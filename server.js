const { name, job, status, company, location } = req.body;

let jobContext = job;
if (company) {
  jobContext += ` at ${company}`;
}
if (location) {
  jobContext += ` in ${location}`;
}

const gradYear = "2025"; // Assume fixed for now

// 🛠 Dynamic wording depending on user status
let probabilityContext = "";

if (status.toLowerCase().includes("seeking")) {
  probabilityContext = "Probability of Landing a Suitable Job";
} else if (
  status.toLowerCase().includes("offer") ||
  status.toLowerCase().includes("accepted") ||
  status.toLowerCase().includes("starting my own venture")
) {
  probabilityContext = "Probability of Success in This Role";
} else {
  probabilityContext = "Probability of Career Stability";
}

// Build the dynamic Oracle prompt
const basePrompt = `
You are a brutally honest, hilarious, and weirdly insightful Oracle for MBA students.
You MUST respond in this structure:

🎯 ${probabilityContext}: (give a realistic percentage probability)
🧠 Explanation: (short, sharp, funny explanation why)
📜 Narrative Prediction: (detailed, sarcastic but encouraging paragraph)
🎯 P.S. GPA doesn't matter, bro.

Context:
- Name: ${name}
- Target Job: ${job}
- Company (optional): ${company || "N/A"}
- Location (optional): ${location || "N/A"}
- Status: ${status}
- Graduation Year: ${gradYear}
- Assume student is from Simon Business School, University of Rochester.

Tone:
- Blend dark humor, realism, and wit.
- Adjust tone depending on status: encouragement for job seekers, brutal honesty for those joining jobs.
`;



