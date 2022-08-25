import { Game } from "boardgame.io";

const board_words = [
    ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"]
]

interface ChameleonState {

}


export const ChameleonGame: Game = {
    minPlayers: 3,

    setup: (ctx) => ({
        words: board_words[0],
        player_words: Array(ctx.numPlayers).fill(null) as Array<string | null>,
        player_who_is_chameleon: Math.floor(Math.random() * ctx.numPlayers),
        votes: Array(ctx.numPlayers).fill(null) as Array<number | null>
    }),

    turn: { minMoves: 1, maxMoves: 1 },



    phases: {
        selectWord: {
            start: true,

            moves: {
                selectAWord: (G, ctx, word) => {
                    G.player_words[ctx.currentPlayer] = word

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