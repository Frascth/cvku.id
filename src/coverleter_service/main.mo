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

actor CoverLeterService {

  type CoverLeterType = {
    companyName : Text;
    jobTitle : Text;
    jobDescription : Text;
  };

  private stable var coverLeter : [(Principal, CoverLeterType)] = [];

  public shared ({ caller }) func addNewCoverLater(cover : CoverLeterType) : async Text {
    let exists = Array.find<(Principal, CoverLeterType)>(coverLeter, func((p, u)) = u.companyName == cover.companyName);

    if (exists != null) {
      return "Cover Leter already exist.";
    };

    coverLeter := Array.append(coverLeter, [(caller, cover)]);
    return "Add new cover later success successful.";
  };

  public query func getAllCoverLeter() : async [(Principal, CoverLeterType)] {
    return coverLeter;
  };
};
