import { generateWithGeminiModel } from "./llm-gemini.js";

const PREPROMPT = `You are an assistant specialized in preparing narrative texts for AI image generation. From now on, you will receive long excerpts from a book and must:
  
  1. Read the entire text and understand its narrative flow (scenes, characters, actions, changes in setting, emotional moments, key objects, etc.).
  2. Insert the special character «⇼» before each new section you consider visually relevant for creating an image.
  
     * Each marked section will start with «⇼» and continue until just before the next «⇼» or the end of the text.
     * Try to group in each section a sufficiently descriptive and cohesive fragment (around 20-35 words) that contains clear visual information (country, landscape, characters, actions), DO NOT EXCEED 35 WORDS.
  3. BY ANY MEANS, Do NOT change or rewrite the original text: just add the ⇼ character at the separation points you choose.
  4. Adjust the frequency of separation according to visual richness: static or very descriptive scenes can be grouped together, while complex scenes or those with several protagonists should be separated.
  5. Return the result as a single block of text, with the ⇼ prefixes indicating each new section.
  6. At the end of each text, print the character ⇼ to mark the end.
  7. YOU MUST ALWAY RETURN/OUTPUT THE ORIGINAL TEXT, DO NOT CHANGE IT IN ANY WAY, JUST ADD THE ⇼ CHARACTER, THIS IS THE MOST IMPORTANT RULE.
  
  For example, if the text were a passage from "Pinocchio," you should produce something like:
  
  *Once upon a time, there was an old carpenter named Geppetto who was very happy making wooden toys for the children in his village.
  ⇼One day, he made a puppet from a very special piece of pine wood and decided to name it Pinocchio.
  ⇼At night, a blue fairy came to the old carpenter's workshop.⇼
  
  Now, when you receive your text, apply these instructions 100% and separate it into sections ready for image generation.

  And remember, DO NOT CHANGE THE ORIGINAL TEXT.

  Also, DO NOT GIVE AN ANSWER, JUST GIVE THE DIVIDED TEXT

  **Important**: under no circumstances output any <think> or internal reasoning tags. Only return the original text with the marker ⇼ before each visual section and a final ⇼ at the end. DO NOT RESPOND ANYTHING ELSE THAN THE DIVIDED TEXT, DO NOT SAY NOTHING EXCEPT FOR THE TEXT
  
  If no text has been sent to you, reply with "no text sent" (IMPORTANT). 

  You cannot divide paragraphs in the middle of a sentence, it MUST always end in a dot.

  Also, highlight the most important words in bold regarding the text context. Highlight them in bold like this example:

  The marvelous minion got <b>excited</b> when he saw a banana.

  So, in this example, the word "excited" is the most important word in the paragraph, because it is the word that expresses the emotion of the character, so you have to highlight it in bold, putting the <b> tag before and after the word.

  Last but not least, every paragraph can have a maximum of 35 words. All paragraphs must be coherent; none should be cut off in the middle.`;

export async function splitTextWithGemini(originalText) {
  const text = (originalText || '').toString();
  if (!text.trim()) return '';
  const prompt = `${PREPROMPT}\n\nBelow, I'll leave you the text to which you must apply these instructions:\n\n${text}`;
    const result = await generateWithGeminiModel(prompt, "gemini-2.5-flash", {
      temperature: 0.2,
      topP: 0.8,
      maxTokens: 1048576,
      systemInstruction: "You split text by inserting the character ⇼ before each visually coherent section. Respond ONLY with the transformed text and a final ⇼."
    });
  return String(result || '').trim();
}

export function splitIntoParagraphArray(splitText) {
  const raw = (splitText || '').toString();
  if (!raw) return [];
  const mark = '⇼';
  const parts = raw
    .replace(/\*?⇼\*?/g, mark)
    .split(mark)
    .map(p => p.replace(/\s+/g, ' ').trim())
    .filter(Boolean);
  return parts;
}


