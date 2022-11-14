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
      <ChameleonClient playerID="0" />
      <ChameleonClient playerID="1" />
      <ChameleonClient playerID="2" />
    </MultiPage>
  </div>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
