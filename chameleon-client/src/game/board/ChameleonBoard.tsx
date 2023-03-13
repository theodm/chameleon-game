import {BoardProps} from "boardgame.io/react";
import {useState} from "react";
import {
    ChameleonPlayerView,
    ChameleonState,
    NotChameleonPlayerView
} from "../../../../chameleon-shared/src/game/ChameleonGame";
import {Ctx} from "boardgame.io";
import {isChameleon} from "./StateUtils";
import {WordBoard} from "./WordBoard";
import {UserIcon} from "@heroicons/react/24/solid";
import {Overlay} from "./Overlay";
import {GameStateBox} from "./GameStateBox";
import {Simulate} from "react-dom/test-utils";
import {VoteForNewGameBox} from "./VoteForNewGameBox";


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

// ToDo: playOrdersOfPlayers könnte eigener Typ sein
function VoteBox({playOrder, playerView, onPlayerVoted}: {
    playOrder: string[], playerView: ChameleonPlayerView | NotChameleonPlayerView,
    onPlayerVoted: (playerID: string) => void
}) {

    return <div className="flex justify-center items-center">
        <table className="w-96">
            {playOrder.map((it, index) =>
                <tr key={it}>
                    <td className="p-1">
                        <div className="flex justify-center items-center">{"Spieler " + (index + 1)}</div>
                    </td>
                    <td className="p-1 w-24">
                        <div className="flex justify-center items-center">{Array(playerView.votes[it[0]]).fill(<>
                            <UserIcon className="m-1 w-6 h-6"/></>)}</div>
                    </td>
                    <td className="p-1">
                        <div className="flex justify-center items-center">
                            <button type="button"
                                    className="px-1 py-1 text-sm font-medium text-center text-gray-900 rounded-lg border border-gray-800 hover:text-white hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
                                    onClick={() => onPlayerVoted(it)}>{it !== playerView.ownVote ? "Wählen" : "Gewählt"}</button>
                        </div>
                    </td>

                </tr>
            )}
        </table>
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

export function ChameleonBoard(props: BoardProps<ChameleonState>) {
    const {ctx, G, moves, playerID} = props;

    const playerView = G as unknown as ChameleonPlayerView | NotChameleonPlayerView;

    // ToDo: moves.vote umbenennen
    return (
        <div className="relative w-full h-screen">

            <Overlay changeKey={ctx.phase + " " + G.playerWon}>
                {ctx.phase === "selectWord" && (isChameleon(playerView) ? "Du bist das Chamäleon 🦎." : "Du bist Mitspieler 🎲.")}
                {ctx.phase === "discussAndVote" && "Die Diskussions- und Abstimmungsphase 🗳️ startet."}
                {ctx.phase === "chameleonChoosesWord" && "Spieler " + G.player_who_is_chameleon + " ist das Chamäleon 🦎. Nun muss es das gesuchte Wort erraten."}
                {ctx.phase === "gameEnded" && G.playerWon === "ChameleonWon_WrongPlayerVoted" && "Falsche Wahl! Spieler " + G.player_who_is_chameleon + " war das Chamäleon 🦎 und hat gewonnen."}
                {ctx.phase === "gameEnded" && G.playerWon === "ChameleonWon_RightWordGuessed" && "Richtiges Wort! Spieler " + G.player_who_is_chameleon + " war das Chamäleon 🦎 und hat das richtige Wort erraten."}
                {ctx.phase === "gameEnded" && G.playerWon === "PlayersWon" && "Falsche Wahl! Die Mitspieler 🎲 haben gewonnen."}
            </Overlay>

            <ChameleonTable phase={ctx.phase} currentPlayerID={ctx.currentPlayer} numberOfPlayers={ctx.numPlayers}
                            playOrder={ctx.playOrder} thisPlayerID={playerID!}
                            G={G as unknown as ChameleonPlayerView | NotChameleonPlayerView}
                            chooseWord={moves.chooseWord} selectAWord={moves.selectAWord} vote={moves.vote} voteForNewGame={moves.voteForNewGame} />
        </div>
    )
}


export function ChameleonTable({
                                   phase,
                                   G,
                                   currentPlayerID,
                                   thisPlayerID,
                                   numberOfPlayers,
                                   playOrder,
                                   chooseWord,
                                   selectAWord,
                                   voteForNewGame,

                                   vote
                               }: { phase: string, G: ChameleonPlayerView | NotChameleonPlayerView, currentPlayerID: string, thisPlayerID: string, chooseWord: (indexOfWord: number) => void, selectAWord: (word: string) => void, vote: (playerIDOfVotedPlayer: string) => void, numberOfPlayers: number, playOrder: string[], voteForNewGame: () => void }) {
    const playerView = G;

    const isCurrentPlayer = thisPlayerID === currentPlayerID;

    const wordSelectable = phase === "chameleonChoosesWord" && isCurrentPlayer;

    return (
        <div className="relative w-full h-screen">
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex flex-col justify-center items-center">


                    <WordBoard playerView={playerView} selectable={wordSelectable} onSelectWord={chooseWord}/>
                    <GameStateBox phase={phase} currentPlayerID={currentPlayerID} numberOfPlayers={numberOfPlayers}
                                  playerView={playerView}/>
                    <div className="w-full">
                        <div className="">

                            <Box>
                                {isCurrentPlayer && phase === "selectWord" && <InputWordBox
                                    onWordSelected={selectAWord}
                                />}
                                {phase === "discussAndVote" &&
                                    <VoteBox playOrder={playOrder} playerView={playerView} onPlayerVoted={vote}/>
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