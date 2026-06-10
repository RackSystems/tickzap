import {Queue} from "bullmq";
import IORedis from "ioredis";

const connection = new IORedis(process.env.REDIS_URL as string, {
    maxRetriesPerRequest: null,
    enableReadyCheck: false,
});

export const messageQueue = new Queue("MessageQueue", {connection});
