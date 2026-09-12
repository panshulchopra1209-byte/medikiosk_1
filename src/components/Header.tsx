import React, { useState, useRef, useEffect } from 'react';
import {
  Activity,
  ShieldCheck,
  Stethoscope,
  Volume2,
  VolumeX,
  Languages,
  AlertCircle,
  Building2,
  BedDouble,
  UserCheck,
  LogIn,
  LogOut,
  ChevronDown,
  User,
  Check,
  Siren,
  X,
  Wifi,
  WifiOff,
  RefreshCw,
  RotateCcw,
  ShieldAlert,
  CheckCircle2,
} from 'lucide-react';
import {
  AppView,
  LanguageCode,
  RedFlagAlert,
  HospitalFacilityInfo,
  HospitalStaffUser,
  PatientIdentity,
} from '../types';
import { SUPPORTED_LANGUAGES } from '../data/mockTemplates';
import { getTranslation } from '../i18n/translations';
import {
  isOperatingOffline,
  getSimulatedOffline,
  setSimulatedOffline,
  getOfflinePendingQueue,
  syncOfflineQueueWithCentralServer,
} from '../utils/offlineEdgeSync';

interface HeaderProps {
  currentView: AppView;
  onViewChange: (view: AppView) => void;
  language: LanguageCode;
  onLanguageChange: (lang: LanguageCode) => void;
  audioMuted: boolean;
  onToggleAudio: () => void;
  activeRedFlag?: RedFlagAlert | null;
  waitingCount: number;
  hospitalFacility: HospitalFacilityInfo;
  staffUser: HospitalStaffUser | null;
  onStaffLogout: () => void;
  loggedInPatient?: PatientIdentity | null;
  onPatientLogout?: () => void;
  onTriggerEmergency?: () => void;
  onConfirmEmergency?: () => void;
  onDismissEmergency?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  language,
  onLanguageChange,
  audioMuted,
  onToggleAudio,
  activeRedFlag,
  waitingCount,
  hospitalFacility,
  staffUser,
  onStaffLogout,
  loggedInPatient,
  onPatientLogout,
  onTriggerEmergency,
  onConfirmEmergency,
  onDismissEmergency,
}) => {
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [edgeMenuOpen, setEdgeMenuOpen] = useState(false);
  const [offlineCount, setOfflineCount] = useState(0);
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const edgeMenuRef = useRef<HTMLDivElement>(null);
  const t = getTranslation(language);
  const currentLangObj =
    SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const totalAvailableBeds = (hospitalFacility.bedInventory || []).reduce(
    (sum, b) => sum + (b.available || 0),
    0
  );

  useEffect(() => {
    const updateNetworkState = () => {
      setIsOfflineMode(isOperatingOffline());
      setOfflineCount(getOfflinePendingQueue().length);
    };

    updateNetworkState();
    window.addEventListener('online', updateNetworkState);
    window.addEventListener('offline', updateNetworkState);
    window.addEventListener('medikiosk-network-changed', updateNetworkState);
    window.addEventListener('medikiosk-offline-queue-changed', updateNetworkState);

    return () => {
      window.removeEventListener('online', updateNetworkState);
      window.removeEventListener('offline', updateNetworkState);
      window.removeEventListener('medikiosk-network-changed', updateNetworkState);
      window.removeEventListener('medikiosk-offline-queue-changed', updateNetworkState);
    };
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (langMenuRef.current && !langMenuRef.current.contains(e.target as Node)) {
        setLangDropdownOpen(false);
      }
      if (edgeMenuRef.current && !edgeMenuRef.current.contains(e.target as Node)) {
        setEdgeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  const hasActiveSession = Boolean(staffUser || loggedInPatient?.fullName);

  const handleLogoutClick = () => {
    if (staffUser) {
      onStaffLogout();
    }
    if (loggedInPatient && onPatientLogout) {
      onPatientLogout();
    }
    onViewChange('auth');
  };

  return (
    <header className="bg-[#FAF8F5] text-[#2D2621] border-b border-[#E8E2D8] sticky top-0 z-50 shadow-[0_2px_12px_rgba(45,38,33,0.04)]">
      {/* Top emergency priority alert banner if red flag detected */}
      {activeRedFlag && activeRedFlag.isEmergency && (
        <div
          id="header-emergency-alert"
          className="bg-[#BA3C2A] text-white px-4 py-2 flex items-center justify-between text-xs sm:text-sm font-semibold shadow-inner transition-all animate-fadeIn"
        >
          <div className="flex items-center gap-2 w-full px-4 sm:px-6 lg:px-8 xl:px-10">
            <AlertCircle className="w-5 h-5 flex-shrink-0 animate-pulse text-amber-200" />
            <span className="font-medium">
              <strong className="tracking-wide">{t.emergencyAlertTitle}:</strong>{' '}
              {activeRedFlag.reason} — {activeRedFlag.recommendedAction}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 ml-2 flex-wrap">
            <span className="bg-white text-[#BA3C2A] px-2.5 py-0.5 rounded-full text-xs uppercase font-extrabold tracking-wider shadow-xs">
              {t.triageRed}
            </span>
            {!activeRedFlag.isConfirmed && onConfirmEmergency && (
              <button
                type="button"
                id="header-confirm-emergency-banner-btn"
                onClick={onConfirmEmergency}
                className="px-3 py-1 bg-white hover:bg-[#FDF2F0] text-[#BA3C2A] rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all animate-pulse"
                title="Confirm Emergency Situation and Dispatch Rapid Response Team"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-[#BA3C2A]" />
                <span>{language === 'hi' ? 'आपातकाल की पुष्टि करें' : 'Confirm Emergency'}</span>
              </button>
            )}
            {activeRedFlag.isConfirmed && (
              <span className="bg-[#2D6A4F] text-white px-2.5 py-0.5 rounded-lg text-xs font-black uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-[#A3D9B8]" />
                <span>CONFIRMED</span>
              </span>
            )}
            {onDismissEmergency && (
              <button
                type="button"
                id="header-revert-emergency-banner-btn"
                onClick={onDismissEmergency}
                className="px-3 py-1 bg-white/20 hover:bg-white/30 text-white border border-white/60 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                title="Convert Emergency Back to Normal Routine OPD Triage"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'सामान्य में बदलें' : 'Convert to Normal'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Main Header Container */}
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-2.5 sm:py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Left Brand & Hospital Identity */}
        <div className="flex items-center gap-3">
          <button
            id="brand-home-btn"
            onClick={() => onViewChange(staffUser ? 'staff_portal' : 'kiosk')}
            className="w-10 h-10 rounded-2xl bg-[#3E5B47] text-[#FAF8F5] flex items-center justify-center shadow-md shadow-[#3E5B47]/20 ring-2 ring-[#3E5B47]/20 hover:bg-[#304737] hover:scale-105 active:scale-95 transition-all"
            title={t.navKiosk}
          >
            <Activity className="w-5 h-5 stroke-[2.2]" />
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span
                onClick={() => onViewChange(staffUser ? 'staff_portal' : 'kiosk')}
                className="text-base sm:text-lg font-bold font-heading tracking-tight text-[#1E1915] cursor-pointer hover:text-[#3E5B47] transition-colors"
              >
                {t.appName}
              </span>
              <span className="text-[10px] sm:text-[11px] px-2 py-0.5 rounded-full bg-[#EFE9DF] text-[#3E5B47] border border-[#DDD3C4] font-bold tracking-wide">
                {t.appBadge}
              </span>
              <span className="hidden lg:inline-flex items-center gap-1 text-[10px] bg-[#E9E4DC] text-[#55473B] px-2 py-0.5 rounded-md border border-[#D8CFC3]">
                <ShieldCheck className="w-3 h-3 text-[#3E5B47]" />
                <span>{t.complianceBadge}</span>
              </span>
            </div>
            <p className="text-xs text-[#75675B] flex items-center gap-1.5 mt-0.5 flex-wrap">
              <Building2 className="w-3.5 h-3.5 text-[#8C7B6C] flex-shrink-0" />
              <span className="font-semibold truncate max-w-[180px] sm:max-w-[280px]">
                {hospitalFacility.name || t.hospitalDefaultName}
              </span>
              <span className="text-[#C4B7A9]">•</span>
              <span className="text-[#3E5B47] font-bold flex items-center gap-1 bg-[#EBF1EC] px-1.5 py-0.2 rounded text-[11px] border border-[#D5E2D7]">
                <BedDouble className="w-3 h-3" /> {totalAvailableBeds} {t.bedsVacantLabel}
              </span>
            </p>
          </div>
        </div>

        {/* Center: Core Clinical Navigation Tabs */}
        <nav
          aria-label="Clinical Navigation"
          className="flex items-center bg-[#EFECE6] p-1 rounded-2xl border border-[#DED6CA] gap-1 shadow-xs"
        >
          {/* Tab 1: Patient Kiosk - Strictly hidden when hospital staff is logged in */}
          {!staffUser && (
            <button
              id="nav-kiosk-btn"
              onClick={() => onViewChange('kiosk')}
              className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 border ${
                currentView === 'kiosk'
                  ? 'bg-[#FFFFFF] text-[#1E1915] font-extrabold shadow-md border-[#D5CCC0] ring-1 ring-[#3E5B47]/20'
                  : 'text-[#6C5E52] font-semibold border-transparent hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F] hover:border-[#C4B7A7]'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-[#3E5B47]" />
              <span>{t.navKiosk}</span>
            </button>
          )}

          {/* Tab 2: Physician OPD Room */}
          <button
            id="nav-physician-btn"
            onClick={() => onViewChange('physician')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 border relative ${
              currentView === 'physician'
                ? 'bg-[#FFFFFF] text-[#1E1915] font-extrabold shadow-md border-[#D5CCC0] ring-1 ring-[#8C5D39]/20'
                : 'text-[#6C5E52] font-semibold border-transparent hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F] hover:border-[#C4B7A7]'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-[#8C5D39]" />
            <span>{t.navPhysician}</span>
            {waitingCount > 0 && (
              <span className="bg-[#BA3C2A] text-white font-extrabold px-1.5 py-0.2 text-[10px] rounded-full shadow-xs">
                {waitingCount}
              </span>
            )}
          </button>

          {/* Tab 3: Hospital Staff & Bed Portal */}
          <button
            id="nav-staff-btn"
            onClick={() => onViewChange('staff_portal')}
            className={`px-3 py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 border ${
              currentView === 'staff_portal'
                ? 'bg-[#FFFFFF] text-[#1E1915] font-extrabold shadow-md border-[#D5CCC0] ring-1 ring-[#3E5B47]/20'
                : 'text-[#6C5E52] font-semibold border-transparent hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F] hover:border-[#C4B7A7]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#55473B]" />
            <span>{t.navStaff}</span>
            {staffUser && (
              <span
                className="w-2 h-2 rounded-full bg-[#3E5B47] animate-pulse"
                title="Staff Session Active"
              />
            )}
          </button>
        </nav>

        {/* Top Right Corner Controls: Language, Audio, and Distinct Login/Register + Logout Tabs */}
        <div className="flex items-center gap-2">
          {/* Persistent High-Contrast Emergency Triage Trigger or Revert to Normal button */}
          {activeRedFlag && activeRedFlag.isEmergency ? (
            <div className="flex items-center gap-1.5">
              {!activeRedFlag.isConfirmed && onConfirmEmergency && (
                <button
                  type="button"
                  id="header-persistent-confirm-btn"
                  onClick={onConfirmEmergency}
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#BA3C2A] hover:bg-[#9B2F20] text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#E7A196] animate-pulse"
                  title="Confirm Emergency Situation and Alert Casualty"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span className="hidden md:inline tracking-wider">
                    {language === 'hi' ? 'पुष्टि करें' : 'CONFIRM EMERGENCY'}
                  </span>
                </button>
              )}
              {activeRedFlag.isConfirmed && (
                <div
                  id="header-persistent-confirmed-badge"
                  className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#2D6A4F] text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-sm border border-[#A3D9B8]"
                  title="Emergency Situation Confirmed"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#A3D9B8]" />
                  <span className="hidden md:inline tracking-wider">
                    {language === 'hi' ? 'पुष्ट आपातकाल' : 'EMERGENCY CONFIRMED'}
                  </span>
                </div>
              )}
              <button
                id="header-persistent-revert-btn"
                onClick={onDismissEmergency}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#EBF1EC] hover:bg-[#D8EADB] text-[#244C30] text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-xs hover:scale-105 active:scale-95 transition-all cursor-pointer border-2 border-[#3E5B47]"
                title="Convert Emergency back to Normal Routine OPD"
              >
                <RotateCcw className="w-4 h-4 text-[#3E5B47]" />
                <span className="hidden sm:inline tracking-wider">
                  {language === 'hi' ? 'सामान्य में बदलें' : 'CONVERT TO NORMAL'}
                </span>
              </button>
            </div>
          ) : (
            <button
              id="header-persistent-emergency-btn"
              onClick={onTriggerEmergency}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-[#BA3C2A] hover:bg-[#9B2F20] text-white text-xs sm:text-sm font-black flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95 transition-all cursor-pointer border border-[#E7A196]"
              title="Immediate Emergency / Casualty Triage Red-Flag Dispatch"
            >
              <Siren className="w-4 h-4 animate-bounce text-white" />
              <span className="hidden sm:inline tracking-wider">
                {language === 'hi' ? 'आपातकाल' : 'EMERGENCY'}
              </span>
            </button>
          )}

          {/* Local Edge Offline-First Engine Status Pill */}
          <div className="relative" ref={edgeMenuRef}>
            <button
              id="edge-resilience-status-btn"
              onClick={() => setEdgeMenuOpen(!edgeMenuOpen)}
              className={`px-2 py-1.5 rounded-xl border text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                isOfflineMode
                  ? 'bg-[#FEF5E7] border-[#FAD7A0] text-[#B76E00] shadow-xs'
                  : 'bg-[#EBF1EC] border-[#BBD5C4] text-[#2F5A3E]'
              }`}
              title="Hospital Edge Service & Offline-First Resilience Status"
            >
              {isOfflineMode ? (
                <WifiOff className="w-3.5 h-3.5 text-[#B76E00]" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-[#2F5A3E]" />
              )}
              <span className="hidden md:inline">
                {isOfflineMode ? 'Local Edge (Offline)' : 'Cloud Live'}
              </span>
              {offlineCount > 0 && (
                <span className="bg-[#B76E00] text-white text-[9px] px-1.5 py-0.2 rounded-full">
                  {offlineCount}
                </span>
              )}
            </button>

            {edgeMenuOpen && (
              <div className="absolute right-0 mt-1.5 w-64 bg-[#FFFFFF] border border-[#DDD5C7] rounded-xl shadow-2xl p-3 z-50 text-xs space-y-2 animate-fadeIn">
                <div className="font-bold text-[#2D2621] flex items-center justify-between border-b border-[#F0EBE2] pb-1.5">
                  <span>Local Edge Resilience</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
                      isOfflineMode ? 'bg-[#FEF5E7] text-[#B76E00]' : 'bg-[#EBF1EC] text-[#2F5A3E]'
                    }`}
                  >
                    {isOfflineMode ? 'OFFLINE EDGE' : 'CLOUD CONNECTED'}
                  </span>
                </div>
                <p className="text-[11px] text-[#7A6C5F]">
                  Intake, token issuance, and voice processing run entirely on local edge storage when internet drops.
                </p>
                {offlineCount > 0 && (
                  <div className="p-2 rounded-lg bg-[#FEF5E7] text-[#B76E00] text-[11px] font-semibold">
                    {offlineCount} token(s) stored locally in edge queue pending cloud sync.
                  </div>
                )}
                <div className="pt-1 flex flex-col gap-1.5">
                  <button
                    onClick={() => {
                      const next = !getSimulatedOffline();
                      setSimulatedOffline(next);
                      setIsOfflineMode(next);
                      setEdgeMenuOpen(false);
                    }}
                    className="w-full py-1.5 px-2 rounded-lg bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#55473B] font-bold border border-[#DDD3C4] text-[11px] text-left flex items-center justify-between cursor-pointer"
                  >
                    <span>{isOfflineMode ? 'Restore Hospital Internet' : 'Simulate Network Outage'}</span>
                    <span className="text-[10px] text-[#8C7B6C]">{isOfflineMode ? 'Go Online' : 'Go Offline'}</span>
                  </button>
                  {offlineCount > 0 && !isOfflineMode && (
                    <button
                      disabled={isSyncing}
                      onClick={async () => {
                        setIsSyncing(true);
                        await syncOfflineQueueWithCentralServer();
                        setOfflineCount(getOfflinePendingQueue().length);
                        setIsSyncing(false);
                        setEdgeMenuOpen(false);
                      }}
                      className="w-full py-1.5 px-2 rounded-lg bg-[#3E5B47] text-white font-bold text-[11px] flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>Sync {offlineCount} Records Now</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Language Switcher Dropdown */}
          <div className="relative" ref={langMenuRef}>
            <button
              id="language-menu-btn"
              onClick={() => setLangDropdownOpen(!langDropdownOpen)}
              className="px-2.5 py-1.5 rounded-xl border border-[#DDD5C7] bg-[#FAF8F5] text-xs text-[#55473B] font-bold transition-all duration-200 flex items-center gap-1.5 hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F] hover:border-[#C4B7A7]"
              title={t.changeLanguage}
            >
              <Languages className="w-3.5 h-3.5 text-[#3E5B47]" />
              <span className="font-semibold">{currentLangObj.nativeLabel}</span>
              <ChevronDown
                className={`w-3 h-3 text-[#7A6C5F] transition-transform duration-200 ${
                  langDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {langDropdownOpen && (
              <div className="absolute left-0 sm:left-auto sm:right-0 mt-1.5 w-52 max-w-[calc(100vw-2rem)] max-h-[80vh] overflow-y-auto bg-[#FFFFFF] border border-[#DDD5C7] rounded-xl shadow-2xl p-1.5 z-50 animate-fadeIn">
                <div className="text-[10px] font-extrabold text-[#8C7B6C] px-2.5 py-1 uppercase tracking-wider border-b border-[#F0EBE2] mb-1">
                  {t.changeLanguage}
                </div>
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    id={`lang-dropdown-opt-${lang.code}`}
                    onClick={() => {
                      onLanguageChange(lang.code);
                      setLangDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs sm:text-sm rounded-lg transition-all flex items-center justify-between ${
                      language === lang.code
                        ? 'bg-[#EBF1EC] text-[#3E5B47] font-bold shadow-2xs'
                        : 'text-[#4F4135] hover:bg-[#FAF5ED] hover:text-[#18130F] font-semibold'
                    }`}
                  >
                    <span className="font-bold text-sm tracking-normal">{lang.nativeLabel}</span>
                    {language === lang.code && (
                      <Check className="w-3.5 h-3.5 text-[#3E5B47] stroke-[2.5] flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Audio Assistance URSA Voice Toggle */}
          <button
            id="audio-toggle-btn"
            onClick={onToggleAudio}
            title={audioMuted ? t.audioOff : t.audioOn}
            className={`p-2 rounded-xl border text-xs flex items-center gap-1.5 transition-all duration-200 hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F] ${
              audioMuted
                ? 'bg-[#FAF8F5] border-[#DED6CA] text-[#786A5E]'
                : 'bg-[#FFFFFF] border-[#3E5B47]/40 text-[#3E5B47] shadow-xs font-bold ring-1 ring-[#3E5B47]/20'
            }`}
          >
            {audioMuted ? (
              <VolumeX className="w-4 h-4 text-[#8C7B6C]" />
            ) : (
              <Volume2 className="w-4 h-4 text-[#3E5B47] animate-pulse" />
            )}
            <span className="hidden xl:inline text-xs font-semibold">
              {audioMuted ? t.audioOff : t.audioOn}
            </span>
          </button>

          {/* Subtle vertical divider */}
          {/* Subtle vertical divider */}
          <div className="h-6 w-px bg-[#DDD5C7] mx-0.5" />

          {/* Top Right Corner: Single Session Controller (Shows ONLY Log Out when logged in/registered to stop multiple login, or Login/Register when logged out) */}
          <div className="flex items-center gap-2" id="top-right-auth-cluster">
            {hasActiveSession ? (
              /* Authenticated Session: Show user identification badge and ONLY the Log Out tab */
              <div className="flex items-center gap-2 animate-fadeIn">
                <div
                  onClick={() => onViewChange(staffUser ? 'staff_portal' : 'kiosk')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#EBF3ED] text-[#244C30] border border-[#CDE1D3] text-xs font-bold cursor-pointer hover:bg-[#DEECE1] transition-all shadow-2xs group"
                  title={`${t.loggedInAs || 'Logged in as'}: ${
                    staffUser?.name || loggedInPatient?.fullName
                  } (${staffUser ? staffUser.role : 'Registered Patient'})`}
                >
                  <div className="w-6 h-6 rounded-lg bg-[#3E5B47] text-white flex items-center justify-center flex-shrink-0 text-[11px] shadow-xs group-hover:scale-105 transition-transform">
                    {staffUser ? (
                      <UserCheck className="w-3.5 h-3.5" />
                    ) : (
                      <User className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="text-left leading-tight hidden sm:block">
                    <span className="block text-[11px] font-extrabold text-[#1F3D27] truncate max-w-[120px]">
                      {staffUser?.name || loggedInPatient?.fullName}
                    </span>
                    <span className="block text-[9px] font-semibold text-[#53765E] uppercase tracking-wider">
                      {staffUser ? staffUser.role.split(' ')[0] : (t.patientLabel || 'Patient')} • {t.activeSelected || 'Active'}
                    </span>
                  </div>
                </div>

                {/* The ONLY tab shown after login/registration to stop multiple login */}
                <button
                  id="top-right-logout-btn"
                  onClick={handleLogoutClick}
                  className="px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 border font-extrabold bg-[#FAF0ED] text-[#BA3C2A] border-[#F2D6CF] hover:bg-[#BA3C2A] hover:text-white hover:border-[#962A1B] hover:shadow-md active:scale-95 cursor-pointer shadow-2xs group"
                  title={t.navLogout || 'Log Out'}
                >
                  <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
                  <span className="whitespace-nowrap">{t.navLogout || 'Log Out'}</span>
                </button>
              </div>
            ) : (
              /* Logged Out State: Show ONLY the Login / Register tab */
              <button
                id="top-right-login-btn"
                onClick={() => onViewChange('auth')}
                className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center gap-2 border font-extrabold shadow-xs cursor-pointer active:scale-95 ${
                  currentView === 'auth'
                    ? 'bg-[#3E5B47] text-white border-[#2F4636] shadow-md ring-2 ring-[#3E5B47]/20 hover:bg-[#304737]'
                    : 'bg-[#FFFFFF] text-[#2D2621] border-[#DDD5C7] hover:bg-[#F5EFE7] hover:border-[#C4B7A7] hover:shadow-md'
                }`}
                title={t.navAuth}
              >
                <LogIn className="w-3.5 h-3.5 text-[#3E5B47]" />
                <span className="whitespace-nowrap">{t.navAuth}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
