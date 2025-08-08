import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Type "../shared/Type";

persistent actor PersonalInfoService {
    
    private var personalInfoByPrincipal = Map.new<Principal, Type.PersonalInfo>();

    public shared query ({ caller }) func clientGet() : async ?Type.PersonalInfo {
        return Map.get(personalInfoByPrincipal, Map.phash, caller);
    };

    public shared ({ caller }) func clientUpdateOrCreate(request: {
        fullName : Text;
        email : Text;
        phone : Text;
        location : Text;
        website : Text;
        bio : Text;
        photoUrl : ?Text;
    }) : async Type.PersonalInfo {
        let personalInfo = Map.get(personalInfoByPrincipal, Map.phash, caller);

        return switch(personalInfo) {
            case(null) {
                // create
                let createdPersonalInfo = {
                    fullName = request.fullName;
                    email = request.email;
                    phone = request.phone;
                    location = request.location;
                    website = request.website;
                    bio = request.bio;
                    photoUrl = request.photoUrl;
                };

                Map.set(personalInfoByPrincipal, Map.phash, caller, createdPersonalInfo);

                return createdPersonalInfo;
            };
            case(?personalInfo) {
                // update
                let updatedPersonalInfo = {
                    fullName = request.fullName;
                    email = request.email;
                    phone = request.phone;
                    location = request.location;
                    website = request.website;
                    bio = request.bio;
                    photoUrl = request.photoUrl;
                };

                Map.set(personalInfoByPrincipal, Map.phash, caller, updatedPersonalInfo);

                return updatedPersonalInfo;
            };
        };
    };
}