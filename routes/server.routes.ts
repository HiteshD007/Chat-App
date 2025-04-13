import express from 'express';
import { protectedRoute } from '../configs/protected-routes';
import { addChannel, deleteServer, joinServer, leaveServer } from '../controllers/server.controller';


const router = express.Router();
// router.post('/create',protectedRoute,createServer);
// router.delete('/delete',protectedRoute,deleteServer);
// router.patch('/join',protectedRoute,joinServer);
// router.patch('/leave',protectedRoute,leaveServer);
// router.patch('/add-channel',protectedRoute,addChannel);

export default router;