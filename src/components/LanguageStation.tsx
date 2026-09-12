import React, { useState } from 'react';
import { Languages, Volume2, Check, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageCode } from '../types';
import { SUPPORTED_LANGUAGES, I18N_PROMPTS } from '../data/mockTemplates';
import { speakPrompt } from '../utils/speech';

interface LanguageStationProps {
  currentLanguage: LanguageCode;
  onSelectLanguage: (lang: LanguageCode) => void;
  audioMuted: boolean;
}

export const LanguageStation: React.FC<LanguageStationProps> = ({
  currentLanguage,
  onSelectLanguage,
  audioMuted,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const activeLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleAudioSample = (e: React.MouseEvent, lang: LanguageCode) => {
    e.stopPropagation();
    if (audioMuted) return;
    const sampleText =
      I18N_PROMPTS[lang]?.welcome ||
      'Welcome to MediKiosk. Please record your clinical symptoms.';
    speakPrompt(sampleText, lang);
  };

  return (
    <section className="bg-[#FAF8F5] border border-[#E7E1D6] rounded-2xl p-3.5 sm:p-4 shadow-sm transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Title & Active indicator */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#EFE9DF] text-[#4A6753] border border-[#DDD3C4] flex items-center justify-center flex-shrink-0">
            <Languages className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wider font-bold text-[#8C7B6C]">
                Language Station / भाषा केंद्र
              </span>
              <span className="text-[10px] bg-[#EAE3D6] text-[#594B3F] font-semibold px-2 py-0.5 rounded-full border border-[#DCD3C5]">
                Multilingual Speech & Touch
              </span>
            </div>
            <p className="text-sm font-semibold text-[#2D2621] mt-0.5 flex items-center gap-2">
              <span>Active Intake Language:</span>
              <span className="text-[#4A6753] font-bold underline decoration-dotted">
                {activeLangObj.nativeLabel}
              </span>
            </p>
          </div>
        </div>

        {/* Quick toggle or expand trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            id="toggle-language-station-btn"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#F0EAE1] hover:bg-[#E8E1D6] text-[#4E4238] border border-[#DED4C7] text-xs font-semibold transition-colors shadow-xs"
          >
            <span>{isExpanded ? 'Hide All Languages' : 'All 7 Indian Languages'}</span>
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Language Selection Grid */}
      <div className={`mt-3 pt-3 border-t border-[#EAE3D6] ${isExpanded ? 'block' : 'hidden sm:block'}`}>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          {SUPPORTED_LANGUAGES.map((lang) => {
            const isSelected = currentLanguage === lang.code;

            return (
              <div
                key={lang.code}
                onClick={() => onSelectLanguage(lang.code)}
                id={`lang-station-pill-${lang.code}`}
                className={`relative group p-2.5 rounded-xl border text-left cursor-pointer transition-all select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-[#FFFFFF] border-[#4A6753] shadow-sm ring-2 ring-[#4A6753]/20'
                    : 'bg-[#FDFBF7] hover:bg-[#FFFFFF] border-[#E5DFD5] hover:border-[#CFC4B5]'
                }`}
              >
                <div className="flex items-start justify-between">
                  <span className="text-sm sm:text-base font-bold text-[#2D2621] tracking-tight">
                    {lang.nativeLabel}
                  </span>
                  {isSelected ? (
                    <span className="w-4 h-4 rounded-full bg-[#4A6753] text-white flex items-center justify-center flex-shrink-0">
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={(e) => handleAudioSample(e, lang.code)}
                      title={`Listen in ${lang.nativeLabel}`}
                      className="opacity-60 hover:opacity-100 p-0.5 rounded text-[#7C6E61] hover:text-[#4A6753]"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                <div className="mt-1 flex items-center justify-between text-[11px] text-[#7A6C5F]">
                  <span className="font-semibold text-xs text-[#55473B]">{lang.nativeLabel}</span>
                  {lang.code === 'en' && (
                    <span className="text-[9px] bg-[#EAE3D6] text-[#55473B] px-1 rounded font-bold">
                      Default
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
