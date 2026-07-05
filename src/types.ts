export type Outfit = 'none' | 'beach' | 'classical' | 'noble' | 'sporty';

export type ParrotState = 'idle' | 'happy' | 'refuse' | 'singing' | 'eating' | 'petted';

export type FoodType = 'apple' | 'worm' | 'pepper' | 'chocolate';

export interface Message {
  id: string;
  sender: 'user' | 'jiujiu';
  text: string;
  timestamp: number;
  type?: 'chat' | 'poetry' | 'word' | 'music' | 'system';
  metadata?: {
    poetryTitle?: string;
    poetryAuthor?: string;
    poetryContent?: string[];
    poetryTranslation?: string;
    word?: string;
    wordIpa?: string;
    wordMeaning?: string;
    wordExampleEn?: string;
    wordExampleCn?: string;
    musicTitle?: string;
    musicMood?: string;
    groundingUrls?: { title: string; uri: string }[];
  };
}

export interface FoodItem {
  id: FoodType;
  name: string;
  emoji: string;
  description: string;
  isSafe: boolean;
  effect: string;
}

export interface OutfitItem {
  id: Outfit;
  name: string;
  emoji: string;
  description: string;
  colorClass: string;
}
