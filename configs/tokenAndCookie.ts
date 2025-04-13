import jwt from 'jsonwebtoken'
import { Response } from 'express';
import mongoose from 'mongoose'


export const generateAccessToken = (userId:mongoose.Schema.Types.ObjectId,res:Response) => {
  const token = jwt.sign({userId},process.env.ACCESS_TOKEN_SECRET!,{
    expiresIn: '60m'
  });

  res.cookie('access_token',token,{
    maxAge: 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: true
  });

  return token;

}

export const generateRefreshToken = (userId:mongoose.Schema.Types.ObjectId,email:string, res:Response) => {
  const token = jwt.sign({userId,email},process.env.REFRESH_TOKEN_SECRET!,{
    expiresIn: '7d'
  });

  res.cookie('refresh_token',token,{
    maxAge: 7 * 24 * 60 * 60 * 1000,
    secure: true,
    httpOnly: true,
    sameSite: true
  });

  return token;
}

