export enum AppView {
  WELCOME = 'WELCOME',
  TOPIC_SELECTION = 'TOPIC_SELECTION',
  CHAT = 'CHAT',
  SUMMARY = 'SUMMARY'
}

export enum Topic {
  CHILDHOOD = 'Childhood & Growing Up',
  ADULTHOOD = 'Young Adulthood & Family Life',
  WORK = 'Work & Achievements',
  TRAVEL = 'Travel & Places',
  HOBBIES = 'Hobbies & Everyday Life',
  LIGHT = 'Light & Neutral Topics',
  OTHER = 'General Reminiscence'
}

export enum Dimension {
  WHO = 'who',
  WHAT = 'what',
  WHERE = 'where',
  WHEN = 'when',
  WHY = 'why',
  HOW = 'how'
}

// Sub-questions / Milestones for the progress bar rail
export interface DimensionMilestones {
  [Dimension.WHO]: ['Identity', 'Relationship', 'Impact'];
  [Dimension.WHAT]: ['Event', 'Details', 'Feelings'];
  [Dimension.WHERE]: ['Location', 'Sensory', 'Context'];
  [Dimension.WHEN]: ['Time', 'Age', 'Era'];
  [Dimension.WHY]: ['Reason', 'Meaning', 'Core'];
  [Dimension.HOW]: ['Process', 'Result', 'Reflection'];
}

export const MILESTONES: Record<Dimension, string[]> = {
  [Dimension.WHO]: ['Identity', 'Relationship', 'Impact'],
  [Dimension.WHAT]: ['Event', 'Details', 'Feelings'],
  [Dimension.WHERE]: ['Location', 'Sensory', 'Context'],
  [Dimension.WHEN]: ['Time', 'Age', 'Era'],
  [Dimension.WHY]: ['Reason', 'Meaning', 'Core'],
  [Dimension.HOW]: ['Process', 'Result', 'Reflection']
};

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  image?: string; // Base64
}

// 1-7 Label System
export enum EmotionLabel {
  WARM = 1,      // Warm, Positive Companionship (a)
  CURIOUS = 2,   // Exploratory Companionship (b)
  UNSAFE = 3,    // Feeling seen/Vulnerable (d)
  PASSION = 4,   // Passion & Encouragement (e)
  PRIDE = 5,     // Recognition & Pride (c)
  HEALING = 6,   // Guidance & Healing (f)
  PLAYFUL = 7    // Light & Playful (g)
}

export interface TherapyResponse {
  text: string;
  coveredDimensions: Dimension[];
  coveredMilestones: string[]; // Specific sub-questions answered
  currentEmotionLabel: EmotionLabel; // 1-7
  emotionIntensity: number; // 0-1
  isSessionComplete: boolean;
}

export interface EmotionResult {
  label: EmotionLabel;
  intensity: number;
  feedback: string;
  personaChar: 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g';
  color: string;
}

export const TOPICS_LIST = [
  Topic.CHILDHOOD,
  Topic.ADULTHOOD,
  Topic.WORK,
  Topic.TRAVEL,
  Topic.HOBBIES,
  Topic.LIGHT
];

export const DIMENSIONS_ORDER = [
  Dimension.WHO,
  Dimension.WHAT,
  Dimension.WHERE,
  Dimension.WHEN,
  Dimension.WHY,
  Dimension.HOW
];