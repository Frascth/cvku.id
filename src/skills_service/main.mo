// src/skills_service/main.mo
import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";
import Nat "mo:base/Nat"; // <-- Pastikan ini ada untuk Nat.toText
import { thash } "mo:map/Map"; // <-- PENTING: Untuk Text hash
import { phash } "mo:map/Map"; // Untuk Principal hash

// Import tipe Skill dan SkillLevel dari shared/Type.mo
import Type "../shared/Type";

actor {
    // State untuk menyimpan skills per principal
    // Kunci inner Map sekarang adalah Text, sesuai dengan Skill.id
    private stable var skillsByPrincipal = Map.new<Principal, Map.Map<Text, Type.Skill>>(); // <-- Berubah di sini
    private stable var nextSkillIdNum: Nat = 0; // Menggunakan nama berbeda untuk counter Nat

    // Fungsi helper untuk menghasilkan ID unik (Text)
    func generateSkillId() : Text {
        let id = Nat.toText(nextSkillIdNum);
        nextSkillIdNum := nextSkillIdNum + 1; // Increment global ID counter
        return id;
    };

    // Helper untuk mendapatkan Map skill untuk caller tertentu, atau membuat yang baru
    // Tipe kunci inner Map di sini juga Text
    private func getOrCreateSkillsMap(caller: Principal) : Map.Map<Text, Type.Skill> { // <-- Berubah di sini
        switch (Map.get(skillsByPrincipal, phash, caller)) {
            case (?skills) skills;
            case null {
                let newMap = Map.new<Text, Type.Skill>(); // <-- Berubah di sini
                Map.set(skillsByPrincipal, phash, caller, newMap);
                newMap
            };
        };
    };

    // --- Fungsi CRUD untuk Skills ---

    // Mendapatkan semua skills untuk caller saat ini
    public shared query ({ caller }) func clientGetAllSkills() : async [Type.Skill] {
        switch (Map.get(skillsByPrincipal, phash, caller)) {
            case (?skillsById) {
                return Iter.toArray(Map.vals(skillsById));
            };
            case null {
                return [];
            };
        };
    };

    // Menambahkan skill baru untuk caller saat ini
    public shared ({ caller }) func clientAddSkill(request: {
        name: Text;
        level: Type.SkillLevel;
    }) : async Type.Skill {
        let id = generateSkillId(); // Menggunakan helper untuk mendapatkan ID Text

        let newSkill: Type.Skill = {
            id = id; // <-- Sekarang id adalah Text
            name = request.name;
            level = request.level;
        };

        let skillsById = getOrCreateSkillsMap(caller);

        Map.set(skillsById, thash, newSkill.id, newSkill); // <-- Gunakan thash di sini

        return newSkill;
    };

    // Memperbarui skills yang sudah ada (batch update)
    public shared ({ caller }) func clientBatchUpdateSkills(newSkills: [Type.Skill]) : async [Type.Skill] {
        let skillsById = switch (Map.get(skillsByPrincipal, phash, caller)) {
            case (?val) val;
            case null return [];
        };

        var updatedSkills : [Type.Skill] = [];

        for (skill in newSkills.vals()) {
            Map.set(skillsById, thash, skill.id, skill); // <-- Gunakan thash di sini
            updatedSkills := Array.append(updatedSkills, [skill]);
        };
        // Catatan: Jika Anda ingin hanya mengupdate yang ada, Anda bisa menambahkan cek `Map.get` sebelum `Map.set`
        // seperti di versi sebelumnya, tapi ini sudah update "if exists, then update" karena Map.set.
        // Jika skill.id tidak ada, Map.set akan menambahkannya.

        return updatedSkills;
    };

    // Menghapus skill berdasarkan ID
    public shared ({ caller }) func clientDeleteSkillById(id: Text) : async Bool { // <-- Parameter ID menjadi Text
        let skillsById = switch (Map.get(skillsByPrincipal, phash, caller)) {
            case (?val) val;
            case null return false;
        };

        return switch (Map.remove(skillsById, thash, id)) { // <-- Gunakan thash di sini
            case (?_) true;
            case null false;
        };
    };

    // Fungsi untuk mendapatkan semua skills dari client tertentu
    public shared query ({ caller = _ }) func getAllSkillsByClient(client: Principal) : async [Type.Skill] {
        switch (Map.get(skillsByPrincipal, phash, client)) {
            case (?skillsById) {
                return Iter.toArray(Map.vals(skillsById));
            };
            case null {
                return [];
            };
        };
    };
}