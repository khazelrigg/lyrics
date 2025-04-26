import type { Tokenizer } from "@patdx/kuromoji";

export interface LyricsWord {
  surface: string;
  reading?: string;
  pos?: string;
}

// Helper: check if a string has kanji
function hasKanji(text: string): boolean {
  return /[\u4e00-\u9faf]/.test(text);
}

function katakanaToHiragana(str: string): string {
  return str.replace(/[\u30a1-\u30f6]/g, (char) => {
    return String.fromCharCode(char.charCodeAt(0) - 0x60);
  });
}


export async function parseLyricsLine(text: string, tokenizer: any): Promise<LyricsWord[]> {
  const tokens = tokenizer.tokenize(text);
  console.log(tokens)
  return tokens.map(token => {
    const surface = token.surface_form;
    const rawReading = token.reading || undefined;
    const reading = rawReading ? katakanaToHiragana(rawReading) : undefined;
    const pos = token.pos || undefined;

    return { surface, reading, pos };

  });
}