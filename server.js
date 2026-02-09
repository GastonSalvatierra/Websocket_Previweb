import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // El puerto de tu Next.js
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("🟢 Cliente conectado:", socket.id);

  // 1. Escuchar cuando se actualiza un pedido individual (confirmación/bloqueo)
  socket.on("pedido-actualizado", (data) => {
    console.log("📦 Pedido actualizado:", data);
    // Usamos io.emit para que TODOS (incluido el que lo envió) estén sincronizados
    io.emit("actualizar-lista", data);
  });

  // 2. AGREGAR ESTO: Escuchar cuando se carga el Excel
  socket.on("actualizar-lista", (data) => {
    console.log("📊 Excel cargado, notificando a todos...");
    // Notifica a todos los clientes que deben ejecutar fetchAllPedidos()
    io.emit("actualizar-lista", data);
  });

  socket.on("disconnect", () => {
    console.log("🔴 Cliente desconectado:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Socket server escuchando en puerto ${PORT}`);
});
