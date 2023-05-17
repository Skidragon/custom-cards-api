import express from "express";
import axios from "axios";
import {
  APIChannel,
  APIMessage,
  RESTGetAPIGuildThreadsResult,
} from "discord-api-types/v10";
import rateLimit from "express-rate-limit";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
});
const DISCORD_BASE_URL = "https://discord.com/api/v10";
app.get("/get-cards", async (req, res) => {
  try {
    const activeThreads = await axios<{ threads: APIChannel[] }>({
      method: "GET",
      baseURL: `https://discord.com/api/v10/guilds/1108002892905992254/threads/active`,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_SECRET_TOKEN}`,
      },
    });

    const channelIds = activeThreads.data.threads.map((thread) => thread.id);

    const requests = channelIds.map((channelId) => {
      return axios({
        method: "GET",
        baseURL: `https://discord.com/api/v10/channels/${channelId}/messages`,
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_SECRET_TOKEN}`,
        },
      });
    });
    const channelsResponses = await Promise.all(requests);
    const channels = channelsResponses.map(
      (channelResponse) => channelResponse.data
    );

    res.json({
      cards: channels,
    });
  } catch (err) {
    res.json({
      ...err,
    });
  }
});
app.get("/", (req, res) => {
  res.json({ message: "Hello API" });
});
app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
