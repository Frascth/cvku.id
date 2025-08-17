// src/ats_service/main.mo

import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Array "mo:base/Array";
import Char "mo:base/Char";
import Type "../shared/Type";

persistent actor ATSOptimizer {

  // Helper cek karakter khusus
  private func hasChar(t : Text, c : Char) : Bool {
    Text.contains(t, #char c)
  };

  private func hasSpecialChars(t : Text) : Bool {
    hasChar(t, '•') or hasChar(t, '▪') or hasChar(t, '→')
  };

  // all()
  private func all<A>(arr : [A], p : A -> Bool) : Bool {
    for (x in arr.vals()) { if (not p(x)) { return false } };
    true
  };

  public shared query func analyzeResume(data : Type.Resume) : async Type.ATSReport {
    var passedChecksCount : Nat = 0;
    var totalChecksCount  : Nat = 0;

    // --- Kondisi dasar yang bisa dinilai dari data ---
    let hasWork    = Array.size(data.workExperience) > 0;
    let hasEdu     = Array.size(data.education) > 0;
    let headersOk  = hasWork and hasEdu;

    let bioHasContent = Text.size(data.personalInfo.bio) >= 50;
    let skillsOptimized = Array.size(data.skills) >= 5;

    let titlesPresent = all<Type.WorkExperience>(
      data.workExperience,
      func (exp : Type.WorkExperience) : Bool {
        Text.size(exp.jobTitle) > 0
      }
    );

    // endDate boleh kosong jika current = true
    let datesOk = all<Type.WorkExperience>(
      data.workExperience,
      func (exp : Type.WorkExperience) : Bool {
        Text.size(exp.startDate) > 0 and (exp.current or Text.size(exp.endDate) > 0)
      }
    );

    let noSpecial = (not hasSpecialChars(data.personalInfo.bio)) and
      all<Type.WorkExperience>(
        data.workExperience,
        func (exp : Type.WorkExperience) : Bool {
          not hasSpecialChars(exp.description)
        }
      );

    // --- Cek yang hanya untuk tampilan (informasi), tidak dipakai untuk skoring ---
    let formatChecksDisplay : [Type.ATSCheck] = [
      { name = "Uses standard fonts";     passed = true;       tip = "Use Arial, Calibri, or Times New Roman" },
      { name = "No images or graphics";   passed = true;       tip = "Avoid images; ATS can't read them" },
      { name = "Simple formatting";       passed = true;       tip = "Avoid complex tables and columns" },
      { name = "Standard section headers";passed = headersOk;  tip = "Fill 'Experience' and 'Education' sections" },
    ];

    let contentChecksDisplay : [Type.ATSCheck] = [
      { name = "Bio contains keywords";     passed = bioHasContent;  tip = "Add relevant industry keywords to your bio" },
      { name = "Skills section optimized";  passed = skillsOptimized;tip = "List at least 5 relevant skills" },
      { name = "Job titles present";        passed = titlesPresent;  tip = "Use clear, standard job titles" },
      { name = "Consistent date formatting";passed = datesOk;        tip = "Fill all dates in MM/YYYY format" },
    ];

    let techChecksDisplay : [Type.ATSCheck] = [
      { name = "File format compatible"; passed = true;     tip = "Use .docx or .pdf for downloads" },
      { name = "No special characters";  passed = noSpecial;tip = "Avoid decorative bullets or symbols (• ▪ →)" },
    ];

    // --- Cek yang dipakai untuk menghitung skor (tanpa cek 'selalu true') ---
    let formatChecksScore : [Type.ATSCheck] = [
      { name = "Standard section headers"; passed = headersOk; tip = "" },
    ];
    let contentChecksScore = contentChecksDisplay; // semua bisa dinilai
    let techChecksScore : [Type.ATSCheck] = [
      { name = "No special characters"; passed = noSpecial; tip = "" },
    ];

    let scoredCategories : [Type.ATSCategory] = [
      { category = "Format & Structure";   checks = formatChecksScore },
      { category = "Keywords & Content";   checks = contentChecksScore },
      { category = "Technical Requirements"; checks = techChecksScore },
    ];

    // Yang dikirim ke FE untuk ditampilkan (lengkap)
    let displayCategories : [Type.ATSCategory] = [
      { category = "Format & Structure";   checks = formatChecksDisplay },
      { category = "Keywords & Content";   checks = contentChecksDisplay },
      { category = "Technical Requirements"; checks = techChecksDisplay },
    ];

    // Hitung skor hanya dari scoredCategories
    for (cat in scoredCategories.vals()) {
      for (chk in cat.checks.vals()) {
        if (chk.passed) { passedChecksCount += 1 };
        totalChecksCount += 1;
      }
    };

    let finalScore : Nat =
      if (totalChecksCount == 0) 0
      else (passedChecksCount * 100 / totalChecksCount);

    {
      score = finalScore;
      categories = displayCategories; // tampilkan semuanya di UI
    }
  };
};
