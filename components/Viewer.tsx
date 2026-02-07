import React, { useState, useEffect, useRef } from 'react';
import { formatDataUrl, calculateSize, formatBytes } from '../utils/base64Helper';
import { ImageDetails } from '../types';
import { Copy, Download, Trash2, AlertCircle, Image as ImageIcon, CheckCircle2 } from 'lucide-react';

export const Viewer: React.FC = () => {
  const [input, setInput] = useState('');
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [error, setError] = useState<boolean>(false);
  const [details, setDetails] = useState<ImageDetails | null>(null);
  const [copied, setCopied] = useState(false);
  
  // Ref for the image element to get natural dimensions
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!input) {
      setImgSrc(null);
      setError(false);
      setDetails(null);
      return;
    }

    const formatted = formatDataUrl(input);
    setImgSrc(formatted);
    setError(false); // Reset error until proven otherwise by onError
  }, [input]);

  const handleImageLoad = () => {
    if (imgRef.current && imgSrc) {
      const width = imgRef.current.naturalWidth;
      const height = imgRef.current.naturalHeight;
      const sizeInBytes = calculateSize(imgSrc);
      const mimeMatch = imgSrc.match(/^data:(image\/[a-zA-Z0-9.+]+);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'unknown';

      setDetails({
        width,
        height,
        sizeInBytes,
        mimeType
      });
      setError(false);
    }
  };

  const handleError = () => {
    setError(true);
    setDetails(null);
  };

  const handleCopy = () => {
    if (imgSrc) {
      navigator.clipboard.writeText(imgSrc).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  const handleDownload = () => {
    if (imgSrc && details) {
      const link = document.createElement('a');
      link.href = imgSrc;
      // Extract extension from mime type
      const ext = details.mimeType.split('/')[1] || 'png';
      link.download = `image-${Date.now()}.${ext}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handleClear = () => {
    setInput('');
    setImgSrc(null);
    setDetails(null);
    setError(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
      {/* Left Column: Input */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
            Paste Base64 String
          </label>
          {input && (
            <button 
              onClick={handleClear}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
            >
              <Trash2 size={12} /> Clear
            </button>
          )}
        </div>
        <textarea
          className="flex-1 w-full bg-slate-800/50 border border-slate-700 rounded-xl p-4 text-xs md:text-sm font-mono text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none transition-all placeholder:text-slate-600"
          placeholder="Paste your Base64 string here (with or without 'data:image/...')..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
        />
        <div className="text-xs text-slate-500">
          {input.length > 0 ? `${formatBytes(input.length)} characters` : 'Waiting for input...'}
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex flex-col gap-4 h-full min-h-[400px] lg:min-h-auto">
        <div className="text-sm font-medium text-slate-300">Live Preview</div>
        <div className={`flex-1 rounded-xl border-2 border-dashed transition-all duration-300 relative overflow-hidden flex items-center justify-center
          ${error ? 'border-red-500/50 bg-red-950/10' : imgSrc ? 'border-slate-700 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] bg-slate-800' : 'border-slate-700 bg-slate-800/30'}
        `}>
          
          {!imgSrc && (
            <div className="text-center text-slate-500 p-8">
              <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Image will render here</p>
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 p-8 animate-in fade-in zoom-in duration-300">
              <AlertCircle className="w-12 h-12 mx-auto mb-3" />
              <p className="font-semibold">Invalid Image Data</p>
              <p className="text-xs mt-2 opacity-80">We tried to auto-repair the header but failed. Please check your input string.</p>
            </div>
          )}

          {imgSrc && (
            <img 
              ref={imgRef}
              src={imgSrc} 
              alt="Base64 Render" 
              className={`max-w-full max-h-full object-contain shadow-2xl transition-opacity duration-300 ${error ? 'opacity-0 absolute' : 'opacity-100'}`}
              onLoad={handleImageLoad}
              onError={handleError}
            />
          )}

          {/* Floating Actions Overlay */}
          {imgSrc && !error && details && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-slate-900/90 backdrop-blur-sm p-1.5 rounded-lg border border-slate-700/50 shadow-xl z-10">
              <button 
                onClick={handleCopy}
                className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors relative group"
                title="Copy Base64"
              >
                {copied ? <CheckCircle2 size={20} className="text-green-500" /> : <Copy size={20} />}
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {copied ? 'Copied!' : 'Copy Data URI'}
                </span>
              </button>
              <div className="w-px bg-slate-700 my-1"></div>
              <button 
                onClick={handleDownload}
                className="p-2 hover:bg-slate-700 rounded-md text-slate-300 hover:text-white transition-colors relative group"
                title="Download"
              >
                <Download size={20} />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-black text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Download File
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Metadata Card */}
        {details && !error && (
          <div className="grid grid-cols-3 gap-2 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
            <div className="text-center">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Dimensions</div>
              <div className="font-mono text-sm font-semibold text-slate-200">{details.width} × {details.height}</div>
            </div>
            <div className="text-center border-l border-slate-700/50">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Size</div>
              <div className="font-mono text-sm font-semibold text-slate-200">{formatBytes(details.sizeInBytes)}</div>
            </div>
            <div className="text-center border-l border-slate-700/50">
              <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">Type</div>
              <div className="font-mono text-sm font-semibold text-blue-400">{details.mimeType.split('/')[1].toUpperCase()}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
