import express from 'express';
import { signUp,login, automaticallySignIn, refreshAccessToken, getAccessToken } from '../controllers/auth.controller';
import { protectedRoute } from '../configs/protected-routes';

const router = express.Router();

router.post('/sign-up',signUp);
router.post('/log-in',login);

router.post('/log-out', protectedRoute, (req:any,res:any) => {
  try {
    res.clearCookie('access_token',{
      secure: true,
      httpOnly: true,
      sameSite: true
    });

    res.clearCookie('refresh_token',{
      secure: true,
      httpOnly: true,
      sameSite: true
    });

    return res.status(200).json({success:true});

  } catch (error) {
    console.log('Error in Logout',error);
    return res.status(500).json({message:"Internal server Error"});
  }
});


router.get('/auto-sign-in',protectedRoute,automaticallySignIn);
router.get('/refresh-access-token',refreshAccessToken);
router.get('/get/access-token',getAccessToken);

export default router;