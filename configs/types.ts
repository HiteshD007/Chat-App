import { Request,Response } from "express";
import mongoose from "mongoose";

export interface AuthenticatedRequest extends Request{
  userId : mongoose.Schema.Types.ObjectId,
}
