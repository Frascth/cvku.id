// src/skills_service/main.mo (ADAPTED FROM work_experience_service)

import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import _ "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat"; // Masih perlu untuk generateSkillId
import { thash } "mo:map/Map"; // <-- PENTING: Untuk Text hash
// import Debug "mo:base/Debug"; // Opsional: Jaga ini jika Anda ingin Debug.print

import Type "../shared/Type";

persistent actor SkillsService {
  // State untuk menyimpan skills per principal
  // Kunci inner Map sekarang adalah Text, sesuai dengan Skill.id
  // Gunakan Map.Map untuk inner Map, sama seperti WorkExperienceService
  private var skillsByPrincipal = Map.new<Principal, Map.Map<Text, Type.Skill>>(); // <-- Kembali ke Map.Map untuk inner

  private var nextSkillIdNum : Nat = 0; // Menggunakan nama berbeda untuk counter Nat

  // Fungsi helper untuk menghasilkan ID unik (Text)
  func generateSkillId() : Text {
    let id = Nat.toText(nextSkillIdNum);
    nextSkillIdNum := nextSkillIdNum + 1; // Increment global ID counter
    return id;
  };

  // Helper untuk mendapatkan Map skill untuk caller tertentu, atau membuat yang baru
  // Tipe kunci inner Map di sini juga Text
  private func getOrCreateSkillsMap(caller : Principal) : Map.Map<Text, Type.Skill> {
    // <-- Kembali ke Map.Map
    switch (Map.get(skillsByPrincipal, Map.phash, caller)) {
      case (?skills) skills;
      case null {
        let newMap = Map.new<Text, Type.Skill>(); // <-- Kembali ke Map.new
        Map.set(skillsByPrincipal, Map.phash, caller, newMap);
        newMap;
      };
    };
  };

  // --- Fungsi CRUD untuk Skills ---

  // Mendapatkan semua skills untuk caller saat ini
  public shared query ({ caller }) func clientGetAllSkills() : async [Type.Skill] {
    switch (Map.get(skillsByPrincipal, Map.phash, caller)) {
      case (?skillsById) {
        return Iter.toArray(Map.vals(skillsById)); // <-- Gunakan Map.vals
      };
      case null {
        return [];
      };
    };
  };

  // Menambahkan skill baru untuk caller saat ini
  public shared ({ caller }) func clientAddSkill(
    request : {
      lid : Text;
      name : Text;
      level : Type.SkillLevel;
    }
  ) : async Type.Response<Type.CreatedResponse> {
    let id = generateSkillId(); // Menggunakan helper untuk mendapatkan ID Text

    let newSkill : Type.Skill = {
      id = id;
      name = request.name;
      level = request.level;
    };

    let skillsById = getOrCreateSkillsMap(caller);

    Map.set(skillsById, thash, newSkill.id, newSkill); // <-- Gunakan thash di sini

    let natId = switch (Nat.fromText(newSkill.id)) {
      case (null) {
        return #err({
          message = "Invalid skill id";
        });
      };
      case (?val) val;
    };

    let lidNat = switch (Nat.fromText(request.lid)) {
      case (?n) n;
      case null { return #err({ message = "Invalid lid: " # request.lid }) };
    };

    return #ok({
      data = {
        lid = lidNat;
        id = natId; 
      };
      message = "Success add skill";
    });

  };

  // Memperbarui skills yang sudah ada (batch update)
  public shared ({ caller }) func clientBatchUpdateSkills(newSkills : [Type.Skill]) : async Type.Response<()> {
    // Ambil atau buat map untuk caller
    let skillsById = getOrCreateSkillsMap(caller);

    // Upsert semua skill yang dikirim FE
    for (skill in newSkills.vals()) {
      Map.set(skillsById, thash, skill.id, skill);
    };

    return #ok({
      data = ();
      message = "Success update skills";
    });
  };

  // Menghapus skill berdasarkan ID
  public shared ({ caller }) func clientDeleteSkillById(id : Text) : async Type.Response<Type.DeletedResponse> {
    // Debug.print("Motoko: Attempting to delete skill with ID: " # id); // Uncomment jika ingin logging

    let skillsById = switch (Map.get(skillsByPrincipal, Map.phash, caller)) {
      case null {
        // Debug.print("Motoko: No skills map found for caller " # Principal.toText(caller) # "."); // Uncomment jika ingin logging
        return #err({
          message = "Empty skill";
        });
      };
      case (?val) val;
    };

    return switch (Map.remove(skillsById, thash, id)) {
      // <-- Gunakan thash di sini
      case (?_) {
        // Debug.print("Motoko: Skill " # id # " successfully removed for caller " # Principal.toText(caller) # "."); // Uncomment jika ingin logging
        let natId = switch (Nat.fromText(id)) {
          case (null) {
            return #err({
              message = "Invalid skill id";
            });
          };
          case (?val) val;
        };

        return #ok({
          data = {
            id = natId;
          };
          message = "Skill with ID " # id # " not found";
        });
      };
      case null {
        // Debug.print("Motoko: Skill " # id # " not found in map for caller " # Principal.toText(caller) # "."); // Uncomment jika ingin logging
        return #err({
          message = "Skill with ID " # id # " not found";
        });
      };
    };
  };

  // Fungsi untuk mendapatkan semua skills dari client tertentu
  public shared query ({ caller = _ }) func getAllSkillsByClient(client : Principal) : async [Type.Skill] {
    switch (Map.get(skillsByPrincipal, Map.phash, client)) {
      case (?skillsById) {
        return Iter.toArray(Map.vals(skillsById)); // <-- Gunakan Map.vals
      };
      case null {
        return [];
      };
    };
  };
};
