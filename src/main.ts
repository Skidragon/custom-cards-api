import express from "express";
import axios from "axios";
import { APIMessage, GatewayThreadListSync } from "discord-api-types/v10";
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
    const GUILD_ID = "1108450817947730010";
    const activeThreads = await axios<GatewayThreadListSync>({
      method: "GET",
      baseURL: DISCORD_BASE_URL,
      url: `/guilds/${GUILD_ID}/threads/active`,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_SECRET_TOKEN}`,
      },
    });

    const channelIds = activeThreads.data.threads.map((thread) => thread.id);

    const requests = channelIds.map((channelId) => {
      return axios<APIMessage>({
        method: "GET",
        baseURL: DISCORD_BASE_URL,
        url: `/channels/${channelId}/messages`,
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_SECRET_TOKEN}`,
        },
      });
    });
    const channelsResponses = await Promise.all(requests);
    const channels = channelsResponses
      .map((channelResponse) => channelResponse.data)
      .reduce((channels, channel) => {
        return [...channels, channel];
      }, [] as APIMessage[]);

    res.json({
      cards: channels.flat(1),
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
