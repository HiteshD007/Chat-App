import User from "../schema/user.schema";
import { generateAccessToken, generateRefreshToken } from "../configs/tokenAndCookie";
import { verifyToken } from "../configs/verifyToken";
import { AuthenticatedRequest } from "../configs/types";


export const signUp = async (req:any,res:any) => {

  try {
    const {username, email, password, confirm} = req.body;

    if(password != confirm) return res.status(406).json({error:true, message: "passwords doesn't match"});

    const isUserExists = await User.findOne({
      email:email
    });
    if(isUserExists) return res.status(406).json({error:true, message: "email already registered!"});

    const isUsernameExists = await User.findOne({
      username:username
    });
    if(isUsernameExists) return res.status(406).json({error:true, message: "username not available"});

    const user = await User.create({
      username,
      email,
      password
    });

    const accessToken = generateAccessToken(user._id,res);
    generateRefreshToken(user._id, user.email, res);

    res.status(201).json({success:true, accessToken});
  } catch (error:any) {
    console.log("Error in Sign-Up Controller",error.message);
    res.status(500).json({message: "Internal Server Error"});
  }
}


export const login = async (req:any,res:any) => {

  try {
    const {identifier, password} = req.body;

    const user = await User.findOne({
      $or: [{username: identifier},{email:identifier}]
    }).select('_id password email');

    if(!user) return res.status(404).json({error:true,message: "account not found"});
    if(password != user.password) return res.status(400).json({error:true, message: "wrong password entered"});
    
    const access_token = generateAccessToken(user._id,res);
    generateRefreshToken(user._id, user.email, res);
    res.status(200).json({success:true, accessToken:access_token});

  } catch (error:any) {
    console.log("Error in Log-In Controller",error.message);
    res.status(500).json({message: "Internal Server Error"});
  }
}


// 200: ok,
// 201: created,
// 400: Bad request,
// 401: Unauthorized,
// 403: Forbidden,
// 404: Not Found,
// 406: Not Acceptable

// 500: Internal Server Error,
// 501: Not Implemented
// 503: Service Unavailable


export const getAccessToken  = (req:any,res:any) => {
  try {
    
    const refresh_token = req.cookies.refresh_token;
    if(!refresh_token) return res.status(401).json({logoutUser: true});

    let accessToken = req.cookies.access_token;
    if(!accessToken) {
      accessToken = refreshToken(refresh_token,res);
      if(!accessToken) return res.status(401).json({logoutUser: true});
    }
    return res.status(200).json({accessToken});
  } catch (error:any) {
    console.log('Error in Getting Access Token', error.message);
    return res.status(500).json('Internal Server Error');
  }
}

const refreshToken = (refreshToken:string, res:any) => {
    const decoded =  verifyToken(refreshToken,process.env.REFRESH_TOKEN_SECRET!);
    if(!decoded) return null;
    const access_token = generateAccessToken(decoded.userId,res);
    return access_token;
} 

export const refreshAccessToken = (req:any, res:any) => {
    try {
    const refresh_token = req.cookies.refresh_token;
    if(!refresh_token) return res.status(401).json({logoutUser: true});
    const decoded =  verifyToken(refresh_token,process.env.REFRESH_TOKEN_SECRET!);
    if(!decoded) return res.status(401).json({logoutUser: true,message:"Invalid Token"});

    const access_token = generateAccessToken(decoded.userId,res);
    return res.status(200).json({accessToken:access_token});

  } catch (error: any) {
    console.log('Error in CheckAuth', error.message);
    return res.status(500).json('Internal Server Error');
  }
}

export const automaticallySignIn = async (req:AuthenticatedRequest, res:any) => {
  return res.status(200).json({success: true});
  // try {
  //   // const data = await getUserById(req.userId);

  //   // return res.status(200).json({
  //   //   isAuthenticated: true,
  //   //   user:data?.user,
  //   //   friends:data?.friends,
  //   //   servers:data?.servers
  //   // });
  // } catch (error: any) {
  //   console.log('Error in CheckAuth', error.message);
  //   return res.status(500).json('Internal Server Error');
  // }
}

