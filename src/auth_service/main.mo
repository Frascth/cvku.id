import Principal "mo:base/Principal";

actor AuthService {
    public shared query ({ caller : Principal }) func whoami() : async Principal {
        return caller;
    };
};
