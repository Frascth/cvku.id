import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Error "mo:base/Error";
import { nhash } "mo:map/Map";
import LLM "mo:llm";
import Type "../shared/Type";

persistent actor WorkExperienceService {
    
    private var workExpByPrincipal = Map.new<Principal, Map.Map<Nat, Type.WorkExperience>>();

    private var nextId: Nat = 0;

    public shared query ({ caller }) func clientGetAll() : async [Type.WorkExperience] {
        switch (Map.get(workExpByPrincipal, Map.phash, caller)) {
            case (?experiencesMap) {
                return Iter.toArray(Map.vals(experiencesMap));
            };
            case null {
                return [];
            };
        };
    };

    // caller is resume_service
    public shared query ({ caller = _ }) func getAllByClient(client:Principal) : async [Type.WorkExperience] {
        switch (Map.get(workExpByPrincipal, Map.phash, client)) {
            case (?experiencesMap) {
                return Iter.toArray(Map.vals(experiencesMap));
            };
            case null {
                return [];
            };
        };
    };

    public shared ({ caller }) func clientAdd(request: {
        jobTitle: Text;
        company: Text;
        startDate: Text;
        endDate: Text;
        current: Bool;
        description: Text;
    }) : async Type.WorkExperience {
        nextId += 1;

        let newExperience: Type.WorkExperience = {
            id = nextId;
            jobTitle = request.jobTitle;
            company = request.company;
            startDate = request.startDate;
            endDate = request.endDate;
            current = request.current;
            description = request.description;
        };

        // Get existing map or create a new one
        let workExperiencesById = switch (Map.get(workExpByPrincipal, Map.phash, caller)) {
            case (?workExps) workExps;
            case null Map.new<Nat, Type.WorkExperience>();
        };

        Map.set(workExperiencesById, nhash, newExperience.id, newExperience);

        Map.set(workExpByPrincipal, Map.phash, caller, workExperiencesById);

        return newExperience;
    };

    public shared ({ caller }) func clientBatchUpdate(newWorkExps: [Type.WorkExperience]) : async [Type.WorkExperience] {
        let expById = switch (Map.get(workExpByPrincipal, Map.phash, caller)) {
            case (?val) val;
            case null return [];
        };

        var updatedWorkExps : [Type.WorkExperience] = [];

        for (exp in newWorkExps.vals()) {
            switch (Map.get(expById, nhash, exp.id)) {
                case (?_) {
                    Map.set(expById, nhash, exp.id, exp);
                    updatedWorkExps := Array.append(updatedWorkExps, [exp]);
                };
                case null {};
            };
        };

        Map.set(workExpByPrincipal, Map.phash, caller, expById);

        return updatedWorkExps;
    };

    public shared ({ caller }) func clientDeleteById(id: Nat) : async Bool {
        let maybeExpById = Map.get(workExpByPrincipal, Map.phash, caller);

        let expById = switch maybeExpById {
            case (?val) val;
            case null return false;
        };

        return switch (Map.remove(expById, nhash, id)) {
            case (?_) true;
            case null false;
        };
    };

    public query func descriptionPromptOf(request: {
        jobTitle: Text;
    }) : async Text {
        let prompt =
            "Based on the following job details, infer 3 realistic and quantifiable resume bullet points. " #
            "focus solely on extracting quantifiable achievements from the role. " #
            "**Only return the points, separated by one pipeline characters |. No intro, no explanation, no conversational text before or after the points.** " #
            "Each point MUST adhere to these strict rules: " #
            "  - Start with a strong action verb. " #
            "  - Clearly mention relevant technical skills. " #
            "  - Include a specific, quantifiable result or impact (e.g., percentages, exact numbers, time saved, revenue generated, efficiency improvements). " #
            "  - Be concise (under 25 words). " #
            "  - Maintain a professional tone. " #
            "Example Output Format: " #
            "Managed Agile sprints for 5-developer team, increasing feature delivery by 15% using Jira.|Developed Python scripts to automate data ETL, reducing manual processing time by 20 hours/month.|Optimized cloud infrastructure on AWS, cutting operational costs by 10% through resource reallocation." #
            "Input Details for Inference: " #
            "Job Title: " # request.jobTitle # " " #
            "Output:";

        return prompt;
    };

    public shared ({ caller = _ }) func clientGenerateAiDescription(request: {
        jobTitle: Text;
    }) : async [Text] {
        let prompt = await descriptionPromptOf(request);

        let result:Text = await LLM.prompt(#Llama3_1_8B, prompt);

        let lowerResult = Text.toLowercase(result);

        if (Text.contains(lowerResult, #text "|") == false) {
            throw Error.reject("Invalid result format: " # result);
        };

        if (Text.contains(lowerResult, #text "i cannot") or
            Text.contains(lowerResult, #text "i'm sorry") or
            Text.contains(lowerResult, #text "unable to")
        ) {
            throw Error.reject("LLM refused to generate description: " # result);
        };

        let iterOfDesc = Text.split(result, #text "|");

        // return as array for more flexibility on frontend
        return Iter.toArray(iterOfDesc);
    };

}