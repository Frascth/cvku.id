import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Error "mo:base/Error";
import Nat "mo:base/Nat";
import { nhash } "mo:map/Map";
import LLM "mo:llm";
import Type "../shared/Type";

actor PersonalInfoService {

    type UserInformation = {
        userCaller : Text;
        user : Type.PersonalInfo;
    };
    type SectionType = {
        id : Nat;
        sectionName : Text;
    };

    type SectionItems = {
        id : Nat;
        title : Text;
        subtitle : ?Text;
        description : Text;
        date : ?Text;
    };
    private stable var userprofile : Type.PersonalInfo = {
        fullName = "-";
        email = "-";
        phone = "-";
        location = "-";
        website = "-";
        bio = "-";
        photoUrl = "-";
    };
    private stable var customesection = Map.new<Principal, Map.Map<Nat, Type.CustomSectionItem>>();
    private stable var sectionId : Nat = 0;
    private stable var dataSectionType = Map.new<Principal, Map.Map<Nat, SectionType>>();
    private stable var dataSectionItems = Map.new<Principal, Map.Map<Nat, SectionItems>>();

    public shared query ({ caller }) func getAllCustoSectionByUser(client : Principal) : async [Type.CustomSectionItem] {
        switch (Map.get(customesection, Map.phash, caller)) {
            case (?experiencesMap) {
                return Iter.toArray(Map.vals(experiencesMap));
            };
            case null {
                return [];
            };
        };
    };

    public shared ({ caller }) func addNewSection(sectionName : Text) : async SectionType {

        // Get the existing map for this caller, or create a new one if not found
        let userSections = switch (Map.get(dataSectionType, Map.phash, caller)) {
            case (?existingMap) existingMap;
            case null Map.new<Nat, SectionType>();
        };

        let size = if (dataSectionType.size() == 0) 1 else dataSectionType.size() +1;
        let bodyData : SectionType = {
            id = size;
            sectionName = sectionName;
        };
        Map.set(userSections, nhash, bodyData.id, bodyData);
        Map.set(dataSectionType, Map.phash, caller, userSections);
        return bodyData;
    };

    public shared ({ caller }) func addNewSectionItemBySectionId(sectionTypeId : Nat, request : SectionItems) : async ?SectionItems {

        let userItemMap = switch (Map.get(dataSectionItems, Map.phash, caller)) {
            case (?existing) existing;
            case null Map.new<Nat, SectionItems>();
        };
        let size = if (dataSectionItems.size() == 0) 1 else dataSectionItems.size() +1;

        let bodyData : SectionItems = {
            id = size;
            title = request.title;
            subtitle = request.subtitle;
            description = request.description;
            date = request.date;
        };

        // Simpan ke dalam map user
        // Map.put(userItemMap, Nat.equal, size, bodyData);

        // // Simpan kembali ke map utama berdasarkan principal
        // Map.put(dataSectionItems, Principal.equal, caller, userItemMap);

        return ?bodyData;
    };

    public shared ({ caller }) func addCustomSection(
        request : {
            title : Text;
            subtitle : ?Text;
            description : Text;
            date : ?Text;
        }
    ) : async Type.CustomSectionItem {
        sectionId += 1;

        let newCustomeSection : Type.CustomSectionItem = {
            id = sectionId;
            title = request.title;
            subtitle = request.subtitle;
            description = request.description;
            date = request.date;
        };

        // Get existing map or create a new one
        let customeSectionById = switch (Map.get(customesection, Map.phash, caller)) {
            case (?workExps) workExps;
            case null Map.new<Nat, Type.CustomSectionItem>();
        };

        Map.set(customeSectionById, nhash, newCustomeSection.id, newCustomeSection);

        Map.set(customesection, Map.phash, caller, customeSectionById);

        return newCustomeSection;
    };

    public shared query ({ caller }) func getUserInfo() : async UserInformation {
        let pengguna : UserInformation = {
            userCaller = Principal.toText(caller);
            user = userprofile;
        };
        return pengguna;
    };

    // caller is resume_service

    public shared ({ caller }) func updateUser(
        request : {
            fullName : Text;
            email : Text;
            phone : Text;
            location : Text;
            website : Text;
            bio : Text;
            photoUrl : Text;
        }
    ) : async UserInformation {

        let update = {
            fullName = request.fullName;
            email = request.email;
            phone = request.phone;
            location = request.location;
            website = request.website;
            bio = request.bio;
            photoUrl = request.photoUrl;
        };
        // userprofile.st

        userprofile := update;
        let pengguna : UserInformation = {
            userCaller = Principal.toText(caller);
            user = update;
        };
        return pengguna

    };

    public query func getUserRequestInfo() : async {
        fullName : Text;
        email : Text;
        phone : Text;
        location : Text;
        website : Text;
        bio : Text;
        photoUrl : Text;
    } {
        {
            fullName = userprofile.fullName;
            email = userprofile.email;
            phone = userprofile.phone;
            location = userprofile.location;
            website = userprofile.website;
            bio = userprofile.bio;
            photoUrl = userprofile.photoUrl;
        };
    };

};
