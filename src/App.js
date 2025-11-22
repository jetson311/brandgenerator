import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  Upload, 
  Smartphone, 
  Box, 
  Globe, 
  PenTool, 
  Layout, 
  Image as ImageIcon, 
  Plus, 
  X, 
  RefreshCw, 
  Wand2, 
  Settings, 
  Check, 
  ChevronRight, 
  ChevronLeft,
  Loader2,
  Trash2,
  Edit2,
  Sliders,
  Download,
  Maximize2,
  XCircle,
  Copy,
  ClipboardCheck
} from 'lucide-react';

// --- Mock AI Logic & Helpers ---

const generateMockAnalysis = (context, images) => {
  const tones = ["Sophisticated", "Playful", "Minimalist", "Industrial", "Organic", "Tech-forward"];
  const tone = tones[Math.floor(Math.random() * tones.length)];
  return `Based on the ${images.length} assets and context, we detect a strong ${tone} aesthetic. Recommended: distinctive typography with the selected palette.`;
};

const generateRandomColor = () => {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};

const generateStarterSchemes = () => {
  const schemes = [];
  const names = ["Vibrant Pulse", "Deep Corporate", "Earthy Organic", "Neon Future"];
  
  for (let i = 0; i < 4; i++) {
    const colors = [];
    for (let j = 0; j < 6; j++) colors.push(generateRandomColor());
    schemes.push({ id: i, name: names[i], colors: colors });
  }
  return schemes;
};

// --- Taxonomy Data ---

const AXIS_DEFINITIONS = {
  density: {
    label: "Visual Density",
    description: "Information saturation",
    min: "Null",
    max: "Chaotic",
    marks: { 0: "Null", 2: "Minimal", 5: "Balanced", 8: "Saturated", 10: "Chaotic" }
  },
  typography: {
    label: "Typographic Dominance",
    description: "Text importance",
    min: "None",
    max: "Architectural",
    marks: { 0: "None", 2: "Functional", 5: "Integrated", 8: "Loud", 10: "Architectural" }
  },
  surrealism: {
    label: "Surrealism",
    description: "Adherence to physics",
    min: "Literal",
    max: "Alien",
    marks: { 0: "Literal", 3: "Metaphorical", 5: "Stylized", 8: "Dream Logic", 10: "Abstract" }
  },
  humanism: {
    label: "Humanism",
    description: "Emotion vs. Logic",
    min: "Mechanical",
    max: "Raw",
    marks: { 0: "Mechanical", 3: "Friendly", 5: "Narrative", 8: "Hand-Crafted", 10: "Raw" }
  }
};

