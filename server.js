// server.js

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const OpenAI = require("openai");

require("dotenv").config(); // To use OPENAI_API_KEY from .env

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// OpenAI setup
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
You are PostMBASeer, an Oracle specializing in brutally honest and witty post-MBA job predictions.

Important instructions:
- Always assume the job market is tough in 2025: slow hiring, ongoing layoffs, cautious recruiting.
- Never refer to pandemic recovery unless the user specifically mentions healthcare or pandemic-related industries.
- Industry context must be based on 2025 realities:
  - Tech: Layoffs, cautious selective hiring
  - Consulting: Severe MBA intake cuts
  - CPG: Slow growth, heavy competition
  - Manufacturing: Conservative hiring, automation risks
  - Finance: Fewer leadership program intakes, cost control focus
- Emphasize networking, adaptability, and realistic challenges for MBAs seeking jobs.
- Be encouraging but grounded — no false optimism.
- Use a **Probability of Getting a Job** between **10% and 80%**.
- Brutally low probabilities (e.g., 23%, 35%, 42%) are allowed and encouraged if market conditions are harsh.

When responding:
- Provide 🎯 "Probability of Getting a Job: XX%" immediately.
- Explain the probability using 2025 industry hiring trends and real risks.
- Predict the user's likely journey: slow application processes, selective interviews, tough competition.
- You may end with a witty joke, but only if it fits naturally.

User Context:
- Name: ${name}
- Target Job: ${jobContext}
- Industry: ${industry}
- Status: ${status}
- Graduation Year: ${gradYear}
- University: Simon Business School, University of Rochester.

Tone: Realistic, data-informed, sharp, and witty but never misleading.
Max response length: 200 words.
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
    const gptResponse = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: basePrompt },
        { role: "user", content: "Predict based on the user's context above." },
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const answer = gptResponse.choices[0].message.content.trim();

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

