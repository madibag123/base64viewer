import React, { useState, useRef } from 'react';
import { Upload, FileType, CheckCircle2, Copy, X } from 'lucide-react';
import { formatBytes } from '../utils/base64Helper';

export const Converter: React.FC = () => {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = (selectedFile: File) => {
    if (!selectedFile) return;
    
    // Only allow images
    if (!selectedFile.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    setFile(selectedFile);
    setLoading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setResult(e.target.result as string);
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setLoading(false);
      alert("Error reading file");
    };
    reader.readAsDataURL(selectedFile);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleCopy = () => {
    if (result) {
      navigator.clipboard.writeText(result).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const reset = () => {
    setFile(null);
    setResult('');
    setCopied(false);
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {!result ? (
        <div 
          className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-xl transition-all duration-300 cursor-pointer
            ${dragActive ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500 hover:bg-slate-800/50'}
          `}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <input 
            ref={inputRef}
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={handleChange}
          />
          <div className="bg-slate-800 p-4 rounded-full mb-4 shadow-lg">
            <Upload className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-lg font-medium text-slate-200 mb-2">Click or Drop Image Here</p>
          <p className="text-slate-500 text-sm">Supports PNG, JPG, WEBP, GIF, SVG</p>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-4">
          {/* File Info Card */}
          <div className="flex items-center justify-between bg-slate-800/50 p-4 rounded-xl border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500/20 p-2.5 rounded-lg">
                <FileType className="text-blue-400" size={24} />
              </div>
              <div>
                <p className="font-medium text-slate-200">{file?.name}</p>
                <p className="text-xs text-slate-500">{file ? formatBytes(file.size) : ''}</p>
              </div>
            </div>
            <button 
              onClick={reset}
              className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Result Area */}
          <div className="flex-1 relative">
            <textarea 
              readOnly
              value={result}
              className="w-full h-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500/50 resize-none"
            />
            <button 
              onClick={handleCopy}
              className={`absolute top-4 right-4 flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all shadow-lg
                ${copied ? 'bg-green-500 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white'}
              `}
            >
              {copied ? <CheckCircle2 size={16} /> : <Copy size={16} />}
              {copied ? 'Copied' : 'Copy Base64'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
