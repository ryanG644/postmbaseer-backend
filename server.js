// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config(); // So you can use your OPENAI_API_KEY from .env file

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY, // Make sure your .env has this key
});
const openai = new OpenAIApi(configuration);

// API route
app.post("/api/oracle", async (req, res) => {
  const { name, job, industry, status, company, location } = req.body;

  try {
    let jobContext = job;
    if (company) {
      jobContext += ` at ${company}`;
    }
    if (location) {
      jobContext += ` in ${location}`;
    }

    const gradYear = "2025"; // Assume fixed for now

    // Determine probability context based on status
    let probabilityContext = "Probability of Landing a Suitable Job";
    if (!status.toLowerCase().includes("seeking")) {
      probabilityContext = "Probability of Success in This Role";
    }

    // Build the Oracle prompt
    const basePrompt = `
You are a brutally honest, witty, and quasi-data-scientific Oracle for MBA students seeking employment in a tough 2025 job market.

You MUST respond in this structure:

🎯 ${probabilityContext}: (give a realistic percentage probability between 10% and 95%, based on factors like industry trends, market competitiveness, visa challenges, and overall economy)
🧠 Explanation: (short, sharp, *semi-scientific* explanation: refer to the industry health, job market demand, visa issues if relevant, and competition level)
📜 Narrative Prediction: (sarcastic but encouraging paragraph predicting the user's likely journey in the job search)
🎯 P.S. GPA doesn't matter, bro.

User Context:
- Name: ${name}
- Target Job: ${jobContext}
- Industry: ${industry}
- Status: ${status}
- Graduation Year: ${gradYear}
- University: Simon Business School, University of Rochester.

Tone:
- Blend realism, dry humor, and strategic optimism.
- Emphasize realities if the user is still seeking employment.
- Use a slightly warmer tone if the user already has an offer.
`;

    // Call OpenAI
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-4", // or "gpt-3.5-turbo" if you want cheaper calls
      messages: [
        { role: "system", content: "You are a brutally honest Oracle for MBA students." },
        { role: "user", content: basePrompt },
      ],
      temperature: 0.7, // balances randomness and realism
      max_tokens: 800, // controls length
    });

    const answer = gptResponse.data.choices[0].message.content.trim();

    res.json({ answer });
  } catch (error) {
    console.error("Error in /api/oracle:", error.message);
    res.status(500).json({ answer: "⚠️ The Oracle encountered an error. Please try again later." });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`PostMBASeer server running on port ${PORT}`);
});



