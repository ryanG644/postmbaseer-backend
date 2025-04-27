// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Configuration, OpenAIApi } = require("openai");

require("dotenv").config(); // To use OPENAI_API_KEY from .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
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

    const gradYear = "2025"; // Fixed for now

    // Determine the correct mode based on employment status
    const isSeeking = status.toLowerCase().includes("seeking");

    // Build the Oracle prompt dynamically
    const basePrompt = isSeeking
      ? `
You are PostMBASeer, a brutally honest, witty, and quasi-data-scientific Oracle specializing in post-MBA job predictions.

When given the user's details, you must always:
- Provide a "🎯 Probability of Getting a Job" as a percentage (e.g., 15%, 45%, 72%).
- Never use the phrase "success probability."
- Immediately after the percentage, explain why using real-world trends:
  - Industry health (e.g., tech layoffs, consulting slowdown)
  - Company-specific factors (e.g., Meta layoffs)
  - MBA-specific advantages (e.g., leadership pipeline needs)

After explanation, provide a short, witty narrative about the candidate's likely job search journey.  
Optionally end with a relevant joke if natural.

User Context:
- Name: ${name}
- Target Job: ${jobContext}
- Industry: ${industry}
- Status: ${status}
- Graduation Year: ${gradYear}
- University: Simon Business School, University of Rochester.

Tone: Data-driven, realistic, and lightly humorous. Max 200 words.
`
      : `
You are PostMBASeer, a brutally honest, witty, and quasi-data-scientific Oracle specializing in post-MBA career predictions.

When given the user's details, you must:
- Provide a "🎯 Probability of Success in This Role" as a percentage (e.g., 60%, 80%, 90%).
- Explain the probability citing factors like role difficulty, industry conditions, company culture, and MBA advantages.
- Provide a light, witty narrative about the candidate's likely success path.

User Context:
- Name: ${name}
- Target Job: ${jobContext}
- Industry: ${industry}
- Status: ${status}
- Graduation Year: ${gradYear}
- University: Simon Business School, University of Rochester.

Tone: Encouraging realism, witty but supportive. Max 200 words.
`;

    // Call OpenAI
    const gptResponse = await openai.createChatCompletion({
      model: "gpt-4",
      messages: [
        { role: "system", content: basePrompt },  // << system role gets your full dynamic basePrompt
        { role: "user", content: `Predict based on the user's context above.` },
      ],
      temperature: 0.7,
      max_tokens: 800,
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


