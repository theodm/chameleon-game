import {Ctx, Game, PlayerID} from "boardgame.io";
import {randomElement, randomElementIndex} from "./RandomElement";

import board_words from "./words/words.json"

/**
 * Map von Spieler-ID auf eine andere Spieler-ID oder null. In
 * der Abstimmungsphase gibt die Map für den linken Spieler an, welchen
 * anderen Spieler er für das Chamäleon hält.
 *
 * Bsp.: {
 *     "A": "B", // A denkt B ist das Chamäleon
 *     "B": null, // B hat noch nicht gewählt
 *     "C": null // C hat noch nicht gewählt
 * }
 *
 * Die Map soll immer alle Spieler enthalten.
 */
type VotesMap = { [key: string]: PlayerID | null };

/**
 * Map von Spieler-ID auf die Anzahl der Stimmen,
 * die auf diesen Spieler gerichtet sind.
 *
 * Bsp.: {
 *     "A": 2, // 2 Spieler halten A für das Chamäleon
 *     "B": 0, // 0 Spieler halten B für das Chamäleon
 *     "C": 0 // 0 Spieler halten C für das Chamäleon
 * }
 *
 * Die Map soll immer alle Spieler enthalten.
 */
type NumericVotesMap = { [key: string]: number };

/**
 * Map von Spieler-ID auf einen boolschen Wert, der angibt,
 * ob der Spieler bereit für die nächste Runde ist. Wenn
 * alle auf wahr sind, wird die nächste Runde gestartet.
 *
 * Bsp.: {
 *     "A": true,
 *     "B": false,
 *     "C": true
 * }
 *
 * Die Map soll immer alle Spieler enthalten.
 */
export type NewGameVotes = { [key: string]: boolean };

/**
 * Map von Spieler-ID auf eine Zeichenkette, die angibt, welches
 * Wort er gewählt hat. Hat er noch kein Wort eingegeben, dann ist der
 * Wert null.
 *
 * Bsp.: {
 *     "A": "Geld",
 *     "B": null,
 *     "C": "Katze"
 * }
 */
export type WordMap = {
    [key: string]: string | null
}

function wordMapSetPlayerWord(wordMap: WordMap, playerID: PlayerID, word: string) {
    wordMap[playerID] = word
}


/**
 * Gibt an, ob alle Spieler für den Spieler abgestimmt haben,
 * der ihrer nach das Chamäleon ist.
 *
 * Bsp.: {
 *     "A": "B",
 *     "B": null,
 *     "C": "A"
 * } -> false
 */
function didAllPlayersVoteForPossibleChameleon(voteMap: VotesMap) {
    return Object.entries(voteMap).filter(entry => !entry[1]).length === 0;
}

/**
 * Gibt für eine WordMap an, ob alle Spieler ein Wort ausgewählt haben.
 *
 * Bsp.: {
 *     "A": "Geld",
 *     "B": null,
 *     "C": "Katze"
 * } -> false
 */
function didAllPlayersChooseAWord(wordMap: WordMap) {
    return Object.entries(wordMap)
        .filter(([playerID, word]) => word === null)
        .length === 0
}


/**
 * Gibt an wer das Spiel gewonnnen oder verloren hat.
 *
 * null -> Bisher hat niemand gewonnen oder verloren.
 * ChameleonWon_WrongPlayerVoted -> Das Chamäleon hat gewonnen, da die Spieler einen falschen Spieler gewählt haben.
 * ChameleonWon_RightWordGuessed -> Das Chamäleon hat gewonnen, da das Chamäleon das richtige Wort geraten hat.
 * PlayersWon -> Die Spieler haben gewonnen; sie haben das Chamäleon enttarnt und das Chamäleon hat das richtige Wort nicht erraten.
 *
 * SinglePlayerWon -> Nur im besonderen Spielmodus "Jeder ist das Chamäleon": Ein Spieler hat abgestimmt, dass jeder das Chamäleon ist und diese Entscheidung war richtig. Daher hat er gewonnen. Der Spieler der gewonnen hat ist im Attribut singlePlayerLostOrWon vermerkt.
 * SinglePlayerLost -> Nur im besonderen Spielmodus "Jeder ist das Chamäleon": Ein Spieler hat abgestimmt, dass jeder das Chamäleon ist und diese Entscheidung war falsch. Daher hat er verloren. Der Spieler der verloren hat ist im Attribut singlePlayerLostOrWon vermerkt.
 * EveryoneLost -> Nur im besonderen Spielmodus "Jeder ist das Chamäleon": Kein Spieler hat erkannt, dass alle das Chamäleon sind, daher haben alle verloren.
 *
 */
