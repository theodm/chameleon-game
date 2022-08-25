import { Client } from 'boardgame.io/react';
import { ChameleonGame } from './ChameleonGame';

const ChameleonClient = Client({ game: ChameleonGame, numPlayers: 3 });

export default ChameleonClient;