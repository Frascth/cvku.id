// src/certification_service/main.mo

import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat"; // Masih dibutuhkan untuk nextId generator
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text"; 

// Import semua tipe dari shared/Type.mo
import Type "../shared/Type";

actor CertificationService {
    // Map data sertifikasi per Principal (pengguna)
    // Map<Principal, Map<Text, Type.Certification>> <-- Kunci Map sekarang Text
    private stable var certificationByPrincipal = Map.new<Principal, Map.Map<Text, Type.Certification>>();

    // ID unik untuk setiap entri sertifikasi di seluruh canister (masih Nat untuk auto-increment)
    private stable var nextId: Nat = 0;

    // --- Fungsi Klien (Untuk Pengguna Langsung) ---

    // Mengambil semua entri sertifikasi untuk caller saat ini
    public shared query ({ caller }) func clientGetAll() : async [Type.Certification] {
        switch (Map.get(certificationByPrincipal, Map.phash, caller)) {
            case (?certificationMap) {
                return Iter.toArray(Map.vals(certificationMap));
            };
            case null {
                return [];
            };
        };
    };

    // Menambah entri sertifikasi baru untuk caller saat ini
    public shared ({ caller }) func clientAdd(request: {
        name: Text;
        issuer: Text;
        date: Text;
        credentialId: ?Text;
    }) : async Type.Certification {
        nextId += 1; // Increment Nat ID

        let newCertification: Type.Certification = {
            id = Nat.toText(nextId); // Ini yang benar untuk mengonversi Nat ke Text // Konversi Nat ke Text untuk ID Sertifikasi
            name = request.name;
            issuer = request.issuer;
            date = request.date;
            credentialId = request.credentialId;
        };

        // Dapatkan map sertifikasi yang sudah ada untuk caller atau buat yang baru
        // Map<Text, Type.Certification> <-- Map key sekarang Text
        let certificationById = switch (Map.get(certificationByPrincipal, Map.phash, caller)) {
            case (?certs) certs;
            case null Map.new<Text, Type.Certification>(); // Map key sekarang Text
        };

        // Set (simpan/update) entri sertifikasi baru ke map pengguna
        Map.set(certificationById, Map.thash, newCertification.id, newCertification); // Gunakan thash dan Text ID

        // Simpan kembali map pengguna yang sudah diperbarui ke map utama
        Map.set(certificationByPrincipal, Map.phash, caller, certificationById);

        return newCertification;
    };

    // Memperbarui entri sertifikasi secara batch untuk caller saat ini
    public shared ({ caller }) func clientBatchUpdate(newCertifications: [Type.Certification]) : async [Type.Certification] {
        let certById = switch (Map.get(certificationByPrincipal, Map.phash, caller)) {
            case (?val) val;
            case null return [];
        };

        var updatedCertifications : [Type.Certification] = [];

        for (cert in newCertifications.vals()) {
            // Gunakan thash dan Text ID dari cert
            switch (Map.get(certById, Map.thash, cert.id)) {
                case (?_) { // Jika entri dengan ID ini ada
                    Map.set(certById, Map.thash, cert.id, cert); // Update
                    updatedCertifications := Array.append(updatedCertifications, [cert]);
                };
                case null {};
            };
        };

        Map.set(certificationByPrincipal, Map.phash, caller, certById);

        return updatedCertifications;
    };

    // Menghapus entri sertifikasi berdasarkan ID untuk caller saat ini
    public shared ({ caller }) func clientDeleteById(id: Text) : async Bool { // ID yang diterima sekarang Text
        let maybeCertById = Map.get(certificationByPrincipal, Map.phash, caller);

        let certById = switch maybeCertById {
            case (?val) val;
            case null return false;
        };

        // Gunakan thash dan Text ID
        return switch (Map.remove(certById, Map.thash, id)) {
            case (?_) true;
            case null false;
        };
    };

    // --- Fungsi Internal/Untuk Canister Lain (jika diperlukan) ---
    public shared query ({ caller = _ }) func getAllByClient(client: Principal) : async [Type.Certification] {
        switch (Map.get(certificationByPrincipal, Map.phash, client)) {
            case (?certificationMap) {
                return Iter.toArray(Map.vals(certificationMap));
            };
            case null {
                return [];
            };
        };
    };
}