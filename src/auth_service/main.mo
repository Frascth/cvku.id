import Principal "mo:base/Principal";

persistent actor AuthService {
    public shared query ({ caller:Principal }) func whoami() : async Principal {
        return caller;
    };
};
