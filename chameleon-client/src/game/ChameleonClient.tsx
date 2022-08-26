import { Client } from 'boardgame.io/react';
import { Local } from 'boardgame.io/multiplayer'
import { ChameleonBoard } from './ChameleonBoard';
import { ChameleonGame, ChameleonState } from './ChameleonGame';

const ChameleonClient = Client({ game: ChameleonGame, board: ChameleonBoard, numPlayers: 3, multiplayer: Local() });

export default ChameleonClient;
