import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config();
const redis = new Redis({
  host: process.env.REDIS_ADRESS,
  port: 6379,
});

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (err) => {
  console.error('Redis connection error:', err);
});

export default redis;
