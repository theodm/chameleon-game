import React from 'react';
import ReactDOM from 'react-dom/client';
import ChameleonClient from './game/ChameleonClient';
import './index.css';
import { MultiPage } from './multipage/MultiPage';
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
// Funktioniert mit boardgame.io zurzeit nicht: https://github.com/boardgameio/boardgame.io/issues/1068
// führt dazu, dass sich das BoardGame nicht aktualisiert
// <React.StrictMode>
// </React.StrictMode>
root.render(
  <div>
    <MultiPage>
      <div className="bg-red-50">
        <ChameleonClient playerID="0" />
      </div>
      <div className="bg-yellow-50">
        <ChameleonClient playerID="1" />
      </div>
      <div className="bg-green-50">
        <ChameleonClient playerID="2" />
      </div>
    </MultiPage>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
