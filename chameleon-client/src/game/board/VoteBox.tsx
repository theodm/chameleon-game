// ToDo: playOrdersOfPlayers könnte eigener Typ sein
import {
    ChameleonPlayerView,
    NotChameleonPlayerView,
    OnlyNumericContainer,
    VoteContainer
} from "chameleon-shared/dist/game/ChameleonGame";
import {UserIcon} from "@heroicons/react/24/solid";
import {PlayerMap} from "./ChameleonBoard";


function NumericVoteView({
                             voteContainer,
                             playerInVotingList
                         }: { voteContainer: OnlyNumericContainer, playerInVotingList: string }) {

    return <div className="flex justify-center items-center">
        {Array(voteContainer.votes[playerInVotingList]).fill(<>
            <UserIcon className="m-1 w-6 h-6"/></>)}</div>;
}

export function VoteBox({playerMap, playerView, onPlayerVoted}: {
    playerMap: PlayerMap,
    playerView: ChameleonPlayerView | NotChameleonPlayerView,
    onPlayerVoted: (playerID: string) => void
}) {

    return <div className="flex justify-center items-center">
        <table className="w-96">
            {Object.entries(playerMap).map(([playerInVotingList, playerData]) =>
                <tr key={playerInVotingList}>
                    <td className="p-1">
                        <div className="flex justify-center items-center">{playerData.name}</div>
                    </td>
                    <td className="p-1 w-24">
                        {playerView.votes.visibility === "OnlyNumeric" && <NumericVoteView voteContainer={playerView.votes} playerInVotingList={playerInVotingList}/> }
                        {playerView.votes.visibility === "None" && "No visibility" }
                        {playerView.votes.visibility === "OnlyNumeric" && <NumericVoteView voteContainer={playerView.votes} playerInVotingList={playerInVotingList}/> }
                    </td>
                    <td className="p-1">
                        <div className="flex justify-center items-center">
                            <button type="button"
                                    className="px-1 py-1 text-sm font-medium text-center text-gray-900 rounded-lg border border-gray-800 hover:text-white hover:bg-gray-900 focus:ring-4 focus:outline-none focus:ring-gray-300 dark:border-gray-600 dark:text-gray-400 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-800"
                                    onClick={() => onPlayerVoted(playerInVotingList)}>{playerInVotingList !== playerView.ownVote ? "Wählen" : "Gewählt"}</button>
                        </div>
                    </td>

                </tr>
            )}
        </table>
    </div>
}