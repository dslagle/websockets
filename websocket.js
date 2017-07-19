"use strict";
class WebsocketManager {
    constructor(io) {
        this.clients = {};
        this.listeners = {};
        this.deregisters = {};
        io.on("connection", (sock) => this.handleConnect(sock));
    }
    send(toClientID, event, data) {
        const client = this.clients[toClientID];
        if (!client) {
            console.log(`Failed to send message to disconnected client "${toClientID}"`);
            return;
        }
        this.clients[toClientID].emit(event, data);
    }
    handleConnect(socket) {
        this.clients[socket.client.id] = socket;
        this.deregisters[socket.client.id] = [];
        socket.on("disconnect", () => this.handleDisconnect(socket));
        socket.on("register", (data) => {
            console.log(`Register: ${data.event}`);
            if (!this.listeners[data.event]) {
                this.listeners[data.event] = {};
            }
            if (!this.listeners[data.event][socket.client.id]) {
                this.listeners[data.event][socket.client.id] = socket;
                this.deregisters[socket.client.id].push(() => { delete this.listeners[data.event][socket.client.id]; console.log(`Unregister: ${data.event}`); });
            }
        });
        socket.on("*", (e) => {
            const event = e.data[0];
            if (event === "register") {
                return;
            }
            console.log(`Event: ${event}`);
            const payload = e.data[1];
            const to = this.listeners[event];
            if (to) {
                Object.keys(to).map((k) => to[k]).forEach((s) => s.emit(event, payload));
            }
        });
    }
    handleDisconnect(socket) {
        delete this.clients[socket.client.id];
        this.deregisters[socket.client.id].forEach((m) => m());
        delete this.deregisters[socket.client.id];
    }
}
exports.WebsocketManager = WebsocketManager;
