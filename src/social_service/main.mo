import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat";
import Iter "mo:base/Iter";
import Type "../shared/Type";
import { nhash } "mo:map/Map";

persistent actor SocialService {

  private var nextSocialLinkId : Nat = 0;

  public type socialLinkById = Map.Map<Nat, Type.SocialLink>;

  private var socialLinksByPrincipal = Map.new<Principal, socialLinkById>();

  private func isValidPlatform(platform : Text) : Bool {
    switch (platform) {
      case ("LinkedIn") return true;
      case ("GitHub") return true;
      case ("Twitter") return true;
      case ("Website") return true;
      case ("Instagram") return true;
      case ("Facebook") return true;
      case (_) return false;
    };
  };

  public shared query ({ caller }) func clientGetAll() : async Type.Response<[Type.SocialLink]> {
    switch (Map.get(socialLinksByPrincipal, Map.phash, caller)) {
      case (null) {
        return #ok({
          data = [];
          message = "Success getting social links.";
        });
      };
      case (?values) {
        return #ok({
          data = Iter.toArray(Map.vals(values));
          message = "Success getting social links.";
        });
      };
    };
  };

  public shared ({ caller }) func clientAdd(
    { lid; platform; url } : {
      lid : Nat; // <-- ganti ke Nat
      platform : Text;
      url : Text;
    }
  ) : async Type.Response<Type.CreatedResponse> {
    if (not isValidPlatform(platform)) {
      return #err({ message = platform # " is not a valid platform." });
    };

    nextSocialLinkId += 1;

    let socialLinks = switch (Map.get(socialLinksByPrincipal, Map.phash, caller)) {
      case (null) Map.new<Nat, Type.SocialLink>();
      case (?values) values;
    };

    let newSocialLink : Type.SocialLink = {
      id = nextSocialLinkId;
      platform = platform;
      url = url;
    };

    Map.set(socialLinks, nhash, nextSocialLinkId, newSocialLink);
    Map.set(socialLinksByPrincipal, Map.phash, caller, socialLinks);

    return #ok({
      data = {
        lid = lid; // <-- lid sekarang Nat
        id = newSocialLink.id; // Nat juga
      };
      message = "Social link added";
    });
  };

  public shared ({ caller }) func clientUpdate({ newSocialLink } : { newSocialLink : Type.SocialLink }) : async Type.Response<Type.UpdatedResponse> {

    if (not isValidPlatform(newSocialLink.platform)) {
      return #err({
        message = newSocialLink.platform # " is not a valid platform.";
      });
    };

    let socialLinks = switch (Map.get(socialLinksByPrincipal, Map.phash, caller)) {
      case (null) {
        return #err({
          message = "Empty social links.";
        });
      };
      case (?values) values;
    };

    switch (Map.get(socialLinks, nhash, newSocialLink.id)) {
      case (null) {
        return #err({
          message = "Social link with ID " # Nat.toText(newSocialLink.id) # " not found";
        });
      };
      case (?_) {};
    };

    Map.set(socialLinks, nhash, newSocialLink.id, newSocialLink);

    return #ok({
      data = {
        id = newSocialLink.id;
      };
      message = "Social link updated";
    });

  };

  public shared ({ caller }) func clientDelete({ id } : { id : Nat }) : async Type.Response<Type.DeletedResponse> {
    let socialLinks = switch (Map.get(socialLinksByPrincipal, Map.phash, caller)) {
      case (null) {
        return #err({
          message = "Empty social links.";
        });
      };
      case (?values) values;
    };

    return switch (Map.remove(socialLinks, nhash, id)) {
      case (null) {
        return #err({
          message = "Social link with ID " # Nat.toText(id) # " not found";
        });
      };
      case (?_) {
        return #ok({
          data = {
            id = id;
          };
          message = "Social link deleted";
        });
      };
    };
  };

};
