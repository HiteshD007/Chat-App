import express from 'express';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectToDb from './configs/database';

import http from 'http';
import { Server } from  'socket.io'; 
import socketIoFile from 'socket.io-file';

import authRoute from './routes/auth.routes';
import serverRoute from './routes/server.routes';
import inviteRoute from './routes/invite.route';
import messageRoute from './routes/message.route';
import { useSocketUser } from './sockets/useSocketUser';
import path from 'path';

dotenv.config();
const app = express();
app.use(express.json());
app.use(cookieParser());


app.use(express.static(path.join(__dirname, 'frontend/dist')));

const server = http.createServer(app);
const io = new Server(server,{
  cors: {
    origin: '*',
    credentials: true,
  }
});

io.on("connection", async(socket) => {
  const uploader = new socketIoFile(socket,{
    uploadDir: '/uploads',
    transmissionDelay: 0,	
    overwrite: true,
  });

  uploader.on('start', (fileInfo) => {});
  uploader.on('stream', (fileInfo) => {
      // console.log(`${fileInfo.wrote} / ${fileInfo.size} byte(s)`);
  });
  uploader.on('error', (err) => {
      console.log('Error!', err);
  });
  uploader.on('abort', (fileInfo) => {
      console.log('Aborted: ', fileInfo);
  });

  useSocketUser(socket,io,uploader);
});


app.use("/api/auth",authRoute);
app.use("/api/server",serverRoute);
app.use("/api/invite", inviteRoute);
app.use("/api/message",messageRoute);


app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'frontend/dist', 'index.html'));
});

const PORT = process.env.PORT;

connectToDb()
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Listening on Port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.log(error);
    process.exit(1);
  })






// Server Setup NPM commands (Typescript)

// npm install express dotenv cors
// npm install --save-dev typescript ts-node @types/node @types/express @types/cors nodemon
// npx tsc --init

// netstat -ano | findstr :5000  // info about port 5000
// taskkill /PID <PID_HERE> /F  // Kill task on port 5000

