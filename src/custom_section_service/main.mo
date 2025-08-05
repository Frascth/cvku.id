import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import { nhash } "mo:map/Map";
import Type "../shared/Type";

persistent actor CustomSectionService {

    // principal has many custom section
    // custom section has many items

    // custom section
    private var nextCustomSectionId: Nat = 0;

    public type customSectionById = Map.Map<Nat, Type.CustomSection>;

    private var customSectionsByPrincipal = Map.new<Principal, customSectionById>();

    // items
    // private var nextItemId: Nat = 0;

    // public type itemById = Map.Map<Nat, Type.CustomSectionItem>;

    // private var itemsBySectionId = Map.new<Nat, itemById>();

    // public shared query ({ caller }) func clientGetAll() : async [Type.WorkExperience] {
    //     switch (Map.get(workExpByPrincipal, Map.phash, caller)) {
    //         case (?experiencesMap) {
    //             return Iter.toArray(Map.vals(experiencesMap));
    //         };
    //         case null {
    //             return [];
    //         };
    //     };
    // };

    public shared ({ caller }) func clientAddCustomSection(request: {
        name: Text;
    }) : async Type.Response<Nat>{
        nextCustomSectionId += 1;

        let newCustomSection: Type.CustomSection = {
            id = nextCustomSectionId;
            name = request.name;
        };

        let updatedCustomSectionById = switch (Map.get(customSectionsByPrincipal, Map.phash, caller)) {
            case (?customSections) customSections;
            case null Map.new<Nat, Type.CustomSection>();
        };

        Map.set(updatedCustomSectionById, nhash, newCustomSection.id, newCustomSection);

        Map.set(customSectionsByPrincipal, Map.phash, caller, updatedCustomSectionById);

        let response : Type.SuccessResponse<Nat> = {
            data = newCustomSection.id;
            message = "Custom section " # newCustomSection.name # " added";
        };

        // if error
        // let errResponse : Type.ErrorResponse = {
        //     message = "An error occurrd";
        // };
        // return #err(errResponse);

        return #ok(response);
    };

}