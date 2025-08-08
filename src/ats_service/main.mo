// src/ats_service/main.mo

import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Bool "mo:base/Bool";
import Array "mo:base/Array";

import Type "../shared/Type";

persistent actor ATSOptimizer {

  // Cek apakah sebuah Text mengandung satu karakter tertentu
  private func hasChar(text : Text, char : Char) : Bool {
    return Text.contains(text, #char char);
  };

  private func hasSpecialChars(text : Text) : Bool {
    return hasChar(text, '•') or hasChar(text, '▪') or hasChar(text, '→');
  };

  // Helper generic: cek semua elemen memenuhi predicate
  private func all<A>(arr : [A], p : A -> Bool) : Bool {
    for (x in arr.vals()) {
      if (not p(x)) {
        return false;
      };
    };
    return true;
  };

  public shared query func analyzeResume(data : Type.Resume) : async Type.ATSReport {

    var passedChecksCount : Nat = 0;
    var totalChecksCount : Nat = 0;

    // --- Kategori 1: Format & Structure
    let standardHeadersPassed = Array.size(data.workExperience) > 0 and Array.size(data.education) > 0;

    let formatChecks : [Type.ATSCheck] = [
      { name = "Uses standard fonts"; passed = true; tip = "Use Arial, Calibri, or Times New Roman" },
      { name = "No images or graphics"; passed = true; tip = "This check assumes no images are used in the final resume document" },
      { name = "Simple formatting"; passed = true; tip = "Avoid complex tables and columns" },
      { name = "Standard section headers"; passed = standardHeadersPassed; tip = "Ensure 'Experience' and 'Education' sections are filled" }
    ];

    // --- Kategori 2: Keywords & Content
    let bioHasContent = data.personalInfo.bio.size() > 20;
    let skillsOptimized = Array.size(data.skills) >= 5;
    let jobTitlesStandard = Array.size(data.workExperience) > 0;
    let datesExist = all<Type.WorkExperience>(
      data.workExperience,
      func(exp : Type.WorkExperience) {
        exp.startDate.size() > 0 and exp.endDate.size() > 0
      }
    );

    let contentChecks : [Type.ATSCheck] = [
      { name = "Bio contains keywords"; passed = bioHasContent; tip = "Expand your bio with relevant industry keywords and achievements." },
      { name = "Skills section optimized"; passed = skillsOptimized; tip = "List at least 5 relevant skills that match job requirements." },
      { name = "Job titles match industry standards"; passed = jobTitlesStandard; tip = "Use standard job titles that ATS can recognize." },
      { name = "Consistent date formatting"; passed = datesExist; tip = "Ensure all dates are filled and use a consistent format (e.g., MM/YYYY)" }
    ];

    // --- Kategori 3: Technical Requirements
    let noSpecial = not hasSpecialChars(data.personalInfo.bio)
      and all<Type.WorkExperience>(
        data.workExperience,
        func(exp : Type.WorkExperience) {
          not hasSpecialChars(exp.description)
        }
      );

    let techChecks : [Type.ATSCheck] = [
      { name = "File format compatible"; passed = true; tip = "Use .docx or .pdf format for downloads." },
      { name = "No special characters"; passed = noSpecial; tip = "Avoid using graphical bullets or symbols in your descriptions." }
    ];

    // Gabungkan kategori
    let allCategories : [Type.ATSCategory] = [
      { category = "Format & Structure"; checks = formatChecks },
      { category = "Keywords & Content"; checks = contentChecks },
      { category = "Technical Requirements"; checks = techChecks }
    ];

    // Hitung skor
    for (category in allCategories.vals()) {
      for (check in category.checks.vals()) {
        if (check.passed) {
          passedChecksCount += 1;
        };
        totalChecksCount += 1;
      };
    };

    let finalScore = if (totalChecksCount == 0) 0 else (passedChecksCount * 100 / totalChecksCount);

    let finalReport : Type.ATSReport = {
      score = finalScore;
      categories = allCategories;
    };

    return finalReport;
  };
};
