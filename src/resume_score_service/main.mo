// src/resume_score_service/main.mo

import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Char "mo:base/Char";

import Type "../shared/Type";

persistent actor ResumeScoreService {

  // helper: cek ada digit
  func hasDigit(t : Text) : Bool {
    for (c in t.chars()) {
      if (Char.isDigit(c)) { return true };
    };
    false
  };

  func anyDescHasDigit(exps : [Type.WorkExperience]) : Bool {
    for (e in exps.vals()) {
      if (hasDigit(e.description)) { return true };
    };
    false
  };

  func concatExperienceText(exps : [Type.WorkExperience]) : Text {
    var acc : Text = "";
    for (e in exps.vals()) { acc := acc # " " # e.description # " " # e.jobTitle };
    acc
  };

  // --- Categories ---

  func contentQuality(r : Type.Resume) : Type.ScoreCategory {
    let skillsCount = Array.size(r.skills);
    let bioLen = r.personalInfo.bio.size();
    let hasNumbers = anyDescHasDigit(r.workExperience);

    var score : Nat = 50;
    if (skillsCount >= 5) { score += 20 } else { score += Nat.min(20, skillsCount * 4) };
    if (bioLen > 60) { score += 15 } else if (bioLen > 20) { score += 8 };
    if (hasNumbers) { score += 15 };
    if (score > 100) { score := 100 };

    var suggestions : [Text] = [];
    if (skillsCount < 5) suggestions := Array.append(suggestions, ["Add more relevant skills (≥ 5)."]);
    if (bioLen <= 60) suggestions := Array.append(suggestions, ["Strengthen bio with more keywords (≥ 60 chars)."]);
    if (not hasNumbers) suggestions := Array.append(suggestions, ["Use quantifiable achievements (numbers/percent)."]);

    {
      name = "Content Quality";
      score = score;
      maxScore = 100;
      suggestions = suggestions;
    }
  };

  func formatDesign(_r : Type.Resume) : Type.ScoreCategory {
    {
      name = "Format & Design";
      score = 90;
      maxScore = 100;
      suggestions = ["Maintain consistent spacing and headings."];
    }
  };

  func keywordOptimization(r : Type.Resume) : Type.ScoreCategory {
    let haystack = Text.toLowercase(r.personalInfo.bio # " " # concatExperienceText(r.workExperience));
    let total = Array.size(r.skills);
    var hit : Nat = 0;
    for (s in r.skills.vals()) {
      if (Text.contains(haystack, #text (Text.toLowercase(s.name)))) { hit += 1 };
    };
    let score =
      if (total == 0) 0
      else Nat.min(100, (hit * 100) / total);

    var suggestions : [Text] = [];
    if (score < 80) {
      suggestions := ["Include more role/industry-specific keywords in summary & experience."];
    };

    {
      name = "Keyword Optimization";
      score = score;
      maxScore = 100;
      suggestions = suggestions;
    }
  };

  func completeness(r : Type.Resume) : Type.ScoreCategory {
    var pts : Nat = 0;
    var total : Nat = 6;

    if (r.personalInfo.fullName.size() > 0) pts += 1;
    if (r.personalInfo.email.size() > 0) pts += 1;
    if (Array.size(r.workExperience) > 0) pts += 1;
    if (Array.size(r.education) > 0) pts += 1;
    if (Array.size(r.skills) > 0) pts += 1;
    if (Array.size(r.socialLinks) > 0) pts += 1;

    let score = (pts * 100) / total;

    var suggestions : [Text] = [];
    if (r.personalInfo.fullName.size() == 0) suggestions := Array.append(suggestions, ["Add your full name."]);
    if (r.personalInfo.email.size() == 0) suggestions := Array.append(suggestions, ["Add a contact email."]);
    if (Array.size(r.workExperience) == 0) suggestions := Array.append(suggestions, ["Add at least one work experience."]);
    if (Array.size(r.education) == 0) suggestions := Array.append(suggestions, ["Add education details."]);
    if (Array.size(r.skills) == 0) suggestions := Array.append(suggestions, ["Add relevant skills."]);
    if (Array.size(r.socialLinks) == 0) suggestions := Array.append(suggestions, ["Add a LinkedIn or portfolio link."]);

    {
      name = "Completeness";
      score = score;
      maxScore = 100;
      suggestions = suggestions;
    }
  };

  func atsCompat(r : Type.Resume) : Type.ScoreCategory {
    func hasSpecial(t : Text) : Bool {
      Text.contains(t, #char '•') or Text.contains(t, #char '▪') or Text.contains(t, #char '→')
    };

    var ok = not hasSpecial(r.personalInfo.bio);
    for (e in r.workExperience.vals()) {
      if (hasSpecial(e.description)) { ok := false };
    };

    let score : Nat = if (ok) 90 else 70;
    let suggestions = if (ok) [] else ["Avoid special symbols (•, ▪, →) in text."];

    {
      name = "ATS Compatibility";
      score = score;
      maxScore = 100;
      suggestions = suggestions;
    }
  };

  // --- FIXED: gunakan semicolon dan lengkapi field record
  func improvementsFrom(categories : [Type.ScoreCategory]) : [Type.Improvement] {
    var res : [Type.Improvement] = [];
    for (c in categories.vals()) {
      if (c.score < 80) {
        let s = if (Array.size(c.suggestions) > 0) c.suggestions[0] else ("Improve " # c.name # ".");
        let prio : Type.Priority = if (c.score < 60) #High else #Medium;
        res := Array.append(res, [{
          priority = prio;
          title = c.name # " needs work";
          description = s;
          example = "Add specific metrics, keywords, or missing details as suggested.";
        }]);
      };
    };
    if (Array.size(res) == 0) {
      res := [{
        priority = #Low;
        title = "Nice!";
        description = "Your resume looks solid. Fine-tune keywords and formatting to reach 90+.";
        example = "Refine action verbs, ensure consistent date formats.";
      }];
    };
    res
  };

  public shared query func analyze(resume : Type.Resume) : async Type.ResumeScoreReport {
    let c1 = contentQuality(resume);
    let c2 = formatDesign(resume);
    let c3 = keywordOptimization(resume);
    let c4 = completeness(resume);
    let c5 = atsCompat(resume);

    let cats : [Type.ScoreCategory] = [c1, c2, c3, c4, c5];

    let overall : Nat = Nat.min(
      100,
      (c1.score * 30 + c2.score * 15 + c3.score * 25 + c4.score * 20 + c5.score * 10) / 100
    );

    {
      overall = overall;
      rankPercentile = if (overall >= 85) 85 else if (overall >= 70) 70 else 50;
      categories = cats;
      improvements = improvementsFrom(cats);
    }
  };
}
