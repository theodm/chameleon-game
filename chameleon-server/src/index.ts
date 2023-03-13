import {Server, Origins} from "boardgame.io/server";
import {ChameleonGame} from "chameleon-shared";
import serve from "koa-static";
import * as path from "path";
import mount from "koa-mount";
import * as fs from "fs";

const server = Server({
    games: [ChameleonGame],
    origins: [Origins.LOCALHOST]
});

server.app.use(mount('/', serve(path.join(__dirname, 'client'))))

// Workaround: Damit der React-Router die richtigen Routen auch mitbekommt.
// Könnte eigentlich schöner sein :(
server.router.all("/simulation", async (ctx) => {
    if (!ctx.body) {
        ctx.type = 'html';
        ctx.body = fs.createReadStream(path.join(__dirname, 'client/index.html'));
    }
});

server.run(8000);
