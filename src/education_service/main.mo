import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Error "mo:base/Error";
import { nhash } "mo:map/Map";
import LLM "mo:llm";
import Type "../shared/Type";

persistent actor EducationService {
  private var eduByPrincipal = Map.new<Principal, Map.Map<Nat, Type.Education>>();

  private var nextId : Nat = 0;

  public shared query ({ caller }) func clientGetAll() : async [Type.Education] {
    switch (Map.get(eduByPrincipal, Map.phash, caller)) {
      case (?eduById) {
        return Iter.toArray(Map.vals(eduById));
      };
      case null {
        return [];
      };
    };
  };

  // caller is canister resume_service
  public shared query ({ caller = _ }) func getAllByClient(client : Principal) : async [Type.Education] {
    switch (Map.get(eduByPrincipal, Map.phash, client)) {
      case (?eduById) {
        return Iter.toArray(Map.vals(eduById));
      };
      case null {
        return [];
      };
    };
  };

  public shared ({ caller }) func clientAdd(
    request : {
      degree : Text;
      institution : Text;
      graduationDate : Text;
      gpa : ?Text;
      description : Text;
    }
  ) : async Type.Education {
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

    return newEdu;
  };

  public shared ({ caller }) func clientBatchUpdate(newEdus : [Type.Education]) : async [Type.Education] {
    let eduById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
      case (?edus) edus;
      case null return [];
    };

    var updatedEdus : [Type.Education] = [];

    for (exp in newEdus.vals()) {
      switch (Map.get(eduById, nhash, exp.id)) {
        case (?_) {
          Map.set(eduById, nhash, exp.id, exp);
          updatedEdus := Array.append(updatedEdus, [exp]);
        };
        case null {};
      };
    };

    Map.set(eduByPrincipal, Map.phash, caller, eduById);

    return updatedEdus;
  };

  public shared ({ caller }) func clientDeleteById(id : Nat) : async Bool {
    let expById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
      case (?val) val;
      case null return false;
    };

    return switch (Map.remove(expById, nhash, id)) {
      case (?_) true;
      case null false;
    };
  };

  public query func descriptionPromptOf(degree : Text) : async Text {
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

  public shared ({ caller = _ }) func clientGenerateAiDescription(
    request : {
      degree : Text;
    }
  ) : async Type.Response<[Text]> {
    let prompt = await descriptionPromptOf(request.degree);

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

};
