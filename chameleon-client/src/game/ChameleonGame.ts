import { Game } from "boardgame.io";

const board_words = [
    ["Baden-Württemberg", "Bayern", "Berlin", "Brandenburg", "Bremen", "Hamburg", "Hessen", "Mecklenburg-Vorpommern", "Niedersachsen", "Nordrhein-Westfalen", "Rheinland-Pfalz", "Saarland", "Sachsen", "Sachsen-Anhalt", "Schleswig-Holstein", "Thüringen"]
]

export interface ChameleonState {
    words: string[];
    player_words: Array<string|null>;

    word_to_describe: number;
    player_who_is_chameleon: number;
    votes: { [key: string]: string | null };
}

export interface ChameleonPlayerView {
    is_chameleon: true;

    words: string[];
    player_words: Array<string|null>;
    votes: { [key: string]: number };
    ownVote: string | null;
}

export interface NotChameleonPlayerView {
    is_chameleon: false;

    words: string[];
    player_words: Array<string|null>;
    votes: { [key: string]: number };
    ownVote: string | null;

    word_to_describe: number;
}


export const ChameleonGame: Game<ChameleonState> = {
    minPlayers: 3,

    setup: (ctx) => ({
        words: board_words[0],
        word_to_describe: Math.floor(Math.random() * board_words[0].length),
        player_words: Array(ctx.numPlayers).fill(null) as Array<string | null>,
        player_who_is_chameleon: Math.floor(Math.random() * ctx.numPlayers),
        // ToDo: Funktioniert nicht, hier wird das null immer zu 0 ??
        votes: Object.fromEntries(ctx.playOrder.map(it => [it, null]))
    }),

    turn: { minMoves: 1, maxMoves: 1 },

    playerView: (G, ctx, playerID) => {
        console.log(G.player_who_is_chameleon)
        console.log(playerID);

        const playerVotes: { [key: string]: number } = Object.fromEntries(ctx.playOrder.map(it => [it, 0]));

        Object.entries(G.votes)
            .forEach(it => {
                const [player, playerVoted] = it;

                if (!playerVoted)
                    return

                playerVotes[playerVoted] = playerVotes[playerVoted]++;
            })

        let ownVote = G.votes[playerID!];
        if (G.player_who_is_chameleon !== Number.parseInt(playerID!)) {
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

                                console.log(G)

                                // Es gibt keinen Spieler mehr, der noch keinen Vote abgegeben
                                // hat bzw. alle Spieler haben abgestimmt
                                if (Object.entries(G.votes).filter(it => !it).length === 0) {
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