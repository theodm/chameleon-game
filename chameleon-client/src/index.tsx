import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {MultiPage} from './multipage/MultiPage';
import reportWebVitals from './reportWebVitals';
import {Client, Lobby} from "boardgame.io/react";
import {ChameleonGame} from "chameleon-shared";
import {ChameleonBoard, ChameleonTable} from "./game/board/ChameleonBoard";
import {
    createBrowserRouter,
    RouterProvider, Routes, useLocation,
} from "react-router-dom";
import {GameSettings, NotChameleonPlayerView} from "chameleon-shared/dist/game/ChameleonGame"
import "./lobby.css";
import {func} from "prop-types";
import {Local} from "boardgame.io/multiplayer";
import {VoteForNewGameBox} from "./game/board/VoteForNewGameBox";
import * as queryString from "querystring";

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
);

// Funktioniert mit boardgame.io zurzeit nicht: https://github.com/boardgameio/boardgame.io/issues/1068
// führt dazu, dass sich das BoardGame nicht aktualisiert
// <React.StrictMode>
// </React.StrictMode>

/**
 * Der echte Client für das Multiplayer über einen gemeinsamen
 * Webserver.
 */
function realClient() {
    let url = ""
    if (process.env.NODE_ENV === 'development') {
        // Wenn wir den Client im Watch-Modus starten,
        // dann greifen wir auf den lokalen Server mit dem Port 8000
        // zu.
        url = `http://${window.location.hostname}:8000`;
    } else {
        // Ansonsten gehen wir davon aus, dass wir schon deployed sind und
        // nehmen die eigene Adresse
        url = `http://${window.location.hostname}:${window.location.port}`
    }

    return <div>
        <Lobby
            gameServer={url}
            lobbyServer={url}
            debug={{
                collapseOnLoad: true
            }}
            gameComponents={[
                {game: ChameleonGame, board: ChameleonBoard}
            ]}
        />;
    </div>;
}

/**
 * Ein Client, der das Spiel lokal mit drei Spielern simuliert. Für das
 * Testen der Logik und des Aussehens des Spielfeldes
 */
function TestClientLocal(props: { }) {
    // Zugriff auf die location-Prop
    const location = useLocation();

    // Parsen der Query-String mit URLSearchParams
    const queryParams = new URLSearchParams(location.search);

    // Extrahieren der Parameter aus dem queryParams-Objekt
    const everyoneCanBeChameleon = queryParams.get("everyoneCanBeChameleon") === "true";
    const everyoneCanBeChameleonChance = parseFloat(queryParams.get("everyoneCanBeChameleonChance") ?? "0.2");
    const votingVisibility = queryParams.get("votingVisibility") ?? "OnlyNumeric";

    // Ausgeben der Parameter
    console.log(everyoneCanBeChameleon, everyoneCanBeChameleonChance, votingVisibility);

    const gameWithSetupData = (game: any, setupData: any) => ({
        ...game,
        setup: (ctx: any) => game.setup(ctx, setupData)
    });

    const ChameleonClient = Client({
        game: gameWithSetupData(ChameleonGame, {
            everyoneCanBeChameleon: everyoneCanBeChameleon,
            votingVisibility: votingVisibility,
            everyoneCanBeChameleonChance: everyoneCanBeChameleonChance,
        } as GameSettings),
        board: ChameleonBoard,
        numPlayers: 3, multiplayer: Local()
    });

    return <MultiPage>
        <ChameleonClient debug={{collapseOnLoad: true}} playerID="0" />
        <ChameleonClient debug={{collapseOnLoad: true}} playerID="1"/>
        <ChameleonClient debug={{collapseOnLoad: true}} playerID="2"/>
    </MultiPage>
}

const router = createBrowserRouter([
    {
        path: "/",
        element: realClient(),
    },
    {
        path: "/simulation",
        element: <TestClientLocal/>
    },
    {
        path: "/styletest/VoteForNewGameBox",
        element: <div>
            <div>
                <VoteForNewGameBox newGameVotes={{"0": true, "1": false, "2": true}}
                                   voteForNewGame={() => alert("voted")} thisPlayerID={"1"}/>
                <VoteForNewGameBox newGameVotes={{"0": true, "1": true, "2": false}}
                                   voteForNewGame={() => alert("voted")} thisPlayerID={"1"}/>
            </div>
        </div>
    },
    {

        path: "/styletest/CompleteUI",
        element: (function () {


            return <div>
                {/*<div>*/}
                {/*    <ChameleonTable phase={"selectWord"} G={({*/}
                {/*        playerWon: null,*/}
                {/*        is_chameleon: false,*/}
                {/*        chameleonChosenWordIndex: null,*/}
                {/*        ownVote: null,*/}
                {/*        player_who_is_chameleon: "T",*/}
                {/*        player_words: {*/}
                {/*            "A": "A",*/}
                {/*            "B": "B",*/}
                {/*            "C": "C",*/}
                {/*            "D": "D",*/}
                {/*            "E": "E",*/}
                {/*            "T": null*/}
                {/*        },*/}
                {/*        startNewGameVotes: {*/}
                {/*            "A": false,*/}
                {/*            "B": false,*/}
                {/*            "C": false,*/}
                {/*            "D": false,*/}
                {/*            "E": false,*/}
                {/*            "T": false*/}
                {/*        },*/}
                {/*        votes: {*/}
                {/*            "A": 0,*/}
                {/*            "B": 0,*/}
                {/*            "C": 0,*/}
                {/*            "D": 0,*/}
                {/*            "E": 0,*/}
                {/*            "T": 0*/}
                {/*        },*/}
                {/*        word_to_describe: 5,*/}
                {/*        words: board_words[0]*/}

                {/*    } as NotChameleonPlayerView)} playerMap={{*/}
                {/*        "A": { name: "Alpha", connected: true },*/}
                {/*        "B": { name: "Beta", connected: true },*/}
                {/*        "C": { name: "Gamma", connected: true },*/}
                {/*        "D": { name: "Delta", connected: true },*/}
                {/*        "E": { name: "Epsilon", connected: true },*/}
                {/*        "T": { name: "Theta", connected: true },*/}
                {/*    }} currentPlayerID={"T"} thisPlayerID={"T"} chooseWord={indexOfWord => {}} selectAWord={word => {}} vote={playerIDOfVotedPlayer => {}} numberOfPlayers={6} voteForNewGame={() => {}} />*/}
                {/*</div>*/}
            </div>
        })()
    }
]);

root.render(
    <RouterProvider router={router}/>
)
;


// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

