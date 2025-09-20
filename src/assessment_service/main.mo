import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Text "mo:base/Text";
import Type "../shared/Type";
import { thash } "mo:map/Map"; // hash utils untuk key Text

// ======================================================================
// AssessmentService
// Storage: Map<Principal, Map<Text, Type.Assessment>>
// - Outer map  : key Principal (pakai Map.phash)
// - Inner map  : key Text (skillId) (pakai thash)
// Response     : Type.Response<T> (sama seperti service lain)
// ======================================================================
persistent actor AssessmentService {

  // user -> (skillId -> Assessment)
  private var resultByPrincipal = Map.new<Principal, Map.Map<Text, Type.Assessment>>();

  // -------------------------
  // Helpers
  // -------------------------

  // Ambil semua assessment milik principal (internal)
  private func _getAllByClient(client : Principal) : [Type.Assessment] {
    switch (Map.get(resultByPrincipal, Map.phash, client)) {
      case (?bySkill) { Iter.toArray(Map.vals(bySkill)) };
      case null { [] };
    };
  };

  // Ambil inner map milik principal, atau map baru bila belum ada
  private func _getInnerOrEmpty(client : Principal) : Map.Map<Text, Type.Assessment> {
    switch (Map.get(resultByPrincipal, Map.phash, client)) {
      case (?m) m;
      case null Map.new<Text, Type.Assessment>();
    };
  };

  // -------------------------
  // Getters (internal/antar canister & client)
  // -------------------------

  // Getter untuk canister lain
  public shared query ({ caller = _ }) func getAllByClient(client : Principal) : async [Type.Assessment] {
    _getAllByClient(client);
  };

  // Getter untuk FE (semua assessment milik caller)
  public shared query ({ caller }) func clientGetAll() : async Type.Response<[Type.Assessment]> {
    #ok({
      data = _getAllByClient(caller);
      message = "Success get assessments";
    });
  };

  // Ambil satu assessment (skillId) milik caller
  public shared query ({ caller }) func clientGetOne(
    request : { skillId : Text }
  ) : async Type.Response<?Type.Assessment> {
    switch (Map.get(resultByPrincipal, Map.phash, caller)) {
      case null {
        #ok({
          data = null;
          message = "Assessment not found";
        });
      };
      case (?bySkill) {
        #ok({
          data = Map.get(bySkill, thash, request.skillId); // <- thash untuk Text
          message = "Success get assessment";
        });
      };
    };
  };

  // Cek apakah sudah pernah dikerjakan
  public shared query ({ caller }) func clientHasCompleted(
    request : { skillId : Text }
  ) : async Type.Response<Type.AssessmentCompletedResponse> {
    let completed : Bool = switch (Map.get(resultByPrincipal, Map.phash, caller)) {
      case null false;
      case (?bySkill) switch (Map.get(bySkill, thash, request.skillId)) {
        case null false;
        case (?_) true;
      };
    };

    #ok({
      data = { completed };
      message = if (completed) "Completed" else "Not completed";
    });
  };

  // -------------------------
  // Upsert / Delete (client)
  // -------------------------

  // Simpan / overwrite hasil assessment untuk (caller, skillId)
  public shared ({ caller }) func clientUpsertResult(
    request : {
      skillId : Text;
      score : Nat; // 0..100
      level : Type.AssessmentLevel; // reuse SkillLevel
      dateISO : ?Text; // FE boleh kirim ISO, jika null kita isi "now"
    }
  ) : async Type.Response<Type.AssessmentSavedResponse> {
    if (request.score > 100) {
      return #err({ message = "score must be 0..100" });
    };

    let dateText : Text = switch (request.dateISO) {
      case (?d) d;
      case null "now";
    };

    let newResult : Type.Assessment = {
      skillId = request.skillId;
      score = request.score;
      level = request.level;
      dateISO = dateText;
    };

    let bySkill = _getInnerOrEmpty(caller);
    Map.set(bySkill, thash, request.skillId, newResult); // <- thash
    Map.set(resultByPrincipal, Map.phash, caller, bySkill);

    #ok({
      data = { skillId = request.skillId };
      message = "Success upsert assessment";
    });
  };

  // Hapus hasil assessment untuk 1 skillId
  public shared ({ caller }) func clientDeleteBySkillId(
    request : { skillId : Text }
  ) : async Type.Response<Type.AssessmentDeletedResponse> {
    let bySkill = switch (Map.get(resultByPrincipal, Map.phash, caller)) {
      case null {
        return #err({ message = "Empty assessments" });
      };
      case (?m) m;
    };

    switch (Map.remove(bySkill, thash, request.skillId)) {
      // <- thash
      case null {
        #err({
          message = "Assessment for skill '" # request.skillId # "' not found";
        });
      };
      case (?_) {
        Map.set(resultByPrincipal, Map.phash, caller, bySkill);
        #ok({
          data = { skillId = request.skillId };
          message = "Success delete assessment";
        });
      };
    };
  };

};