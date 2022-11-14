import { BoardProps } from "boardgame.io/react";
import { useEffect, useState } from "react";
import { ChameleonPlayerView, ChameleonState, NotChameleonPlayerView } from "../ChameleonGame";
import { Ctx } from "boardgame.io";
import { isChameleon } from "./StateUtils";
import { WordBoard } from "./WordBoard";
import { ChatBubbleLeftEllipsisIcon, ChatBubbleLeftRightIcon, CubeIcon, SwatchIcon, TrophyIcon, UserIcon } from "@heroicons/react/24/solid";
import { PlayerTurnSpinner } from "./PlayerTurnSpinner";


function PlayerToWord({
    playerName,
    word,
    playerRole,
    isCurrentPlayer
}: { playerName: string, playerRole: "Chameleon" | "Player" | "Unknown", word: string | null, isCurrentPlayer: boolean }) {
    return <tr>
        <td className="p-2 whitespace-nowrap border border-black">{playerName}</td>
        <td className="p-2 text-center border border-black w-[99%]">{isCurrentPlayer && !word ? <PlayerTurnSpinner /> : (!!word ? word : "...")}</td>
        <td className="p-2 text-center border border-black">{isCurrentPlayer && !word ? <PlayerTurnSpinner /> : (!!word ? word : "...")}</td>
    </tr>
}

function Box({ children }: { children: any }) {
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

function VoteBox({ ctx, playerView, onPlayerVoted }: {
    ctx: Ctx, playerView: ChameleonPlayerView | NotChameleonPlayerView,
    onPlayerVoted: (playerID: string) => void
}) {

    return <div className="flex justify-center items-center">
        <table className="w-96">
            {ctx.playOrder.map((it, index) =>
                <tr key={it}>
                    <td className="p-1"><div className="flex justify-center items-center">{"Spieler " + (index + 1)}</div></td>
                    <td className="p-1 w-24"><div className="flex justify-center items-center">{Array(playerView.votes[it[0]]).fill(<><UserIcon className="m-1 w-6 h-6" /></>)}</div></td>
                    <td className="p-1"><div className="flex justify-center items-center"><button type="button" className="px-1 py-1 text-sm font-medium text-center text-gray-900 rounded-lg border border-gray-800 hover:text-white hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800" onClick={() => onPlayerVoted(it)}>{it !== playerView.ownVote ? "Wählen" : "Gewählt"}</button></div></td>

                </tr>
            )}
        </table>
    </div >
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
                required />
        </div>
        <div className="flex justify-center w-full">
            <button type="button"
                className="m-2 text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 mr-2 mb-2"
                onClick={() => onWordSelected(currentWord)}>Bestätigen
            </button>
        </div>
    </form>;
}

function GameStateBoard({
    ctx,
    playerView
}: {
    ctx: any,
    playerView: ChameleonPlayerView | NotChameleonPlayerView
}) {

    return <div className="flex mt-2 w-full">
        <div className="flex justify-center items-center w-4/12 border border-black">
            <div className="flex flex-col">
                <span className="flex justify-center items-center">
                    {ctx.phase === "selectWord" ? <SwatchIcon className="w-6 h-6" /> : ""}
                    {ctx.phase === "discussAndVote" ? <ChatBubbleLeftRightIcon className="w-6 h-6" /> : ""}
                    {ctx.phase === "chameleonChoosesWord" ? <CubeIcon className="w-6 h-6" /> : ""}
                    {ctx.phase === "gameEnded" ? <TrophyIcon className="w-6 h-6" /> : ""}

                </span>
                <div className="flex justify-center items-center mb-2 text-center">
                    {ctx.phase === "selectWord" ? "Die Spieler wählen ein Wort aus." : ""}
                    {ctx.phase === "discussAndVote" ? "Die Spieler wählen den Verdächtigen." : ""}
                    {ctx.phase === "chameleonChoosesWord" ? "Das Chameleon versucht das Wort erraten." : ""}
                    {ctx.phase === "gameEnded" ? "Das Spiel ist beendet." : ""}
                </div>
            </div>
        </div>
        <div className="ml-2 w-8/12">
            <table>
                <tbody>
                    {Array(ctx.numPlayers).fill(null).map((it, index) => <PlayerToWord
                        key={index}
                        playerRole={playerView.player_who_is_chameleon && parseInt(playerView.player_who_is_chameleon) == index ? "Chameleon" : "Unknown"}
                        playerName={"Spieler " + (index + 1)} word={playerView.player_words[index]}
                        isCurrentPlayer={Number.parseInt(ctx.currentPlayer) === index} />)}
                </tbody>
            </table>
        </div>
    </div>
}

export function Overlay({changeKey, children}: {changeKey: string, children: any}) {
    const [overlayIsShown, setOverlayIsShown] = useState(true);
    
    useEffect(() => {
        setOverlayIsShown(true);

        let timer = setTimeout(() => setOverlayIsShown(false), 3000);

        return () => {
            clearTimeout(timer)
        };
    }, [changeKey])
    
    if (!overlayIsShown) {
        return <></>
    }

    return <div className="flex absolute top-0 right-0 left-0 z-50 justify-center items-center h-full">
            <div
                className="flex relative justify-center items-center w-full h-64 text-2xl text-white bg-black/90">
                <div className="absolute top-1 right-5 text-3xl text-white cursor-pointer top"
                    onClick={() => { setOverlayIsShown(false) }}>×
                </div>
                {children}
            </div>
        </div>
}

export function ChameleonBoard(props: BoardProps<ChameleonState>) {
    const {ctx, G, moves, playerID} = props;
        
    const playerView = G as unknown as ChameleonPlayerView | NotChameleonPlayerView;
    

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
                    
            <ChameleonBoard_ {...props}/>       
        </div>
    )
}


export function ChameleonBoard_({ ctx, G, moves, playerID }: BoardProps<ChameleonState>) {
    const playerView = G as unknown as ChameleonPlayerView | NotChameleonPlayerView;

    const isCurrentPlayer = playerID === ctx.currentPlayer;

    const wordSelectable = ctx.phase === "chameleonChoosesWord" && isCurrentPlayer;

    function onSelectWord(wordIndex: number) {
        moves.chooseWord(wordIndex);        
    }

    return (
        <div className="relative w-full h-screen">
            <div className="flex justify-center items-center w-full h-full">
                <div className="flex flex-col justify-center items-center">

                    <WordBoard playerView={playerView} selectable={wordSelectable} onSelectWord={onSelectWord} />
                    <GameStateBoard ctx={ctx} playerView={playerView} />
                    <div className="w-full">
                        <div className="">

                            <Box>
                                {isCurrentPlayer && ctx.phase === "selectWord" && <InputWordBox
                                    onWordSelected={(word) => {
                                        moves.selectAWord(word)
                                    }}
                                />}
                                {ctx.phase === "discussAndVote" &&
                                    <VoteBox ctx={ctx} playerView={playerView} onPlayerVoted={(votedPlayer) => {
                                        moves.vote(votedPlayer)
                                    }} />
                                }
                                {ctx.phase === "chameleonChoosesWord" && isCurrentPlayer && <ChameleonChoosesWordBox/> }
                                {ctx.phase !== "discussAndVote" && !isCurrentPlayer && <NotPlayersTurnBox />}
                            </Box>

                        </div>
                    </div>

                </div></div>
        </div>
    );
}