const PRESETS = {
  "Purists": [
    { 
      name: "Industrial Minimal", 
      description: "Clinical perfection. Bead-blasted aluminum, squircle geometry, and absolute functionalism. Think Dieter Rams.",
      vals: { density: 1, typography: 1, surrealism: 0, humanism: 1 } 
    },
    { 
      name: "Japanese Emptiness", 
      description: "Haptic minimalism defined by natural materials, diffused light, and extreme negative space (Ma).",
      vals: { density: 0, typography: 2, surrealism: 1, humanism: 6 } 
    },
    { 
      name: "Modernist Glamour", 
      description: "California Modern. Floating forms, material contrast (chrome vs velvet), and low-slung lounge vibes.",
      vals: { density: 4, typography: 2, surrealism: 1, humanism: 5 } 
    },
    { 
      name: "Pixel Humanism", 
      description: "Metaphorical UI. 1-bit outlines, dithering patterns, and friendly bitmap fonts.",
      vals: { density: 5, typography: 3, surrealism: 4, humanism: 9 } 
    },
  ],
  "Disruptors": [
    { 
      name: "Pop Surrealism", 
      description: "High-gloss conceptualism. Hard flash photography, melting objects, and saturated monochromatic backgrounds.",
      vals: { density: 7, typography: 6, surrealism: 9, humanism: 8 } 
    },
    { 
      name: "Radical Postmodern", 
      description: "Memphis Group energy. Clashing primary colors, totemic stacking, and plastic laminate textures.",
      vals: { density: 8, typography: 1, surrealism: 7, humanism: 10 } 
    },
    { 
      name: "Grunge / Anti-Design", 
      description: "Analog decay. Photocopy grain, torn edges, distorted type, and a complete rejection of the grid.",
      vals: { density: 10, typography: 10, surrealism: 2, humanism: 9 } 
    },
  ],
  "Narrators": [
    { 
      name: "Psychedelic Concept", 
      description: "Illustrative Pop. Cel-shaded contour lines, stained glass colors, and visual puns.",
      vals: { density: 6, typography: 7, surrealism: 6, humanism: 8 } 
    },
    { 
      name: "Bio-Ornamentalism", 
      description: "Arts & Crafts revival. Horror vacui pattern density with local floral motifs and vegetable dye tones.",
      vals: { density: 10, typography: 5, surrealism: 2, humanism: 9 } 
    },
    { 
      name: "Environmental Type", 
      description: "Typography as architecture. Massive scale text wrapping around 3D corners and filling entire facades.",
      vals: { density: 9, typography: 10, surrealism: 3, humanism: 6 } 
    },
  ],
  "Scientists": [
    { 
      name: "Data Humanism", 
      description: "Hand-drawn visualization. Wobbly lines and personal data metaphors (flowers, stitches) over charts.",
      vals: { density: 6, typography: 5, surrealism: 3, humanism: 10 } 
    },
    { 
      name: "Bio-Generative", 
      description: "Material Ecology. Voronoi patterns, cellular structures, and gradient material transitions.",
      vals: { density: 9, typography: 0, surrealism: 10, humanism: 1 } 
    },
  ]
};

const OutputCheckbox = ({ id, label, icon: Icon, selected, toggle }) => (
  <div 
    onClick={() => toggle(id)}
    className={`cursor-pointer border rounded-lg p-3 flex flex-col items-center justify-center gap-2 transition-all duration-200 shadow-sm ${selected ? 'border-yellow-500 bg-yellow-50 text-yellow-700 ring-1 ring-yellow-500' : 'border-gray-200 bg-white hover:border-gray-300 text-slate-500 hover:bg-gray-50'}`}
  >
    <Icon size={24} strokeWidth={1.5} />
    <span className="font-medium text-xs text-center leading-tight">{label}</span>
  </div>
);

const ColorSwatch = ({ color, onClick, onRemove, canRemove }) => (
  <div className="relative group">
    <div 
      className="w-8 h-8 md:w-10 md:h-10 rounded-full cursor-pointer shadow-sm border border-gray-200 transition-transform hover:scale-110"
      style={{ backgroundColor: color }}
      onClick={onClick}
    />
    {canRemove && (
      <button 
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
      >
        <X size={10} />
      </button>
    )}
  </div>
);

const TaxonomySlider = ({ axisKey, value, onChange }) => {
  const def = AXIS_DEFINITIONS[axisKey];
  
  const getLabel = (val) => {
    const keys = Object.keys(def.marks).map(Number).sort((a,b) => a-b);
    let closest = keys[0];
    let minDiff = Math.abs(val - closest);
    for (let k of keys) {
      const diff = Math.abs(val - k);
      if (diff < minDiff) {
        minDiff = diff;
        closest = k;
      }
    }
    return def.marks[closest];
  };

  return (
    <div className="mb-3 bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex flex-col justify-center">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-xs uppercase tracking-wide text-slate-700 font-bold">{def.label}</span>
          <span className="text-[10px] text-slate-400 truncate hidden sm:inline-block">{def.description}</span>
        </div>
        <div className="text-right flex items-baseline gap-1">
           <span className="text-sm font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded text-center min-w-[60px]">{getLabel(value)}</span>
           <span className="text-xs font-mono text-yellow-600 w-8 text-right">{value}/10</span>
        </div>
      </div>
      
      <div className="relative h-6 flex items-center">
         <input 
          type="range" 
          min="0" 
          max="10" 
          step="1"
          value={value} 
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-yellow-500 z-10 relative"
        />
      </div>
      <div className="flex justify-between px-1 mt-1">
           <span className="text-[9px] text-slate-400 uppercase">{def.min}</span>
           <span className="text-[9px] text-slate-400 uppercase">{def.max}</span>
      </div>
    </div>
  );
};

