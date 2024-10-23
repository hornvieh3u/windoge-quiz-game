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
    public type QTime = Int;
    public type TimerId = Nat;

    // several types
    public type Log = {
        logPlayerId: PlayerId;
        logPlayerName: PlayerName;
        logQAId: QAId;
        logAnswer: Text;
        logScore: Nat;
        logTime: Int;
    };
    public type Player = {
        id: PlayerId;
        name: PlayerName;
        password: Text;
        principal: ?Principal;
        score: Nat;
        rounds_played: Nat;
        rounds_passed: Nat;
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
        var startTime: QTime;
        var status: Nat;
        var timerId: TimerId;
    }
}