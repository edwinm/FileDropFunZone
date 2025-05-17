
'use server';
/**
 * @fileOverview A Genkit flow to identify the language of a text and translate it to English if it's not already English.
 *
 * - translateAndIdentifyLanguage - A function that handles language identification and translation.
 * - TranslateAndIdentifyLanguageInput - The input type for the function.
 * - TranslateAndIdentifyLanguageOutput - The return type for the function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const TranslateAndIdentifyLanguageInputSchema = z.object({
  text: z.string().describe('The text to analyze and potentially translate.'),
});
export type TranslateAndIdentifyLanguageInput = z.infer<typeof TranslateAndIdentifyLanguageInputSchema>;

const TranslateAndIdentifyLanguageOutputSchema = z.object({
  translatedText: z.string().describe('The English translation if the original was not English, otherwise the original text.'),
  sourceLanguage: z.string().describe('The detected original language of the input text (e.g., "Spanish", "French", "English").'),
  isTranslationNeeded: z.boolean().describe('True if the original language was not English and a translation was performed, false otherwise.'),
});
export type TranslateAndIdentifyLanguageOutput = z.infer<typeof TranslateAndIdentifyLanguageOutputSchema>;

export async function translateAndIdentifyLanguage(input: TranslateAndIdentifyLanguageInput): Promise<TranslateAndIdentifyLanguageOutput> {
  return translateAndIdentifyLanguageFlow(input);
}

const translatePrompt = ai.definePrompt({
  name: 'translateAndIdentifyLanguagePrompt',
  input: {schema: TranslateAndIdentifyLanguageInputSchema},
  output: {schema: TranslateAndIdentifyLanguageOutputSchema},
  prompt: `You are a language expert. Analyze the following text and provide your response in the specified JSON format.

Text to analyze:
{{{text}}}

Your task is to:
1. Identify the original language of the text. Provide the full language name (e.g., "Spanish", "French", "English").
2. If the original language is NOT English, translate the text to English. The "translatedText" field should contain this English translation.
3. If the original language IS English, the "translatedText" field should be the same as the original input text.
4. The "sourceLanguage" field must contain the identified original language.
5. The "isTranslationNeeded" field must be a boolean: true if the original language was not English (and thus a translation was performed), and false if the original language was English.

Ensure your entire response is a single JSON object matching the output schema.
`,
});

const translateAndIdentifyLanguageFlow = ai.defineFlow(
  {
    name: 'translateAndIdentifyLanguageFlow',
    inputSchema: TranslateAndIdentifyLanguageInputSchema,
    outputSchema: TranslateAndIdentifyLanguageOutputSchema,
  },
  async (input: TranslateAndIdentifyLanguageInput) => {
    if (!input.text || input.text.trim() === "") {
      // If input text is empty or whitespace, return non-translated state
      return {
        translatedText: "",
        sourceLanguage: "Unknown",
        isTranslationNeeded: false,
      };
    }
    const {output} = await translatePrompt(input);
    if (!output) {
        throw new Error("Translation prompt failed to return an output.");
    }
    return output;
  }
);

