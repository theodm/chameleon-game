import {ChameleonPlayerView, NotChameleonPlayerView} from "chameleon-shared/dist/game/ChameleonGame";
import {ChatBubbleLeftRightIcon, CubeIcon, SwatchIcon, TrophyIcon} from "@heroicons/react/24/solid";

// https://loading.io/css/
export function PlayerTurnSpinner() {
    return <div role="status">
        <svg className="inline mr-2 w-4 h-4 text-gray-200 animate-spin dark:text-gray-600 fill-black" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" />
            <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" />
        </svg>
        <span className="sr-only">Loading...</span>
    </div>;
}
function PlayerToWord({
                          playerName,
                          word,
                          playerRole,
                          isCurrentPlayer
                      }: { playerName: string, playerRole: "Chameleon" | "Player" | "Unknown", word: string | null, isCurrentPlayer: boolean }) {
    return <tr>
        <td className="p-2 whitespace-nowrap border border-black">{playerName}</td>
        <td className="p-2 text-center border border-black w-[99%]">{isCurrentPlayer && !word ?
            <PlayerTurnSpinner/> : (!!word ? word : "...")}</td>
        <td className="p-2 text-center border border-black">{isCurrentPlayer && !word ?
            <PlayerTurnSpinner/> : (!!word ? word : "...")}</td>
    </tr>
}

/**
 * Gibt für den Spieler den aktuellen Stand des Spiels an; z.B.
 * in welcher Phase er sich gerade befindet, oder auf welchen Spieler er im Moment wartet.
 * Außerdem werden rechts die gewählten Wörter der Spieler sowie ggf. ein Warteindikator angezeigt.
 *
 * @param phase
 * @param currentPlayerID
 * @param numberOfPlayers
 * @param playerView
 * @constructor
 */
export function GameStateBox({
                                   phase,
                                   currentPlayerID,
                                   numberOfPlayers,
                                   playerView
                               }: {
    phase: string,
    currentPlayerID: string,
    numberOfPlayers: number,
    playerView: ChameleonPlayerView | NotChameleonPlayerView
}) {

    return <div className="flex mt-2 w-full">
        <div className="flex justify-center items-center w-4/12 border border-black">
            <div className="flex flex-col">
                <span className="flex justify-center items-center">
                    {phase === "selectWord" ? <SwatchIcon className="w-6 h-6"/> : ""}
                    {phase === "discussAndVote" ? <ChatBubbleLeftRightIcon className="w-6 h-6"/> : ""}
                    {phase === "chameleonChoosesWord" ? <CubeIcon className="w-6 h-6"/> : ""}
                    {phase === "gameEnded" ? <TrophyIcon className="w-6 h-6"/> : ""}

                </span>
                <div className="flex justify-center items-center mb-2 text-center">
                    {phase === "selectWord" ? "Die Spieler wählen ein Wort aus." : ""}
                    {phase === "discussAndVote" ? "Die Spieler wählen den Verdächtigen." : ""}
                    {phase === "chameleonChoosesWord" ? "Das Chameleon versucht das Wort erraten." : ""}
                    {phase === "gameEnded" ? "Das Spiel ist beendet." : ""}
                </div>
            </div>
        </div>
        <div className="ml-2 w-8/12">
            <table>
                <tbody>
                {/* TODO: Hier verdächtig, wie PlayerID mit einem Index verglichen wird. Das kann schiefgehen. */}
                {Array(numberOfPlayers).fill(null).map((it, index) => <PlayerToWord
                    key={index}
                    playerRole={playerView.player_who_is_chameleon && parseInt(playerView.player_who_is_chameleon) == index ? "Chameleon" : "Unknown"}
                    playerName={"Spieler " + (index + 1)} word={playerView.player_words[index]}
                    isCurrentPlayer={Number.parseInt(currentPlayerID) === index}/>)}
                </tbody>
            </table>
        </div>
    </div>
}