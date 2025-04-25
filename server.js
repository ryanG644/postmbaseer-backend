const express = require("express");
const cors = require("cors");
require("dotenv").config();
const OpenAI = require("openai");

const app = express();
app.use(cors());
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/oracle", async (req, res) => {
  const { name, job, status } = req.body;

  const prompt = `You're a sarcastic, clever, yet weirdly accurate Oracle for MBA students. A student named ${name} wants to become a ${job}, and they're currently ${status}. Give a funny and insightful prediction about their future. Include a made-up job success probability and one joke.`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a hilarious and brutally honest MBA career oracle."
        },
        {
          role: "user",
          content: prompt
        }
      ]
    });

    const message = completion.choices[0].message.content;
    res.json({ answer: message });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: "Oracle failed to respond." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🔮 Oracle backend running on port ${PORT}`));
