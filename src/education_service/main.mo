import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import { nhash } "mo:map/Map";
import LLM "mo:llm";
import Type "../shared/Type";

persistent actor EducationService {
  private var eduByPrincipal = Map.new<Principal, Map.Map<Nat, Type.Education>>();

  private var nextId : Nat = 0;

  // helper for internal canister
  private func _getAllByClient(client : Principal) : [Type.Education] {
    switch (Map.get(eduByPrincipal, Map.phash, client)) {
      case (?eduById) {
        return Iter.toArray(Map.vals(eduById));
      };
      case null {
        return [];
      };
    };
  };

  // getter for another canister
  public shared query ({ caller = _ }) func getAllByClient(client : Principal) : async [Type.Education] {
    return _getAllByClient(client);
  };

  // getter for client / fe canister
  public shared query ({ caller }) func clientGetAll_v2() : async Type.Response<[Type.Education]> {
    return #ok({
      data = _getAllByClient(caller);
      message = "Success get educations";
    });
  };

  public shared ({ caller }) func clientAdd_v2(
    request : {
      lid : Text;
      degree : Text;
      institution : Text;
      graduationDate : Text;
      gpa : ?Text;
      description : Text;
    }
  ) : async Type.Response<Type.CreatedResponse> {
    nextId += 1;

    let newEdu : Type.Education = {
      id = nextId;
      degree = request.degree;
      institution = request.institution;
      graduationDate = request.graduationDate;
      gpa = request.gpa;
      description = request.description;
    };

    let eduById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
      case (?edus) edus;
      case null Map.new<Nat, Type.Education>();
    };

    Map.set(eduById, nhash, newEdu.id, newEdu);

    Map.set(eduByPrincipal, Map.phash, caller, eduById);

    return #ok({
      data = {
        lid = request.lid;
        id = newEdu.id;
      };
      message = "Success create education";
    });
  };

  public shared ({ caller }) func clientBatchUpdate_v2(newEdus : [Type.Education]) : async Type.Response<()> {
    let eduById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
      case null {
        return #err({
          message = "Empty educations";
        });
      };
      case (?values) values;
    };

    for (newEdu in newEdus.vals()) {
      switch (Map.get(eduById, nhash, newEdu.id)) {
        case null {
          // no id match do nothing
        };
        case (?_) {
          Map.set(eduById, nhash, newEdu.id, newEdu);
        };
      };
    };

    Map.set(eduByPrincipal, Map.phash, caller, eduById);

    return #ok({
      data = ();
      message = "Success update educations";
    });
  };

  public shared ({ caller }) func clientDeleteById_v2(request : { id : Nat }) : async Type.Response<Type.DeletedResponse> {
    let expById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
      case null {
        return #err({
          message = "Empty educations";
        });
      };
      case (?val) val;
    };

    return switch (Map.remove(expById, nhash, request.id)) {
      case null {
        return #err({
          message = "Education with ID " # Nat.toText(request.id) # " not found";
        });
      };
      case (?_) {
        return #ok({
          data = {
            id = request.id;
          };
          message = "Success delete education";
        });
      };
    };
  };

  private func _descriptionPromptOf(degree : Text) : Text {
    let prompt = "Based on the following education degree, infer 3 realistic and quantifiable resume bullet points. " #
    "Focus solely on extracting quantifiable academic or project-based achievements relevant to the degree. " #
    "**Only return the points, separated by one pipeline characters |. No intro, no explanation, no conversational text before or after the points.** " #
    "Each point MUST adhere to these strict rules: " #
    "  - Start with a strong action verb. " #
    "  - Clearly mention relevant technical or academic skills. " #
    "  - Include a specific, quantifiable result or impact (e.g., percentages, exact numbers, lab results, publications, presentations, projects). " #
    "  - Be concise (under 25 words). " #
    "  - Maintain a professional tone. " #
    "Example Output Format: " #
    "Conducted genetic sequencing on 50+ samples, improving analysis accuracy by 20%.|Presented biology research at 3 conferences, reaching 500+ attendees.|Led lab team of 6 students, reducing experiment errors by 15%." #
    "Input Details for Inference: " #
    "Education Degree: " # degree # " " #
    "Output:";

    return prompt;
  };

  public shared ({ caller = _ }) func clientGenerateAiDescription_v2(
    request : {
      degree : Text;
    }
  ) : async Type.Response<[Text]> {
    let prompt = _descriptionPromptOf(request.degree);

    let result : Text = await LLM.prompt(#Llama3_1_8B, prompt);

    let lowerResult = Text.toLowercase(result);

    if (Text.contains(lowerResult, #text "|") == false) {
      throw Error.reject("Invalid result format: " # result);
    };

    if (
      Text.contains(lowerResult, #text "i cannot") or
      Text.contains(lowerResult, #text "i'm sorry") or
      Text.contains(lowerResult, #text "unable to")
    ) {
      throw Error.reject("LLM refused to generate description: " # result);
    };

    let iterOfDesc = Text.split(result, #text "|");

    // return as array for more flexibility on frontend
    return #ok({
      data = Iter.toArray(iterOfDesc);
      message = "Success generate description.";
    });
  };

  // ========== V1 (kompatibel dengan old.did) ==========

  // clientAdd v1: TANPA `lid`, return Education
  public shared ({ caller }) func clientAdd(
    req : {
      degree : Text;
      institution : Text;
      graduationDate : Text;
      gpa : ?Text;
      description : Text;
    }
  ) : async Type.Education {
    let lid = Principal.toText(caller);
    switch (await clientAdd_v2({ lid; degree = req.degree; institution = req.institution; graduationDate = req.graduationDate; gpa = req.gpa; description = req.description })) {
      case (#ok created) {
        // Ambil data yang baru dibuat dari storage
        let all = _getAllByClient(caller);
        for (e in all.vals()) {
          if (e.id == created.data.id) { return e };
        };
        // fallback (kalau belum kebaca dari map)
        return {
          id = created.data.id;
          degree = req.degree;
          institution = req.institution;
          graduationDate = req.graduationDate;
          gpa = req.gpa;
          description = req.description;
        };
      };
      case (#err e) { throw Error.reject(e.message) };
    };
  };

  // clientBatchUpdate v1: return vec Education
  public shared ({ caller }) func clientBatchUpdate(newEdus : [Type.Education]) : async [Type.Education] {
    switch (await clientBatchUpdate_v2(newEdus)) {
      case (#ok _) { return _getAllByClient(caller) };
      case (#err e) { throw Error.reject(e.message) };
    };
  };

  // clientDeleteById v1: argumen nat, return bool
  public shared ({ caller = _ }) func clientDeleteById(id : Nat) : async Bool {
    switch (await clientDeleteById_v2({ id })) {
      case (#ok _) true;
      case (#err _) false;
    };
  };
  // clientGetAll v1: return vec Education (query)
  public shared query ({ caller }) func clientGetAll() : async [Type.Education] {
    return _getAllByClient(caller);
  };

  // clientGenerateAiDescription v1: nama lama tetap ada
  public shared ({ caller = _ }) func clientGenerateAiDescription(
    request : { degree : Text }
  ) : async Type.Response<[Text]> {
    switch (await clientGenerateAiDescription_v2(request)) {
      case (#ok okRes) { #ok({ data = okRes.data; message = okRes.message }) };
      case (#err errRes) { #err(errRes) };
    };
  };

  // kembalikan endpoint publik descriptionPromptOf (query)
  public shared query func descriptionPromptOf(degree : Text) : async Text {
    return _descriptionPromptOf(degree);
  }

};
