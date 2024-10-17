import Nat "mo:base/Nat";
import Text "mo:base/Text";
import Principal "mo:base/Principal";

module {

    // id types
    public type QAId = Int;
    public type QType = Nat;
    public type PlayerId = Int;
    public type PlayerName = Text;
    public type PlayerStatus = Nat;

    // several types
    public type TriviaLog = {
        logQAId: QAId;
        logAnswer: Text;
        createdAt: Int;
    };
    public type Player = {
        id: PlayerId;
        name: PlayerName;
        password: Text;
        status: PlayerStatus;
        principal: ?Principal;
        score: Nat;
        rounds_played: Nat;
        max_rounds: Nat;
        trivia_logs: [?TriviaLog];
    };
    public type QA = {
        id: QAId;
        qType: QType;
        question: Text;
        answer: Text;
        hint: Text;
    };
    public type TriviaGame = {
        var currentQAId: QAId;
        var timeLimit: Nat;
    }
}