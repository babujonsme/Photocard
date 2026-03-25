import React, { useState, useRef, useEffect } from 'react';
import { toPng } from 'html-to-image';
import { Upload, Download, Image as ImageIcon, Move, Settings2, Trash2, Edit3, MapPin, Type, SlidersHorizontal } from 'lucide-react';

export default function App() {
  const [template, setTemplate] = useState<string>('https://i.imgur.com/qrNbdji.png');
  const [photo, setPhoto] = useState<string | null>(null);
  
  // Text states
  const [locationName, setLocationName] = useState('পটুয়াখালী');
  const [headline, setHeadline] = useState('কলাপাড়ায় উন্নত বীজ ও আধুনিক কৃষি প্রযুক্তি নিয়ে মাঠ দিবস অনুষ্ঠিত');
  const [locationHistory, setLocationHistory] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('newsCardLocationHistory');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          return [];
        }
      }
    }
    return ['পটুয়াখালী', 'ঢাকা', 'বরিশাল', 'খুলনা', 'রাজশাহী', 'চট্টগ্রাম', 'সিলেট', 'রংপুর', 'ময়মনসিংহ'];
  });

  useEffect(() => {
    localStorage.setItem('newsCardLocationHistory', JSON.stringify(locationHistory));
  }, [locationHistory]);

  const handleLocationBlur = () => {
    const trimmed = locationName.trim();
    if (trimmed && !locationHistory.includes(trimmed)) {
      setLocationHistory(prev => [trimmed, ...prev].slice(0, 20));
    }
  };
  
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
  const [isPinchingText, setIsPinchingText] = useState(false);
  const textPinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const [isDraggingPhoto, setIsDraggingPhoto] = useState(false);
  const [isPinchingPhoto, setIsPinchingPhoto] = useState(false);
  const photoPinchRef = useRef<{ dist: number; scale: number } | null>(null);

  const handleTextMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingText(true);
  };

  const handleTextTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      textPinchRef.current = { dist, scale: textScale };
      setIsDraggingText(false);
      setIsPinchingText(true);
    } else if (e.touches.length === 1) {
      setIsDraggingText(true);
      setIsPinchingText(false);
      textPinchRef.current = null;
    }
  };

  const handleTextWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -5 : 5;
    setTextScale(prev => Math.max(50, Math.min(200, prev + delta)));
  };

  const handlePhotoMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingPhoto(true);
  };

  const handlePhotoTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      photoPinchRef.current = { dist, scale: photoScale };
      setIsDraggingPhoto(false);
      setIsPinchingPhoto(true);
    } else if (e.touches.length === 1) {
      setIsDraggingPhoto(true);
      setIsPinchingPhoto(false);
      photoPinchRef.current = null;
    }
  };

  const handlePhotoWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const delta = e.deltaY > 0 ? -5 : 5;
    setPhotoScale(prev => Math.max(10, Math.min(300, prev + delta)));
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      
      if (isDraggingText) {
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        setTextX(Math.round(Math.max(0, Math.min(100, x))));
        setTextY(Math.round(Math.max(0, Math.min(100, y))));
      } else if (isDraggingPhoto) {
        let x = ((e.clientX - rect.left) / rect.width) * 100;
        let y = ((e.clientY - rect.top) / rect.height) * 100;
        setPhotoX(Math.round(Math.max(0, Math.min(100, x))));
        setPhotoY(Math.round(Math.max(0, Math.min(100, y))));
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!cardRef.current) return;
      
      if (isPinchingText && e.touches.length === 2 && textPinchRef.current) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = dist / textPinchRef.current.dist;
        const newScale = Math.max(50, Math.min(200, textPinchRef.current.scale * scaleFactor));
        setTextScale(Math.round(newScale));
        return;
      }
      
      if (isPinchingPhoto && e.touches.length === 2 && photoPinchRef.current) {
        e.preventDefault();
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const scaleFactor = dist / photoPinchRef.current.dist;
        const newScale = Math.max(10, Math.min(300, photoPinchRef.current.scale * scaleFactor));
        setPhotoScale(Math.round(newScale));
        return;
      }

      if (e.touches.length === 1) {
        const rect = cardRef.current.getBoundingClientRect();
        let x = ((e.touches[0].clientX - rect.left) / rect.width) * 100;
        let y = ((e.touches[0].clientY - rect.top) / rect.height) * 100;
        
        if (isDraggingText) {
          e.preventDefault();
          setTextX(Math.round(Math.max(0, Math.min(100, x))));
          setTextY(Math.round(Math.max(0, Math.min(100, y))));
        } else if (isDraggingPhoto) {
          e.preventDefault();
          setPhotoX(Math.round(Math.max(0, Math.min(100, x))));
          setPhotoY(Math.round(Math.max(0, Math.min(100, y))));
        }
      }
    };

    const handleEnd = () => {
      setIsDraggingText(false);
      setIsDraggingPhoto(false);
      setIsPinchingText(false);
      setIsPinchingPhoto(false);
      textPinchRef.current = null;
      photoPinchRef.current = null;
    };

    const isActive = isDraggingText || isDraggingPhoto || isPinchingText || isPinchingPhoto;

    if (isActive) {
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
  }, [isDraggingText, isDraggingPhoto, isPinchingText, isPinchingPhoto]);

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

  const handleTemplateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setTemplate(reader.result as string);
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

  const DownloadButton = ({ className = "" }: { className?: string }) => (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={`w-full max-w-[540px] py-4 px-6 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-2xl font-bold text-lg shadow-xl shadow-red-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed border border-red-500/50 ${className}`}
    >
      {isDownloading ? (
        <>
          <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
          <span>ডাউনলোড হচ্ছে...</span>
        </>
      ) : (
        <>
          <Download size={24} className="animate-bounce-subtle" />
          <span>ফাইনাল কার্ড ডাউনলোড করুন</span>
        </>
      )}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-8 px-4 sm:px-6 lg:px-8 font-sans selection:bg-red-100 selection:text-red-900">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-10 space-y-3">
          <div className="inline-block">
            <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
              দৈনিক কাগজের ডাক
            </h1>
            <div className="h-1.5 w-1/2 bg-red-600 mx-auto mt-4 rounded-full"></div>
          </div>
          <p className="text-slate-500 font-medium text-sm md:text-base">
            তৈরিতে: <span className="text-slate-700 font-semibold">মোঃ আল আমিন বাবু</span> (কালের কণ্ঠ)
          </p>
        </div>

        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Section 1: Text Inputs (Mobile: 1st, Desktop: Left Column Top) */}
          <div className="order-1 lg:order-none lg:col-span-5 lg:col-start-1 lg:row-start-1 w-full space-y-8 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200/60 relative overflow-hidden">
            
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-red-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

            {/* Section 1: Text Inputs */}
            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="bg-red-100 p-2 rounded-lg text-red-600">
                  <Edit3 size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">১. লেখা পরিবর্তন করুন</h3>
              </div>
              
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <MapPin size={14} className="text-slate-400" />
                    স্থান <span className="text-slate-400 text-xs font-normal">(তারিখ অটোমেটিক)</span>
                  </label>
                  <input 
                    type="text" 
                    list="location-history"
                    value={locationName} 
                    onChange={(e) => setLocationName(e.target.value)} 
                    onBlur={handleLocationBlur}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all" 
                    placeholder="স্থানের নাম লিখুন"
                  />
                  <datalist id="location-history">
                    {locationHistory.map((loc, idx) => (
                      <option key={idx} value={loc} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-1.5">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700">
                    <Type size={14} className="text-slate-400" />
                    প্রধান শিরোনাম
                  </label>
                  <textarea 
                    value={headline} 
                    onChange={(e) => setHeadline(e.target.value)} 
                    rows={3}
                    className="w-full px-4 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none transition-all resize-none" 
                    placeholder="প্রধান শিরোনাম লিখুন"
                  />
                </div>
              </div>

              {/* Text Adjustments */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <Settings2 className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">শিরোনামের পজিশন ও সাইজ</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                      <span>সাইজ (Scale)</span>
                      <span className="bg-white px-2 py-0.5 rounded text-slate-800 shadow-sm border border-slate-100">{textScale}%</span>
                    </label>
                    <input type="range" min="50" max="200" value={textScale} onChange={(e) => setTextScale(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                        <span>ডানে/বামে (X)</span>
                      </label>
                      <input type="range" min="0" max="100" value={textX} onChange={(e) => setTextX(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                    </div>
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                        <span>উপরে/নিচে (Y)</span>
                      </label>
                      <input type="range" min="0" max="100" value={textY} onChange={(e) => setTextY(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-red-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          {/* Section 2: Image Upload (Mobile: 3rd, Desktop: Left Column Bottom) */}
          <div className="order-3 lg:order-none lg:col-span-5 lg:col-start-1 lg:row-start-2 w-full space-y-8 bg-white/80 backdrop-blur-xl p-6 md:p-8 rounded-3xl shadow-xl border border-slate-200/60 relative overflow-hidden">
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-60 pointer-events-none"></div>

            <div className="space-y-5 relative z-10">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                  <ImageIcon size={18} />
                </div>
                <h3 className="text-lg font-bold text-slate-800">২. মূল ছবি</h3>
              </div>
              
              <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-2xl hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all duration-200 ease-in-out">
                <div className="bg-white p-3 rounded-full shadow-sm group-hover:scale-110 transition-transform duration-200 mb-3">
                  <Upload className="w-5 h-5 text-blue-500" />
                </div>
                <span className="text-sm text-slate-600 font-medium group-hover:text-blue-600 transition-colors">ক্লিক করে ছবি আপলোড করুন</span>
                <span className="text-xs text-slate-400 mt-1">PNG, JPG (Max 5MB)</span>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
              </label>

              {/* Photo Adjustments */}
              <div className="bg-slate-50/80 p-5 rounded-2xl border border-slate-100 space-y-5">
                <div className="flex items-center gap-2 mb-1">
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <h4 className="text-sm font-semibold text-slate-700">ছবি পজিশন ও সাইজ</h4>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                      <span>জুম (Scale)</span>
                      <span className="bg-white px-2 py-0.5 rounded text-slate-800 shadow-sm border border-slate-100">{photoScale}%</span>
                    </label>
                    <input type="range" min="10" max="300" value={photoScale} onChange={(e) => setPhotoScale(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                        <span>ডানে/বামে (X)</span>
                      </label>
                      <input type="range" min="0" max="100" value={photoX} onChange={(e) => setPhotoX(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                    <div>
                      <label className="flex justify-between text-xs font-medium text-slate-600 mb-2">
                        <span>উপরে/নিচে (Y)</span>
                      </label>
                      <input type="range" min="0" max="100" value={photoY} onChange={(e) => setPhotoY(Number(e.target.value))} className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Section (Mobile: 2nd, Desktop: Right Column) */}
          <div className="order-2 lg:order-none lg:col-span-7 lg:col-start-6 lg:row-start-1 lg:row-span-2 w-full flex flex-col items-center lg:sticky lg:top-8 h-fit z-10">
            <div className="w-full max-w-[540px] relative shadow-2xl shadow-slate-200/50 rounded-2xl overflow-hidden border border-slate-200/60 bg-white ring-1 ring-slate-900/5">
              
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
                    className="absolute z-0 max-w-none cursor-move pointer-events-auto"
                    style={{
                      width: `${photoScale}%`,
                      height: 'auto',
                      left: `${photoX}%`,
                      top: `${photoY}%`,
                      transform: 'translate(-50%, -50%)',
                      touchAction: 'none'
                    }}
                    crossOrigin="anonymous"
                    onMouseDown={handlePhotoMouseDown}
                    onTouchStart={handlePhotoTouchStart}
                    onWheel={handlePhotoWheel}
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

            {/* Desktop Download Button */}
            <DownloadButton className="hidden lg:flex mt-8" />
          </div>

          {/* Mobile Download Button */}
          <div className="order-4 lg:hidden w-full flex justify-center mt-2">
            <DownloadButton />
          </div>

        </div>
      </div>
    </div>
  );
}
