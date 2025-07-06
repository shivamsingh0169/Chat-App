import express from 'express';
import 'dotenv/config';
import cors from "cors";
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import { Server } from 'socket.io';

const app = express();

// ✅ Always FIRST: Manual headers for CORS reliability in serverless
// ✅ Always FIRST: Manual headers for CORS reliability in serverless
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://chat-app-one-bay.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  next();
});

// ✅ Then apply CORS middleware
app.use(cors({
  origin: [
    "http://localhost:5173",
    "https://chat-app-one-bay.vercel.app"
  ],
  credentials: true
}));

// ✅ Handle preflight OPTIONS requests
app.options('*', cors({
  origin: [
    "http://localhost:5173",
    "https://chat-app-one-bay.vercel.app"
  ],
  credentials: true
}));

// ✅ JSON body parser
app.use(express.json({ limit: '4mb' }));


// ✅ Store online users
export const userSocketMap = {}; // { userId: socketId }

io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('User Connected', userId);

  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit('getOnlineUsers', Object.keys(userSocketMap));

  socket.on('disconnect', () => {
    console.log("User Disconnected", userId);
    delete userSocketMap[userId];
    io.emit('getOnlineUsers', Object.keys(userSocketMap));
  });
});

// ✅ Route Setup
app.use("/api/status", (req, res) => res.send("Server is live"));
app.use('/api/auth', userRouter);
app.use('/api/messages', messageRouter);

// ✅ Connect to MongoDB
await connectDB();

// ✅ Server listen for dev
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log("Server is running on PORT: " + PORT));


// ✅ Export for Vercel (serverless adapter)
export default server;
