import {Ctx, Game} from "boardgame.io";

const board_words = [
    // Bundesländer
    ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"],
    // Zoo
    ["Elephant", "Giraffe", "Koala", "Tiger", "Lion", "Leopard", "Meerkat", "Buffalo", "Ostrich", "Owl", "Eagle", "Parrot", "Scorpion", "Alligator", "Zebra", "Gorilla"]

]

type VotesMap = { [key: string]: string | null };
type NumericVotesMap = { [key: string]: number };
export type NewGameVotes = { [key: string]: boolean };

export interface ChameleonState {
    /**
     * Spieler, bei dem das Spiel gestartet ist.
     */
    startPlayer: string;

    /**
     * Wörter auf dem Spielfeld.
     *
     * von links nach rechts,
     * von oben nach unten
     */
    words: string[];

    /**
     * Wörter, die ein Spieler eingegeben hat, um
     * das gesuchte Wort zu beschreiben.
     *
     * falls null: Spieler hat noch kein Wort ausgewählt.
     */
    player_words: Array<string | null>;

    /**
     * Index des Wortes, welches beschrieben werden sollen.
     */
    word_to_describe: number;

    /**
     * Spieler-ID des Spielers, der das Chameleon ist.
     */
    player_who_is_chameleon: string;

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

    playerWon: "ChameleonWon_WrongPlayerVoted" | "ChameleonWon_RightWordGuessed" | "PlayersWon" | null;

    /**
     * Abstimmung darüber, ob ein Spieler bereit für die
     * neue Runde ist.
     */
    startNewGameVotes: NewGameVotes;
}


export interface ChameleonPlayerView {
    is_chameleon: true;

    chameleonChosenWordIndex: number | null;

    words: string[];
    player_words: Array<string | null>;
    votes: NumericVotesMap;
    ownVote: string | null;

    playerWon: "ChameleonWon_WrongPlayerVoted" | "ChameleonWon_RightWordGuessed" | "PlayersWon" | null;

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
    is_chameleon: false;

    chameleonChosenWordIndex: number | null;

    words: string[];
    player_words: Array<string | null>;
    votes: NumericVotesMap;
    ownVote: string | null;

    word_to_describe: number;

    playerWon: "ChameleonWon_WrongPlayerVoted" | "ChameleonWon_RightWordGuessed" | "PlayersWon" | null;

    /**
     * PlayerID des Chameleon, sobald dieser entdeckt wurde oder das Spiel beendet ist.
     */
    player_who_is_chameleon: string | null;

    startNewGameVotes: NewGameVotes;
}