export type WinState =
    "ChameleonWon_WrongPlayerVoted"
    | "ChameleonWon_RightWordGuessed"
    | "PlayersWon"
    | null
    | "SinglePlayerWon"
    | "SinglePlayerLost"
    | "EveryoneLost";

export interface ChameleonState {
    /**
     * Game-Settings.
     */
    settings: GameSettings,

    /**
     * Spieler-ID des Spielers, bei dem das Spiel gestartet wurde. Der
     * Erste, der in dieser Runde ein Wort eingeben musste.
     */
    startPlayer: string;

    /**
     * Titel des Spielfelds (Kategorie).
     */
    boardTitle: string;

    /**
     * Wörter auf dem Spielfeld.
     *
     * von links nach rechts,
     * von oben nach unten
     */
    words: string[];

    /**
     * Wörter, welche die Spieler eingegeben haben,
     * um das markierte Wort zu beschreiben.
     */
    player_words: WordMap;

    /**
     * Index des Wortes, welches beschrieben werden sollen.
     */
    word_to_describe: number;

    /**
     * Spieler-ID des Spielers, der das Chameleon ist.
     *
     * Oder im besonderen Spielmodus "Jeder ist das Chamäleon" kann das Element auch null sein, dann ist jeder das Chamäleon.
     */
    player_who_is_chameleon: string | null;

    /**
     * Abgegebene Votes der Spieler in der Diskussions- und
     * Abstimmungsphase.
     */
    votes: VotesMap;

    /**
     * Index des Wortes, den das Chameleon ausgewählt hat,
     * nachdem es enttarnt wurde.
     */
    chameleonChosenWordIndex: number | null;

    /**
     * Gibt an, wer gewonnen oder verloren hat.
     *
     * @see WinState
     */
    playerWon: WinState;

    singlePlayerLostOrWon: PlayerID | null;

    /**
     * Abstimmung darüber, ob ein Spieler bereit für die
     * neue Runde ist.
     */
    startNewGameVotes: NewGameVotes;
}

/**
 * Objekt welches unterscheidet zwischen den verschiedenen Anzeigearten
 * der Abstimmungen in der Abstimmungsphase. Je nach Einstellung in votingVisibility
 * in den GameSettings wird ein unterschiedliches Voting-Objekt verwendet.
 */
export type VoteContainer = NoneContainer | OnlyNumericContainer | AllVotesContainer;

export interface NoneContainer {
    visibility: "None";
}

export interface OnlyNumericContainer {
    visibility: "OnlyNumeric";

    votes: NumericVotesMap;

}

export interface AllVotesContainer  {
    visibility: "AllVotes";

    votes: VotesMap;
}

export interface ChameleonPlayerView {
    /**
     * Game-Settings.
     */
    settings: GameSettings,
    is_chameleon: true;

    boardTitle: string;
    chameleonChosenWordIndex: number | null;

    words: string[];
    player_words: WordMap;
    votes: VoteContainer;
    ownVote: string | null;

    playerWon: WinState;

    /**
     * Index des Wortes, welches beschrieben werden soll.
     *
     * Erst sichtbar für das Chameleon, falls das Spiel zu Ende ist.
     */
    word_to_describe: number | null;

    player_who_is_chameleon: string | null;

    startNewGameVotes: NewGameVotes;
}

export interface NotChameleonPlayerView {
    /**
     * Game-Settings.
     */
    settings: GameSettings,

    is_chameleon: false;

    boardTitle: string;

    chameleonChosenWordIndex: number | null;

    words: string[];
    player_words: WordMap;
    votes: VoteContainer;
    ownVote: string | null;

    word_to_describe: number;

    playerWon: WinState;

    /**
     * PlayerID des Chameleon, sobald dieser entdeckt wurde oder das Spiel beendet ist.
     */
    player_who_is_chameleon: string | null;

    startNewGameVotes: NewGameVotes;
}

