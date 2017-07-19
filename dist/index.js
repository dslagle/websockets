"use strict";
const express = require("express");
const bp = require("body-parser");
const cors = require("cors");
const iof = require("socket.io");
const wildcard = require("socketio-wildcard");
const websocket_1 = require("./websocket");
const app = express();
const server = app.listen(8888, "0.0.0.0", () => console.log("Listening!"));
const io = iof(server);
io.use(wildcard());
const manager = new websocket_1.WebsocketManager(io);
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
