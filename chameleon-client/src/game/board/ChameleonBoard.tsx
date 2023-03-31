import {BoardProps} from "boardgame.io/react";
import {useState} from "react";
import {
    ChameleonPlayerView,
    ChameleonState,
    NotChameleonPlayerView
} from "../../../../chameleon-shared/src/game/ChameleonGame";
import {isChameleon} from "./StateUtils";
import {WordBoard} from "./WordBoard";
import {Overlay} from "./Overlay";
import {GameStateBox} from "./GameStateBox";
import {VoteForNewGameBox} from "./VoteForNewGameBox";
import {VoteBox} from "./VoteBox";

function Box({children}: { children: any }) {
    return <div className="p-2 mt-2 border border-black">
        {children}
    </div>;
}

function NotPlayersTurnBox() {
    return <div className="flex justify-center items-center h-16 text-center">
        Sie sind nicht am Zug.
    </div>
}

function ChameleonChoosesWordBox() {
    return <div className="flex justify-center items-center h-16 text-center">
        Wählen Sie das geheime Wort auf dem Spielfeld.
    </div>
}

function InputWordBox({
                          onWordSelected
                      }: {
    onWordSelected: (word: string) => void
}) {
    const [currentWord, setCurrentWord] = useState("");


    return <form>
        <div className="p-2">
            <label htmlFor="email"
                   className="block mb-2 font-medium text-center text-gray-900 text-md">Wort
                eingeben</label>
            <input type="email" id="email"
                   value={currentWord}
                   onChange={(e) => setCurrentWord(e.target.value)}
                   className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5"
                   required/>
        </div>
        <div className="flex justify-center w-full">
            <button type="button"
                    className="m-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2"
                    onClick={() => onWordSelected(currentWord)}>Bestätigen
            </button>
        </div>
    </form>;
}

export type PlayerMap = { [key: string]: { name: string, connected: boolean } }

export function ChameleonBoard(props: BoardProps<ChameleonState>) {
    const {ctx, G, moves, playerID, matchData} = props;

    const playerMap = {} as PlayerMap

    matchData?.forEach(it => playerMap[it.id + ""] = {
        name: it.name ? it.name : "_Spieler " + it.id,
        connected: !!it.isConnected
    })

    console.log(playerMap)

    // ToDo: moves.vote umbenennen
    return (
        <_ChameleonBoard phase={ctx.phase} currentPlayerID={ctx.currentPlayer} numberOfPlayers={ctx.numPlayers}
                         playOrder={ctx.playOrder} thisPlayerID={playerID!}
                         G={G as unknown as ChameleonPlayerView | NotChameleonPlayerView}
                         playerMap={playerMap}
                         chooseWord={moves.chooseWord} selectAWord={moves.selectAWord} vote={moves.vote}
                         voteForNewGame={moves.voteForNewGame}/>
    )
}

export function _ChameleonBoard({
                                    playerMap,
                                    phase,
                                    G,
                                    currentPlayerID,
                                    thisPlayerID,
                                    numberOfPlayers,
                                    chooseWord,
                                    selectAWord,
                                    voteForNewGame,

                                    vote
                                }: { playerMap: PlayerMap, phase: string, G: ChameleonPlayerView | NotChameleonPlayerView, currentPlayerID: string, thisPlayerID: string, chooseWord: (indexOfWord: number) => void, selectAWord: (word: string) => void, vote: (playerIDOfVotedPlayer: string) => void, numberOfPlayers: number, playOrder: string[], voteForNewGame: () => void }) {

    return (
        <div className="relative w-full h-screen">

            <Overlay changeKey={phase + " " + G.playerWon}>
                {phase === "selectWord" && (isChameleon(G) ? "Du bist das Chamäleon 🦎." : "Du bist Mitspieler 🎲.")}
                {phase === "discussAndVote" && "Die Diskussions- und Abstimmungsphase 🗳️ startet."}
                {phase === "chameleonChoosesWord" && "Spieler " + playerMap[G.player_who_is_chameleon!].name + " ist das Chamäleon 🦎. Nun muss es das gesuchte Wort erraten."}
                {phase === "gameEnded" && G.playerWon === "ChameleonWon_WrongPlayerVoted" && "Falsche Wahl! Spieler " + playerMap[G.player_who_is_chameleon!].name + " war das Chamäleon 🦎 und hat gewonnen."}
                {phase === "gameEnded" && G.playerWon === "ChameleonWon_RightWordGuessed" && "Richtiges Wort! Spieler " + playerMap[G.player_who_is_chameleon!].name + " war das Chamäleon 🦎 und hat das richtige Wort erraten."}
                {phase === "gameEnded" && G.playerWon === "PlayersWon" && "Falsche Wahl! Die Mitspieler 🎲 haben gewonnen."}
            </Overlay>

            <ChameleonTable playerMap={playerMap} phase={phase} currentPlayerID={currentPlayerID}
                            numberOfPlayers={numberOfPlayers}
                            thisPlayerID={thisPlayerID}
                            G={G}
                            chooseWord={chooseWord} selectAWord={selectAWord} vote={vote}
                            voteForNewGame={voteForNewGame}/>
        </div>
    )
}


export function ChameleonTable({
                                   playerMap,
                                   phase,
                                   G,
                                   currentPlayerID,
                                   thisPlayerID,
                                   numberOfPlayers,
                                   chooseWord,
                                   selectAWord,
                                   voteForNewGame,

                                   vote
                               }: { playerMap: PlayerMap, phase: string, G: ChameleonPlayerView | NotChameleonPlayerView, currentPlayerID: string, thisPlayerID: string, chooseWord: (indexOfWord: number) => void, selectAWord: (word: string) => void, vote: (playerIDOfVotedPlayer: string) => void, numberOfPlayers: number, voteForNewGame: () => void }) {
    const playerView = G;

    const isCurrentPlayer = thisPlayerID === currentPlayerID;

    const wordSelectable = phase === "chameleonChoosesWord" && isCurrentPlayer;

    return (
        <div className="relative w-full h-screen">
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex flex-col justify-center items-center">


                    <WordBoard playerView={playerView} selectable={wordSelectable} onSelectWord={chooseWord}/>
                    <GameStateBox phase={phase} currentPlayerID={currentPlayerID} numberOfPlayers={numberOfPlayers}
                                  playerMap={playerMap}
                                  playerView={playerView}/>
                    <div className="w-full">
                        <div className="">

                            <Box>
                                {isCurrentPlayer && phase === "selectWord" && <InputWordBox
                                    onWordSelected={selectAWord}
                                />}
                                {phase === "discussAndVote" &&
                                    <VoteBox playerMap={playerMap} playerView={playerView} onPlayerVoted={vote}/>
                                }
                                {phase === "chameleonChoosesWord" && isCurrentPlayer && <ChameleonChoosesWordBox/>}
                                {phase === "gameEnded" && <VoteForNewGameBox voteForNewGame={voteForNewGame}
                                                                             newGameVotes={playerView.startNewGameVotes}
                                                                             thisPlayerID={thisPlayerID}/>}
                                {phase !== "discussAndVote" && phase != "gameEnded" && !isCurrentPlayer &&
                                    <NotPlayersTurnBox/>}
                            </Box>

                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}