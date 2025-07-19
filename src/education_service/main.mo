import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import { nhash } "mo:map/Map";
import LLM "mo:llm";
import Type "../shared/Type";

actor {
    private stable var eduByPrincipal = Map.new<Principal, Map.Map<Nat, Type.Education>>();

    private stable var nextId: Nat = 0;

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
    public shared query ({ caller = _ }) func getAllByClient(client:Principal) : async [Type.Education] {
        switch (Map.get(eduByPrincipal, Map.phash, client)) {
            case (?eduById) {
                return Iter.toArray(Map.vals(eduById));
            };
            case null {
                return [];
            };
        };
    };

    public shared ({ caller }) func clientAdd(request: {
        degree: Text;
        institution: Text;
        graduationDate: Text;
        gpa: ?Text;
    }) : async Type.Education {
        nextId += 1;

        let newEdu: Type.Education = {
            id = nextId;
            degree = request.degree;
            institution = request.institution;
            graduationDate = request.graduationDate;
            gpa = request.gpa;
        };

        let eduById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
            case (?edus) edus;
            case null Map.new<Nat, Type.Education>();
        };

        Map.set(eduById, nhash, newEdu.id, newEdu);

        Map.set(eduByPrincipal, Map.phash, caller, eduById);

        return newEdu;
    };

    public shared ({ caller }) func clientBatchUpdate(newEdus: [Type.Education]) : async [Type.Education] {
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

    public shared ({ caller }) func clientDeleteById(id: Nat) : async Bool {
        let expById = switch (Map.get(eduByPrincipal, Map.phash, caller)) {
            case (?val) val;
            case null return false;
        };

        return switch (Map.remove(expById, nhash, id)) {
            case (?_) true;
            case null false;
        };
    };

    public query func descriptionPromptOf(request: {
        degree: Text;
        institution: Text;
        graduationDate: Text;
        gpa: ?Text;
    }) : async Text {
        let gpa = switch (request.gpa) {
            case (?val) val;
            case null "-";
        };

        let prompt = 
            "based on the following education input, infer 3 realistic and impactful resume bullet points. " #
            "Only return the points; no intro, no explanation. " #
            "Each point must: " #
            "  - Start with a strong action verb (e.g., Developed, Researched, Analyzed, Led, Achieved, Completed, Participated). " #
            "  - Highlight academic achievements, relevant coursework, projects, or leadership roles. " #
            "  - Include relevant technical skills or methodologies used, if applicable. " #
            "  - Be concise (under 25 words). " #
            "  - Maintain a clean and professional tone. " #
            "  - If GPA is provided and high (e.g., 3.5+), integrate it where appropriate, along with honors/awards. " #
            "Separate each point with three pipeline char ||| " #
            "Input: " #
            "degree: " # request.degree # " " #
            "institution: " # request.institution # " " #
            "graduationDate: " # request.graduationDate # " " #
            "gpa: " # gpa # " " #
            "Output:";

        return prompt;
    };

    public shared ({ caller = _ }) func clientGenerateAiDescription(request: {
        degree: Text;
        institution: Text;
        graduationDate: Text;
        gpa: ?Text;
    }) : async [Text] {
        let prompt = await descriptionPromptOf(request);

        let result:Text = await LLM.prompt(#Llama3_1_8B, prompt);

        let iterOfDesc = Text.split(result, #text "|||");

        // return as array for more flexibility on frontend
        return Iter.toArray(iterOfDesc);
    };

}