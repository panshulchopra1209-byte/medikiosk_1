import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Mic,
  MicOff,
  X,
  Sparkles,
  ChevronDown,
  Building2,
  CheckCircle2,
  AlertCircle,
  BedDouble,
} from 'lucide-react';
import { HospitalFacilityInfo, LanguageCode } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { LocationSelectorModal } from './LocationSelectorModal';

interface ClinicalSearchBarWithLocationProps {
  inputText: string;
  setInputText: (text: string) => void;
  onSubmit: (text: string) => void;
  isListening: boolean;
  onToggleVoice: () => void;
  hospitalFacility: HospitalFacilityInfo;
  onSelectFacility: (facility: HospitalFacilityInfo) => void;
  selectedDepartment: string;
  onSelectDepartment: (deptName: string, isAyush: boolean) => void;
  language: LanguageCode;
  suggestedPresets?: Array<{ id: string; label: string; redFlagPotential?: boolean }>;
  isLoading?: boolean;
}

export const ClinicalSearchBarWithLocation: React.FC<ClinicalSearchBarWithLocationProps> = ({
  inputText,
  setInputText,
  onSubmit,
  isListening,
  onToggleVoice,
  hospitalFacility,
  onSelectFacility,
  selectedDepartment,
  onSelectDepartment,
  language,
  suggestedPresets = [],
  isLoading = false,
}) => {
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const dict = getTranslation(language);

  const vacantBedsCount = hospitalFacility.bedInventory.reduce(
    (acc, b) => acc + b.available,
    0
  );

  // Filter matching presets for dropdown auto-complete
  const matchingPresets = suggestedPresets.filter((p) =>
    p.label.toLowerCase().includes(inputText.toLowerCase().trim())
  );

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleFormSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    onSubmit(inputText.trim());
    setShowDropdown(false);
  };

  const handleSelectPreset = (label: string) => {
    setInputText(label);
    onSubmit(label);
    setShowDropdown(false);
  };

  return (
    <>
      <div ref={containerRef} className="relative w-full">
        {/* Main Combined Search & Location Unit */}
        <div
          className={`w-full rounded-2xl bg-[#FFFFFF] transition-all duration-200 border-2 shadow-sm ${
            isListening
              ? 'border-[#BA3C2A] ring-4 ring-[#BA3C2A]/20 bg-[#FAEEEA]'
              : isFocused
              ? 'border-[#3E5B47] ring-4 ring-[#3E5B47]/15 shadow-md'
              : 'border-[#D8CEBE] hover:border-[#3E5B47]/80 hover:shadow-xs'
          }`}
        >
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center divide-y lg:divide-y-0 lg:divide-x divide-[#E7E1D6]">
            {/* 1. SEARCH BAR SECTION (LEFT / CENTER) */}
            <div className="flex-1 flex items-center p-2.5 sm:p-3 gap-2.5 min-w-0">
              {/* Search Icon */}
              <div
                className={`p-2 rounded-xl flex-shrink-0 transition-colors ${
                  isListening
                    ? 'bg-[#BA3C2A] text-white animate-pulse'
                    : 'bg-[#EBF1EC] text-[#3E5B47]'
                }`}
              >
                <Search className="w-5 h-5" />
              </div>

              {/* Text Input */}
              <div className="flex-1 relative min-w-0">
                <input
                  ref={inputRef}
                  type="text"
                  id="clinical-symptom-search-bar"
                  value={inputText}
                  onFocus={() => {
                    setIsFocused(true);
                    if (inputText.trim().length > 0) setShowDropdown(true);
                  }}
                  onBlur={() => setIsFocused(false)}
                  onChange={(e) => {
                    setInputText(e.target.value);
                    if (e.target.value.trim().length > 0) {
                      setShowDropdown(true);
                    } else {
                      setShowDropdown(false);
                    }
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleFormSubmit();
                  }}
                  placeholder={
                    isListening
                      ? `${dict.listeningRealTime || 'Listening to voice... speak now'}`
                      : 'Search symptoms, health concerns or complaints (e.g. Chest pain, Fever, Knee stiffness)...'
                  }
                  className={`w-full py-2 sm:py-2.5 px-1 bg-transparent text-sm sm:text-base text-[#1F1914] placeholder:text-[#8C7B6C] focus:outline-none ${
                    inputText.length > 0 ? 'font-semibold' : 'font-normal'
                  }`}
                />

                {/* Clear text (X) button */}
                {inputText.trim().length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setInputText('');
                      setShowDropdown(false);
                      inputRef.current?.focus();
                    }}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-1 text-[#8C7B6C] hover:text-[#2D2621] rounded-md transition-colors"
                    title="Clear input"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Voice Mic Button */}
              <button
                type="button"
                onClick={onToggleVoice}
                id="voice-mic-search-button"
                title={isListening ? 'Stop Voice Recording' : 'Speak Symptoms via Microphone'}
                className={`px-3 sm:px-3.5 py-2.5 rounded-xl flex items-center justify-center gap-1.5 text-xs font-bold transition-all shadow-xs cursor-pointer active:scale-95 flex-shrink-0 ${
                  isListening
                    ? 'bg-[#BA3C2A] text-white animate-pulse ring-2 ring-[#BA3C2A]/30'
                    : 'bg-[#FAF8F5] text-[#3E5B47] hover:bg-[#3E5B47] hover:text-white border border-[#DDD3C4]'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-4 h-4 text-white" />
                    <span className="hidden sm:inline">Stop</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-4 h-4 text-[#3E5B47] group-hover:text-white" />
                    <span className="hidden sm:inline">Speak</span>
                  </>
                )}
              </button>
            </div>

            {/* 2. LOCATION TAB (BESIDE IT!) */}
            <div className="lg:w-80 flex-shrink-0 p-2 sm:p-2.5 flex items-center bg-[#FAF8F5] lg:bg-transparent rounded-b-2xl lg:rounded-b-none">
              <button
                type="button"
                id="location-tab-button"
                onClick={() => setIsLocationModalOpen(true)}
                className="w-full p-2 rounded-xl text-left hover:bg-[#F2ECE4] transition-all flex items-center justify-between gap-2.5 cursor-pointer group border border-transparent hover:border-[#DDD3C4]"
                title="Change Hospital Facility & OPD Wing"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-2 rounded-lg bg-[#EBF1EC] text-[#3E5B47] group-hover:bg-[#3E5B47] group-hover:text-white transition-colors flex-shrink-0">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#7A6C5F]">
                        Location & Wing
                      </span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                    <p className="text-xs sm:text-sm font-bold text-[#2D2621] truncate group-hover:text-[#3E5B47]">
                      {hospitalFacility.district || hospitalFacility.state} • {hospitalFacility.name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-[#647668] truncate">
                      <span className="font-semibold text-[#3E5B47]">
                        {vacantBedsCount} Beds Vacant
                      </span>
                      <span>•</span>
                      <span className="truncate">{selectedDepartment}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center text-[#8C7B6C] group-hover:text-[#3E5B47] flex-shrink-0 pr-1">
                  <ChevronDown className="w-4 h-4" />
                </div>
              </button>
            </div>

            {/* 3. CONSULT / SEARCH ACTION BUTTON */}
            <div className="p-2 sm:p-2.5 flex-shrink-0 flex items-center justify-end">
              <button
                type="button"
                id="consult-ai-search-btn"
                onClick={() => handleFormSubmit()}
                disabled={isLoading}
                className="w-full lg:w-auto px-5 py-3 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>{isLoading ? 'Analyzing...' : 'Consult AI'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Live Suggestions Dropdown (appears under the search bar when typing) */}
        {showDropdown && matchingPresets.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-2 z-40 bg-[#FFFFFF] rounded-2xl border border-[#DDD3C4] shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
            <div className="p-2.5 bg-[#FAF8F5] border-b border-[#E7E1D6] flex items-center justify-between text-xs text-[#7A6C5F]">
              <span className="font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#9E4F36]" />
                Suggested Clinical Complaints:
              </span>
              <span className="text-[11px]">Click to consult immediately</span>
            </div>
            <div className="max-h-60 overflow-y-auto divide-y divide-[#F2ECE4]">
              {matchingPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.label)}
                  className="w-full text-left p-3 hover:bg-[#F7F4EE] transition-colors flex items-center justify-between text-xs sm:text-sm font-medium text-[#2D2621]"
                >
                  <div className="flex items-center gap-2">
                    <Search className="w-3.5 h-3.5 text-[#8C7B6C]" />
                    <span>{preset.label}</span>
                  </div>
                  {preset.redFlagPotential && (
                    <span className="text-[10px] font-bold text-[#BA3C2A] bg-[#FAEEEA] px-2 py-0.5 rounded border border-[#EACEC6]">
                      ⚠️ Critical / Emergency Potential
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interactive Location & Facility Selector Modal */}
      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentFacility={hospitalFacility}
        onSelectFacility={onSelectFacility}
        selectedDepartment={selectedDepartment}
        onSelectDepartment={onSelectDepartment}
        language={language}
      />
    </>
  );
};