/**
 * Diese Methode konvertiert eine VotesMap in eine NumericVotesMap,
 * indem sie die Anzahl der Stimmen für jeden Spieler zählt.
 * Die Reihenfolge der Spieler wird durch das playOrder-Argument bestimmt.
 *
 * @param playOrder Ein Array von Spieler-IDs, die die Reihenfolge der Spieler angibt.
 * @param votes Eine VotesMap, die die Abstimmungsergebnisse enthält.
 * @returns Eine NumericVotesMap, die die Anzahl der Stimmen für jeden Spieler enthält.
 *
 * Beispiel:
 * const playOrder = ["A", "B", "C"];
 * const votes = {
 *     "A": "B", // A denkt B ist das Chamäleon
 *     "B": null, // B hat noch nicht gewählt
 *     "C": "A" // C denkt A ist das Chamäleon
 * };
 *
 * const numericVotes = votesMapToNumericVotesMap(playOrder, votes);
 *
 * // numericVotes ist {
 * //     "A": 1, // 1 Spieler hält A für das Chamäleon
 * //     "B": 1, // 1 Spieler hält B für das Chamäleon
 * //     "C": 0 // 0 Spieler halten C für das Chamäleon
 * // }
 */
function votesMapToNumericVotesMap(
    playOrder: string[],
    votes: VotesMap
): NumericVotesMap {
    // Erstelle ein leeres Objekt mit den Spielern als Schlüsseln und 0 als Werten
    const playerVotes: { [key: string]: number } = Object.fromEntries(playOrder.map(it => [it, 0]));

    // Iteriere über die Einträge der VotesMap
    Object
        .entries(votes)
        .forEach(it => {
            const [player, playerVoted] = it;

            // Überspringe Spieler, die noch nicht gewählt haben
            if (!playerVoted)
                return

            // Erhöhe die Stimmenanzahl für den gewählten Spieler um 1
            playerVotes[playerVoted] = playerVotes[playerVoted] + 1;
        })

    // Gib das Ergebnis zurück
    return playerVotes;
}

/**
 * Gibt die Spieler-IDs zurück, die von den meisten Spielern
 * gewählt wurde. Bei Gleichstand werden mehrere Spieler zurück gegeben.
 * Ansonsten wird nur eine Spieler-ID zurück gegeben.
 */
export function playersWithMostVotes(
    playOrder: string[],
    votes: VotesMap
) {
    const playerVotes = votesMapToNumericVotesMap(playOrder, votes);

    // Wieviele Stimmen wurden auf den / die Spieler mit den 
    // meisten Stimmen abgegeben?
    const maxVotesOnPlayer = Math.max(...Object.entries(playerVotes).map(([k, v]) => v));

    // Alle Spieler zurückgeben, welche die 
    // genau die meisten Stimmen haben.
    return Object
        .entries(playerVotes)
        .filter(([k, v]) => v === maxVotesOnPlayer)
        .map(([k, v]) => k);
}


/**
 * Erstellt eine Map, welche für eine gegebene Spielerreihenfolge
 * eine Map mit dem übergebenen Wert für jeden Spieler erstellt. Dies ist notwendig,
 * da nach den obigen Definitionen eine solche Map immer alle Spieler beinhalten soll,
 * wenn auch mit dem gleichen übergebenen Wert.
 *
 * @param playOrder Array der Spieler-IDs in Reihenfolge.
 * @param defaultValue Standard-Wert für ein neues Element
 *
 * Bsp.: ["A", "B", "C"], null ->{
 *     "A": null,
 *     "B": null,
 *     "C", null
 * }
 */
function createPlayerMap<T>(
    playOrder: Array<PlayerID>,
    defaultValue: T
): { [playerID: string]: T } {
    return Object.fromEntries(playOrder.map(it => [it, defaultValue]))
}


function resetState(ctx: Ctx, setupData: GameSettings): ChameleonState {
    // Die aktuellen Wörter werden zufällig aus den verfügbaren
    // Spielfeldern gewählt.
    const board = randomElement(board_words)
    const words = board.words

    return {
        settings: setupData,

        startPlayer: ctx.currentPlayer,

        // Kategorie des Spielfelds
        boardTitle: board.name,

        // Wörter des Spielfeldes
        words: words,

        // Innerhalb der Wörter wird ein Wort zufällig als geheimes Wort
        // ausgewählt:
        //
        // Bsp.: 0..15
        word_to_describe: randomElementIndex(words),

        // Am Anfang hat noch kein Spieler ein Wort zum Erklären
        // der Begriffe eingegeben.
        player_words: createPlayerMap(ctx.playOrder, null),

        // Am Anfang wird ein zufälliger Spieler als Chamäleon auserkoren.
        // Wenn der besondere Spielmodus (Jeder ist das Chämeleon) aktiviert ist, kann es sein, dass
        // alle Spieler das Chamäleon sind. (null)
        player_who_is_chameleon: setupData.everyoneCanBeChameleon && Math.random() < setupData.everyoneCanBeChameleonChance ? null : randomElement(ctx.playOrder),

        // Am Anfang hat noch kein Spieler das potenzielle Chamäleon oder
        // den falschen Spieler ausgewählt
        votes: createPlayerMap(ctx.playOrder, null),

        // Am Anfang des Spiels hat das Chamäleon noch kein Wort als
        // markiertes Wort ausgewählt.
        chameleonChosenWordIndex: null,

        // Am Anfang eines Spiels hat noch niemand für das Starten des
        // nächsten Spiels abgestimmt.
        startNewGameVotes: createPlayerMap(ctx.playOrder, false),

        // Am Anfang eines Spiels hat noch niemand gewonnen.
        playerWon: null,

        singlePlayerLostOrWon: null
    }
}

