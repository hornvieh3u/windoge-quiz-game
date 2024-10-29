import Time "mo:base/Time";
import Timer "mo:base/Timer";
import Text "mo:base/Text";
import Int "mo:base/Int";
import Debug "mo:base/Debug";
import Iter "mo:base/Iter";
import Nat "mo:base/Nat";
import Array "mo:base/Array";
import Principal "mo:base/Principal";

import Const "const";
import Types "types";
import Utiles "utiles";
import StableRbTree "StableRBTree";

actor Trivia {
    stable var players = StableRbTree.init<Types.PlayerName, Types.Player>();
    stable var QAs = StableRbTree.init<Types.QAId, Types.QA>();
    stable var logs = StableRbTree.init<Types.QTime, [Types.Log]>();
    stable var indexes = StableRbTree.init<Text, Types.PlayerName>();

    stable var game: Types.TriviaGame = {
        var currentQAId = -1;
        var timeLimit = Const.CONFIG.TIME_LIMIT;
        var startTime = 0;
        var status = Const.GAME_STATUS.INACTIVE;
        var timerId = 0;
    };

    public func start() : async () {
        Debug.print("Here we start");
        Timer.cancelTimer(game.timerId);

        await idle();
        game.timerId := Timer.recurringTimer<system>(#seconds (game.timeLimit), idle);
        game.status := Const.GAME_STATUS.ACTIVE;
    };

    public func stop() : async () {
        Debug.print("Here we stop");
        Timer.cancelTimer(game.timerId);
        game.status := Const.GAME_STATUS.STOP;
    };

    public func sign_up(name: Text, password: Text, principal: Text) : async Bool {
        var prevPlayer = StableRbTree.get(players, Text.compare, name);
        if (prevPlayer != null) return false;

        var player: Types.Player = {
            id = Time.now();
            name;
            password;
            score = 0;
            rounds_played = 0;
            rounds_passed = 0;
            principal = ?Principal.fromText(principal);
        };

        players := StableRbTree.put(players, Text.compare, name, player);
        indexes := StableRbTree.put(indexes, Text.compare, principal, player.name);

        return true;
    };

    public func sign_in(name: Text, password: Text) : async (Bool, ?Types.Player) {
        switch(StableRbTree.get(players, Text.compare, name)) {
            case null (false, null);
            case (?player) {
                if (player.password != password) {
                    return (false, null);
                };

                (true, ?player);
            }
        }
    };

    public func sign_in_with_wallet(principal: Text) : async ?Types.Player {
        switch(StableRbTree.get(indexes, Text.compare, principal)) {
            case null null;
            case (?playerName) {
                StableRbTree.get(players, Text.compare, playerName)
            }
        }
    };

    public func add_QA(qType: Types.QType, question: Text, answer: Text, hint: Text) : async Int {

        for (entry in StableRbTree.entries(QAs)) {
            if (entry.1.question == question) return 0;
        };

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

    public func get_current_logs() : async (Int, ?[Types.Log]) {
        (game.startTime, StableRbTree.get(logs, Int.compare, game.startTime));
    };

    public func check_answer(playerId: Types.PlayerId, playerName: Types.PlayerName, answer: Text) : async (Bool, Nat) {
        // validate user
        if (not (await validate_player(playerId, playerName))) return (false, 0);

        // validate is answered
        if (await is_answered(playerId)) return (false, 0);

        // check answer
        switch(StableRbTree.get(QAs, Int.compare, game.currentQAId)) {
            case null (false, 0);
            case (?currentQA) {
                switch(StableRbTree.get(players, Text.compare, playerName)) {
                    case null (false, 0);
                    case (?player) {
                        var score = await score_answer(currentQA.qType, currentQA.answer, answer);
                        var updatedPlayer: Types.Player = {
                            id = player.id;
                            name = player.name;
                            password = player.password;
                            score = player.score + score;
                            rounds_played = player.rounds_played + 1;
                            rounds_passed = player.rounds_passed + (if (score > 0) 1 else 0);
                            principal = player.principal;
                        };
                        let (_, updatedPlayers) = StableRbTree.replace(players, Text.compare, playerName, updatedPlayer);
                        players := updatedPlayers;

                        await save_log(player.id, player.name, currentQA.id, answer, score);

                        (true, score);
                    }
                }
            }
        }
    };

    public func set_game_time_limit(time_limit: Nat) : async () {
        game.timeLimit := time_limit;
        await stop();
        await start();
    };

    // Start - test mode
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

    public func set_current_QAId(QAId: Types.QAId) : async () {
        game.currentQAId := QAId;
    };
    // End - test mode

    private func idle() : async () {
        var isNext = false;
        for (entry in StableRbTree.entries(QAs)) {
            if (game.currentQAId == -1 or isNext) {
                game.currentQAId := entry.0;
                game.startTime := Time.now();
                Debug.print(Int.toText(game.startTime) # ": " # Int.toText(game.currentQAId));
                return;
            };

            if (entry.0 == game.currentQAId) {
                isNext := true;
            };
        };

        await stop();
        game.currentQAId := -1;

        Debug.print("Here we finished");
    };

    private func validate_player(playerId: Types.PlayerId, playerName: Types.PlayerName) : async Bool {

        switch(StableRbTree.get(players, Text.compare, playerName)) {
            case null return false;
            case (?player) {
                if (player.id != playerId) return false;

                return true;
            }
        };
    };

    private func is_answered(playerId: Types.PlayerId) : async Bool {
        switch(StableRbTree.get(logs, Int.compare, game.startTime)) {
            case null false;
            case (?logs) {
                for(log in logs.vals()) {
                    if (log.logPlayerId == playerId) return true;
                };
                return false;
            }
        };
    };

    private func score_answer(qType: Types.QType, qAnswer: Text, pAnswer: Text) : async Nat {
        if ((qType == Const.QTYPES.SINGLE or qType == Const.QTYPES.SELECT) and qAnswer == pAnswer) {
            return Const.CONFIG.ROUND_SCORE;
        };

        if (qType == Const.QTYPES.MULTIPLE) {
            var splitChar: Text.Pattern = #char ',';
            var qAnswers: [Text] = Utiles.array_unique(Iter.toArray(Text.split(qAnswer, splitChar)));
            var pAnswers: [Text] = Utiles.array_unique(Iter.toArray(Text.split(pAnswer, splitChar)));

            var total = 0;
            var part = 0;

            for(qAnswer in qAnswers.vals()) {
                total += 1;
                if (Utiles.array_include(pAnswers, qAnswer)) part += 1;
            };

            return Const.CONFIG.ROUND_SCORE * part / total;
        };

        return 0;
    };

    private func save_log(playerId: Types.PlayerId, playerName: Types.PlayerName, QAId: Types.QAId, answer: Text, score: Nat) : async () {

        var newLog: Types.Log = {
            logPlayerId = playerId;
            logPlayerName = playerName;
            logQAId = QAId;
            logAnswer = answer;
            logScore = score;
            logTime = Time.now();
        };

        switch(StableRbTree.get(logs, Int.compare, game.startTime)) {
            case null {
                logs := StableRbTree.put(logs, Int.compare, game.startTime, [newLog]);
            };
            case (?prevLogs) {
                var newLogs = Array.append(prevLogs, [newLog]);
                let (_, updatedLogs) = StableRbTree.replace(logs, Int.compare, game.startTime, newLogs);
                logs := updatedLogs;
            }
        };

    };
}