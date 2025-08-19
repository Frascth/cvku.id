import Map "mo:map/Map";
import Principal "mo:base/Principal";
import Text "mo:base/Text";
import Nat "mo:base/Nat";
import LLM "mo:llm";
import Type "../shared/Type";

persistent actor CoverLetterService {

  private var builderNextId : Nat = 0;

  private var builderByPrincipal = Map.new<Principal, Type.CoverLetterBuilder>();

  private var editorNextId : Nat = 0;

  private var editorByPrincipal = Map.new<Principal, Type.CoverLetterEditor>();

  public shared query ({ caller }) func clientGetBuilder() : async Type.Response<?Type.CoverLetterBuilder> {
    switch (Map.get(builderByPrincipal, Map.phash, caller)) {
      case null {
        return #ok({
          data = null;
          message = "Success get cover letter builder.";
        });
      };
      case (?value) {
        return #ok({
          data = ?value;
          message = "Success get cover letter builder.";
        });
      };
    };
  };

  public shared query ({ caller }) func clientGetEditor() : async Type.Response<?Type.CoverLetterEditor> {
    switch (Map.get(editorByPrincipal, Map.phash, caller)) {
      case null {
        return #ok({
          data = null;
          message = "Success get cover letter editor.";
        });
      };
      case (?value) {
        return #ok({
          data = ?value;
          message = "Success get cover letter editor.";
        });
      };
    };
  };

  private func storeBuilder(
    request : {
      client : Principal;
      companyName : Text;
      jobTitle : Text;
      recipientName : Text;
      tone : Text;
      jobDescription : Text;
    }
  ) : Type.CoverLetterBuilder {

    builderNextId += 1;

    let builder : Type.CoverLetterBuilder = {
      id = builderNextId;
      companyName = request.companyName;
      jobTitle = request.jobTitle;
      recipientName = request.recipientName;
      tone = request.tone;
      jobDescription = request.jobDescription;
    };

    let _ = Map.set(builderByPrincipal, Map.phash, request.client, builder);

    return builder;
  };

  private func storeEditor(
    request : {
      client : Principal;
      introduction : Text;
      body : Text;
      conclusion : Text;
    }
  ) : Type.CoverLetterEditor {

    editorNextId += 1;

    let editor : Type.CoverLetterEditor = {
      id = editorNextId;
      introduction = request.introduction;
      body = request.body;
      conclusion = request.conclusion;
    };

    let _ = Map.set(editorByPrincipal, Map.phash, request.client, editor);

    return editor;
  };

  public query func coverLetterPromptOf(
    request : {
      companyName : Text;
      jobTitle : Text;
      recipientName : Text;
      tone : Text;
      jobDescription : Text;
    }
  ) : async Text {
    let prompt = "You are a professional cover letter writer. " #
    "Write a personalized cover letter for the job below. " #
    "The cover letter must have exactly 3 sections: Introduction, Body, and Conclusion. " #
    "Output format rules:" #
    "\n- Separate the 3 sections strictly with a single '|' character." #
    "\n- Do not include section headers like 'Introduction' or 'Conclusion' — only the content." #
    "\n- No extra text, no commentary, no formatting other than the '|' separator." #
    "\n- Tone: " # request.tone #
    "\n" #
    "Input details:" #
    "\nCompany: " # request.companyName #
    "\nJob Title: " # request.jobTitle #
    "\nRecipient: " # request.recipientName #
    "\nJob Description: " # request.jobDescription #
    "\n" #
    "Output:";

    return prompt;
  };

  public shared ({ caller }) func clientGenerateAiCoverLetter(
    request : {
      companyName : Text;
      jobTitle : Text;
      recipientName : Text;
      tone : Text;
      jobDescription : Text;
    }
  ) : async Type.Response<Type.CoverLetterEditor> {
    let _ = storeBuilder({
      client = caller;
      companyName = request.companyName;
      jobTitle = request.jobTitle;
      recipientName = request.recipientName;
      tone = request.tone;
      jobDescription = request.jobDescription;
    });

    let prompt = await coverLetterPromptOf(request);

    let result : Text = await LLM.prompt(#Llama3_1_8B, prompt);

    let lowerResult = Text.toLowercase(result);

    if (Text.contains(lowerResult, #text "|") == false) {
      return #err({
        message = "Invalid result format: " # result;
      });
    };

    if (
      Text.contains(lowerResult, #text "i cannot") or
      Text.contains(lowerResult, #text "i'm sorry") or
      Text.contains(lowerResult, #text "unable to")
    ) {
      return #err({
        message = "LLM refused to generate description: " # result;
      });
    };

    let iterOfPart = Text.split(result, #text "|");

    let introduction = switch (iterOfPart.next()) {
      case (?txt) txt;
      case null "";
    };

    let body = switch (iterOfPart.next()) {
      case (?txt) txt;
      case null "";
    };

    let conclusion = switch (iterOfPart.next()) {
      case (?txt) txt;
      case null "";
    };

    let editor = storeEditor({
      client = caller;
      introduction = introduction;
      body = body;
      conclusion = conclusion;
    });

    return #ok({
      data = editor;
      message = "Success generate cover letter.";
    });
  };

};
