
import { verifyToken } from "./verifyToken";

export const protectedRoute = (req:any,res:any,next:any) => {
  try {
    const access_token = req.headers.authorization?.split(" ")[1] || null;
    if(!access_token) return res.status(401).json({isAuthenticated : false});
    const decoded = verifyToken(access_token,process.env.ACCESS_TOKEN_SECRET!);
    if(decoded === null) return res.status(401).json({isAuthenticated : false});
    
    req.userId = decoded.userId;
    next();
    
  } catch (error:any) {
    console.error("Error in Protected Route",error.message);
    return res.status(500).json({message:"Internal Server Error"});
  }
}