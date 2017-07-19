export class WebsocketManager {
   private clients: { [key: string]: SocketIO.Socket } = {};
   private listeners: { [key: string]: { [key: string]: SocketIO.Socket } } = {};
   private deregisters: { [key: string]: Array<() => void> } = {};

   constructor(io: SocketIO.Server) {
      io.on("connection", (sock) => this.handleConnect(sock));
   }

   send(fromClientID: string, event: string, data: any) {
      const to = this.listeners[event];

      if (to) {
         Object.keys(to).map((k) => to[k]).forEach((s) => s.emit(event, data));
      }
   }

   private handleConnect(socket: SocketIO.Socket) {
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
         
         this.send(socket.client.id, event, payload);
      });
   }

   private handleDisconnect(socket) {
      delete this.clients[socket.client.id];

      this.deregisters[socket.client.id].forEach((m) => m());
      delete this.deregisters[socket.client.id];
   }
}
