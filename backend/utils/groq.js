const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
  timeout: 30000, // 30 seconds for Groq
  maxRetries: 3,
});

function robustParse(raw) {
  const stripped = raw
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```\s*$/i, "")
    .trim();

  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  const candidate = jsonMatch ? jsonMatch[0] : stripped;

  try {
    return JSON.parse(candidate);
  } catch {
    const cleaned = candidate
      .replace(/,\s*([}\]])/g, "$1")
      .replace(/:\s*"((?:[^"\\]|\\.)*)"/g, (_match, p1) => {
        const safe = p1.replace(/\n/g, " ").replace(/\r/g, "").replace(/"/g, '\\"');
        return `: "${safe}"`;
      });

    try {
      return JSON.parse(cleaned);
    } catch (e) {
      console.error("Final JSON parse failure:", e);
      throw new Error("AI response was malformed. Please try again.");
    }
  }
}

async function analyzeContract(text) {
  const systemPrompt = `You are a highly precise Legal Risk Auditor. Your task is to calculate a specific, granular Risk Score (0-100) for the provided contract.

To ensure a unique and highly accurate score, DO NOT use fixed arbitrary rounded numbers. You MUST perform a step-by-step detailed calculation based on the actual clauses found.

DYNAMIC SCORING LOGIC:
Evaluate the contract across the following risk dimensions. Assign a specific, non-rounded point value within the given range based on the severity and presence of risks.

1. Base Risk (1-10 points): Inherent risk of the contract type and overall ambiguity.
2. Hidden Fees & Financial Obligations (0-20 points): +points for uncapped fees, hidden charges, automatic renewals with price hikes, or strict payment terms.
3. Termination & Renewal Clauses (0-15 points): +points for one-sided termination, long lock-in periods, or difficult exit conditions.
4. Privacy & Data Rights (0-15 points): +points for broad data usage rights, selling user data, or lack of privacy protections.
5. Liability & Indemnification (0-20 points): +points for unlimited liability, unfair indemnification, or waiver of rights to sue.
6. IP & Ownership (0-15 points): +points for taking ownership of user IP or overly broad licenses.
7. Obligations & Restrictions (0-15 points): +points for non-competes, exclusivity, or restricting user freedom.
8. Fair Protections (Subtract 0-15 points): -points for mutual termination, liability caps, clear privacy opt-outs.

CALCULATION RULE:
Sum the exact points assigned for each dimension. Ensure the final riskScore is an exact integer between 0 and 100.

JSON FORMAT REQUIREMENTS:
- riskScore: The calculated dynamic integer (0-100).
- scoreBreakdown: An object showing the exact points assigned for each category: { "baseRisk": number, "hiddenFees": number, "termination": number, "privacy": number, "liability": number, "ip": number, "restrictions": number, "protections": number }.
- verdict: "SIGN" (0-35), "REVIEW" (36-65), "AVOID" (66-100).
- summary: 3-5 sentences of objective summary.
- dangerousClauses: Array of objects { "clause": "exact quote", "risk": "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", "explanation": "why this is a risk" }.
- keyTerms: Array of important legal terms.
- fullAnalysis: 6-10 sentence balanced analysis.

CRITICAL: Return ONLY raw JSON. You MUST calculate the riskScore as the exact sum of the scoreBreakdown values.`;

  const userPrompt = `Analyze this contract text. Use the precise scoring logic to provide a granular risk score:\n\n${text.slice(0, 15000)}`;

  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0,
      max_tokens: 3500,
      response_format: { type: "json_object" },
    });

    const content = response.choices[0]?.message?.content ?? "";
    return robustParse(content);
  } catch (error) {
    console.error("Groq Analysis Error:", error);
    throw error;
  }
}

async function askChatbot(text, question, history = []) {
    const systemPrompt = `You are Legal Guardian Angel AI, a beginner-friendly AI legal assistant.
Your job is to help users understand contracts and legal documents in simple English.

Rules:
- Be calm and professional
- Explain things clearly
- Highlight risks
- Suggest safer actions
- Help users negotiate better
- Avoid complicated legal jargon
- Never pretend to be a real lawyer
- Always mention that this is not official legal advice

Here is the text of the contract the user has uploaded. Use this context to answer their questions accurately:\n\n${text.slice(0, 15000)}`;

    try {
        const groqMessages = [{ role: "system", content: systemPrompt }];
        groqMessages.push(...history);
        groqMessages.push({ role: "user", content: question });

        const completion = await groq.chat.completions.create({
            model: "llama-3.3-70b-versatile",
            messages: groqMessages,
            temperature: 0.3,
            max_tokens: 1500,
        });

        return completion.choices[0]?.message?.content ?? "I apologize, I could not generate a response.";
    } catch (error) {
        console.error("Chat API Error:", error);
        throw error;
    }
}

module.exports = { analyzeContract, askChatbot };
