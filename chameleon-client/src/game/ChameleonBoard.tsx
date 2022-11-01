import {BoardProps} from "boardgame.io/react";
import {useEffect, useState} from "react";
import {ChameleonPlayerView, ChameleonState, NotChameleonPlayerView} from "./ChameleonGame";
import {Ctx} from "boardgame.io";

function Card({text, isSelectedWord}: { text: string, isSelectedWord: boolean }) {
    const content = isSelectedWord ? <mark>{text}</mark> : <>{text}</>;

    return <div key={text}
                className="flex justify-center items-center p-2 m-1 rounded-lg border border-black">
        {content}
    </div>
}

function PlayerToWord({
                          playerName,
                          word,
                          isCurrentPlayer
                      }: { playerName: string, word: string | null, isCurrentPlayer: boolean }) {
    return <tr>
        <td className="p-2">{playerName}</td>
        <td className="p-2">{!word ? "..." : word}</td>
    </tr>
}

function isChameleon(playerView: ChameleonPlayerView | NotChameleonPlayerView): playerView is ChameleonPlayerView {
    return playerView.is_chameleon
}


function isNotChameleon(playerView: ChameleonPlayerView | NotChameleonPlayerView): playerView is NotChameleonPlayerView {
    return !isChameleon(playerView)
}

function WordBoard({playerView}: { playerView: ChameleonPlayerView | NotChameleonPlayerView }) {
    return <div>
        <div className="grid grid-cols-[repeat(4,_min-content)]">
            {playerView.words.map((it, index) => <Card
                key={it}
                text={it}
                isSelectedWord={!isChameleon(playerView) && playerView.word_to_describe === index}/>
            )}
        </div>
    </div>;
}

function Box({children}: { children: any }) {
    return <div className="p-2 m-2 border border-black">
        {children}
    </div>;
}

function NotPlayersTurnBox() {
    return <div className="h-64">
        Nicht am Zug
    </div>
}

function VoteBox({ctx, playerView, onPlayerVoted}: {
    ctx: Ctx, playerView: ChameleonPlayerView | NotChameleonPlayerView,
    onPlayerVoted: (playerID: string) => void
}) {

    return <div>
        {ctx.playOrder.map((it, index) => <div key={index}>
                {"Spieler " + (index + 1)} | {playerView.votes[it[0]]} | {it === playerView.ownVote ? "Voted" : <a onClick={() => onPlayerVoted(it)}> Vote</a>}
            </div>
        )}
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

export function ChameleonBoard({ctx, G, moves, playerID}: BoardProps<ChameleonState>) {
    const playerView = G as unknown as ChameleonPlayerView | NotChameleonPlayerView;

    const [playerRoleIsShown, setPlayerRoleIsShown] = useState(true);

    useEffect(() => {
        if (!playerRoleIsShown) {
            return
        }

        let timer = setTimeout(() => setPlayerRoleIsShown(false), 5000);

        return () => {
            clearTimeout(timer)
        };

    }, [playerRoleIsShown]);
    //
    // const currentPlayerID = playerID;
    const isCurrentPlayer = playerID === ctx.currentPlayer;

    return (
        <div>
            {playerRoleIsShown &&
                <div className="flex fixed top-0 right-0 left-0 z-50 justify-center items-center h-full">
                    <div
                        className="flex relative justify-center items-center w-full h-64 text-2xl text-white bg-black/90">
                        <div className="absolute top-1 right-5 text-3xl text-white cursor-pointer top"
                             onClick={() => setPlayerRoleIsShown(false)}>×
                        </div>
                        {isChameleon(playerView) ? "Du bist das Chamäleon 🦎." : "Du bist Mitspieler 🎲."}
                    </div>
                </div>
            }
            <div className="flex justify-center w-full h-screen">
                <div className="flex justify-center items-center w-full h-screen">
                    <WordBoard playerView={playerView}/>
                </div>
                <div className="w-92">
                    <div className="">
                        <table>
                            <tbody>
                            {Array(ctx.numPlayers).fill(null).map((it, index) => <PlayerToWord
                                key={index}
                                playerName={"Spieler " + (index + 1)} word={playerView.player_words[index]}
                                isCurrentPlayer={Number.parseInt(ctx.currentPlayer) === index}/>)}
                            </tbody>
                        </table>
                        <Box>
                            {isCurrentPlayer && ctx.phase === "selectWord" && <InputWordBox
                                onWordSelected={(word) => {
                                    moves.selectAWord(word)
                                }}
                            />}
                            {ctx.phase === "discussAndVote" &&
                                <VoteBox ctx={ctx} playerView={playerView} onPlayerVoted={(votedPlayer) => {
                                    moves.vote(votedPlayer)
                                }}/>
                            }
                            {ctx.phase !== "discussAndVote" && !isCurrentPlayer && <NotPlayersTurnBox/>}
                        </Box>

                    </div>
                </div>

            </div>
        </div>
    );
}