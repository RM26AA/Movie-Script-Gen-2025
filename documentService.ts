import { Document, Packer, Paragraph, TextRun, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

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
  status: string;
  pageRange: string;
}

export async function generateWordDocument(scriptDetails: ScriptDetails, sections: ScriptSection[]): Promise<void> {
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          margin: {
            top: 1440, // 1 inch in twips (1440 twips = 1 inch)
            right: 1440,
            bottom: 1440,
            left: 1440,
          },
        },
      },
      children: [
        // Title Page
        new Paragraph({
          children: [
            new TextRun({
              text: scriptDetails.title.toUpperCase(),
              bold: true,
              size: 32,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 480, // 24pt spacing
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `A ${scriptDetails.genre} Screenplay`,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 960, // 48pt spacing
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Genre: ${scriptDetails.genre}`,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 240,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Setting: ${scriptDetails.setting}`,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 240,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Main Characters: ${scriptDetails.mainCharacters}`,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 240,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: `Tone: ${scriptDetails.tone}`,
              size: 20,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 480,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: "PLOT SUMMARY",
              bold: true,
              size: 24,
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: {
            after: 240,
          },
        }),
        new Paragraph({
          children: [
            new TextRun({
              text: scriptDetails.plot,
              size: 20,
            }),
          ],
          alignment: AlignmentType.JUSTIFIED,
          spacing: {
            after: 960,
          },
        }),
        
        // Page break before script content
        new Paragraph({
          children: [new TextRun({ text: "", break: 1 })],
          pageBreakBefore: true,
        }),
        
        // Script content
        ...sections.flatMap(section => [
          // Section header
          new Paragraph({
            children: [
              new TextRun({
                text: `${section.title.toUpperCase()} (Pages ${section.pageRange})`,
                bold: true,
                size: 24,
              }),
            ],
            alignment: AlignmentType.CENTER,
            spacing: {
              before: 480,
              after: 480,
            },
            heading: HeadingLevel.HEADING_2,
          }),
          
          // Section content - parse and format screenplay text
          ...parseScriptContent(section.content),
        ]),
      ],
    }],
  });

  // Generate and download the document
  const buffer = await Packer.toBlob(doc);
  const fileName = `${scriptDetails.title || 'Movie_Script'}.docx`;
  saveAs(buffer, fileName);
}

function parseScriptContent(content: string): Paragraph[] {
  const lines = content.split('\n');
  const paragraphs: Paragraph[] = [];
  
  for (const line of lines) {
    const trimmedLine = line.trim();
    
    if (!trimmedLine) {
      // Empty line
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: "" })],
        spacing: { after: 120 },
      }));
      continue;
    }
    
    // Scene headings (EXT./INT.)
    if (trimmedLine.match(/^(EXT\.|INT\.|FADE IN:|FADE OUT\.|CUT TO:)/)) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: trimmedLine,
            bold: true,
            allCaps: true,
            size: 24,
          }),
        ],
        spacing: {
          before: 240,
          after: 240,
        },
      }));
      continue;
    }
    
    // Character names (all caps, centered-ish)
    if (trimmedLine === trimmedLine.toUpperCase() && 
        trimmedLine.length < 50 && 
        !trimmedLine.includes('.') &&
        !trimmedLine.startsWith('(') &&
        trimmedLine.match(/^[A-Z\s]+$/)) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: trimmedLine,
            bold: true,
            size: 24,
          }),
        ],
        indent: {
          left: 2160, // Character names indented
        },
        spacing: {
          before: 240,
          after: 120,
        },
      }));
      continue;
    }
    
    // Parentheticals
    if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: trimmedLine,
            italics: true,
            size: 22,
          }),
        ],
        indent: {
          left: 1800, // Parentheticals indented less than character names
        },
        spacing: {
          after: 120,
        },
      }));
      continue;
    }
    
    // Dialogue
    if (paragraphs.length > 0) {
      const lastParagraph = paragraphs[paragraphs.length - 1];
      // Check if previous paragraph was a character name or parenthetical
      paragraphs.push(new Paragraph({
        children: [
          new TextRun({
            text: trimmedLine,
            size: 22,
          }),
        ],
        indent: {
          left: 1440, // Dialogue indented
          right: 1440,
        },
        spacing: {
          after: 120,
        },
      }));
      continue;
    }
    
    // Action/description (default)
    paragraphs.push(new Paragraph({
      children: [
        new TextRun({
          text: trimmedLine,
          size: 22,
        }),
      ],
      spacing: {
        after: 240,
      },
    }));
  }
  
  return paragraphs;
}