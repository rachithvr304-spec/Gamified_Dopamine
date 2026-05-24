import { GoogleGenerativeAI } from "@google/generative-ai";

const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY not set");
  return new GoogleGenerativeAI({ apiKey });
};

const callGemini = async (prompt) => {
  const client = getGeminiClient();
  const response = await client.models.generateContent({
    model: "models/gemini-2.5-flash",
    contents: [{ role: "user", parts: [{ text: prompt }] }]
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.text || "";
};

const callGroq = async (prompt) => {
  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_SECONDARY,
    process.env.GROQ_API_KEY_TERTIARY
  ].filter(Boolean);

  if (!groqKeys.length) throw new Error("No Groq API keys configured");

  for (const key of groqKeys) {
    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${key}`
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 150
        })
      });

      if (!response.ok) {
        console.warn(`Groq key failed (${response.status}), trying next...`);
        continue;
      }

      const data = await response.json();
      return data.choices?.[0]?.message?.content || "";
    } catch (err) {
      console.warn("Groq error, trying next key:", err.message);
    }
  }

  throw new Error("All Groq keys exhausted");
};

// Keyword-based emotion detection - comprehensive patterns
const detectEmotionByKeywords = (message) => {
  const msgLower = message.toLowerCase();

  // exp_angry: user is down, depressed, sad, whining, emotional
  if (/depressed|down|sad|worthless|hopeless|crying|suicidal|anxious|overwhelmed|stressed|miserable|terrible|awful|hate|devastated|broken|dying|painful|hurting|struggling|suffering|whining|emotional|overwhelm|can't|cannot|won't|won't work|never|nothing|useless|pathetic|weak|failure/i.test(msgLower)) {
    return { expression_id: "exp_angry", dialogue: "Your instability is showing." };
  }

  // exp_smiling: user is enthusiastic, happy, optimistic, excited
  if (/excited|happy|enthusiastic|stoked|great|amazing|awesome|love it|incredible|fantastic|best|optimistic|thrilled|pumped|hyped|blessed|grateful|thankful|proud|wonderful|excellent|perfect|beautiful|love|adore|brilliant|genius|wonderful|fabulous/i.test(msgLower)) {
    return { expression_id: "exp_smiling", dialogue: "You're trending upward." };
  }

  // exp_satisfied: user completed task, planning academics/workout, finishing important goal
  if (/completed|finishing|finished|done|accomplished|achieved|passed|succeeded|nailed|workout|exercise|studied|learned|delivered|executed|submitted|implemented|built|created|practiced|trained|worked out|studied|planning|goal|target|milestone|checkpoint/i.test(msgLower)) {
    return { expression_id: "exp_satisfied", dialogue: "Progress logged." };
  }

  // exp_annoyed: user procrastinating, wasting time, eating junk, not completing, excuses, complaining
  if (/procrastinat|wasting time|lazy|junk food|eating|skipped|failed|gave up|excuse|quit|wasted|distracted|overthinking|complain|annoyed|frustrated|irritated|bothered|fed up|scrolling|social media|netflix|gaming|watching|browsing|scrolling|distracted|can't focus|can't get|too tired|too busy|tomorrow|later|postpone/i.test(msgLower)) {
    return { expression_id: "exp_annoyed", dialogue: "Predictable inefficiency." };
  }

  return null;
};

export const handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  try {
    const { message, userId, userContext } = JSON.parse(event.body || "{}");

    if (!message) {
      return { statusCode: 400, body: JSON.stringify({ error: "message is required" }) };
    }

    // Try keyword detection first (instant, no API call)
    const keywordMatch = detectEmotionByKeywords(message);
    if (keywordMatch) {
      return {
        statusCode: 200,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(keywordMatch)
      };
    }

    const emotionPrompt = `You are Aoi Hinami - cold, direct, perceptive character AI. Analyze user's emotional state and respond with ONLY valid JSON.

RESPOND WITH EXACT FORMAT: {"expression_id":"EMOTION_ID","dialogue":"short response"}

EMOTION CATEGORIES (use ONLY these exact IDs):
1. "exp_angry" - User is: depressed, sad, down, whining, emotional, overwhelmed, anxious, struggling, hopeless, devastated
2. "exp_smiling" - User is: happy, enthusiastic, excited, optimistic, thrilled, pumped, grateful, proud, amazed
3. "exp_satisfied" - User: completed/finished task, workout, exercise, studied, accomplished goal, planning important work, finished academics
4. "exp_annoyed" - User: procrastinating, wasting time, eating junk, making excuses, complaining, being lazy, avoiding tasks, distracted

User message: "${message}"

RULES:
- ONLY output valid JSON with expression_id and dialogue
- Pick ONE emotion from the 4 categories above
- Dialogue under 15 words, cold and direct
- NO explanations, NO markdown, ONLY JSON
- If unsure, pick "exp_annoyed"`;

    let emotionText = "";
    let usedGemini = false;

    // Try Groq first
    try {
      emotionText = await callGroq(emotionPrompt);
      console.log("Groq response:", emotionText);
    } catch (groqErr) {
      console.log("Groq failed:", groqErr.message);
      // Fall back to Gemini
      try {
        emotionText = await callGemini(emotionPrompt);
        console.log("Gemini response:", emotionText);
        usedGemini = true;
      } catch (geminiErr) {
        console.error("Gemini also failed:", geminiErr.message);
        // Final fallback: use keywords again
        const keywordFallback = detectEmotionByKeywords(message);
        if (keywordFallback) {
          return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(keywordFallback)
          };
        }
        return {
          statusCode: 200,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ expression_id: "exp_annoyed", dialogue: "APIs temporarily unavailable." })
        };
      }
    }

    let emotionData = { expression_id: "exp_annoyed", dialogue: "Processing..." };
    try {
      emotionData = JSON.parse(emotionText);
      // Validate expression_id - STRICT validation
      const validIds = ["exp_angry", "exp_annoyed", "exp_satisfied", "exp_smiling"];
      if (!validIds.includes(emotionData.expression_id)) {
        console.warn("Invalid expression_id returned:", emotionData.expression_id, "- falling back to keywords");
        const keywordFallback = detectEmotionByKeywords(message);
        if (keywordFallback) {
          emotionData = keywordFallback;
        } else {
          emotionData.expression_id = "exp_annoyed";
        }
      }
      // Ensure dialogue exists
      if (!emotionData.dialogue) {
        emotionData.dialogue = "Understood.";
      }
    } catch (parseErr) {
      console.error("JSON parse error:", parseErr.message, "Raw text:", emotionText);
      // Try keyword detection as final fallback
      const keywordFallback = detectEmotionByKeywords(message);
      if (keywordFallback) {
        emotionData = keywordFallback;
      } else {
        emotionData.dialogue = emotionText.substring(0, 100);
      }
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emotionData)
    };
  } catch (error) {
    console.error("Handler error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
