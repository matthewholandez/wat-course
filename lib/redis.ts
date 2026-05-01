import { createClient, RedisClientType } from "redis";

class RedisSingleton {
    private static instance: RedisSingleton;
    private client: RedisClientType;
    
    private constructor() {
        this.client = createClient();
        this.client.on('error', (e) => console.error('Redis client error', e));
    }

    public static async getInstance(): Promise<RedisClientType> {
        if (!RedisSingleton.instance) {
            RedisSingleton.instance = new RedisSingleton();
            await RedisSingleton.instance.client.connect();
        }
        return RedisSingleton.instance.client;
    }
}

export default RedisSingleton;