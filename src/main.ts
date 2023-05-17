import express from "express";
import axios from "axios";
import { APIMessage } from "discord-api-types/v10";

const host = process.env.HOST ?? "localhost";
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.get("/get-content", async (req, res) => {
  try {
    const { data } = await axios<APIMessage[]>({
      method: "GET",
      baseURL: `https://discord.com/api/v10/channels/1108109671883096064/messages`,
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_SECRET_TOKEN}`,
      },
    });
    const allAttachments = data.reduce((attachments, message) => {
      if (message.attachments.length > 0) {
        attachments.push(...message.attachments);
      }
      return attachments;
    }, []);
    res.json({
      images: allAttachments,
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
