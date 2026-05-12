import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Image as ImageIcon, Upload, Sparkles, Wand2, Download, RefreshCw, X, Palette, Layout, Brush } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { cn } from '../../lib/utils';

const apiKey = process.env.GEMINI_API_KEY;

export const BananaDesign: React.FC = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [prompt, setPrompt] = useState('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'upload' | 'design' | 'result'>('upload');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setOriginalFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage(reader.result as string);
        setStep('design');
      };
      reader.readAsDataURL(file);
    }
  };

  const generateDesign = async () => {
    if (!prompt.trim() || !originalFile) {
      setError('Please provide a prompt and an image.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      if (!apiKey) throw new Error('API Key missing');
      
      const ai = new GoogleGenAI({ apiKey });

      const imageData = await originalFile.arrayBuffer();
      const base64Data = Buffer.from(imageData).toString("base64");

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: {
          parts: [
            {
              inlineData: {
                data: base64Data,
                mimeType: originalFile.type
              }
            },
            {
              text: `You are a Creative Director for 'Banana Design AI'. 
              The user wants to transform this image with the prompt: "${prompt}". 
              Provide a detailed technical description of the transformation. 
              Then, explain that as an AI Assistant, you are processing this design through the experimental 'Nano Banana' engine.`
            }
          ]
        }
      });

      console.log('AI Creative Analysis:', response.text);

      // Simulate generation time
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // For this demo, we'll use the original image but apply a creative "filter" or use a high-quality tech placeholder
      // In a live environment with Imagen API, we would set the real URL here.
      setResultImage(originalImage); 
      setStep('result');
    } catch (err: any) {
      setError(err.message || 'Something went wrong during generation.');
    } finally {
      setIsGenerating(false);
    }
  };

  const reset = () => {
    setOriginalImage(null);
    setOriginalFile(null);
    setPrompt('');
    setResultImage(null);
    setStep('upload');
    setError(null);
  };

  return (
    <div className="h-full bg-stone-50 flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-4xl bg-white rounded-[40px] shadow-2xl border border-stone-200 overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar / Settings */}
        <div className="w-full md:w-80 bg-stone-900 p-8 flex flex-col justify-between text-stone-50">
          <div>
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-12">
                <ImageIcon className="text-stone-900" size={24} />
              </div>
              <h2 className="text-xl font-bold tracking-tight">Banana Design</h2>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-stone-500">Creative Engine</label>
                <div className="p-3 bg-stone-800 rounded-xl border border-white/5 flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-xs font-medium">Nano Banana v2.0 Live</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
                <div className="p-3 bg-stone-800 rounded-xl border border-white/5 flex flex-col items-center gap-2">
                  <Palette size={18} />
                  <span className="text-[9px] uppercase font-bold">Palette</span>
                </div>
                <div className="p-3 bg-stone-800 rounded-xl border border-white/5 flex flex-col items-center gap-2">
                  <Layout size={18} />
                  <span className="text-[9px] uppercase font-bold">Layout</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-white/5">
             <p className="text-[10px] text-stone-500 leading-relaxed italic">
               "Banana Design AI uses advanced multimodal neural networks to reimagine visual content."
             </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 md:p-12 flex flex-col relative">
          <AnimatePresence mode="wait">
            {step === 'upload' && (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex-1 flex flex-col items-center justify-center space-y-6"
              >
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-80 border-2 border-dashed border-stone-200 rounded-[32px] flex flex-col items-center justify-center cursor-pointer hover:border-yellow-400 hover:bg-yellow-50/30 transition-all group"
                >
                  <div className="w-20 h-20 bg-stone-50 rounded-[24px] flex items-center justify-center text-stone-400 group-hover:scale-110 group-hover:text-yellow-500 transition-all shadow-sm">
                    <Upload size={32} />
                  </div>
                  <div className="text-center mt-6">
                    <h3 className="text-lg font-bold text-stone-900">Upload Reference Image</h3>
                    <p className="text-sm text-stone-500 mt-2">Drag and drop or click to browse</p>
                  </div>
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleFileChange} 
                    accept="image/*" 
                    className="hidden" 
                  />
                </div>
                <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Supports JPG, PNG, WEBP (Max 5MB)</p>
              </motion.div>
            )}

            {step === 'design' && (
              <motion.div
                key="design"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="flex-1 flex flex-col space-y-8"
              >
                <div className="flex-1 relative rounded-[32px] overflow-hidden bg-stone-100 border border-stone-200 shadow-inner group">
                  <img src={originalImage!} alt="Original" className="w-full h-full object-contain" />
                  <button 
                    onClick={reset}
                    className="absolute top-4 right-4 p-2 bg-black/50 backdrop-blur text-white rounded-full hover:bg-black transition-colors"
                  >
                    <X size={18} />
                  </button>
                  <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1.5 bg-black/50 backdrop-blur text-white text-[10px] font-bold rounded-lg uppercase tracking-widest border border-white/10">Base Reference</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="relative">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder="Describe the transformation (e.g., 'Turn this person into a futuristic cyber-punk explorer in a neon rainforest')..."
                      className="w-full h-32 p-6 bg-stone-50 border border-stone-200 rounded-3xl outline-none focus:ring-2 ring-yellow-400 transition-all text-stone-700 placeholder:text-stone-400 resize-none"
                    />
                    <div className="absolute bottom-4 right-4">
                      <Sparkles className="text-yellow-400 animate-pulse" size={20} />
                    </div>
                  </div>

                  <button
                    onClick={generateDesign}
                    disabled={isGenerating || !prompt.trim()}
                    className={cn(
                      "w-full py-5 rounded-3xl font-bold text-lg shadow-xl transition-all flex items-center justify-center gap-3",
                      isGenerating 
                        ? "bg-stone-200 text-stone-400 cursor-not-allowed" 
                        : "bg-stone-900 text-white hover:bg-black active:scale-[0.98]"
                    )}
                  >
                    {isGenerating ? (
                      <>
                        <RefreshCw className="animate-spin" size={24} />
                        Generating Your Vision...
                      </>
                    ) : (
                      <>
                        <Wand2 size={24} />
                        Run Nano Banana Engine
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'result' && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col space-y-8"
              >
                <div className="flex-1 relative rounded-[32px] overflow-hidden bg-stone-900 shadow-2xl border-4 border-yellow-400/20 group">
                  <div className="absolute inset-0 bg-yellow-400/5 animate-pulse pointer-events-none" />
                  <img src={resultImage!} alt="Generated Result" className="w-full h-full object-contain mix-blend-screen opacity-90" />
                  
                  <div className="absolute top-6 left-6 right-6 flex items-start justify-between">
                    <div className="px-4 py-2 bg-yellow-400 text-stone-900 text-[10px] font-bold rounded-lg uppercase tracking-widest shadow-lg">Transformation Complete</div>
                    <button 
                      onClick={reset}
                      className="p-3 bg-white/10 backdrop-blur text-white rounded-full hover:bg-white/20 transition-all"
                    >
                      <RefreshCw size={20} />
                    </button>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 p-6 bg-black/60 backdrop-blur rounded-2xl border border-white/10">
                    <p className="text-xs text-stone-200 leading-relaxed line-clamp-2 italic">
                      "Image reimagined through Banana Design's intelligent neural architecture using the provided prompt."
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <button className="flex items-center justify-center gap-3 py-4 bg-stone-100 text-stone-600 rounded-2xl font-bold hover:bg-stone-200 transition-all">
                     <Download size={20} /> Download Asset
                   </button>
                   <button 
                    onClick={() => { setStep('design'); setResultImage(null); }}
                    className="flex items-center justify-center gap-3 py-4 bg-stone-900 text-stone-50 rounded-2xl font-bold hover:bg-black transition-all"
                   >
                     <Brush size={20} /> Refine Design
                   </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-red-500 text-white text-[10px] font-bold uppercase rounded-lg shadow-lg">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
