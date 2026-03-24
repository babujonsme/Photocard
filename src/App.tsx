import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Upload, Download, Image as ImageIcon, Sparkles, Move, Settings2, Trash2 } from 'lucide-react';
import templateImg from './template.png';

export default function App() {
  const template = templateImg;
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Text states
  const [locationName, setLocationName] = useState('পটুয়াখালী');
  const [headline, setHeadline] = useState('কলাপাড়ায় উন্নত বীজ ও আধুনিক কৃষি প্রযুক্তি নিয়ে মাঠ দিবস অনুষ্ঠিত');
  
  // Photo positioning states
  const [photoScale, setPhotoScale] = useState(100);
  const [photoX, setPhotoX] = useState(50);
  const [photoY, setPhotoY] = useState(30); // Default to upper part

  // Text positioning states
  const [textScale, setTextScale] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsCardTextScale');
      return saved ? Number(saved) : 100;
    }
    return 100;
  });
  const [textX, setTextX] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsCardTextX');
      return saved ? Number(saved) : 50;
    }
    return 50;
  });
  const [textY, setTextY] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsCardTextY');
      return saved ? Number(saved) : 82;
    }
    return 82;
  });

  useEffect(() => {
    localStorage.setItem('newsCardTextScale', textScale.toString());
    localStorage.setItem('newsCardTextX', textX.toString());
    localStorage.setItem('newsCardTextY', textY.toString());
  }, [textScale, textX, textY]);

  const [isDraggingText, setIsDraggingText] = useState(false);

  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDraggingText(true);
  };

  const handleTextTouchStart = (e: React.TouchEvent) => {
    setIsDraggingText(true);
  };

  const handleTextWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -5 : 5;
    setTextScale(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!isDraggingText || !cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      let x = ((clientX - rect.left) / rect.width) * 100;
      let y = ((clientY - rect.top) / rect.height) * 100;
      
      x = Math.max(0, Math.min(100, x));
      y = Math.max(0, Math.min(100, y));

      setTextX(Math.round(x));
      setTextY(Math.round(y));
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        e.preventDefault(); // Prevent scrolling while dragging
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleEnd = () => setIsDraggingText(false);

    if (isDraggingText) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleEnd);
      window.addEventListener('touchmove', handleTouchMove, { passive: false });
      window.addEventListener('touchend', handleEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleEnd);
    };
  }, [isDraggingText]);

  const [isDownloading, setIsDownloading] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const getBengaliDate = () => {
    const date = new Date();
    const formatted = date.toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });
    return formatted.replace(',', ''); // e.g., "১৯ মার্চ ২০২৬"
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(cardRef.current, { 
        quality: 1, 
        pixelRatio: 3,
        cacheBust: true,
      });
      const link = document.createElement('a');
      link.download = `NewsCard_${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download image', err);
      alert('কার্ডটি ডাউনলোড করতে সমস্যা হয়েছে।');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center gap-3">
            <Sparkles className="text-red-600" size={28} />
            দৈনিক কাগজের ডাক
          </h1>
          <p className="mt-2 text-gray-600">তৈরিতে: মোঃ আল আমিন বাবু (কালের কণ্ঠ)</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Controls Section */}
          <div className="lg:col-span-5 space-y-6 bg-white p-6 rounded-2xl shadow-sm border border-gray-200 h-fit order-2 lg:order-1">
            
            {/* File Uploads */}
            <div className="grid grid-cols-1 gap-4">
              {/* Photo Upload */}
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">১. মূল ছবি</label>
                <label className="flex flex-col items-center justify-center w-full h-24 border-2 border-dashed border-gray-300 rounded-xl hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-all">
                  <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                  <span className="text-xs text-gray-600 font-medium">ছবি আপলোড করুন</span>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
              </div>
            </div>

            {/* Photo Adjustments */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">ছবি পজিশন ও সাইজ</h3>
              </div>
              
              <div>
                <label className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>জুম (Scale)</span>
                  <span>{photoScale}%</span>
                </label>
                <input type="range" min="10" max="300" value={photoScale} onChange={(e) => setPhotoScale(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>ডানে/বামে (X)</span>
                  </label>
                  <input type="range" min="0" max="100" value={photoX} onChange={(e) => setPhotoX(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>উপরে/নিচে (Y)</span>
                  </label>
                  <input type="range" min="0" max="100" value={photoY} onChange={(e) => setPhotoY(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                </div>
              </div>
            </div>

            {/* Text Inputs */}
            <div className="space-y-4 pt-2">
              <h3 className="text-sm font-semibold text-gray-700 border-b pb-2">২. লেখা পরিবর্তন করুন</h3>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">স্থান (তারিখ অটোমেটিক)</label>
                  <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">প্রধান শিরোনাম</label>
                <input type="text" value={headline} onChange={(e) => setHeadline(e.target.value)} className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none" />
              </div>
            </div>

            {/* Text Adjustments */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-4 mt-6">
              <div className="flex items-center gap-2 mb-2">
                <Settings2 className="w-4 h-4 text-gray-600" />
                <h3 className="text-sm font-semibold text-gray-700">শিরোনামের পজিশন ও সাইজ</h3>
              </div>
              
              <div>
                <label className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                  <span>সাইজ (Scale)</span>
                  <span>{textScale}%</span>
                </label>
                <input type="range" min="50" max="200" value={textScale} onChange={(e) => setTextScale(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>ডানে/বামে (X)</span>
                  </label>
                  <input type="range" min="0" max="100" value={textX} onChange={(e) => setTextX(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                </div>
                <div>
                  <label className="flex justify-between text-xs font-medium text-gray-600 mb-1">
                    <span>উপরে/নিচে (Y)</span>
                  </label>
                  <input type="range" min="0" max="100" value={textY} onChange={(e) => setTextY(Number(e.target.value))} className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                </div>
              </div>
            </div>

          </div>

          {/* Preview Section */}
          <div className="lg:col-span-7 flex flex-col items-center order-1 lg:order-2 lg:sticky lg:top-8 h-fit">
            <div className="w-full max-w-[540px] relative shadow-2xl rounded-lg overflow-hidden border border-gray-200 bg-white">
              
              {/* The Card to be captured */}
              <div 
                ref={cardRef}
                className="relative w-full overflow-hidden bg-gray-100 flex items-center justify-center"
                style={{ aspectRatio: template ? 'auto' : '1080/960' }}
              >
                {/* 1. Base Photo (Bottom Layer) */}
                {photo ? (
                  <img 
                    src={photo} 
                    alt="Uploaded Photo" 
                    className="absolute z-0 max-w-none"
                    style={{
                      width: `${photoScale}%`,
                      height: 'auto',
                      left: `${photoX}%`,
                      top: `${photoY}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                    crossOrigin="anonymous"
                  />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 z-0 bg-gray-200">
                    <ImageIcon size={48} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">ছবি আপলোড করুন</span>
                  </div>
                )}

                {/* 2. Template (Middle Layer) */}
                <img 
                  src={template} 
                  alt="Template" 
                  className="relative z-10 w-full h-auto pointer-events-none"
                  crossOrigin="anonymous"
                />

                {/* 3. Texts (Top Layer) */}
                <div className="absolute inset-0 z-20 pointer-events-none">
                  {/* Top Right Location */}
                  <div className="absolute top-[3%] right-[4%] text-white font-semibold text-[3vw] sm:text-[1.2rem] drop-shadow-md tracking-wide">
                    {locationName} | {getBengaliDate()}
                  </div>
                  
                  {/* Bottom Right Website */}
                  <div className="absolute bottom-[4.5%] right-[4%] text-white font-semibold text-[2vw] sm:text-[0.85rem] drop-shadow-md tracking-wide">
                    dailykagojerdak.com
                  </div>

                  {/* Main Headline Area */}
                  <div 
                    className="absolute w-full text-center px-4 sm:px-10 flex flex-col gap-2 cursor-move pointer-events-auto hover:ring-2 hover:ring-dashed hover:ring-black/50 rounded-lg transition-shadow"
                    style={{
                      left: `${textX}%`,
                      top: `${textY}%`,
                      transform: `translate(-50%, -50%) scale(${textScale / 100})`,
                      touchAction: 'none'
                    }}
                    onMouseDown={handleTextMouseDown}
                    onTouchStart={handleTextTouchStart}
                    onWheel={handleTextWheel}
                  >
                    <h2 className="text-black font-bold text-[5vw] sm:text-[2.2rem] drop-shadow-md leading-[1.4] pointer-events-none break-words whitespace-normal text-center">
                      {headline}
                    </h2>
                  </div>
                </div>
              </div>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              disabled={isDownloading}
              className="mt-8 w-full max-w-[540px] py-4 px-6 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDownloading ? (
                <span className="animate-pulse">ডাউনলোড হচ্ছে...</span>
              ) : (
                <>
                  <Download size={24} />
                  ফাইনাল কার্ড ডাউনলোড করুন
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
