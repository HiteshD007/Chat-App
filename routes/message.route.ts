import express from 'express';
import { protectedRoute } from '../configs/protected-routes';
// import { sendMessage } from '../controllers/message.controller';
import multer from 'multer';

const storage = multer.memoryStorage();
const upload = multer({storage});


const router = express.Router();

// router.post('/send',protectedRoute, upload.array("files") ,sendMessage);


export default router;