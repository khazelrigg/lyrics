import { useEffect, useState } from "react";
import { loadTokenizer } from "@/utils/kuromojiLoader";
//import type { Tokenizer } from "@patdx/kuromoji";

export function useTokenizer() {
  const [tokenizer, setTokenizer] = useState<any>(null);

  useEffect(() => {
    async function init() {
      const t = await loadTokenizer();
      setTokenizer(t);
    }
    init();
  }, []);

  return tokenizer;
}
