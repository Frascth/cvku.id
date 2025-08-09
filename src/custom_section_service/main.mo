import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import Bool "mo:base/Bool";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
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
    private var nextItemId: Nat = 0;

    public type itemById = Map.Map<Nat, Type.CustomSectionItem>;

    private var itemsBySectionId = Map.new<Nat, itemById>();

    private func isClientAuthorized(params : { client:Principal; sectionId:Nat; }):Bool {
        let customSections = switch(Map.get(customSectionsByPrincipal, Map.phash, params.client)) {
            case (?sections) sections;
            case null Map.new<Nat, Type.CustomSection>();        
        };

        let customSection = Map.get(customSections, nhash, params.sectionId);

        if (customSection == null) {
            return false;
        };

        return true;
    };

    public shared query ({ caller }) func clientGetAll() : async Type.Response<[Type.CustomSection]> {
        let customSections = switch (Map.get(customSectionsByPrincipal, Map.phash, caller)) {
            case (null) {
                return #ok({
                    data = [];
                    message = "Success getting custom sections";
                });
            };
            case (?values) values;
        };

        var result : [Type.CustomSection] = [];

        for ((sectionId, section) in Map.entries(customSections)) {
            let items = switch (Map.get(itemsBySectionId, nhash, sectionId)) {
                case (null) [];
                case (?values) Iter.toArray(Map.vals(values));
            };

            result := Array.append(
                result,
                [{
                    id = sectionId;
                    name = section.name;
                    items = items;
                }]
            );
        };

        return #ok({
            data = result;
            message = "Success getting custom sections";
        });
    };

    public shared ({ caller }) func clientAddCustomSection(request: {
        lid: Text; // local id for optimistic update
        name: Text;
    }) : async Type.Response<Type.CreatedResponse>{
        nextCustomSectionId += 1;

        let newCustomSection: Type.CustomSection = {
            id = nextCustomSectionId;
            name = request.name;
            items = [];
        };

        let updatedCustomSectionById = switch (Map.get(customSectionsByPrincipal, Map.phash, caller)) {
            case (?customSections) customSections;
            case null Map.new<Nat, Type.CustomSection>();
        };

        Map.set(updatedCustomSectionById, nhash, newCustomSection.id, newCustomSection);

        Map.set(customSectionsByPrincipal, Map.phash, caller, updatedCustomSectionById);

        let response : Type.SuccessResponse<Type.CreatedResponse> = {
            data = {
                lid = request.lid;
                id = newCustomSection.id;
            };
            message = "Custom section " # newCustomSection.name # " added";
        };

        // if error
        // let errResponse : Type.ErrorResponse = {
        //     message = "An error occurrd";
        // };
        // return #err(errResponse);

        return #ok(response);
    };

    public shared ({ caller }) func clientDeleteCustomSection(request: {id :Nat; }): async Type.Response<Type.DeletedResponse> {
        let customSections = switch(Map.get(customSectionsByPrincipal, Map.phash, caller)) {
            case (null) {
                return #err({
                    message = "Custom section is empty";
                });
            };
            case (?values) values;
        };

        switch(Map.remove(customSections, nhash, request.id)) {
            case (null) {
                return #err({
                    message = "Custom section with ID " # Nat.toText(request.id) # " not found";
                });
            };
            case (?_) {
                return #ok({
                    data = {
                        id = request.id;
                    };
                    message = "Custom section deleted";
                });
            };
        };
    };

    public shared ({ caller }) func clientDeleteItem(request: {
        sectionId: Nat;
        id: Nat;
    }) : async Type.Response<Type.DeletedResponse>{
        let isAuthorized = isClientAuthorized({
            client = caller;
            sectionId = request.sectionId;
        });

        if (not isAuthorized) {
            let errResponse : Type.ErrorResponse = {
                message = "Custom section with ID " # Nat.toText(request.sectionId) # " not found";
            };

            return #err(errResponse);
        };

        let items = switch(Map.get(itemsBySectionId, nhash, request.sectionId)) {
            case null {
                return #err({
                    message = "Item with ID " # Nat.toText(request.sectionId) # " not found";
                });
            };
            case (?values) values;
        };

        return switch (Map.remove(items, nhash, request.id)) {
            case (?_) {
                return #ok({
                    data = {
                        id = request.id;
                    };
                    message = "Item deleted";
                });
            };
            case null {
                return #err({
                    message = "Item with " # Nat.toText(request.id) # " not found";
                });
            };
        };
    };

    public shared ({ caller }) func clientAddItem(request: {
        sectionId : Nat;
        lid: Text; // local id for optimistic update
        title : Text;
        description : Text;
        subtitle : ?Text;
        date : ?Text;
    }) : async Type.Response<Type.CreatedResponse>{
        let isAuthorized = isClientAuthorized({
            client = caller;
            sectionId = request.sectionId;
        });

        if (not isAuthorized) {
            let errResponse : Type.ErrorResponse = {
                message = "Custom section with " # Nat.toText(request.sectionId) # " not found";
            };

            return #err(errResponse);
        };

        nextItemId += 1;

        let newItem: Type.CustomSectionItem = {
            sectionId = request.sectionId;
            id = nextItemId;
            title = request.title;
            description = request.description;
            subtitle = request.subtitle;
            date = request.date;
        };

        let updatedItems = switch (Map.get(itemsBySectionId, nhash, request.sectionId)) {
            case (?items) items;
            case null Map.new<Nat, Type.CustomSectionItem>();
        };

        Map.set(updatedItems, nhash, newItem.id, newItem);

        Map.set(itemsBySectionId, nhash, request.sectionId, updatedItems);

        let response : Type.SuccessResponse<Type.CreatedResponse> = {
            data = {
                lid = request.lid;
                id = newItem.id;
            };
            message = "Custom section " # newItem.title # " added";
        };

        // if error
        // let errResponse : Type.ErrorResponse = {
        //     message = "An error occurrd";
        // };
        // return #err(errResponse);

        return #ok(response);
    };

    public shared ({ caller }) func clientBatchUpdateItem(request: {
        sectionId : Nat;
        newItems: [Type.CustomSectionItem];
    }) : async Type.Response<()>{
        let isAuthorized = isClientAuthorized({
            client = caller;
            sectionId = request.sectionId;
        });

        if (not isAuthorized) {
            let errResponse : Type.ErrorResponse = {
                message = "Custom section with " # Nat.toText(request.sectionId) # " not found";
            };

            return #err(errResponse);
        };

        let items = switch(Map.get(itemsBySectionId, nhash, request.sectionId)) {
            case null {
                return #err({
                    message = "Custom section ID " # Nat.toText(request.sectionId) # " doesnt have items yet" ;
                });
            };        
            case (?values) values;
        };

        for (newItem in request.newItems.vals()) {
            switch (Map.get(items, nhash, newItem.id)) {
                case null {};
                case (?_) {
                    Map.set(items, nhash, newItem.id, newItem);
                };
            };
        };

        return #ok({
            data = ();
            message = "Success batch update item";
        });
    };



}