import * as kuromoji from "@patdx/kuromoji";

let tokenizerInstance: any = null;

const myLoader: kuromoji.LoaderConfig = {
  async loadArrayBuffer(url: string): Promise<ArrayBufferLike> {
    url = url.replace(".gz", "");
    const res = await fetch("/dict/" + url);
    if (!res.ok) {
      throw new Error(`Failed to fetch ${url}, status: ${res.status}`);
    }
    return res.arrayBuffer();
  },
};

export async function loadTokenizer() {
  if (tokenizerInstance) {
    return tokenizerInstance;
  }

  tokenizerInstance = await new kuromoji.TokenizerBuilder({
    loader: myLoader,
  }).build();
  console.log("[KuromojiLoader] Tokenizer built.");
  return tokenizerInstance;
}
