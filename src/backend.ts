const API = "http://localhost:8000";

export type Result = {
  sent: string;
  found_words: string[];
  found_grammars: string[];
  missing: [string, string[], string, string, string][];
  verbose_found_words: [string, [number, number], string][];
  verbose_found_grammars: [string, {start: number, end: number, abs_pos: [number, number]}[]];
  pos_tags: [string, string[], string, string];
};

export async function analyzeText(text: string, idRef?: string){
  const result = await fetch(`${API}/test/`, {
    method: "POST",
    body: JSON.stringify({
      sent: text,
      idRef: idRef
    }),
  });
  const json = await result.json();
  return {sents: json.analyzed_sents, concepts: json.concepts} as {sents: Result[], concepts: string[]};
}
