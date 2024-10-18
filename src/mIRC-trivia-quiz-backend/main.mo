import Const "const";
import Types "types";
import RBTree "mo:base/RBTree";
import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import StableRbTree "StableRBTree";

actor Trivia {
    var players = RBTree.RBTree<Types.PlayerName, Types.Player>(Text.compare);
    stable var QAs = StableRbTree.init<Types.QAId, Types.QA>();
    // var trivia_logs = RBTree.RBTree<Types.QATime, [Types.TriviaLog]>(Int.compare);

    var game: Types.TriviaGame = {
        var currentQAId = -1;
        var timeLimit = Const.CONFIG.TIME_LIMIT;
        var startTime = 0;
        var status = Const.GAME_STATUS.INACTIVE;
        var timerId = 0;
    };

    public func start() : async () {
        game.timerId := Timer.recurringTimer<system>(#seconds (game.timeLimit), idle);
        game.status := Const.GAME_STATUS.ACTIVE;
    };

    public func stop() : async () {
        Timer.cancelTimer(game.timerId);
        game.status := Const.GAME_STATUS.STOP;
    };


    public func sign_up(name: Text, password: Text) : async Bool {
        var prevPlayer = players.get(name);
        if (prevPlayer != null) return false;

        var player = {
            id = Time.now();
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

        QAs := StableRbTree.put(QAs, Int.compare, newQAId, newQA);
        return newQA.id;
    };

    public func get_current_QA() : async ?Types.QA {
        StableRbTree.get(QAs, Int.compare, game.currentQAId);
    };

    public func check_answer(playerId: Types.PlayerId, playerName: Types.PlayerName, answer: Text) : async Bool {
        // validate user
        if (not (await validate_player(playerId, playerName))) return false;

        // check answer
        switch(StableRbTree.get(QAs, Int.compare, game.currentQAId)) {
            case null false;
            case (?currentQA) {
                var score = await score_answer(currentQA.qType, currentQA.answer, answer);
                return true;
            }
        }
    };

    public func set_game_time_limit(time_limit: Nat) : async () {
        game.timeLimit := time_limit;
        await stop();
        await start();
    };

    // deprecated
    public func get_QA(QAId: Types.QAId) : async ?Types.QA {
        StableRbTree.get(QAs, Int.compare, QAId);
    };

    public func get_QAId_text() : async Text {
        var text = "";
        for (entry in StableRbTree.entries(QAs)) {
            text #= Int.toText(entry.0) # ",";
        };

        return text # " all done!";
    };
    // deprecated

    private func validate_player(playerId: Types.PlayerId, playerName: Types.PlayerName) : async Bool {

        switch(players.get(playerName)) {
            case null return false;
            case (?player) {
                if (player.id != playerId) return false;

                return true;
            }
        };
    };

    private func score_answer(qType: Types.QType, qAnswer: Text, pAnswer: Text) : async Nat {

        if ((qType == Const.QTYPES.SINGLE or qType == Const.QTYPES.SELECT) and qAnswer == pAnswer) {
            return Const.CONFIG.ROUND_SCORE;
        };

        if (qType == Const.QTYPES.MULTIPLE) {
            var splitChar: Text.Pattern = #char ',';
            var qAnswers: Iter.Iter<Text> = Text.split(qAnswer, splitChar);
            var pAnswers: Iter.Iter<Text> = Text.split(pAnswer, splitChar);

            Iter.iterate(qAnswers, func (qItem: Text, _i: Nat) {
                Debug.print(qItem);
            });
            Iter.iterate(pAnswers, func (pItem: Text, _i: Nat) {
                Debug.print(pItem);
            });
        };

        return 0;
    };

    private func update_player() : async () {

    };

    private func idle() : async () {
        var isNext = false;
        for (entry in StableRbTree.entries(QAs)) {
            if (game.currentQAId == -1 or isNext) {
                game.currentQAId := entry.0;
                game.startTime := Time.now();
                Debug.print(Int.toText(game.currentQAId));
                return;
            };

            if (entry.0 == game.currentQAId) {
                isNext := true;
            };
        };

        await stop();
        game.currentQAId := -1;
    };
}