const ResultCard = ({ id, type, color, onExpand, onRegenerate, isRegenerating }) => (
  <div className="bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all group">
    {/* Image Area */}
    <div 
      onClick={() => onExpand(id)}
      className={`h-64 w-full flex items-center justify-center bg-gradient-to-br ${color === 'dark' ? 'from-slate-100 to-slate-300' : 'from-yellow-50 to-orange-50'} relative cursor-zoom-in`}
    >
      {isRegenerating ? (
         <Loader2 className="animate-spin text-slate-400" size={32} />
      ) : (
        <div className="w-16 h-16 rounded-lg bg-white/60 text-yellow-600 flex items-center justify-center backdrop-blur-sm border border-white/50 shadow-sm transition-transform group-hover:scale-110">
           <Wand2 size={28} />
        </div>
      )}
    </div>

    {/* Action Bar */}
    <div className="py-3 bg-white border-t border-gray-100 flex items-center justify-center gap-6">
      <button 
        title="Download"
        className="text-slate-400 hover:text-slate-800 transition-colors p-2 rounded-full hover:bg-slate-50"
      >
        <Download size={18} />
      </button>
      <button 
        title="Edit"
        className="text-slate-400 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-blue-50"
      >
        <Edit2 size={18} />
      </button>
      <button 
        title="Regenerate this asset"
        onClick={(e) => { e.stopPropagation(); onRegenerate(id); }}
        disabled={isRegenerating}
        className={`text-slate-400 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50 ${isRegenerating ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        <RefreshCw size={18} className={isRegenerating ? 'animate-spin' : ''} />
      </button>
    </div>
  </div>
);

const FooterControls = ({ children }) => (
  <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur border-t border-gray-200 p-4 z-50">
    <div className="max-w-4xl mx-auto px-4 flex justify-between items-center">
      {children}
    </div>
  </div>
);

export default function BrandGenApp() {
  // --- State ---
  const [step, setStep] = useState(1);
  
  // Step 1: Inputs
  const [selectedOutputs, setSelectedOutputs] = useState([]);
  const [otherOutput, setOtherOutput] = useState("");
  const [context, setContext] = useState("");
  const [uploadedImages, setUploadedImages] = useState([]);
  const [imageInstructions, setImageInstructions] = useState("");

  // Step 2: Analysis & Colors
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisReport, setAnalysisReport] = useState("");
  const [colorSchemes, setColorSchemes] = useState([]);
  const [selectedSchemeId, setSelectedSchemeId] = useState(null);
  const [editingColorIndex, setEditingColorIndex] = useState({ schemeId: null, index: null });

  // Step 3: Taxonomy Controls
  const [controls, setControls] = useState({
    density: 5,
    typography: 5,
    surrealism: 5,
    humanism: 5
  });
  const [activePreset, setActivePreset] = useState(null);

  // Step 4: Generation
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState([]);
  
  // Step 5: Results Interaction
  const [expandedImageId, setExpandedImageId] = useState(null);
  const [regeneratingIds, setRegeneratingIds] = useState([]);
  const [copied, setCopied] = useState(false);

  // Refs
  const colorInputRef = useRef(null);

  // Scroll to top on step change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [step]);

  // --- Handlers ---

  const toggleOutput = (id) => {
    setSelectedOutputs(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map(file => ({
      name: file.name,
      url: URL.createObjectURL(file)
    }));
    setUploadedImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index) => {
    setUploadedImages(prev => prev.filter((_, i) => i !== index));
  };

  const startAnalysis = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setColorSchemes(generateStarterSchemes());
      setAnalysisReport(generateMockAnalysis(context, uploadedImages));
      setIsAnalyzing(false);
      setStep(2);
    }, 1500);
  };

  // Color Logic
  const handleColorClick = (schemeId, index) => {
    setEditingColorIndex({ schemeId, index });
    colorInputRef.current.click();
  };

  const handleColorChange = (e) => {
    const newColor = e.target.value;
    const { schemeId, index } = editingColorIndex;
    
    setColorSchemes(prev => prev.map(scheme => {
      if (scheme.id === schemeId) {
        const newColors = [...scheme.colors];
        newColors[index] = newColor;
        return { ...scheme, colors: newColors };
      }
      return scheme;
    }));
  };

  const addColor = (schemeId) => {
    setColorSchemes(prev => prev.map(scheme => {
      if (scheme.id === schemeId && scheme.colors.length < 8) {
        return { ...scheme, colors: [...scheme.colors, generateRandomColor()] };
      }
      return scheme;
    }));
  };

  const removeColor = (schemeId, index) => {
    setColorSchemes(prev => prev.map(scheme => {
      if (scheme.id === schemeId) {
        return { ...scheme, colors: scheme.colors.filter((_, i) => i !== index) };
      }
      return scheme;
    }));
  };

  const addNewCustomScheme = () => {
    const newId = Math.max(...colorSchemes.map(s => s.id), 0) + 1;
    const newScheme = {
      id: newId,
      name: "Custom Palette",
      colors: [generateRandomColor(), generateRandomColor(), generateRandomColor()]
    };
    setColorSchemes([...colorSchemes, newScheme]);
    setSelectedSchemeId(newId);
  };

  // Preset Selection
  const applyPreset = (presetName, values) => {
    setControls(values);
    setActivePreset(presetName);
  };

  const handleSliderChange = (key, val) => {
    setControls(prev => ({ ...prev, [key]: val }));
    setActivePreset(null);
  };

  // Prompt & Gen Logic
  useEffect(() => {
    if (step === 4) {
      const taxonomy = `
        Axis A (Visual Density): ${controls.density}/10 (${AXIS_DEFINITIONS.density.marks[controls.density] || 'Custom'})
        Axis B (Typographic Dominance): ${controls.typography}/10 (${AXIS_DEFINITIONS.typography.marks[controls.typography] || 'Custom'})
        Axis C (Surrealism/Abstraction): ${controls.surrealism}/10 (${AXIS_DEFINITIONS.surrealism.marks[controls.surrealism] || 'Custom'})
        Axis D (Humanism/Wit): ${controls.humanism}/10 (${AXIS_DEFINITIONS.humanism.marks[controls.humanism] || 'Custom'})
      `.replace(/\s+/g, ' ');

      const outputList = [...selectedOutputs];
      if (otherOutput) outputList.push(otherOutput);

      const colors = selectedSchemeId !== null 
        ? colorSchemes.find(s => s.id === selectedSchemeId)?.colors.join(', ') 
        : "Default Palette";

      const prompt = `Design a cohesive brand identity featuring: ${outputList.join(', ')}.
      
Project Context: ${context}
Visual Analysis: ${analysisReport}
Design Taxonomy (The Ruler):
${taxonomy}
${activePreset ? `Based on Style Preset: "${activePreset}"` : "Custom Configuration"}

Colors: ${colors}
Instructions: ${imageInstructions}`;
      setGeneratedPrompt(prompt);
    }
  }, [step, controls, activePreset, selectedOutputs, otherOutput, context, selectedSchemeId, colorSchemes, analysisReport, imageInstructions]);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const newResults = [];
      selectedOutputs.forEach(output => {
        newResults.push({ id: Math.random(), title: `${output} Concept`, type: output });
      });
      if (otherOutput) {
        newResults.push({ id: Math.random(), title: `${otherOutput} Concept`, type: 'Custom' });
      }
      setResults(newResults);
      setIsGenerating(false);
      setStep(5);
    }, 2000);
  };

  const handleSingleRegenerate = (id) => {
    setRegeneratingIds(prev => [...prev, id]);
    setTimeout(() => {
       setRegeneratingIds(prev => prev.filter(itemId => itemId !== id));
       setResults(prev => prev.map(item => item.id === id ? { ...item, id: Math.random() } : item));
    }, 1500);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getPresetDescription = (presetName) => {
    for (const group of Object.values(PRESETS)) {
      const found = group.find(p => p.name === presetName);
      if (found) return found.description;
    }
    return "";
  };

  // --- Views ---

  const renderStep1 = () => (
    <div className="animate-in fade-in duration-300 flex flex-col pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Inputs */}
        <div className="space-y-5">
          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
             <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
               <span className="bg-yellow-100 text-yellow-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">1</span> 
               Deliverables
             </h2>
             <div className="grid grid-cols-3 gap-3">
                <OutputCheckbox id="Logo Design" label="Logo" icon={PenTool} selected={selectedOutputs.includes("Logo Design")} toggle={toggleOutput} />
                <OutputCheckbox id="Mobile App" label="App" icon={Smartphone} selected={selectedOutputs.includes("Mobile App")} toggle={toggleOutput} />
                <OutputCheckbox id="Website" label="Web" icon={Globe} selected={selectedOutputs.includes("Website")} toggle={toggleOutput} />
                <OutputCheckbox id="Packaging" label="Package" icon={Box} selected={selectedOutputs.includes("Packaging")} toggle={toggleOutput} />
                <OutputCheckbox id="Ad Campaign" label="Ads" icon={Layout} selected={selectedOutputs.includes("Ad Campaign")} toggle={toggleOutput} />
                <OutputCheckbox id="Showcase" label="Mockup" icon={ImageIcon} selected={selectedOutputs.includes("Showcase")} toggle={toggleOutput} />
              </div>
              <div className="mt-3">
                <input 
                  type="text" 
                  placeholder="Other (e.g. Billboard)" 
                  value={otherOutput}
                  onChange={(e) => setOtherOutput(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
                />
              </div>
          </section>

          <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
               <span className="bg-yellow-100 text-yellow-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">2</span> 
               Context
             </h2>
            <textarea 
              value={context}
              onChange={(e) => setContext(e.target.value)}
              placeholder="Brand mission, audience, vibe..."
              className="w-full h-20 bg-gray-50 border border-gray-200 text-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-yellow-500 outline-none resize-none"
            />
          </section>
        </div>

        {/* Right Column: Visuals */}
        <section className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col">
           <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-2">
               <span className="bg-yellow-100 text-yellow-700 w-5 h-5 flex items-center justify-center rounded-full text-[10px]">3</span> 
               Inspiration
           </h2>
          <div className="grid grid-cols-1 gap-3 flex-grow">
              <label className="w-full h-24 border-2 border-dashed border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer flex flex-col items-center justify-center text-slate-400">
                <Upload size={20} className="mb-1" />
                <span className="text-xs">Drop images here</span>
                <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload} />
              </label>
              
              {uploadedImages.length > 0 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {uploadedImages.map((img, idx) => (
                    <div key={idx} className="relative w-16 h-16 flex-shrink-0 rounded-md overflow-hidden group bg-gray-100 border border-gray-200">
                      <img src={img.url} alt="upload" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => removeImage(idx)}
                        className="absolute top-0.5 right-0.5 bg-white/80 hover:bg-red-500 hover:text-white text-slate-700 rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={10} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
          </div>
          <div className="mt-3">
            <input 
              type="text" 
              placeholder="Specific instructions for these assets..." 
              value={imageInstructions}
              onChange={(e) => setImageInstructions(e.target.value)}
              className="w-full bg-gray-50 border border-gray-200 text-slate-800 rounded-lg px-3 py-2 text-sm focus:ring-1 focus:ring-yellow-500 outline-none"
            />
          </div>
        </section>
      </div>

      <FooterControls>
        <div />
        <button 
          onClick={startAnalysis}
          disabled={!context}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 text-sm transition-all shadow-sm"
        >
          {isAnalyzing ? (
            <>Analyzing... <Loader2 size={16} className="animate-spin" /></>
          ) : (
            <>Analyze <ChevronRight size={16} /></>
          )}
        </button>
      </FooterControls>
    </div>
  );

  const renderStep2 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      <section className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex gap-3 items-start group hover:border-blue-300 transition-colors">
         <div className="bg-white text-blue-600 p-2 rounded-lg shadow-sm border border-blue-100"><Wand2 size={18} /></div>
         <div className="flex-grow">
           <div className="flex justify-between items-center mb-1">
             <h3 className="text-sm font-bold text-blue-900">Gemini Assessment</h3>
             <span className="text-[10px] text-blue-400 uppercase font-semibold tracking-wider opacity-0 group-hover:opacity-100 transition-opacity">Editable</span>
           </div>
           <textarea 
             value={analysisReport} 
             onChange={(e) => setAnalysisReport(e.target.value)}
             className="w-full bg-transparent text-blue-800 text-xs leading-relaxed border-none p-0 focus:ring-0 resize-none h-auto min-h-[40px]"
             rows={3}
           />
         </div>
      </section>

      <section className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Color Strategy</h2>
          <button onClick={addNewCustomScheme} className="text-xs font-medium text-yellow-600 hover:text-yellow-700 flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded hover:bg-yellow-100 transition-colors">
            <Plus size={14} /> New Custom
          </button>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {colorSchemes.map((scheme) => (
            <div 
              key={scheme.id}
              onClick={() => setSelectedSchemeId(scheme.id)}
              className={`p-3 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between ${selectedSchemeId === scheme.id ? 'border-yellow-500 bg-yellow-50/30' : 'border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50'}`}
            >
              <div className="flex items-center gap-4">
                {selectedSchemeId === scheme.id ? (
                  <div className="w-5 h-5 rounded-full bg-yellow-500 text-white flex items-center justify-center"><Check size={12} strokeWidth={3} /></div>
                ) : (
                  <div className="w-5 h-5 rounded-full border border-gray-300"></div>
                )}
                <div>
                  <h4 className={`text-sm font-bold ${selectedSchemeId === scheme.id ? 'text-slate-900' : 'text-slate-600'}`}>{scheme.name}</h4>
                  <div className="flex -space-x-2 mt-1.5">
                    {scheme.colors.map((color, idx) => (
                      <ColorSwatch 
                        key={idx} 
                        color={color} 
                        onClick={(e) => {
                          e.stopPropagation();
                          if(selectedSchemeId === scheme.id) handleColorClick(scheme.id, idx);
                        }}
                        onRemove={() => removeColor(scheme.id, idx)}
                        canRemove={selectedSchemeId === scheme.id && scheme.colors.length > 2}
                      />
                    ))}
                     {selectedSchemeId === scheme.id && scheme.colors.length < 8 && (
                      <button 
                        onClick={(e) => { e.stopPropagation(); addColor(scheme.id); }}
                        className="w-8 h-8 md:w-10 md:h-10 rounded-full border-2 border-dashed border-gray-300 hover:border-yellow-500 text-gray-400 hover:text-yellow-600 flex items-center justify-center transition-colors bg-white ml-2"
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedSchemeId === scheme.id && (
                 <span className="text-[10px] text-slate-400 italic hidden sm:flex items-center gap-1 bg-white px-2 py-1 rounded border border-gray-200">
                   <Edit2 size={10} /> Click swatch to edit
                 </span>
              )}
            </div>
          ))}
        </div>
        
        <input type="color" ref={colorInputRef} className="invisible absolute" onChange={handleColorChange} />
      </section>

      <FooterControls>
        <button onClick={() => setStep(1)} className="text-slate-500 hover:text-slate-800 text-sm font-medium px-4">Back</button>
        <button 
          onClick={() => { if (selectedSchemeId !== null) setStep(3); }}
          disabled={selectedSchemeId === null}
          className="bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 text-sm shadow-sm"
        >
          Next <ChevronRight size={16} />
        </button>
      </FooterControls>
    </div>
  );

  const renderStep3 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 h-full flex flex-col pb-20">
      <div className="flex-grow grid grid-cols-1 min-[700px]:grid-cols-4 h-[calc(100vh-140px)]">
        
        <div className="min-[700px]:col-span-1 flex flex-col h-full overflow-hidden">
           <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 mt-1">Quick Styles</h3>
           <div className="overflow-y-auto pr-2 space-y-6 custom-scrollbar flex-grow pb-24">
              {Object.entries(PRESETS).map(([groupName, presets]) => (
                <div key={groupName}>
                  <div className="text-[10px] font-bold text-slate-400 mb-2 uppercase border-b border-gray-100 pb-1">{groupName}</div>
                  <div className="space-y-2">
                    {presets.map((preset) => (
                      <button
                        key={preset.name}
                        title={preset.description}
                        onClick={() => applyPreset(preset.name, preset.vals)}
                        className={`w-full px-3 py-2 rounded-lg border text-left transition-all flex items-center justify-between group relative ${
                          activePreset === preset.name 
                          ? 'border-yellow-500 bg-yellow-50 text-slate-900 shadow-sm' 
                          : 'border-gray-200 bg-white text-slate-600 hover:bg-gray-50'
                        }`}
                      >
                          <span className="text-xs font-semibold truncate">{preset.name}</span>
                          {activePreset === preset.name && <Check size={12} className="text-yellow-600 flex-shrink-0" />}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
           </div>
        </div>

        <div className="min-[700px]:col-span-3 pl-6 border-l border-gray-200 flex flex-col h-full overflow-hidden">
           <div className="mb-4 pb-4 border-b border-gray-200 flex-shrink-0">
             <div className="flex items-center justify-between mb-1">
               <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mt-1">
                 {activePreset ? `Active: ${activePreset}` : "Custom Configuration"}
               </h3>
               <span className="text-[10px] text-slate-400 bg-white px-2 py-1 rounded border border-gray-200">v1.3 Specs</span>
             </div>
             <p className="text-xs text-slate-500">
               {activePreset ? getPresetDescription(activePreset) : "Manually adjust the sliders below to define your own style taxonomy."}
             </p>
           </div>

           <div className="flex-grow overflow-y-auto pr-2 pb-24">
             <div className="flex items-center gap-2 mb-4">
                <div className="p-1.5 bg-slate-200 text-slate-700 rounded-md"><Sliders size={16} /></div>
                <h3 className="text-sm font-bold text-slate-800">Fine Tuning</h3>
             </div>
             
             <div className="space-y-1 pb-4">
                <TaxonomySlider axisKey="density" value={controls.density} onChange={(v) => handleSliderChange('density', v)} />
                <TaxonomySlider axisKey="typography" value={controls.typography} onChange={(v) => handleSliderChange('typography', v)} />
                <TaxonomySlider axisKey="surrealism" value={controls.surrealism} onChange={(v) => handleSliderChange('surrealism', v)} />
                <TaxonomySlider axisKey="humanism" value={controls.humanism} onChange={(v) => handleSliderChange('humanism', v)} />
             </div>
           </div>
        </div>
      </div>

      <FooterControls>
        <button onClick={() => setStep(2)} className="text-slate-500 hover:text-slate-800 text-sm font-medium px-4">Back</button>
        <button 
          onClick={() => setStep(4)}
          className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2 px-6 rounded-full flex items-center gap-2 text-sm shadow-sm"
        >
          Review <ChevronRight size={16} />
        </button>
      </FooterControls>
    </div>
  );

  const renderStep4 = () => (
    <div className="animate-in fade-in slide-in-from-right-4 duration-300 pb-20">
      <section className="bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-lg">
           <h2 className="text-sm font-bold text-slate-800">Final Prompt</h2>
           <span className="text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium border border-green-200">Ready to Generate</span>
        </div>
        <textarea 
          value={generatedPrompt}
          onChange={(e) => setGeneratedPrompt(e.target.value)}
          className="w-full h-80 bg-white text-slate-600 font-mono text-xs p-4 focus:outline-none leading-relaxed resize-none rounded-b-xl"
        />
      </section>

      <FooterControls>
        <button onClick={() => setStep(3)} className="text-slate-500 hover:text-slate-800 text-sm font-medium px-4">Back</button>
        <button 
          onClick={handleGenerate}
          className="bg-yellow-500 hover:bg-yellow-400 text-white font-bold py-3 px-8 rounded-full flex items-center gap-2 shadow-lg shadow-yellow-500/20 transform hover:-translate-y-0.5 transition-all text-sm"
        >
          {isGenerating ? (
            <>Working... <Loader2 size={16} className="animate-spin" /></>
          ) : (
            <>Generate Assets <Wand2 size={16} /></>
          )}
        </button>
      </FooterControls>
    </div>
  );

  const renderStep5 = () => (
    <div className="animate-in fade-in zoom-in-95 duration-300 relative pb-20">
       <div className="flex justify-between items-end mb-6 border-b border-gray-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Generated Assets</h2>
            <p className="text-slate-500 text-xs">Ready for download</p>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={handleCopyPrompt}
              className={`border border-gray-200 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors ${copied ? 'text-green-600 bg-green-50 border-green-200' : 'text-slate-600 hover:bg-gray-50'}`}
            >
              {copied ? <ClipboardCheck size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy Prompt'}
            </button>
            <button 
              onClick={() => setStep(4)} 
              className="border border-gray-200 text-slate-600 hover:bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-medium transition-colors"
            >
              <Edit2 size={14} /> Edit Prompt
            </button>
            <button 
              onClick={handleGenerate}
              className="bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold transition-colors shadow-sm"
            >
              <RefreshCw size={14} /> Refresh All
            </button>
          </div>
       </div>

       <div className="grid grid-cols-2 gap-6">
          {results.map((res, i) => (
            <ResultCard 
              key={res.id} 
              id={res.id}
              type={res.type} 
              color={i % 2 === 0 ? 'dark' : 'light'} 
              onExpand={(id) => setExpandedImageId(id)}
              onRegenerate={handleSingleRegenerate}
              isRegenerating={regeneratingIds.includes(res.id)}
            />
          ))}
       </div>

       {expandedImageId && (
         <div className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-10 animate-in fade-in duration-200">
           <button 
             onClick={() => setExpandedImageId(null)}
             className="absolute top-5 right-5 text-white/50 hover:text-white transition-colors"
           >
             <XCircle size={32} strokeWidth={1.5} />
           </button>
           <div className="w-full max-w-4xl aspect-video bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-2xl border border-white/10">
              <Wand2 size={64} className="text-yellow-500/50" />
           </div>
         </div>
       )}
    </div>
  );

  // --- Main Render ---
  return (
    <div className="min-h-screen bg-gray-50 text-slate-900 font-sans selection:bg-yellow-200 selection:text-slate-900 flex flex-col">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm h-14">
        <div className="max-w-5xl mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="font-bold text-lg tracking-tight text-slate-900">Brand Generator</h1>
          </div>
          
          <div className="flex items-center gap-1 text-[10px] font-medium text-slate-400 bg-gray-50 p-1 rounded-full border border-gray-100">
            {[
              {id: 1, label: "Input"},
              {id: 2, label: "Define"},
              {id: 3, label: "Stylize"},
              {id: 4, label: "Export"}
            ].map((s, i) => (
              <React.Fragment key={s.id}>
                <button 
                  onClick={() => s.id < step && setStep(s.id)}
                  disabled={s.id >= step}
                  className={`px-2 py-0.5 rounded-full transition-all ${
                    step === s.id 
                      ? 'bg-white text-yellow-600 shadow-sm border border-gray-100 font-bold' 
                      : step > s.id 
                        ? 'text-slate-600 hover:bg-gray-100 hover:text-slate-900 cursor-pointer' 
                        : 'opacity-50 cursor-default'
                  }`}
                >
                  {s.label}
                </button>
                {i < 3 && <ChevronRight size={10} className="text-gray-300" />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-6 flex-grow w-full">
        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}
        {step === 4 && renderStep4()}
        {step === 5 && renderStep5()}
      </main>
    </div>
  );
}
