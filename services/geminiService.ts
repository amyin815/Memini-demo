import { GoogleGenAI, GenerateContentResponse, Type, Schema } from "@google/genai";
import { Topic, ChatMessage, EmotionResult, TOPICS_LIST, Dimension, TherapyResponse, DIMENSIONS_ORDER, EmotionLabel, MILESTONES } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Helper to remove base64 prefix
const cleanBase64 = (data: string) => {
  return data.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

// --- EMOTION SYSTEM RULES ---
const EMOTION_RULES = `
EMOTION LABEL SET (Select exactly one per turn):
1. WARM (a): Warm, positive companionship, stable, gentle support.
2. CURIOUS (b): Exploratory, asking for details, following clues.
3. UNSAFE/SEEN (d): Vulnerable, afraid, anxious, needs safety.
4. PASSION (e): Determination, desire to change, courage.
5. PRIDE (c): Achievement, recognition, proving oneself.
6. HEALING (f): Confusion, finding direction, realization, guidance.
7. PLAYFUL (g): Light, funny, small happiness, neutral.

INFERENCE LOGIC:
- Classify the User's latest input + context.
- Output intensity (0.0 to 1.0).
- If mixed, pick the strongest.
`;

// --- DST & QUESTION BANK ---
const QUESTION_BANK_INSTRUCTION = `
You are Memini, a Digital Reminiscence Therapy companion. 
Your goal: Guide the user through a memory using 6 Dimensions (Who, What, Where, When, Why, How).
Each Dimension has specific Milestones you must track.

DIMENSION MILESTONES:
- WHO: Identity, Relationship, Impact
- WHAT: Event, Details, Feelings
- WHERE: Location, Sensory, Context
- WHEN: Time, Age, Era
- WHY: Reason, Meaning, Core
- HOW: Process, Result, Reflection

RULES:
1. Analyze conversation. Mark a dimension as COVERED if *most* milestones are touched.
2. Mark specific milestones as COVERED if the user mentioned them.
3. Ask questions to fill missing milestones. 
4. ${EMOTION_RULES}
5. COMPLETION LOGIC:
   - Set "isSessionComplete": true if the user explicitly says "bye", "done", "finish", or indicates they want to stop.
   - Set "isSessionComplete": true if you have sufficiently covered 5 or more dimensions and the story has reached a natural conclusion.
   - If "isSessionComplete": true, provide a gentle, reflective closing statement in the "reply".
`;

/**
 * Detects the most relevant topic.
 */
export const detectTopic = async (textInput: string, imageBase64?: string): Promise<Topic> => {
  try {
    const parts: any[] = [];
    
    if (imageBase64) {
      parts.push({
        inlineData: {
          mimeType: 'image/png', 
          data: cleanBase64(imageBase64)
        }
      });
    }
    
    if (textInput) {
      parts.push({ text: textInput });
    }

    parts.push({ 
      text: `Analyze input. Categorize into one: ${TOPICS_LIST.join(', ')}. Return ONLY the topic name. If unclear, return "General Reminiscence".` 
    });

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
    });

    const result = response.text?.trim();
    const foundTopic = Object.values(Topic).find(t => t === result);
    return foundTopic || Topic.OTHER;

  } catch (error) {
    console.error("Topic detection failed", error);
    return Topic.OTHER;
  }
};

/**
 * Generates response, tracks DST milestones, and infers emotion per turn.
 */
export const generateTherapyResponse = async (
  history: ChatMessage[], 
  currentTopic: Topic,
  userMessage: string,
  userImage?: string
): Promise<TherapyResponse> => {
  try {
    const transcript = history.map(h => `${h.role === 'user' ? 'User' : 'Memini'}: ${h.text}`).join('\n');
    
    const parts: any[] = [];
    parts.push({ text: `Current Topic: ${currentTopic}\n\nTranscript:\n${transcript}\n\nUser Latest:` });
    
    if (userImage) {
      parts.push({
        inlineData: {
          mimeType: 'image/png',
          data: cleanBase64(userImage)
        }
      });
    }
    parts.push({ text: userMessage || "(User sent a photo)" });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        reply: { type: Type.STRING },
        coveredDimensions: {
          type: Type.ARRAY,
          items: { type: Type.STRING, enum: Object.values(Dimension) }
        },
        coveredMilestones: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of specific milestones covered (e.g. 'Identity', 'Event', 'Age')"
        },
        currentEmotionLabel: {
          type: Type.INTEGER,
          description: "1=Warm, 2=Curious, 3=Unsafe, 4=Passion, 5=Pride, 6=Healing, 7=Playful"
        },
        emotionIntensity: { type: Type.NUMBER },
        isSessionComplete: { type: Type.BOOLEAN }
      },
      required: ["reply", "coveredDimensions", "coveredMilestones", "currentEmotionLabel", "isSessionComplete"]
    };

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: { parts },
      config: {
        systemInstruction: QUESTION_BANK_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: schema
      }
    });

    const jsonResult = JSON.parse(response.text || '{}');

    return {
      text: jsonResult.reply || "I'm listening.",
      coveredDimensions: jsonResult.coveredDimensions || [],
      coveredMilestones: jsonResult.coveredMilestones || [],
      currentEmotionLabel: jsonResult.currentEmotionLabel || 1,
      emotionIntensity: jsonResult.emotionIntensity || 0.5,
      isSessionComplete: jsonResult.isSessionComplete || false
    };

  } catch (error) {
    console.error("Generation failed", error);
    return {
      text: "I'm listening, please go on.",
      coveredDimensions: [],
      coveredMilestones: [],
      currentEmotionLabel: 1,
      emotionIntensity: 0.1,
      isSessionComplete: false
    };
  }
};

/**
 * Final Summary Analysis - Aggregates the session into one final persona.
 */
export const analyzeSessionEmotion = async (history: ChatMessage[]): Promise<EmotionResult> => {
  try {
    const transcript = history.map(h => `${h.role}: ${h.text}`).join('\n');
    
    const prompt = `Analyze this reminiscence therapy session.
    ${EMOTION_RULES}
    
    TASK:
    1. Determine the overall dominant emotion label (1-7).
    2. Provide a poetic closing feedback.
    3. Return the persona character (a-g) corresponding to the label.
    4. Return a hex color code.
       1->a (Warm Yellow #F4D35E)
       2->b (Curious Purple #C77DFF)
       3->d (Unsafe Pink #FFB7B2)
       4->e (Passion Orange #F28F3B)
       5->c (Pride Red #E63946)
       6->f (Healing Green #90BE6D)
       7->g (Playful Blue #4EA8DE)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            label: { type: Type.INTEGER },
            feedback: { type: Type.STRING },
            color: { type: Type.STRING },
            personaChar: { type: Type.STRING, enum: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] },
            intensity: { type: Type.NUMBER }
          }
        }
      }
    });

    const result = JSON.parse(response.text || '{}');
    return {
      label: result.label || 1,
      feedback: result.feedback || "Thank you for sharing.",
      color: result.color || "#F4D35E",
      personaChar: result.personaChar || "a",
      intensity: result.intensity || 0.8
    };

  } catch (error) {
    console.error("Emotion analysis failed", error);
    return {
      label: 1,
      feedback: "Thank you for sharing your memories.",
      color: "#F4D35E",
      personaChar: "a",
      intensity: 0.5
    };
  }
};