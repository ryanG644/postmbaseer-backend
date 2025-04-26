app.post("/api/oracle", async (req, res) => {
  const { name, job, status, company, location } = req.body;

  let jobContext = job;
  if (company) {
    jobContext += ` at ${company}`;
  }
  if (location) {
    jobContext += ` in ${location}`;
  }

  const gradYear = "2025"; // Fixed for now
  const basePrompt = `
You are a brutally honest, hilarious, and weirdly insightful Oracle for MBA students.
You MUST respond in this structure:

🎯 Probability: (give a percentage probability)
🧠 Explanation: (1-2 sentence reason behind the probability)
📜 Narrative Prediction: (funny, sarcastic but useful paragraph)
🎯 Tagline: ("P.S. GPA doesn't matter bro." or something similar)

Context:
- Name: ${name}
- Job/Target Job: ${job}
- Company/Location (optional): ${company || "N/A"} / ${location || "N/A"}
- Status: ${status}
- Graduation Year: ${gradYear}
- Assume student is graduating from Simon Business School, University of Rochester.

Tone:
- Blend humor + a weird amount of realistic career advice.
- Reference industry realities if possible (e.g., tech layoffs, consulting burnout, etc.)
- Be both brutal and encouraging.

Special Rule:
- If Status is "Seeking employment", probability is for Landing a Suitable Role.
- If Status is "Accepted an offer" or "Considering an offer", probability is for Success in the Role.
- If Starting Venture, probability is Success of the Startup.
- If Taking Time Off, probability is Career Stability after 1 year.
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a brutally honest MBA career Oracle."
        },
        {
          role: "user",
          content: basePrompt
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

