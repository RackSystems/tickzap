import { Worker, Job } from "bullmq";
import IORedis from "ioredis";
import Agent from "../../app/integrations/agno/Agent";
import sendMessage from "./MessageService";
import {broadcastToChannel, broadcastToWatchingConversation} from "../../websocket";
import {truncateWithoutCuttingWord} from '../../modules/conversations/ConversationHelper'

const redisURL = process.env.REDIS_URL as string;

const connection = new IORedis(redisURL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

const messageWorker = new Worker(
  "MessageQueue",
  async (job: Job) => {
    const { agentId, payload } = job.data;
    console.log(`Processing message for agent ${agentId}`, payload);
    const response = await Agent.useAgent(agentId, payload);

    job.data.response = response;

    if (response.message) {
      /*
       * conversationId: payload.session_id,
       * contactId: payload.contact_id,
       * content: response.message,
       * type: "BOT",
       * */

      await sendMessage.sendMessage({
        conversationId: payload.session_id,
        contactId: payload.user_id,
        content: response.message,
        type: "BOT",
      }); //send message processed by AI
    }
  },
  { connection },
);

messageWorker.on("completed", async (job: Job) => {
  console.log(`Job ${job.id} has completed!`);

  const { session_id, user_id, channelId } = job.data.payload;
  const response = job.data.response;

  await broadcastToWatchingConversation(job.data.payload.session_id, {
    type: "messageProcessed",
    jobId: job.id,
    conversationId: session_id,
    contactId: user_id,
    message: response?.message,
    timestamp: new Date().toISOString(),
  })

  //global notification
  if (channelId) {
    await broadcastToChannel(channelId, {
      type: "conversationUpdated",
      jobId: job.id,
      conversationId: session_id,
      lastMessage: truncateWithoutCuttingWord(response?.message),
      updatedAt: new Date().toISOString(),
      hasNewMessage: true
    })
  } else {
    console.warn(`No channelId for job ${job.id}, skipping global broadcast`);
  }
});

messageWorker.on("failed", async (job: Job | undefined, err: Error) => {
  if (job) {
    console.log(`Job ${job.id} has failed with ${err.message}`);
    await broadcastToWatchingConversation(job.data.payload.session_id, {
      type: "messageProcessingFailed",
      jobId: job.id,
      conversationId: job.data.payload.session_id,
      contactId: job.data.payload.user_id,
      error: err.message,
    });
  } else {
    console.log(`A job has failed with ${err.message}`);
  }
});

export default messageWorker;
