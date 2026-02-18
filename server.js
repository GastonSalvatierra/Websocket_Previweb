import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";

const app = express();

// 1. Configuramos los orígenes permitidos
// Incluimos localhost para desarrollo y tu URL de Railway para producción
const allowedOrigins = [
  "http://localhost:3000",
  "https://previweb-production.up.railway.app"
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on("connection", (socket) => {
  console.log(`🟢 Cliente conectado: ${socket.id}`);

  // Evento para cambios individuales (Registro, Bloqueo, Anulación)
  socket.on("pedido-actualizado", (data) => {
    console.log("📦 Cambio en pedido:", data);
    // Notificamos a todos los clientes que deben refrescar sus listas
    io.emit("actualizar-lista", data);
  });

  // Evento para actualizaciones masivas (Excel)
  socket.on("actualizar-lista", (data) => {
    console.log("📊 Actualización masiva recibida:", data);
    io.emit("actualizar-lista", data);
  });

  socket.on("disconnect", () => {
    console.log(`🔴 Cliente desconectado: ${socket.id}`);
  });
});

// Railway detectará este puerto automáticamente
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log(`🚀 Servidor de Sockets corriendo en el puerto ${PORT}`);
  console.log(`✅ Permitiendo conexiones desde: ${allowedOrigins.join(", ")}`);
});