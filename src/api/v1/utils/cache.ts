import redis from '../../database/redis';

export const CACHE_EXPIRATION_TIME = 60 * 60;

export async function invalidateCache(keys: string[]) {
  for (const key of keys) {
    await redis.del(key);
  }
}

export async function setCache(key: string, data: any) {
  await redis.set(key, JSON.stringify(data), 'EX', CACHE_EXPIRATION_TIME);
}
