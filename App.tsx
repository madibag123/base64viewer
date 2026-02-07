import React, { useState } from 'react';
import { Viewer } from './components/Viewer';
import { Converter } from './components/Converter';
import { Tab } from './types';
import { Eye, ImagePlus, Code2, Github } from 'lucide-react';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIEWER);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col text-slate-100 selection:bg-blue-500/30">
      
      {/* Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-gradient-to-tr from-blue-600 to-indigo-600 p-2 rounded-lg shadow-lg shadow-blue-500/20">
              <Code2 className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">Base64<span className="text-blue-400">Viz</span></h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">Dev Tools</p>
            </div>
          </div>
          
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noreferrer"
            className="text-slate-400 hover:text-white transition-colors"
          >
            <Github size={24} />
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 lg:p-8 flex flex-col">
        
        {/* Tab Switcher */}
        <div className="bg-slate-900/80 p-1.5 rounded-xl self-center flex gap-1 mb-8 shadow-inner shadow-slate-950/50 border border-slate-800">
          <button
            onClick={() => setActiveTab(Tab.VIEWER)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === Tab.VIEWER 
                ? 'bg-slate-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
          >
            <Eye size={18} />
            Viewer
          </button>
          <button
            onClick={() => setActiveTab(Tab.CONVERTER)}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
              ${activeTab === Tab.CONVERTER 
                ? 'bg-slate-800 text-white shadow-lg shadow-black/20 ring-1 ring-white/10' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'}
            `}
          >
            <ImagePlus size={18} />
            Converter
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 lg:p-8 min-h-[600px]">
          {activeTab === Tab.VIEWER ? <Viewer /> : <Converter />}
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-slate-500 text-sm">
            Built with React, Tailwind & TypeScript. Runs entirely in your browser.
          </p>
        </div>
      </footer>

    </div>
  );
};

export default App;
