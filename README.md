<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1vgtzLlCkADvn40X6yDDRsP6LbFgiDpoE

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`


export const generateDateIdea = async (mood: string): Promise<DateIdea> => {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('API Key is missing');
  }

  const prompt = `
Roleplay as a Gen Z dating curator with a NewJeans-core aesthetic: ethereal, nostalgic, and airy.
Create a unique, actionable dating itinerary based on this theme: "${mood}".

IMPORTANT: Respond strictly with a valid JSON object (no markdown, no extra text):
{
  "title": "A catchy, aesthetic title with 1-2 Y2K emojis",
  "description": "Create 3 distinct sections using these exact emojis as headers:

🫧 [The Concept]: A poetic, hazy intro that paints the scene. (Max 40 words, use LINE BREAKS).
🎧 [The To-do]: 2-3 specific actions. Must include one 'quirky detail' (e.g., sharing a wired headphone splitter).
💿 [The Logistics]: Give me a REAL [Location] in Paris or GBA, a [Transport vibe], and one [Pro-tip].

Use minimal slang (e.g., 'lowkey' or 'vibe' only). Style should be soft-focused and evocative.",
  "duration": "e.g., 3.5h",
  "budget": "2-7 DIFFERENT romantic emojis that represent the vibe cost (e.g., 🫧💎✨)",
  "vibe": "One word (e.g., Ethereal, Retro, Crisp)"
}

Requirements:

1. 🎯 LOCATIONS: You MUST mention specific, real-world spots in either Paris or the Guangdong-Hong Kong-Macao Greater Bay Area.
2. 🎁 TOGGLES: At the very end of the 'description' field, add 2-4 items following a double newline:
   • [Emoji] [Aesthetic Item Name] (e.g., • 📸 Digital Camcorder)
3. ✨ EMOJIS: Use 🫧, 🎧, 💿, 🦋, ☁️, 🎀 sparingly for a clean, premium feel.

Pure JSON only.`;

  // 后续的 fetch 调用逻辑保持不变...
};
