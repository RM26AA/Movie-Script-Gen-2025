interface ScriptDetails {
  title: string;
  genre: string;
  plot: string;
  mainCharacters: string;
  tone: string;
  setting: string;
}

interface ScriptSection {
  id: number;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  pageRange: string;
}

// API keys stored securely in the service
const API_KEYS = [
  'add here 1st gemni apin key',
  'add here 2nd gemni apin key',
  'add here 3rd gemni apin key',
  'add here 4th gemni apin key',
  'add here 5th gemni apin key'
];

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent';

export async function generateScriptSection(
  scriptDetails: ScriptDetails,
  section: ScriptSection,
  previousContent: string,
  sectionIndex: number
): Promise<string> {
  const apiKey = API_KEYS[sectionIndex];
  
  const prompt = createSectionPrompt(scriptDetails, section, previousContent, sectionIndex);
  
  const maxRetries = 5;
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const response = await fetch(`${GEMINI_API_URL}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 8192,
          }
        })
      });

      if (response.ok) {
        const data = await response.json();
        
        if (data.candidates && data.candidates[0] && data.candidates[0].content) {
          return data.candidates[0].content.parts[0].text;
        } else {
          throw new Error('Invalid response format from Gemini API');
        }
      }

      // Check if we should retry based on status code
      if (response.status === 503 || response.status === 429 || response.status >= 500) {
        lastError = new Error(`API request failed: ${response.status}`);
        
        // Don't wait after the last attempt
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // Exponential backoff: 1s, 2s, 4s, 8s
          console.log(`Attempt ${attempt + 1} failed with status ${response.status}. Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      } else {
        // For other HTTP errors, don't retry
        throw new Error(`API request failed: ${response.status}`);
      }
    } catch (error) {
      lastError = error as Error;
      
      // For network errors, retry with exponential backoff
      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.log(`Attempt ${attempt + 1} failed with network error. Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  console.error('All retry attempts failed:', lastError);
  throw lastError;
}

function createSectionPrompt(
  scriptDetails: ScriptDetails,
  section: ScriptSection,
  previousContent: string,
  sectionIndex: number
): string {
  const contextInfo = previousContent ? 
    `\n\nPREVIOUS SECTION CONTEXT:\n${previousContent.substring(0, 1000)}...` : 
    '';

  return `You are a professional screenplay writer. Write a ${section.pageRange} page section of a movie script.

MOVIE DETAILS:
- Title: ${scriptDetails.title}
- Genre: ${scriptDetails.genre}
- Setting: ${scriptDetails.setting}
- Main Characters: ${scriptDetails.mainCharacters}
- Tone: ${scriptDetails.tone}
- Plot: ${scriptDetails.plot}

SECTION REQUIREMENTS:
- Section: ${section.title} (Pages ${section.pageRange})
- This is section ${sectionIndex + 1} of 5 total sections
- Write approximately ${getSectionPageCount(section.pageRange)} pages of screenplay content
- Use proper screenplay formatting (FADE IN, character names in caps, scene headings, etc.)
- Maintain continuity with previous sections
- Focus on: ${getSectionFocus(sectionIndex)}

${contextInfo}

FORMATTING GUIDELINES:
- Use standard screenplay format
- Scene headings: EXT./INT. LOCATION - TIME
- Character names in ALL CAPS when speaking
- Action lines in present tense
- Proper spacing and indentation
- Include scene transitions (FADE IN, FADE OUT, CUT TO:)

Write the complete section now:`;
}

function getSectionPageCount(pageRange: string): number {
  const [start, end] = pageRange.split('-').map(Number);
  return end - start + 1;
}

function getSectionFocus(sectionIndex: number): string {
  const focuses = [
    'Character introductions, world-building, and inciting incident',
    'Plot development, character relationships, and rising tension',
    'Major plot twist, character development, and escalating conflicts',
    'Climax, major confrontations, and turning points',
    'Resolution, character arcs completion, and satisfying conclusion'
  ];
  return focuses[sectionIndex] || 'Story development and character progression';
}