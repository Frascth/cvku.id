import Map "mo:map/Map";
import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Type "../shared/Type";
import { thash } "mo:map/Map";

persistent actor ResumeService {
  // resume link
  private var nextPublicLinkId : Nat = 0;

  private var resumeLinkByPrincipal = Map.new<Principal, Type.ResumeLink>();

  // indexing for fast checking path availability
  // every update to resume link path must update this
  private var resumeLinkPrincipalBypath = Map.new<Text, Principal>();

  private func resumeLinkPathUpdated(
    { client; oldPath; newPath } : {
      client : Principal;
      oldPath : ?Text;
      newPath : Text;
    }
  ) : async Bool {
    switch (oldPath) {
      case (null) {};
      case (?value) {
        let owner = switch (Map.get(resumeLinkPrincipalBypath, thash, value)) {
          case (null) return false;
          case (?principal) principal;
        };

        if (owner != client) {
          return false;
        };

        let _ = Map.remove(resumeLinkPrincipalBypath, thash, value);
      };
    };

    let _ = Map.set(resumeLinkPrincipalBypath, thash, newPath, client);

    return true;
  };

  private func isPathExists({ path } : { path : Text }) : Bool {
    switch (Map.get(resumeLinkPrincipalBypath, thash, path)) {
      case (null) {
        return false;
      };
      case (?_) {
        return true;
      };
    };
  };

  public shared query func clientCheckIsPathExists({ path } : { path : Text }) : async Type.Response<Bool> {
    if (isPathExists({ path = path })) {
      return #ok({
        data = true;
        message = "Resume link with path " # path # " already exists";
      });
    } else {
      return #ok({
        data = false;
        message = "Resume link with path " # path # " is not exists";
      });
    };
  };

  public shared query ({ caller }) func clientGetResumeLink() : async Type.Response<?Type.ResumeLink> {
    return #ok({
      data = Map.get(resumeLinkByPrincipal, Map.phash, caller);
      message = "Success getting resume link";
    });
  };

  public shared ({ caller }) func clientAddResumeLink(
    { lid; path; isPublic } : {
      lid : Text;
      path : Text;
      isPublic : Bool;
    }
  ) : async Type.Response<Type.CreatedResponse> {
    switch (Map.get(resumeLinkByPrincipal, Map.phash, caller)) {
      case (?_) {
        return #err({
          message = "Cannot add more link";
        });
      };
      case (null) {};
    };

    if (isPathExists({ path = path })) {
      return #err({
        message = "Path already used";
      });
    };

    nextPublicLinkId += 1;

    let newResumeLink : Type.ResumeLink = {
      id = nextPublicLinkId;
      path = path;
      isPublic = isPublic;
    };

    Map.set(resumeLinkByPrincipal, Map.phash, caller, newResumeLink);

    let _ = resumeLinkPathUpdated({
      client = caller;
      oldPath = null;
      newPath = newResumeLink.path;
    });

    return #ok({
      data = {
        lid = lid;
        id = newResumeLink.id;
      };
      message = "Resume link added";
    });

  };

  public shared ({ caller }) func clientUpdateResumeLink({ newResumeLink } : { newResumeLink : Type.ResumeLink }) : async Type.Response<Type.UpdatedResponse> {
    let oldResumeLink = switch (Map.get(resumeLinkByPrincipal, Map.phash, caller)) {
      case (null) {
        return #err({
          message = "Resume link with ID " # Nat.toText(newResumeLink.id) # " not found";
        });
      };
      case (?value) value;
    };

    if (oldResumeLink.id != newResumeLink.id) {
      return #err({
        message = "Resume link with ID " # Nat.toText(newResumeLink.id) # " not found";
      });
    };

    if (oldResumeLink.path != newResumeLink.path and isPathExists({ path = newResumeLink.path })) {
      return #err({
        message = "Path already used";
      });
    };

    Map.set(resumeLinkByPrincipal, Map.phash, caller, newResumeLink);

    let _ = resumeLinkPathUpdated({
      client = caller;
      oldPath = ?oldResumeLink.path;
      newPath = newResumeLink.path;
    });

    return #ok({
      data = {
        id = newResumeLink.id;
      };
      message = "Resume link updated";
    });

  };

};
