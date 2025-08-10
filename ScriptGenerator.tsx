import React, { useState } from 'react';
import { Film, FileText, Download, Play, Pause, RotateCcw } from 'lucide-react';
import { generateScriptSection } from '../services/geminiService';
import { generateWordDocument } from '../services/documentService';

interface ScriptSection {
  id: number;
  title: string;
  content: string;
  status: 'pending' | 'generating' | 'completed' | 'error';
  pageRange: string;
}

interface ScriptDetails {
  title: string;
  genre: string;
  plot: string;
  mainCharacters: string;
  tone: string;
  setting: string;
}

export const ScriptGenerator: React.FC = () => {
  const [step, setStep] = useState<'input' | 'generating' | 'preview'>('input');
  const [scriptDetails, setScriptDetails] = useState<ScriptDetails>({
    title: '',
    genre: '',
    plot: '',
    mainCharacters: '',
    tone: '',
    setting: ''
  });
  const [sections, setSections] = useState<ScriptSection[]>([]);
  const [currentSection, setCurrentSection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);

  const sectionRanges = [
    { id: 1, title: 'Opening & Setup', pageRange: '1-24', description: 'Character introduction and story setup' },
    { id: 2, title: 'Rising Action', pageRange: '25-48', description: 'Conflict development and plot advancement' },
    { id: 3, title: 'Midpoint & Complications', pageRange: '49-72', description: 'Major plot point and character challenges' },
    { id: 4, title: 'Climax & Final Act', pageRange: '73-96', description: 'Climax and resolution buildup' },
    { id: 5, title: 'Resolution', pageRange: '97-120', description: 'Conclusion and character arcs completion' }
  ];

  const handleInputChange = (field: keyof ScriptDetails, value: string) => {
    setScriptDetails(prev => ({ ...prev, [field]: value }));
  };

  const startGeneration = () => {
    const initialSections: ScriptSection[] = sectionRanges.map(range => ({
      id: range.id,
      title: range.title,
      content: '',
      status: 'pending',
      pageRange: range.pageRange
    }));
    
    setSections(initialSections);
    setStep('generating');
    setCurrentSection(0);
    generateSections(initialSections);
  };

  const generateSections = async (sectionsToGenerate: ScriptSection[]) => {
    setIsGenerating(true);
    
    for (let i = 0; i < sectionsToGenerate.length; i++) {
      setCurrentSection(i);
      setSections(prev => prev.map((section, index) => 
        index === i ? { ...section, status: 'generating' } : section
      ));

      try {
        const previousContent = i > 0 ? sectionsToGenerate[i - 1].content : '';
        const generatedContent = await generateScriptSection(
          scriptDetails,
          sectionsToGenerate[i],
          previousContent,
          i
        );
        
        setSections(prev => prev.map((section, index) => 
          index === i ? { 
            ...section, 
            content: generatedContent, 
            status: 'completed' 
          } : section
        ));
      } catch (error) {
        setSections(prev => prev.map((section, index) => 
          index === i ? { ...section, status: 'error' } : section
        ));
        console.error('Error generating section:', error);
      }
    }
    
    setIsGenerating(false);
    setStep('preview');
  };

  const generateMockContent = (section: ScriptSection, index: number): string => {
    return `FADE IN:

EXT. ${scriptDetails.setting?.toUpperCase() || 'LOCATION'} - DAY

${section.title.toUpperCase()}

The ${scriptDetails.genre.toLowerCase()} story unfolds as ${scriptDetails.mainCharacters} navigate through the challenges of this ${section.pageRange} page section.

MAIN CHARACTER
${scriptDetails.tone === 'dramatic' ? '(dramatically)' : '(confidently)'}
This is where the ${section.title.toLowerCase()} begins to take shape, building upon the foundation of our ${scriptDetails.title}.

The plot thickens as ${scriptDetails.plot.substring(0, 100)}...

[This is a mock generation for section ${index + 1}. In the actual implementation, this would be replaced by the Gemini API response containing properly formatted screenplay content for pages ${section.pageRange}.]

FADE OUT.`;
  };

  const retrySection = (sectionId: number) => {
    // Implementation for retrying a failed section
    console.log(`Retrying section ${sectionId}`);
  };

  const downloadScript = () => {
    const fullScript = sections.map(section => section.content).join('\n\n');
    const element = document.createElement('a');
    const file = new Blob([fullScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${scriptDetails.title || 'Movie_Script'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const downloadWordDocument = async () => {
    try {
      await generateWordDocument(scriptDetails, sections);
    } catch (error) {
      console.error('Error generating Word document:', error);
      alert('Error generating Word document. Please try again.');
    }
  };
  const resetGenerator = () => {
    setStep('input');
    setSections([]);
    setCurrentSection(0);
    setIsGenerating(false);
  };

  if (step === 'input') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Film className="w-12 h-12 text-yellow-400 mr-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                ScriptForge AI
              </h1>
            </div>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Generate professional movie scripts using AI. Break down your story into manageable sections for the perfect screenplay.
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700">
              <h2 className="text-2xl font-semibold mb-8 flex items-center">
                <FileText className="w-6 h-6 mr-3 text-yellow-400" />
                Script Details
              </h2>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Movie Title
                  </label>
                  <input
                    type="text"
                    value={scriptDetails.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="The Great Adventure"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre
                  </label>
                  <select
                    value={scriptDetails.genre}
                    onChange={(e) => handleInputChange('genre', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                  >
                    <option value="">Select genre</option>
                    <option value="action">Action</option>
                    <option value="comedy">Comedy</option>
                    <option value="drama">Drama</option>
                    <option value="horror">Horror</option>
                    <option value="romance">Romance</option>
                    <option value="sci-fi">Science Fiction</option>
                    <option value="thriller">Thriller</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tone
                  </label>
                  <select
                    value={scriptDetails.tone}
                    onChange={(e) => handleInputChange('tone', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white"
                  >
                    <option value="">Select tone</option>
                    <option value="light">Light & Humorous</option>
                    <option value="dramatic">Dramatic & Serious</option>
                    <option value="dark">Dark & Intense</option>
                    <option value="inspirational">Inspirational</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Setting
                  </label>
                  <input
                    type="text"
                    value={scriptDetails.setting}
                    onChange={(e) => handleInputChange('setting', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="Modern day New York City"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Main Characters
                  </label>
                  <input
                    type="text"
                    value={scriptDetails.mainCharacters}
                    onChange={(e) => handleInputChange('mainCharacters', e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400"
                    placeholder="John (protagonist), Sarah (love interest), Marcus (antagonist)"
                  />
                </div>
              </div>

              <div className="mb-8">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Plot Summary
                </label>
                <textarea
                  value={scriptDetails.plot}
                  onChange={(e) => handleInputChange('plot', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-white placeholder-gray-400 resize-none"
                  placeholder="A brief summary of your movie plot. This will guide the AI in generating each section of your screenplay..."
                />
              </div>

              <div className="mb-8">
                <h3 className="text-lg font-medium mb-4 text-gray-300">Generation Plan</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sectionRanges.map((section) => (
                    <div key={section.id} className="bg-gray-900/50 p-4 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-yellow-400">{section.title}</span>
                        <span className="text-sm text-gray-400">Pages {section.pageRange}</span>
                      </div>
                      <p className="text-sm text-gray-300">{section.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={startGeneration}
                disabled={!scriptDetails.title || !scriptDetails.genre || !scriptDetails.plot}
                className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-lg transition-all duration-200 flex items-center justify-center"
              >
                <Play className="w-5 h-5 mr-2" />
                Generate Movie Script
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (step === 'generating') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
        <div className="container mx-auto px-6 py-8">
          <div className="text-center mb-12">
            <div className="flex items-center justify-center mb-6">
              <Film className="w-12 h-12 text-yellow-400 mr-4" />
              <h1 className="text-3xl font-bold">Generating Your Script</h1>
            </div>
            <p className="text-lg text-gray-300">
              Creating "{scriptDetails.title}" - This may take several minutes
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700 mb-8">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-300">Overall Progress</span>
                  <span className="text-sm text-gray-300">{Math.min(currentSection + 1, sections.length)} of {sections.length}</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-yellow-400 to-orange-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(Math.min(currentSection + 1, sections.length) / sections.length) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-4">
                {sections.map((section, index) => (
                  <div key={section.id} className={`p-4 rounded-lg border transition-all duration-300 ${
                    section.status === 'completed' ? 'bg-green-900/20 border-green-500' :
                    section.status === 'generating' ? 'bg-yellow-900/20 border-yellow-500' :
                    section.status === 'error' ? 'bg-red-900/20 border-red-500' :
                    'bg-gray-900/20 border-gray-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{section.title}</h3>
                        <p className="text-sm text-gray-400">Pages {section.pageRange}</p>
                      </div>
                      <div className="flex items-center">
                        {section.status === 'generating' && (
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-yellow-400"></div>
                        )}
                        {section.status === 'completed' && (
                          <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        {section.status === 'error' && (
                          <button
                            onClick={() => retrySection(section.id)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white">
      <div className="container mx-auto px-6 py-8">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Film className="w-10 h-10 text-yellow-400 mr-3" />
            <h1 className="text-3xl font-bold">Script Generated Successfully!</h1>
          </div>
          <p className="text-lg text-gray-300">"{scriptDetails.title}" is ready for download</p>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="lg:w-1/3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700 sticky top-8">
                <h2 className="text-xl font-semibold mb-4">Script Sections</h2>
                <div className="space-y-3">
                  {sections.map((section) => (
                    <div key={section.id} className="p-3 bg-gray-900/50 rounded-lg border border-gray-600">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-medium text-sm">{section.title}</span>
                        <span className="text-xs text-gray-400">{section.pageRange}</span>
                      </div>
                      <div className="text-xs text-green-400">✓ Generated</div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  <button
                    onClick={downloadScript}
                    className="w-full bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download as TXT
                  </button>
                  
                  <button
                    onClick={downloadWordDocument}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    Download as Word Doc
                  </button>
                  
                  <button
                    onClick={resetGenerator}
                    className="w-full bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Generate New Script
                  </button>
                </div>
              </div>
            </div>

            <div className="lg:w-2/3">
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700">
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-semibold">Script Preview</h2>
                  <p className="text-gray-400 text-sm mt-1">Scroll through your generated screenplay</p>
                </div>
                <div className="p-6 max-h-96 overflow-y-auto">
                  <div className="space-y-8">
                    {sections.map((section) => (
                      <div key={section.id} className="border-b border-gray-700 pb-6 last:border-b-0">
                        <h3 className="text-lg font-medium text-yellow-400 mb-3">{section.title}</h3>
                        <pre className="whitespace-pre-wrap font-mono text-sm text-gray-300 leading-relaxed">
                          {section.content}
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};