import Text "mo:base/Text";
import Result "mo:base/Result";
import Bool "mo:base/Bool";

module {
  // one to one
  // private stable var personalInfoByPrincipal = Map.new<Principal, PersonalInfo>();

  // one to one example
  // private stable var personalInfoByPrincipal = {
  //   clientA: PersonalInfo,
  //   clientB: PersonalInfo,
  //   clientC: PersonalInfo,
  // };

  // one to many
  // private stable var workExpByPrincipal = Map.new<Principal, Map.Map<Nat, WorkExperience>>();
  // private stable var educationByPrincipal = Map.new<Principal, Map.Map<Nat, Education>>();
  // private stable var skillByPrincipal = Map.new<Principal, Map.Map<Nat, Skill>>();

  // one to many example
  // private stable var workExpByPrincipal = {
  //   clientA: {
  //     1: WorkExperience, // as map not array/list for indexing (fast crud) complexity O(1)
  //     2: WorkExperience
  //   },
  //   clientB: {
  //     23: WorkExperience,
  //     99: WorkExperience
  //   },
  //   clientB: {
  //     103: WorkExperience,
  //     900: WorkExperience
  //   },
  // };

  public type SkillLevel = { #Beginner; #Intermediate; #Advanced; #Expert };

  public type Role = Text;

  public let ROLE_CLIENT : Role = "client";

  public let ROLE_ADMIN : Role = "admin";

  public type CreatedResponse = {
    lid:Text;
    id:Nat
  };

  public type UpdatedResponse = {
    id:Nat
  };

  public type DeletedResponse = {
    id:Nat
  };
  
  public type SuccessResponse<T> = {
    data: T;
    message : Text;
  };

  public type ErrorResponse = {
    message : Text;
  };

  // https://internetcomputer.org/docs/motoko/base/Result
  // example of usage in src/custom_section_service/main.mo
  public type Response<T> = Result.Result<SuccessResponse<T>, ErrorResponse>;

  public type PersonalInfo = {
    fullName : Text;
    email : Text;
    phone : Text;
    location : Text;
    website : Text;
    bio : Text;
    photoUrl : ?Text;
  };

  public type WorkExperience = {
    id : Nat;
    jobTitle : Text;
    company : Text;
    startDate : Text;
    endDate : Text;
    current : Bool;
    description : Text;
  };

  public type Education = {
    id : Nat;
    degree : Text;
    institution : Text;
    graduationDate : Text;
    gpa : ?Text;
  };

  public type Skill = {
    id : Text;
    name : Text;
    level : SkillLevel;
  };

  public type Certification = {
    id : Text;
    name : Text;
    issuer : Text;
    date : Text;
    credentialId : ?Text;
  };

  public type CustomSectionItem = {
    sectionId : Nat;
    id : Nat;
    title : Text;
    description : Text;
    subtitle : ?Text;
    date : ?Text;
  };

  public type CustomSection = {
    id : Nat;
    name : Text;
    items: [CustomSectionItem];
  };

  public type CoverLetterBuilder = {
    id : Nat;
    companyName : Text;
    jobTitle : Text;
    recipientName : Text;
    tone : Text;
    jobDescription : Text;
  };

  public type CoverLetterEditor = {
    id : Nat;
    introduction : Text;
    body : Text;
    conclusion : Text;
  };

  public type SocialLink = {
    id : Nat;
    platform : Text;
    url : Text;
  };

  public type ResumeLink = {
    id : Nat;
    path : Text;
    isPublic: Bool;
  };

  public type ATSCheck = {
    name : Text;
    passed : Bool;
    tip : Text;
  };

  public type ATSCategory = {
    category : Text;
    checks : [ATSCheck];
  };

  public type ATSReport = {
    score : Nat;
    categories : [ATSCategory];
  };

  // resume_service/main.mo assemble all
  public type Resume = {
    personalInfo : PersonalInfo;
    workExperience : [WorkExperience];
    education : [Education];
    skills : [Skill];
    certifications : [Certification];
    socialLinks : [SocialLink];
    customSections : [CustomSection];
  };
};
