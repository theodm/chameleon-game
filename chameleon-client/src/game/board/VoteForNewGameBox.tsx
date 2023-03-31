import React from "react";
import {ButtonWithLabel} from "./components/Button";

export function VoteForNewGameBox({
                                      thisPlayerID,
                                      newGameVotes,
                                      voteForNewGame
                                  }: { thisPlayerID: string, newGameVotes: { [playerID: string]: boolean }, voteForNewGame: () => void }) {

    const thisPlayerVoted = newGameVotes[thisPlayerID]
    const numberOfPlayersWhoVoted = Object
        .entries(newGameVotes)
        .filter((it: [string, boolean]) => it[1])
        .length
    const numberOfPlayers = Object
        .entries(newGameVotes)
        .length

    return <div className="flex justify-center items-center h-16 text-center">
        <ButtonWithLabel onClick={() => voteForNewGame()} text={!thisPlayerVoted ? "Nächste Runde" : "Warte auf Mitspieler"}
                         disabled={thisPlayerVoted} label={`${numberOfPlayersWhoVoted}/${numberOfPlayers}`}/>
    </div>
}