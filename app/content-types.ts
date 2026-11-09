export type Lang = "zh" | "ja" | "bi";
export type Pair = { zh: string; ja: string };
export const pair = (zh: string, ja: string): Pair => ({ zh, ja });
export type Source = { id: string; title: Pair; url: string; kind: Pair; claim: Pair; language: string };
export type Question = { id: string; prompt: Pair; options: Pair[]; answer: number; explanation: Pair; sourceIds: string[] };
export type Term = { id: string; word: Pair; reading: string; definition: Pair; sourceIds: string[] };
export type Lesson = {
  id: string; group: "tang" | "ming"; title: Pair; intro: Pair; objectives: Pair[];
  sections: { heading: Pair; body: Pair; sourceIds: string[] }[];
  questions: Question[]; terms: Term[]; sourceIds: string[]; imageIds: string[];
  observation: Pair; reflection: Pair; minutes: number; lab?: "network" | "cities" | "layers" | "painting" | "trade";
};
export type Asset = {
  id: string; src: string; title: Pair; alt: Pair; caption: Pair;
  sourcePage: string; originalFileURL: string; author: string; license: string; licenseURL: string;
  attribution: string; dateTaken: string; width: number; height: number;
};
export type StudyState = { completed: string[]; saved: string[]; answers: Record<string,number> };
