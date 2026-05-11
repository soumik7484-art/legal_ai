import os
from groq import Groq

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set")
client = Groq(api_key=GROQ_API_KEY)

def ask_chatbot(text_context: str, question: str, history: list = None) -> str:
    """Answer a question about the contract using LLaMA via Groq."""
    if history is None:
        history = []

    # Truncate context to stay within token limits
    truncated_context = text_context[:12000]

    system_prompt = f"""You are an expert AI legal assistant. A user has uploaded a legal contract and has questions about it.
Your job is to answer their questions clearly, accurately, and in plain English based ONLY on the contract text below.

Rules:
- If the answer is in the contract, cite the relevant clause or section.
- If the answer is NOT found in the contract, clearly say so.
- Explain legal jargon in simple terms.
- Be specific and thorough — don't give vague answers.
- Format longer responses with clear bullet points for readability.

CONTRACT TEXT:
---
{truncated_context}
---
"""

    messages = [{"role": "system", "content": system_prompt}]
    
    # Add last 6 messages of history to stay within context limits
    for msg in history[-6:]:
        messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    try:
        response = client.chat.completions.create(
            messages=messages,
            model="llama-3.3-70b-versatile",
            temperature=0.3,
            max_tokens=1024,
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Chatbot error: {str(e)}")
