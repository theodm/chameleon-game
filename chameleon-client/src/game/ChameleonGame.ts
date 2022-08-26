import { Game } from "boardgame.io";

const board_words = [
    ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"]
]

export interface ChameleonState {
    words: string[];
    player_words: Array<string|null>;

    word_to_describe: number;
    player_who_is_chameleon: number;
    votes: Array<number|null>;
}

export interface ChameleonPlayerView {
    is_chameleon: true;

    words: string[];
    player_words: Array<string|null>;
}

export interface NotChameleonPlayerView {
    is_chameleon: false;

    words: string[];
    player_words: Array<string|null>;

    word_to_describe: number;
}


export const ChameleonGame: Game<ChameleonState> = {
    minPlayers: 3,

    setup: (ctx) => ({
        words: board_words[0],
        word_to_describe: Math.floor(Math.random() * board_words[0].length),
        player_words: Array(ctx.numPlayers).fill(null) as Array<string | null>,
        player_who_is_chameleon: Math.floor(Math.random() * ctx.numPlayers),
        votes: Array(ctx.numPlayers).fill(null) as Array<number | null>
    }),

    turn: { minMoves: 1, maxMoves: 1 },

    playerView: (G, ctx, playerID) => {
        console.log(G.player_who_is_chameleon)
        console.log(playerID);
        
        if (G.player_who_is_chameleon !== Number.parseInt(playerID!)) {
            return {
                is_chameleon: false,

                player_words: G.player_words,
                word_to_describe: G.word_to_describe,
                words: G.words
            } as NotChameleonPlayerView
        }

        return {
            is_chameleon: true,

            player_words: G.player_words,
            words: G.words
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
                                G.votes[Number.parseInt(ctx.playerID!)] = playerId

                                if (!G.votes.includes(null)) {
                                    ctx.events?.endStage()
                                    ctx.events?.endTurn()
                                    ctx.events?.endPhase()
                                }
                            }
                         },
                    },
                },

            },

            next: "gameEnded"
        },

        gameEnded: {
            

        }

    }
};