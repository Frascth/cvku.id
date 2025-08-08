import Text "mo:base/Text";

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
    id : Text;
    title : Text;
    subtitle : ?Text;
    description : Text;
    date : ?Text;
  };

  public type CustomSection = {
    id : Text;
    name : Text;
    items : [CustomSectionItem];
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
    id : Text;
    platform : Text;
    url : Text;
  };

  public type PublicLink = {
    id : Nat;
    link : Text;
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
