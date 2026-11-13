import type { Pair } from "../content-types";

export type Period = "tang" | "song" | "ming" | "qing";

export type Token = { text: string; note?: string };

export type Poem = {
  id: string;
  period: Period;
  title: string;
  author: string;
  authorJa: string;
  form: Pair;
  lines: Token[][];
  breakAt?: number;
  preface?: string;
  commentary: Pair;
  edition?: Pair;
  source: { name: string; url: string };
  related?: { title: Pair; href: string };
};

export const forms = {
  five: { zh: "五言绝句", ja: "五言絶句" },
  seven: { zh: "七言绝句", ja: "七言絶句" },
  regulated: { zh: "五言律诗", ja: "五言律詩" },
  ci: { zh: "词", ja: "詞" },
};

export function verse(text: string, ...notes: string[]): Token[] {
  const words = text.split("|");
  if (words.length !== notes.length) throw new Error("Missing gloss for " + text);
  return words.flatMap((word, index) => {
    const match = word.match(/^(.+?)([，。？！、；：]+)$/u);
    return match
      ? [{ text: match[1], note: notes[index] }, { text: match[2] }]
      : [{ text: word, note: notes[index] }];
  });
}

export function wikisource(title: string, name = "维基文库 / ウィキソース") {
  return { name, url: "https://zh.wikisource.org/wiki/" + encodeURI(title) };
}
