import { BoardProps } from "boardgame.io/dist/types/packages/react";
import { useEffect, useState } from "react";
import { ChameleonPlayerView, ChameleonState, NotChameleonPlayerView } from "./ChameleonGame";

function Card({ text, isSelectedWord }: { text: string, isSelectedWord: boolean }) {
    const content = isSelectedWord ? <mark>{text}</mark> : <>{text}</>;

    return <div key={text} className="flex justify-center items-center p-2 m-1 w-48 h-32 rounded-lg border border-black">
        {content}
    </div>
}

function PlayerToWord({ playerName, word, isCurrentPlayer }: { playerName: string, word: string | null, isCurrentPlayer: boolean }) {
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

export function ChameleonBoard({ ctx, G, moves }: BoardProps<ChameleonState>) {
    const playerView = G as unknown as ChameleonPlayerView | NotChameleonPlayerView;

    const [playerRoleIsShown, setPlayerRoleIsShown] = useState(true);

    useEffect(() => {
        if (!playerRoleIsShown) {
            return
        }

        let timer = setTimeout(() => setPlayerRoleIsShown(false), 3000);

        return () => {
            clearTimeout(timer)
        };

    }), [playerRoleIsShown];


    return (
        <div>
            {playerRoleIsShown && <div className="flex fixed top-0 right-0 left-0 z-50 justify-center items-center h-full">
                <div className="flex relative justify-center items-center w-full h-64 text-2xl text-white bg-black/90">
                    <div className="absolute top-1 right-5 text-3xl text-white cursor-pointer top" onClick={() => setPlayerRoleIsShown(false)}>×</div>
                    {isChameleon(playerView) ? "Du bist das Chamäleon 🦎." : "Du bist Mitspieler 🎲."}
                </div>
            </div>
            }
            <div className="flex justify-center w-full h-screen">
                <div>
                    <div className="grid grid-cols-[repeat(4,_min-content)]">
                        {G.words.map((it, index) => <Card key={it} text={it} isSelectedWord={!isChameleon(playerView) && playerView.word_to_describe === index} />)}
                    </div>
                </div>
                <div className="w-92">
                    <div className="">
                        <table>
                            <tbody>
                                {Array(ctx.numPlayers).fill(null).map((it, index) => <PlayerToWord playerName={"Spieler " + (index + 1)} word={playerView.player_words[index]} isCurrentPlayer={Number.parseInt(ctx.currentPlayer) === index} />)}
                            </tbody>
                        </table>
                        <form className="p-2 m-2 border border-black">
                            <div className="p-2">
                                <label htmlFor="email" className="block mb-2 font-medium text-center text-gray-900 text-md">Wort eingeben</label>
                                <input type="email" id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" required />
                            </div>
                            <div className="flex justify-center w-full">
                                <button type="button" className="m-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2">Bestätigen</button>
                            </div>
                        </form>
                    </div>
                </div>

            </div>
        </div>
    );
}