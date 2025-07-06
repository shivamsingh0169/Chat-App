import express from 'express';
import 'dotenv/config';
import cors from "cors";
import http from 'http';
import { connectDB } from './lib/db.js';
import userRouter from './routes/userRoutes.js';
import messageRouter from './routes/messageRoutes.js';
import {Server} from 'socket.io'
// create express app and http server

const app = express();
const server =http.createServer(app)

//Initialize socket.io
export const io = new Server(server, {
    cors: {
      origin: ["https://chat-app-three-wine-11.vercel.app"], 
      methods: ["GET", "POST"],
      credentials: true
    }
  });
  

// Store online users

export const userSocketMap={}; // {userId:socketId}

//socket.io connection handler
io.on('connection',(socket)=>{
    const userId =socket.handshake.query.userId;
    console.log('User Connected',userId)

    if (userId) {
        userSocketMap[userId]= socket.id;
    }
    // Emit online user to all connection clients
    io.emit('getOnlineUsers',Object.keys(userSocketMap));

    socket.on('disconnect',()=>{
        console.log("User Disconnected", userId);
        delete userSocketMap[userId];
        io.emit('getOnlineUsers',Object.keys(userSocketMap))
    })
})

//Middleware setup

app.use(express.json({limit:'4mb'}));
app.use(cors({
    origin: [
      "http://localhost:5173",
      "https://chat-app-three-wine-11.vercel.app"
    ],
    credentials: true
  }));
  

// Route Setup
app.use("/api/status",(req,res)=>res.send("Server is live"));
app.use('/api/auth',userRouter);
app.use('/api/messages',messageRouter)

//Connect to MongoDb

await connectDB();


if(process.env.NODE_ENV !=="production"){
    const PORT = process.env.PORT || 5000;
    server.listen(PORT,()=>console.log("Server is running on PORT: " +PORT));
}
// Export server for vercal
export default server;