function votesMapToNumericVotesMap(
    playOrder: string[],
    votes: VotesMap
): NumericVotesMap {
    const playerVotes: { [key: string]: number } = Object.fromEntries(playOrder.map(it => [it, 0]));

    Object
        .entries(votes)
        .forEach(it => {
            const [player, playerVoted] = it;

            if (!playerVoted)
                return

            playerVotes[playerVoted] = playerVotes[playerVoted] + 1;
        })

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

function randomElement<T>(items: T[]) {
    const item = items[Math.floor(Math.random() * items.length)];

    return item
}



function resetState(ctx: Ctx) {
    // Die aktuellen Wörter werden zufällig aus den verfügbaren
    // Spielfeldern gewählt.
    const words = randomElement(board_words)

    return {
        startPlayer: ctx.currentPlayer,
        words: words,
        // Innerhalb der Wörter wird ein Wort zufällig als geheimes Wort
        // ausgewählt:
        //
        // Bsp.: 0..15
        word_to_describe: Math.floor(Math.random() * board_words[0].length),
        player_words: Array(ctx.numPlayers).fill(null) as Array<string | null>,
        player_who_is_chameleon: randomElement(ctx.playOrder),
        // ToDo: Funktioniert nicht, hier wird das null immer zu 0 ??
        votes: Object.fromEntries(ctx.playOrder.map(it => [it, null])),
        chameleonChosenWordIndex: null,
        startNewGameVotes: Object.fromEntries(ctx.playOrder.map(it => [it, false])),
        playerWon: null
    }
}

export const ChameleonGame: Game<ChameleonState> = {
    name: "Chameleon",
    minPlayers: 3,
    maxPlayers: 20,

    setup: ({ctx}) => (
        resetState(ctx)
    ),

    turn: {minMoves: 1, maxMoves: 1},

    playerView: ({G, ctx, playerID}) => {
        console.log("Global State: ")
        console.log("G.votes: ", JSON.stringify(G.votes))
        console.log("G.player_who_is_chameleon: ", JSON.stringify(G.player_who_is_chameleon))

        const playerVotes = votesMapToNumericVotesMap(ctx.playOrder, G.votes);

        let ownVote = G.votes[playerID!];
        if (G.player_who_is_chameleon !== playerID!) {
            let retVal: NotChameleonPlayerView = {
                is_chameleon: false,

                player_words: G.player_words,
                word_to_describe: G.word_to_describe,
                words: G.words,
                votes: playerVotes,
                ownVote: ownVote,

                playerWon: G.playerWon,

                chameleonChosenWordIndex: G.chameleonChosenWordIndex,

                player_who_is_chameleon: ctx.phase === "chameleonChoosesWord" || ctx.phase === "gameEnded" ? G.player_who_is_chameleon : null,

                startNewGameVotes: G.startNewGameVotes
            }

            return retVal
        }

        let retVal: ChameleonPlayerView = {
            is_chameleon: true,

            player_words: G.player_words,
            words: G.words,
            votes: playerVotes,
            ownVote: ownVote,

            chameleonChosenWordIndex: G.chameleonChosenWordIndex,

            playerWon: G.playerWon,

            // Dem Chameleon wird das zu erratende Wort nur angezeigt,
            // wenn das Spiel beendet ist.
            word_to_describe: ctx.phase === "gameEnded" ? G.word_to_describe : null,

            player_who_is_chameleon: G.player_who_is_chameleon,

            startNewGameVotes: G.startNewGameVotes
        }

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
                    console.log(playerID + " selected word " + word)

                    G.player_words[Number.parseInt(ctx.currentPlayer)] = word as string

                    // Nachdem der Spieler sein Wort gewählt hat,
                    // ist der nächste Spieler dran.
                    events.endTurn();
                },
            },

            // Alle Spieler haben ein Wort ausgewählt
            endIf: ({G}) => !G.player_words.includes(null),
            // dann in die Diskussions- und Abstimmrunde
            next: "discussAndVote"
        },

        discussAndVote: {
            turn: {
                activePlayers: {all: 'votingStage'},

                stages: {
                    votingStage: {
                        moves: {
                            vote: ({G, ctx, events, playerID}, playerId) => {
                                console.log("Player " + playerID + " voted " + playerId)

                                G.votes[playerID] = playerId as string

                                // Es gibt keinen Spieler mehr, der noch keinen Vote abgegeben
                                // hat bzw. alle Spieler haben abgestimmt
                                if (Object.entries(G.votes).filter(entry => !entry[1]).length === 0) {
                                    const votedPlayers = playersWithMostVotes(ctx.playOrder, G.votes);

                                    if (votedPlayers.length > 1 || !votedPlayers.includes(G.player_who_is_chameleon)) {
                                        // Chameleon hat gewonnen, da mehrere
                                        // Personen mit der gleichen Anzahl gevoted wurden
                                        // oder eine falsche Person gevoted wurde.
                                        G.playerWon = "ChameleonWon_WrongPlayerVoted";
                                        events.setPhase("gameEnded")
                                    } else {
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
                    // Get the initial value of playOrderPos.
                    // This is called at the beginning of the phase.
                    first: ({G, ctx}) => ctx.playOrder.indexOf(G.player_who_is_chameleon),

                    // Get the next value of playOrderPos.
                    // This is called at the end of each turn.
                    // The phase ends if this returns undefined.
                    next: ({G, ctx}) => undefined
                },

                activePlayers: {currentPlayer: 'chameleonChoosesStage'},

                stages: {

                    chameleonChoosesStage: {
                        moves: {
                            chooseWord: ({G, ctx, events}, wordIndex) => {
                                G.chameleonChosenWordIndex = wordIndex as number

                                if (G.chameleonChosenWordIndex === G.word_to_describe) {
                                    // Chameleon hat gewonnen
                                    G.playerWon = "ChameleonWon_RightWordGuessed";
                                } else {
                                    // Chameleon hat verloren
                                    G.playerWon = "PlayersWon";
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
                                G.startNewGameVotes[playerID] = true

                                // Wenn alle die neue Runde bestätigt haben:
                                // Neue Runde starten
                                if (Object.entries(G.startNewGameVotes).length === Object.entries(G.startNewGameVotes).filter(it => it[1]).length) {
                                    const newState = resetState(ctx)

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

                                    console.log("new startPlayer: ", nextPlayer)

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