/**
 * Gibt an, ob die Abstimmungen öffentlich sind. Dann sieht jeder wer für wen abgestimmt hat (AllVotes). Es gibt semi-öffentlich, dann
 * sieht man nur wie viele Personen für eine andere Person abgestimmt haben (OnlyNumeric). Oder niemand sieht wer schon abgestimmt hat (None).
 */
export type VotingVisibility = "None" | "OnlyNumeric" | "AllVotes";

export interface GameSettings {
    /**
     * Spielmodus: Mit einer bestimmten Wahrscheinlichkeit sind in einer Runde alle das Chamäleon; dann gewinnt
     * derjenige, der zuerst den Button "Jeder ist das Chamäleon" klickt.
     */
    everyoneCanBeChameleon: boolean;

    /**
     * Falls der besondere Spielmodus aktiv ist, die Wahrscheinlichkeit, dass in einem Spiel jeder das Chamäleon ist.
      */
    everyoneCanBeChameleonChance: number;

    /**
     * @see VotingVisibility
     */
    votingVisibility: VotingVisibility
}

export const ChameleonGame: Game<ChameleonState, Record<string, unknown>, GameSettings> = {
    name: "Chameleon",
    minPlayers: 3,
    maxPlayers: 20,

    setup: ({ctx}, setupData) => {
        console.log("[Setup] with setupData: ", setupData)

        if (!setupData) {
            console.log("[Setup] No setupData provided. Using default setupData.")

            setupData = {
                everyoneCanBeChameleon: false,
                everyoneCanBeChameleonChance: 0.5,
                votingVisibility: "OnlyNumeric"
            }
        }

        return resetState(ctx, setupData)
    },

    turn: {minMoves: 1, maxMoves: 1},

    playerView: ({G, ctx, playerID}) => {
        console.log("[Generating PlayerView] for ", playerID, " in phase ", ctx.phase)

        let voteContainer: VoteContainer;

        if (G.settings.votingVisibility === "AllVotes") {
            voteContainer = { visibility: "AllVotes", votes: { ...G.votes } }
        } else if (G.settings.votingVisibility === "OnlyNumeric") {
            voteContainer = { visibility: "OnlyNumeric", votes: votesMapToNumericVotesMap(ctx.playOrder, G.votes) };
        } else {
            voteContainer = { visibility: "None" }
        }

        console.log("[Generating PlayerView] voteContainer: ", voteContainer)

        let ownVote = G.votes[playerID!];
        if (!playerID || G.player_who_is_chameleon !== playerID!) {
            if (!playerID) {
                console.log("[Generating PlayerView] Player " + playerID + " is spectator. Same result as for normal player.")
            }

            console.log("[Generating PlayerView] Player " + playerID + " is not the chameleon.")

            let retVal: NotChameleonPlayerView = {
                settings: G.settings,

                is_chameleon: false,

                boardTitle: G.boardTitle,

                player_words: G.player_words,
                word_to_describe: G.word_to_describe,
                words: G.words,
                votes: voteContainer,
                ownVote: ownVote,

                playerWon: G.playerWon,

                chameleonChosenWordIndex: G.chameleonChosenWordIndex,

                player_who_is_chameleon: ctx.phase === "chameleonChoosesWord" || ctx.phase === "gameEnded" ? G.player_who_is_chameleon : null,

                startNewGameVotes: G.startNewGameVotes
            }

            console.log("[Generating PlayerView] Result: ", retVal)

            return retVal
        }

        console.log("[Generating PlayerView] Player " + playerID + " is the chameleon.")

        let retVal: ChameleonPlayerView = {
            settings: G.settings,

            is_chameleon: true,

            boardTitle: G.boardTitle,

            player_words: G.player_words,
            words: G.words,
            votes: voteContainer,
            ownVote: ownVote,

            chameleonChosenWordIndex: G.chameleonChosenWordIndex,

            playerWon: G.playerWon,

            // Dem Chameleon wird das zu erratende Wort nur angezeigt,
            // wenn das Spiel beendet ist.
            word_to_describe: ctx.phase === "gameEnded" ? G.word_to_describe : null,

            player_who_is_chameleon: G.player_who_is_chameleon,

            startNewGameVotes: G.startNewGameVotes
        }

        console.log("[Generating PlayerView] Result: ", retVal)

        return retVal
    },

    phases: {
        selectWord: {
            start: true,

            turn: {
                order: {
                    // Get the initial value of playOrderPos.
                    // This is called at the beginning of the phase.
                    first: ({ G, ctx }) => ctx.playOrder.indexOf(G.startPlayer),

                    // Get the next value of playOrderPos.
                    // This is called at the end of each turn.
                    // The phase ends if this returns undefined.
                    next: ({ G, ctx }) => (ctx.playOrderPos + 1) % ctx.numPlayers
                }
            },

            moves: {
                selectAWord: ({G, ctx, events, playerID}, word) => {
                    console.log("[Selected Word] Player " + playerID + " selected word " + word + ".")
                    console.log("G: ", JSON.stringify(G))

                    wordMapSetPlayerWord(G.player_words, playerID, word)

                    // Nachdem der Spieler sein Wort gewählt hat,
                    // ist der nächste Spieler dran.
                    events.endTurn();
                },
            },

            // Alle Spieler haben ein Wort ausgewählt
            endIf: ({G}) => didAllPlayersChooseAWord(G.player_words),
            // dann in die Diskussions- und Abstimmrunde
            next: "discussAndVote"
        },

        discussAndVote: {
            turn: {
                activePlayers: {
                    all: 'votingStage'
                },

                stages: {
                    votingStage: {
                        moves: {
                            voteForEveryoneIsTheChameleon: ({G, ctx, events, playerID}) => {
                                console.log("[Player voted] Player " + playerID + " voted for everyone is the chameleon.")
                                console.log("G: ", JSON.stringify(G))

                                if (!G.settings.everyoneCanBeChameleon) {
                                    console.log("[Player voted] Player " + playerID + " voted for everyone is the chameleon, but this is not possible in this game mode.")

                                    throw Error("Die Aktion 'Jeder ist das Chamäleon' ist nur im entsprechenden Spielmodus ausführbar.")
                                }

                                // Jeder ist das Chamäleon, daher hat der Spieler gewonnen.
                                if (!G.player_who_is_chameleon) {
                                    console.log("[Player voted] Player " + playerID + " voted for everyone is the chameleon, and everyone is the chameleon. Player won.")

                                    G.playerWon = "SinglePlayerWon";
                                    G.singlePlayerLostOrWon = playerID;
                                    events.setPhase("gameEnded")
                                    return
                                }

                                console.log("[Player voted] Player " + playerID + " voted for everyone is the chameleon, but there is only one chameleon. Player lost.")

                                // Es gibt ein Chämeleon und nicht jeder ist das Chamäleon, daher hat der Spieler verloren.
                                G.playerWon = "SinglePlayerLost";
                                G.singlePlayerLostOrWon = playerID;
                                events.setPhase("gameEnded")
                            },

                            vote: ({G, ctx, events, playerID}, playerId) => {
                                console.log("[Player voted] Player " + playerID + " voted " + playerId + ".")
                                console.log("G: ", JSON.stringify(G))

                                G.votes[playerID] = playerId as string

                                if (didAllPlayersVoteForPossibleChameleon(G.votes)) {
                                    console.log("[All players voted] All players voted for possible chameleon.")

                                    const votedPlayers = playersWithMostVotes(ctx.playOrder, G.votes);

                                    console.log("[All players voted] Players with most votes: " + votedPlayers)

                                    if (!G.player_who_is_chameleon) {
                                        console.log("[All players voted] There is no chameleon. Everyone lost.")

                                        // Jeder ist das Chamäleon, aber niemand hat das erraten,
                                        // daher haben alle verloren :(
                                        G.playerWon = "EveryoneLost"
                                        events.setPhase("gameEnded")
                                        return
                                    }

                                    if (votedPlayers.length > 1 || !votedPlayers.includes(G.player_who_is_chameleon)) {
                                        if (votedPlayers.length > 1) {
                                            console.log("[All players voted] More than one player has the most votes. The chameleon has won.")
                                        }

                                        if (!votedPlayers.includes(G.player_who_is_chameleon)) {
                                            console.log("[All players voted] The chosen player is not the chameleon. The chameleon has won.")
                                        }

                                        // Chameleon hat gewonnen, da mehrere
                                        // Personen mit der gleichen Anzahl gevoted wurden
                                        // oder eine falsche Person gevoted wurde.
                                        G.playerWon = "ChameleonWon_WrongPlayerVoted";
                                        events.setPhase("gameEnded")
                                    } else {
                                        console.log("[All players voted] The chosen player is the chameleon. The players have won.")

                                        // Spieler haben herausgefunden, wer das Chameleon ist;
                                        // nun ist das Chameleon dran und hat die Möglichkeit
                                        // das gesuchte Wort zu finden.
                                        events.setPhase("chameleonChoosesWord")
                                    }

                                }
                            }
                        },
                    },
                },

            },
        },

        chameleonChoosesWord: {
            turn: {
                // Workaround: https://github.com/boardgameio/boardgame.io/discussions/948
                order: {
                    // In dieser Phase ist nur das Chamäleon dran, um das markierte Wort zu
                    // erraten.
                    first: ({G, ctx}) => {
                        if (!G.player_who_is_chameleon) {
                            console.error("[Chameleon chooses Word] There is no chameleon. But the phase 'chameleonChoosesWord' was called.")

                            throw Error("Es gibt kein Chamäleon. Aber es wurde die Phase 'chameleonChoosesWord' aufgerufen.")
                        }

                        return ctx.playOrder.indexOf(G.player_who_is_chameleon)
                    },

                    // Es gibt keinen anderen Spieler in dieser Phase.
                    next: ({G, ctx}) => undefined
                },

                activePlayers: {currentPlayer: 'chameleonChoosesStage'},

                stages: {
                    chameleonChoosesStage: {
                        moves: {
                            chooseWord: ({G, ctx, events, playerID}, wordIndex) => {
                                console.log("[Chameleon chooses Word] Player " + playerID + " (the chameleon) guesses word " + G.words[wordIndex] + ".")
                                console.log("G: ", JSON.stringify(G))

                                G.chameleonChosenWordIndex = wordIndex as number

                                if (G.chameleonChosenWordIndex === G.word_to_describe) {
                                    // Chameleon hat gewonnen
                                    G.playerWon = "ChameleonWon_RightWordGuessed";

                                    console.log("[Chameleon chooses Word] The chameleon was right and won.")
                                } else {
                                    // Chameleon hat verloren
                                    G.playerWon = "PlayersWon";

                                    console.log("[Chameleon chooses Word] The chameleon was wrong and lost.")
                                }

                                events.setPhase("gameEnded")
                            }
                        }
                    }
                },
            },

            next: "gameEnded"
        },

        gameEnded: {
            turn: {
                activePlayers: {all: 'votingForNewGameStage'},

                stages: {
                    votingForNewGameStage: {
                        moves: {
                            voteForNewGame: ({G, ctx, events, playerID}) => {
                                console.log("[Player voted] Player " + playerID + " voted for a new game.")
                                console.log("G: ", JSON.stringify(G))

                                G.startNewGameVotes[playerID] = true

                                // Wenn alle die neue Runde bestätigt haben:
                                // Neue Runde starten
                                if (Object.entries(G.startNewGameVotes).length === Object.entries(G.startNewGameVotes).filter(it => it[1]).length) {
                                    console.log("[All players voted] All players voted for a new game.")

                                    const newState = resetState(ctx, G.settings)

                                    G.settings = newState.settings
                                    G.startNewGameVotes = newState.startNewGameVotes
                                    G.votes = newState.votes
                                    G.words = newState.words
                                    G.playerWon = newState.playerWon
                                    G.player_words = newState.player_words
                                    G.chameleonChosenWordIndex = newState.chameleonChosenWordIndex
                                    G.player_who_is_chameleon = newState.player_who_is_chameleon
                                    G.word_to_describe = newState.word_to_describe

                                    const nextPlayer = ctx.playOrder[(ctx.playOrder.indexOf(G.startPlayer) + 1) % ctx.playOrder.length]

                                    G.startPlayer = nextPlayer

                                    console.log("[All players voted] Next player: " + nextPlayer)

                                    events.endTurn({ next: nextPlayer})
                                    events.setPhase("selectWord")
                                }

                            }
                        }
                    }
                }
            }

        }

    }
};