import jwt, { JwtPayload } from 'jsonwebtoken';

export const verifyToken = (token:string,secret:string) => {

  const decoded = jwt.verify(token,secret) as JwtPayload;

  if(decoded) return decoded;

  return null;

}