
import { createClient} from 'redis';

let redisClient:ReturnType<typeof createClient>;

const connectToRedis = async () => {
  if(redisClient) return redisClient;

  try {
    redisClient = createClient({
    // username: 'default',
    // password: process.env.REDIS_PASSWORD!,
    socket: {
        host: process.env.REDIS_LOCAL_HOST!,
        port: 6379
    }
});
    redisClient.on('error',(err:any) => {
      console.log('Error while turning ON redis :',err);
    });

    await redisClient.connect();
    return redisClient;
  
  } catch (error:any) {
    console.log('ERROR IN CONNECTING WITH REDIS :',error);
  }
}


export const setToRedis = async (key:string,value:any,expireIn:number) => {

  const redisClient = await connectToRedis();
  if(!redisClient) return;

  try {
    await redisClient.set(key,value,{
      EX: expireIn
    });
  } catch (error:any) {
    console.log('Error in storing value to Redis :',error.message);
  }
}

export const getFromRedis = async (key:string) => {
  const redisClient = await connectToRedis();
  if(!redisClient) return;

  try {
    const value = await redisClient.get(key);
    return value;
  } catch (error:any) {
    console.log('Error in getting value from Redis :',error.message);
  }
}