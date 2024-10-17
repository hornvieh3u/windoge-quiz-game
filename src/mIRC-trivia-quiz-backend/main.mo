import Const "const";
import Types "types";
import RBTree "mo:base/RBTree";
import Time "mo:base/Time";
import Text "mo:base/Text";
import Int "mo:base/Int";

actor Trivia {
    var players = RBTree.RBTree<Types.PlayerName, Types.Player>(Text.compare);
    var QAs = RBTree.RBTree<Types.QAId, Types.QA>(Int.compare);
    var trivia_logs = RBTree.RBTree<Types.QATime, Types.TriviaLog>(Int.compare);
    var game: Types.TriviaGame = { var currentQAId = -1; var timeLimit = Const.CONFIG.TIME_LIMIT; var startTime = 0; };

    public func sign_up(name: Text, password: Text) : async Bool {
        var prevPlayer = players.get(name);
        if (prevPlayer != null) return false;

        var player = {
            id = Time.now();
            status = Const.PSTATUS.INACTIVE;
            name;
            password;
            score = 0;
            rounds_played = 0;
            max_rounds = 0;
            principal = null;
        };

        players.put(name, player);

        return true;
    };

    public func sign_in(name: Text, password: Text) : async (Bool, ?Types.Player) {
        switch(players.get(name)) {
            case null (false, null);
            case (?player) {
                if (player.password != password) {
                    return (false, null);
                };

                (true, ?player);
            }
        }
    };

    public func add_QA(qType: Types.QType, question: Text, answer: Text, hint: Text) : async Int {
        var newQAId: Types.QAId = Time.now();
        var newQA: Types.QA = {
            id = newQAId;
            qType;
            question;
            answer;
            hint;
        };

        QAs.put(newQAId, newQA);
        return newQA.id;
    };

    public func get_current_QA() : async ?Types.QA {
        QAs.get(game.currentQAId);
    };

    public func set_game_current_QAId(QAId: Types.QAId) : async () {
        game.currentQAId := QAId;
    };

    public func set_game_time_limit(time_limit: Nat) : async () {
        game.timeLimit := time_limit;
    };

    public func set_game_start_time() : async Int {
        game.startTime := Time.now();
        game.startTime;
    };

}