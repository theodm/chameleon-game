import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import {MultiPage} from './multipage/MultiPage';
import reportWebVitals from './reportWebVitals';
import {Client, Lobby} from "boardgame.io/react";
import {ChameleonGame} from "chameleon-shared";
import {ChameleonBoard} from "./game/board/ChameleonBoard";
import {
    createBrowserRouter,
    RouterProvider, Routes,
} from "react-router-dom";
import "./lobby.css";
import {func} from "prop-types";
import {Local} from "boardgame.io/multiplayer";
import {VoteForNewGameBox} from "./game/board/VoteForNewGameBox";

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
function testClientLocal() {
    const ChameleonClient = Client({ game: ChameleonGame, board: ChameleonBoard, numPlayers: 3, multiplayer: Local() });

    return <MultiPage>
        <ChameleonClient debug={{collapseOnLoad: true}} playerID="0"/>
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
        element: testClientLocal()
    },
    {
        path: "/styletest/VoteForNewGameBox",
        element: <div>
            <div>
                <VoteForNewGameBox newGameVotes={{ "0": true, "1": false, "2": true }} voteForNewGame={() => alert("voted")} thisPlayerID={"1"}/>
                <VoteForNewGameBox newGameVotes={{ "0": true, "1": true, "2": false }} voteForNewGame={() => alert("voted")} thisPlayerID={"1"}/>
            </div>
        </div>
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

