import { Game } from "boardgame.io";
import { isNull } from "util";

const board_words = [
    ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"]
]

type VotesMap = { [key: string]: string | null };
type NumericVotesMap = { [key: string]: number };

export interface ChameleonState {
    words: string[];
    player_words: Array<string | null>;

    word_to_describe: number;
    player_who_is_chameleon: string;
    votes: VotesMap;

    chameleonChosenWordIndex: number | null;
    startNewGameVotes: { [key: string]: boolean };
}

export interface ChameleonPlayerView {
    is_chameleon: true;

    words: string[];
    player_words: Array<string | null>;
    votes: NumericVotesMap;
    ownVote: string | null;
}

export interface NotChameleonPlayerView {
    is_chameleon: false;

    words: string[];
    player_words: Array<string | null>;
    votes: NumericVotesMap;
    ownVote: string | null;

    word_to_describe: number;
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
function playersWithMostVotes(
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


export const ChameleonGame: Game<ChameleonState> = {
    minPlayers: 3,

    setup: (ctx) => ({
        words: board_words[0],
        word_to_describe: Math.floor(Math.random() * board_words[0].length),
        player_words: Array(ctx.numPlayers).fill(null) as Array<string | null>,
        player_who_is_chameleon: Math.floor(Math.random() * ctx.numPlayers) + "",
        // ToDo: Funktioniert nicht, hier wird das null immer zu 0 ??
        votes: Object.fromEntries(ctx.playOrder.map(it => [it, null])),
        chameleonChosenWordIndex: null,
        startNewGameVotes: Object.fromEntries(ctx.playOrder.map(it => [it, false]))
    }),

    turn: { minMoves: 1, maxMoves: 1 },

    playerView: (G, ctx, playerID) => {
        console.log("Global State: ")
        console.log("G.votes: ", JSON.stringify(G.votes))

        const playerVotes = votesMapToNumericVotesMap(ctx.playOrder, G.votes);

        let ownVote = G.votes[playerID!];
        if (G.player_who_is_chameleon !== playerID!) {
            return {
                is_chameleon: false,

                player_words: G.player_words,
                word_to_describe: G.word_to_describe,
                words: G.words,
                votes: playerVotes,
                ownVote: ownVote
            } as NotChameleonPlayerView
        }

        return {
            is_chameleon: true,

            player_words: G.player_words,
            words: G.words,
            votes: playerVotes,
            ownVote: ownVote
        } as ChameleonPlayerView
    },

    phases: {
        selectWord: {
            start: true,

            moves: {
                selectAWord: (G, ctx, word) => {
                    G.player_words[Number.parseInt(ctx.currentPlayer)] = word

                    // Nachdem der Spieler sein Wort gewählt hat,
                    // ist der nächste Spieler dran.
                    ctx.events!.endTurn();
                },
            },

            // Alle Spieler haben ein Wort ausgewählt
            endIf: G => !G.player_words.includes(null),
            // dann in die Diskussions- und Abstimmrunde
            next: "discussAndVote"
        },

        discussAndVote: {
            turn: {
                activePlayers: { all: 'votingStage' },

                stages: {
                    votingStage: {
                        moves: {
                            vote: (G, ctx, playerId) => {
                                G.votes[ctx.playerID!] = playerId

                                // Es gibt keinen Spieler mehr, der noch keinen Vote abgegeben
                                // hat bzw. alle Spieler haben abgestimmt
                                if (Object.entries(G.votes).filter(entry => !entry[1]).length === 0) {
                                    ctx.events?.endStage()
                                    ctx.events?.endTurn({ next: G.player_who_is_chameleon })

                                    const votedPlayers = playersWithMostVotes(ctx.playOrder, G.votes);

                                    if (votedPlayers.length > 1 || !votedPlayers.includes(G.player_who_is_chameleon)) {
                                        // Chameleon hat gewonnen, da mehrere
                                        // Personen mit der gleichen Anzahl gevoted wurden.
                                        // oder 
                                        ctx.events?.setPhase("gameEnded")
                                    } else {
                                        // Spieler haben herausgefunden, wer das Chameleon ist;
                                        // nun ist das Chameleon dran und hat die Möglichkeit
                                        // das gesuchte Wort zu finden.
                                        ctx.events?.setPhase("chameleonChoosesWord")
                                    }

                                }
                            }
                        },
                    },
                },

            },
        },

        chameleonChoosesWord: {

            moves: {
                chooseWord: (G, ctx, wordIndex) => {
                    G.chameleonChosenWordIndex = wordIndex

                    if (G.chameleonChosenWordIndex === G.word_to_describe) {
                        // Chameleon hat gewonnen
                    } else {
                        // Chameleon hat verloren
                    }

                    ctx.events?.setPhase("gameEnded")
                }
            },

            next: "gameEnded"
        },

        gameEnded: {            
            turn: {
                activePlayers: { all: 'votingForNewGameStage' },

                stages: {
                    votingForNewGameStage: {
                        moves: {
                            vote: (G, ctx) => {
                                        
                            }
                        }
                    }
                }
            }

        }

    }
};