import HashMap "mo:base/HashMap";
import Nat32 "mo:base/Nat32";
import Hash "mo:base/Hash";
import Text "mo:base/Text";
import Array "mo:base/Array";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Result "mo:base/Result";

persistent actor {

  // ================== Types (pindah ke dalam actor) ==================
  public type CoverLetterBuilder = {
    recipientName : Text;
    companyName : Text;
    jobTitle : Text;
    jobDescription : Text;
    tone : Text;
  };

  public type CoverLetterEditor = {
    introduction : Text;
    body : Text;
    conclusion : Text;
  };

  public type CoverLetter = {
    id : Nat;
    builder : CoverLetterBuilder;
    editor : CoverLetterEditor;
  };

  public type Request = { system_prompt : Text; user_prompt : Text };
  public type Response = { completion : Text };
  public type Error = { code : Nat; message : Text };

  let llm_service : actor {
    generate : (Request) -> async Result.Result<Response, Error>;
  } = actor ("v27v7-7x777-77774-qaaha-cai");

  // === Tambahan tipe untuk v0_chat ===
  public type Role = { #user; #assistant; #system_ };
  public type ChatMessage = {
    content : Text;
    role : Role;
  };

  public type V0ChatRequest = {
    model : Text;
    messages : [ChatMessage];
  };

  // ================== Helpers & External actors ==================
  private func natHash(n : Nat) : Hash.Hash { Nat32.fromNat(n) };

  // Hardcode principal LLM (boleh diganti alias canister: llm_service)
  // Jika mau alias:
  //   import LLM "canister:llm_service";
  //   let llm_service : actor { generate : (Request) -> async Result.Result<Response, Error> } = LLM;
  // JANGAN dihapus, biarkan ada supaya stable check lolos (jangan dipakai lagi)

  // Pakai var baru (transient biar nggak masuk stable layout)
  transient let llm_chat : actor {
    v0_chat : (V0ChatRequest) -> async Text;
  } = actor ("v27v7-7x777-77774-qaaha-cai");

  // ================== State ==================
  private var nextId : Nat = 0;

  // stable buffer untuk upgrade
  private var coverLettersEntries : [(Nat, CoverLetter)] = [];

  // in-memory map
  transient let coverLetters = HashMap.HashMap<Nat, CoverLetter>(10, Nat.equal, natHash);

  system func preupgrade() {
    coverLettersEntries := Iter.toArray(coverLetters.entries());
  };

  system func postupgrade() {
    for ((k, v) in coverLettersEntries.vals()) {
      coverLetters.put(k, v);
    };
    coverLettersEntries := [];

    // Supaya gak warning M0194 tapi tetap aman untuk stable layout:
    ignore llm_service;
  };

  // ================== CRUD ==================
  public shared func createCoverLetter(builder : CoverLetterBuilder) : async Nat {
    let id = nextId;
    nextId += 1;

    let cl : CoverLetter = {
      id = id;
      builder = builder;
      editor = { introduction = ""; body = ""; conclusion = "" };
    };

    coverLetters.put(id, cl);
    id;
  };

  public shared query func getCoverLetter(id : Nat) : async ?CoverLetter {
    coverLetters.get(id);
  };

  public shared func updateCoverLetter(id : Nat, editor : CoverLetterEditor) : async ?CoverLetter {
    switch (coverLetters.get(id)) {
      case (null) { null };
      case (?cl) {
        let updated : CoverLetter = { cl with editor = editor };
        coverLetters.put(id, updated);
        ?updated;
      };
    };
  };

  // ================== Generate via LLM ==================
  public shared func generateCoverLetter(builder : CoverLetterBuilder) : async ?CoverLetterEditor {
    let userText = "Recipient: " # (if (builder.recipientName == "") "Hiring Manager" else builder.recipientName) # "\n" #
    "Company: " # builder.companyName # "\n" #
    "Job Title: " # builder.jobTitle # "\n" #
    "Job Description: " # builder.jobDescription # "\n" #
    "Tone: " # builder.tone;

    let req : V0ChatRequest = {
      model = "llama-3.1-8b-instruct";
      messages = [
        {
          role = #system_;
          content = "You are an expert cover letter writer. Output EXACTLY three paragraphs: an introduction, a body, and a conclusion. Keep it concise and professional.";
        },
        {
          role = #user;
          content = userText;
        },
      ];
    };

    let completion : Text = await llm_chat.v0_chat(req);

    let partsIter = Text.split(completion, #text "\n\n");
    let partsArr = Iter.toArray(partsIter);

    let intro = if (Array.size(partsArr) > 0) partsArr[0] else "";
    let body = if (Array.size(partsArr) > 1) partsArr[1] else "";
    let concl = if (Array.size(partsArr) > 2) partsArr[2] else "";

    ?{ introduction = intro; body = body; conclusion = concl };
  };
};
