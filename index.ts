import * as express from "express";
import * as bp from "body-parser";
import * as cors from "cors";
import * as iof from "socket.io";
import * as wildcard from "socketio-wildcard";

import { WebsocketManager } from "./websocket";

const app = express();
const server = app.listen(8888, "0.0.0.0", () => console.log("Listening!"));

const io = iof(server);
io.use(wildcard());
const manager = new WebsocketManager(io);

app.use(cors());

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));

app.get("/health", (req, res) => {
   res.status(200).json({ hello: "world" });
});

app.post("/message", (req, res) => {
   console.log(req.body);
   const message = req.body.message;

   manager.send("message", message);
   res.status(200).end();
});

// server.listen(8888, "0.0.0.0", () => console.log("Listening!"));
