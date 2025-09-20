// src/certification_service/main.mo

import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Nat "mo:base/Nat"; // Masih dibutuhkan untuk nextId generator
import Iter "mo:base/Iter";
import Array "mo:base/Array";
import Text "mo:base/Text";

// Import semua tipe dari shared/Type.mo
import Type "../shared/Type";

persistent actor CertificationService {
  // Map data sertifikasi per Principal (pengguna)
  // Map<Principal, Map<Text, Type.Certification>> <-- Kunci Map sekarang Text
  private var certificationByPrincipal = Map.new<Principal, Map.Map<Text, Type.Certification>>();

  // ID unik untuk setiap entri sertifikasi di seluruh canister (masih Nat untuk auto-increment)
  private var nextId : Nat = 0;

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
  public shared ({ caller }) func clientAdd(
    request : {
      lid : Text;
      name : Text;
      issuer : Text;
      date : Text;
      credentialId : ?Text;
    }
  ) : async Type.Response<Type.CreatedResponse> {
    nextId += 1; // Increment Nat ID

    let newCertification : Type.Certification = {
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

    let natId = switch (Nat.fromText(newCertification.id)) {
      case (null) {
        return #err({
          message = "Invalid certification id";
        });
      };
      case (?val) val;
    };

    let lidNat : Nat = switch (Nat.fromText(request.lid)) {
      case (?n) n;
      case null {
        return #err({
          message = "Invalid lid: must be a natural number";
        });
      };
    };

    return #ok({
      data = {
        lid = lidNat; // sekarang Nat
        id = natId; // Nat
      };
      message = "Success certification added";
    });
  };

  // Memperbarui entri sertifikasi secara batch untuk caller saat ini
  public shared ({ caller }) func clientBatchUpdate(newCertifications : [Type.Certification]) : async Type.Response<()> {
    let certById = switch (Map.get(certificationByPrincipal, Map.phash, caller)) {
      case null {
        return #ok({
          data = ();
          message = "Success update certification";
        });
      };
      case (?val) val;
    };

    var updatedCertifications : [Type.Certification] = [];

    for (cert in newCertifications.vals()) {
      // Gunakan thash dan Text ID dari cert
      switch (Map.get(certById, Map.thash, cert.id)) {
        case (?_) {
          // Jika entri dengan ID ini ada
          Map.set(certById, Map.thash, cert.id, cert); // Update
          updatedCertifications := Array.append(updatedCertifications, [cert]);
        };
        case null {};
      };
    };

    Map.set(certificationByPrincipal, Map.phash, caller, certById);

    return #ok({
      data = ();
      message = "Success update certification";
    });
  };

  // Menghapus entri sertifikasi berdasarkan ID untuk caller saat ini
  public shared ({ caller }) func clientDeleteById(id : Text) : async Type.Response<Type.DeletedResponse> {
    // ID yang diterima sekarang Text
    let maybeCertById = Map.get(certificationByPrincipal, Map.phash, caller);

    let certById = switch maybeCertById {
      case null {
        return #err({
          message = "Empty certification";
        });
      };
      case (?val) val;
    };

    let natId = switch (Nat.fromText(id)) {
      case (null) {
        return #err({
          message = "Invalid certification id";
        });
      };
      case (?val) val;
    };

    // Gunakan thash dan Text ID
    return switch (Map.remove(certById, Map.thash, id)) {
      case null {
        return #err({
          message = "Certification with ID " # id # " not found";
        });
      };
      case (?_) {
        return #ok({
          data = {
            id = natId;
          };
          message = "Success delete certification";
        });
      };
    };
  };

  // --- Fungsi Internal/Untuk Canister Lain (jika diperlukan) ---
  public shared query ({ caller = _ }) func getAllByClient(client : Principal) : async [Type.Certification] {
    switch (Map.get(certificationByPrincipal, Map.phash, client)) {
      case (?certificationMap) {
        return Iter.toArray(Map.vals(certificationMap));
      };
      case null {
        return [];
      };
    };
  };
};
