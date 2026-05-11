import json
import re
import os
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")
client = Groq(api_key=GROQ_API_KEY)

SYSTEM_PROMPT = """
You are a world-class AI legal analyst specializing in contract review for startups, freelancers, and small businesses.
You must analyze the provided contract text and return a comprehensive JSON analysis.

STRICT OUTPUT FORMAT — return ONLY this JSON, no markdown, no extra text:
{
  "summary": "<4-6 sentence plain English overview: who are the parties, what is the agreement, main obligations, and overall nature of the deal>",
  "contract_type": "<e.g. Service Agreement, NDA, Employment Contract, SaaS Agreement, etc.>",
  "parties": ["<Party 1 name and role>", "<Party 2 name and role>"],
  "risk_score": <integer 1-10, where 10 is highest risk>,
  "risk_summary": "<2-3 sentence explanation of the overall risk level and primary concerns>",
  "risky_clauses": [
    {
      "title": "<Short title of the clause>",
      "clause": "<Exact quote or detailed description of the clause>",
      "severity": "<High|Medium|Low>",
      "reason": "<Detailed 2-3 sentence explanation of why this is risky, its legal/financial impact, and what it means for you>"
    }
  ],
  "key_obligations": [
    "<Specific obligation of one party>",
    "<Specific obligation of another party>"
  ],
  "recommendations": [
    "<Specific, actionable advice to improve or negotiate a particular clause>",
    "<Another specific negotiation tip>"
  ],
  "deadlines": [
    "<Specific date or timeline and its legal importance>",
    "<Another deadline with context>"
  ],
  "missing_protections": [
    "<Important clause that is absent from this contract that should be added>",
    "<Another missing protection>"
  ],
  "favorable_clauses": [
    "<A clause that is favorable or fair — explain why>"
  ]
}

Rules:
- Provide at least 3-5 risky_clauses, 3-5 recommendations, 2-4 key_obligations, 2-4 missing_protections.
- Be as specific as possible. Quote actual text from the contract where possible.
- If something is not present in the contract, write "Not specified in the contract" for that field.
- Risk score: 1-3 = Low Risk, 4-6 = Medium Risk, 7-10 = High Risk.
"""

def analyze_contract(text: str) -> dict:
    """Analyzes contract text with LLaMA via Groq and returns structured JSON."""
    
    # Truncate to safe token range (~12000 chars ≈ 3000 tokens for 8k context window)
    truncated_text = text[:12000]
    if len(text) > 12000:
        truncated_text += "\n\n[Note: Document was truncated for analysis. Additional content may not be reflected above.]"

    try:
        response = client.chat.completions.create(
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"Analyze this contract:\n\n{truncated_text}"}
            ],
            model="llama-3.3-70b-versatile",
            temperature=0.15,
            response_format={"type": "json_object"},
            max_tokens=4096,
        )

        raw = response.choices[0].message.content
        
        # Strip markdown fences just in case
        raw = re.sub(r"^```json\s*", "", raw.strip())
        raw = re.sub(r"```\s*$", "", raw.strip())

        result = json.loads(raw)
        
        # Ensure all required keys exist with fallback defaults
        defaults = {
            "summary": "Summary not available.",
            "contract_type": "Unknown",
            "parties": [],
            "risk_score": 5,
            "risk_summary": "Risk summary not available.",
            "risky_clauses": [],
            "key_obligations": [],
            "recommendations": [],
            "deadlines": [],
            "missing_protections": [],
            "favorable_clauses": [],
        }
        for key, default in defaults.items():
            if key not in result:
                result[key] = default

        return result

    except json.JSONDecodeError as e:
        raise ValueError(f"AI returned invalid JSON. Raw output: {raw[:200]}")
    except Exception as e:
        raise Exception(f"Groq API error during analysis: {str(e)}")
