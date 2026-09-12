import React, { useState } from 'react';
import {
  QrCode,
  User,
  UserCheck,
  ShieldCheck,
  Volume2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Stethoscope,
  Leaf,
  HeartPulse,
  Wind,
  Flame,
  Bone,
  Brain,
  Baby,
  Droplets,
  Eye,
  Users,
  HeartHandshake,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Siren,
  Clock,
  Smartphone,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import { PatientIdentity, ConsentRecord, LanguageCode, RedFlagAlert } from '../../types';
import { I18N_PROMPTS } from '../../data/mockTemplates';
import { getTranslation } from '../../i18n/translations';
import { getLocalizedDepartments } from '../../i18n/localizedData';
import { speakPrompt } from '../../utils/speech';

import welcomeImg from '../../assets/images/kiosk_clinical_welcome_1788929610427.jpg';
import ayushImg from '../../assets/images/ayush_holistic_care_1788929625756.jpg';

interface Step1IdentityProps {
  patient: PatientIdentity;
  setPatient: React.Dispatch<React.SetStateAction<PatientIdentity>>;
  consent: ConsentRecord;
  setConsent: React.Dispatch<React.SetStateAction<ConsentRecord>>;
  language: LanguageCode;
  onNext: () => void;
  onBack?: () => void;
  audioMuted: boolean;
  loggedInPatient?: PatientIdentity | null;
  redFlagAlert?: RedFlagAlert | null;
  onTriggerEmergency?: (reason?: string) => void;
  onConfirmEmergency?: () => void;
  onRevertToNormal?: () => void;
  onOpenDistributedQueue?: () => void;
}

export const Step1Identity: React.FC<Step1IdentityProps> = ({
  patient,
  setPatient,
  consent,
  setConsent,
  language,
  onNext,
  onBack,
  audioMuted,
  loggedInPatient,
  redFlagAlert,
  onTriggerEmergency,
  onConfirmEmergency,
  onRevertToNormal,
  onOpenDistributedQueue,
}) => {
  const [activeTab, setActiveTab] = useState<'abha' | 'manual'>('abha');
  const [showQrModal, setShowQrModal] = useState(false);
  const [targetMode, setTargetMode] = useState<'self' | 'dependent'>(
    patient.isDependent ? 'dependent' : 'self'
  );
  const [dependentRelation, setDependentRelation] = useState<
    'Child' | 'Elderly Parent' | 'Spouse' | 'Sibling' | 'Dependent Relative'
  >(patient.dependentRelation || 'Child');
  const [autoFilledNotice, setAutoFilledNotice] = useState(false);

  const dict = getTranslation(language);
  const t = I18N_PROMPTS[language] || I18N_PROMPTS.en;
  const localizedDepartments = getLocalizedDepartments(language);

  const playStepAudio = () => {
    if (audioMuted) return;
    const textToSpeak = `${t.welcome} ${dict.dpdpaFullNotice || t.consentNotice}`;
    speakPrompt(textToSpeak, language);
  };

  const playConsentAudio = () => {
    if (audioMuted) return;
    speakPrompt(dict.dpdpaFullNotice || t.audioPromptConsent, language);
    setConsent((prev) => ({ ...prev, audioConsentPlayed: true }));
  };

  // Quick preset loader for fast demonstration
  const loadDemoProfile = (type: 'diabetic' | 'emergency' | 'ayush') => {
    const generalDept =
      localizedDepartments.find((d) => d.id === 'dept-gen-med')?.name ||
      'General Medicine / आंतरिक चिकित्सा';
    const cardioDept =
      localizedDepartments.find((d) => d.id === 'dept-cardio')?.name ||
      'Cardiology / हृदय रोग';
    const ayushDept =
      localizedDepartments.find((d) => d.id === 'dept-kaya')?.name ||
      'Kayachikitsa (Internal Medicine) / कायचिकित्सा (आयुर्वेद)';

    if (type === 'diabetic') {
      setPatient({
        abhaId: '91-8273-1928-4421',
        fullName: 'Ramesh Kumar',
        age: 54,
        gender: 'Male',
        phone: '+91 94160 88219',
        language,
        selectedDepartment: generalDept,
        clinicalMode: 'allopathy',
        tokenNumber: `MED-${Math.floor(100 + Math.random() * 900)}`,
        registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    } else if (type === 'emergency') {
      setPatient({
        abhaId: '91-4402-9182-3341',
        fullName: 'Sunita Devi',
        age: 62,
        gender: 'Female',
        phone: '+91 98112 34509',
        language,
        selectedDepartment: cardioDept,
        clinicalMode: 'allopathy',
        tokenNumber: `CARD-${Math.floor(100 + Math.random() * 900)}`,
        registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    } else {
      setPatient({
        abhaId: '91-3190-7762-1104',
        fullName: 'Aarav Shastri',
        age: 41,
        gender: 'Male',
        phone: '+91 98200 11983',
        language,
        selectedDepartment: ayushDept,
        clinicalMode: 'ayush',
        tokenNumber: `AYU-${Math.floor(10 + Math.random() * 90)}`,
        registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      });
    }

    setConsent((prev) => ({
      ...prev,
      granted: true,
      audioConsentPlayed: true,
    }));
  };

  const isFormValid =
    patient.fullName.trim().length > 1 &&
    patient.age > 0 &&
    patient.selectedDepartment &&
    consent.granted;

  return (
    <div className="w-full space-y-6">
      {/* Patient Identity Header Banner (Welcome moved to Clinical Interview front) */}
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#EBF1EC] border border-[#D0DFD2] flex items-center justify-center text-[#3E5B47] flex-shrink-0">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#2D2621]">
              {dict.step1Header || 'Patient Identity & Health ID (ABHA)'}
            </h2>
            <p className="text-xs text-[#7A6C5F]">
              {dict.step1Desc || 'Verify your digital ABHA ID or enter basic demographics to link your clinical intake record.'}
            </p>
          </div>
        </div>

        {/* Quick Demo Pre-fills */}
        <div className="flex items-center gap-1.5 flex-wrap self-stretch sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-[#EFE9DF]">
          <span className="text-[11px] text-[#8C7B6C] font-semibold flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#9E4F36]" /> Pre-fill:
          </span>
          <button
            type="button"
            onClick={() => loadDemoProfile('diabetic')}
            className="px-2 py-1 text-[11px] rounded-lg bg-[#FAF8F5] hover:bg-[#F0EAE1] text-[#3E5B47] border border-[#DDD3C4] font-medium transition-colors"
            title="Ramesh Kumar (54/M, General OPD)"
          >
            Ramesh (54)
          </button>
          <button
            type="button"
            onClick={() => loadDemoProfile('emergency')}
            className="px-2 py-1 text-[11px] rounded-lg bg-[#FAEEEA] hover:bg-[#F6E3DD] text-[#9E4F36] border border-[#EACEC6] font-medium transition-colors"
            title="Sunita Devi (62/F, Triage Red)"
          >
            Sunita (62)
          </button>
          <button
            type="button"
            onClick={() => loadDemoProfile('ayush')}
            className="px-2 py-1 text-[11px] rounded-lg bg-[#EBF1EC] hover:bg-[#DFEAE1] text-[#365342] border border-[#CDE0D2] font-medium transition-colors"
            title="Aarav Shastri (41/M, AYUSH)"
          >
            Aarav (41)
          </button>
        </div>
      </div>

      {/* Main Identification Form Card */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-5 sm:p-7 shadow-sm space-y-6">
        {/* Registration Target Selector: Self vs Family Member / Dependent */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <label className="text-xs font-bold uppercase tracking-wider text-[#685B4F]">
              {dict.regTypeLabel || 'Patient Registration Type'}
            </label>
            <span className="text-[11px] text-[#8C7B6C]">
              {dict.regTypeSub || 'Select whether this intake is for yourself or an assisted family member'}
            </span>
          </div>

          <div className="bg-[#FAF8F5] border border-[#E7E1D6] rounded-xl p-1.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setTargetMode('self');
                setPatient((prev) => ({ ...prev, isDependent: false }));
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                targetMode === 'self'
                  ? 'bg-[#3E5B47] text-white shadow-xs'
                  : 'text-[#6C5E52] hover:text-[#2D2621] hover:bg-[#EAE2D5]'
              }`}
            >
              <User className="w-4 h-4" />
              <span>{dict.forMyself || 'For Myself (Self)'}</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTargetMode('dependent');
                setPatient((prev) => ({
                  ...prev,
                  isDependent: true,
                  dependentRelation: dependentRelation,
                  guardianName: loggedInPatient?.fullName || prev.guardianName || '',
                  guardianPhone: loggedInPatient?.phone || prev.guardianPhone || '',
                }));
              }}
              className={`flex-1 py-2.5 px-3 rounded-lg text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                targetMode === 'dependent'
                  ? 'bg-[#3E5B47] text-white shadow-xs'
                  : 'text-[#6C5E52] hover:text-[#2D2621] hover:bg-[#EAE2D5]'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>{dict.forDependent || 'For Family Member / Dependent'}</span>
            </button>
          </div>
        </div>

        {/* Self Mode: Auto-Fill option if logged in */}
        {targetMode === 'self' && loggedInPatient && (
          <div className="bg-[#EBF1EC] border border-[#D0DFD2] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white border border-[#BCD4BF] text-[#3E5B47] flex items-center justify-center font-bold flex-shrink-0">
                <UserCheck className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-[#2D2621] block text-sm">
                  {dict.loggedInAs || 'Logged in as'}: {loggedInPatient.fullName}
                </span>
                <span className="text-[#4F6854]">
                  ABHA: {loggedInPatient.abhaId || 'Linked'} • Mobile: {loggedInPatient.phone} • {loggedInPatient.gender}, {loggedInPatient.age} yrs
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setPatient((prev) => ({
                  ...prev,
                  fullName: loggedInPatient.fullName,
                  age: loggedInPatient.age || prev.age,
                  gender: loggedInPatient.gender || prev.gender,
                  phone: loggedInPatient.phone || prev.phone,
                  abhaId: loggedInPatient.abhaId || prev.abhaId,
                  language: loggedInPatient.language || prev.language,
                  isDependent: false,
                }));
                setAutoFilledNotice(true);
                setTimeout(() => setAutoFilledNotice(false), 3500);
              }}
              className="px-4 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#304737] text-white font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer whitespace-nowrap self-stretch sm:self-auto justify-center"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{dict.autoFillProfile || 'Auto-Fill With My Profile'}</span>
            </button>
          </div>
        )}

        {/* Family Member / Dependent Mode: Relationship and Caregiver Linkage */}
        {targetMode === 'dependent' && (
          <div className="bg-[#FAF4E8] border border-[#E8D4B0] rounded-2xl p-4 sm:p-5 space-y-4 text-xs animate-in fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white border border-[#DEC497] text-[#9E651E] flex items-center justify-center flex-shrink-0">
                  <HeartHandshake className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#2D2621]">
                    {dict.familyRegTitle || 'Family Member / Dependent Registration'}
                  </h3>
                  <p className="text-[11px] text-[#7A644D]">
                    {dict.familyRegNotice || 'Use this form for children, elderly parents, or relatives who cannot navigate the digital kiosk alone.'}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#FFFFFF] border border-[#E3CDA5] text-[#9E651E] uppercase tracking-wide">
                {dict.assistedCaregiverMode || 'Assisted Caregiver Mode'}
              </span>
            </div>

            {/* Relationship Selector */}
            <div className="space-y-1.5">
              <label className="font-bold text-[#55473B] block">
                {dict.relationshipLabel || 'Relationship to you (Patient is your):'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'Child', label: dict.relChild || 'Child / Minor (<18)', icon: Baby },
                  { id: 'Elderly Parent', label: dict.relParent || 'Elderly Parent (60+)', icon: Users },
                  { id: 'Spouse', label: dict.relSpouse || 'Spouse / Partner', icon: User },
                  { id: 'Dependent Relative', label: dict.relRelative || 'Dependent Relative', icon: HeartHandshake },
                ].map((rel) => {
                  const isSelected = dependentRelation === rel.id;
                  const RelIcon = rel.icon;
                  return (
                    <button
                      key={rel.id}
                      type="button"
                      onClick={() => {
                        setDependentRelation(rel.id as any);
                        setPatient((prev) => ({
                          ...prev,
                          isDependent: true,
                          dependentRelation: rel.id as any,
                          guardianName: loggedInPatient?.fullName || prev.guardianName || '',
                          guardianPhone: loggedInPatient?.phone || prev.guardianPhone || '',
                        }));
                      }}
                      className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#3E5B47] text-white border-[#2E4535] shadow-xs'
                          : 'bg-[#FFFFFF] text-[#55473B] border-[#DDD5C7] hover:bg-[#F2ECE4]'
                      }`}
                    >
                      <RelIcon className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="truncate">{rel.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Caregiver Guardian Linkage */}
            <div className="p-3 bg-white border border-[#E0CFB4] rounded-xl space-y-2.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="font-bold text-[#2D2621]">
                  {dict.guardianSectionTitle || 'Primary Caregiver / Guardian Information:'}
                </span>
                {loggedInPatient && (
                  <span className="text-[11px] text-[#3E5B47] font-bold bg-[#EBF1EC] px-2 py-0.5 rounded-md border border-[#D0DFD2]">
                    {dict.linkedToUser || 'Linked to logged-in user:'} {loggedInPatient.fullName}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-[#7A644D] mb-1 font-medium">
                    {dict.guardianNameLabel || 'Guardian / Caregiver Name'}
                  </label>
                  <input
                    type="text"
                    value={patient.guardianName || loggedInPatient?.fullName || ''}
                    onChange={(e) =>
                      setPatient((prev) => ({ ...prev, guardianName: e.target.value }))
                    }
                    placeholder="e.g. Guardian Full Name"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-[#7A644D] mb-1 font-medium">
                    {dict.guardianPhoneLabel || 'Guardian Phone (for SMS Token & Prescriptions)'}
                  </label>
                  <input
                    type="tel"
                    value={patient.guardianPhone || loggedInPatient?.phone || ''}
                    onChange={(e) =>
                      setPatient((prev) => ({ ...prev, guardianPhone: e.target.value }))
                    }
                    placeholder="+91 98765 43210"
                    className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg px-3 py-2 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {autoFilledNotice && (
          <div className="p-3 rounded-xl bg-[#E6F4EA] border border-[#A8DAB5] text-[#1E4620] text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-[#1E4620]" />
            <span>{dict.autoFillSuccess || 'Details successfully auto-filled from your verified ABHA profile!'}</span>
          </div>
        )}

        {/* 1. Persistent High-Contrast Emergency Safety Triage Button (Screen 1 Entry Guard) */}
        {redFlagAlert && redFlagAlert.isEmergency ? (
          <div className="bg-[#FAEEEA] border-2 border-[#BA3C2A] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#BA3C2A] text-white rounded-xl flex-shrink-0 animate-bounce">
                <Siren className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-[#BA3C2A] tracking-wider flex items-center gap-1.5">
                  <span>{dict.emergencyAlertTitle || 'ACTIVE EMERGENCY / CODE RED STATE'}</span>
                </span>
                <p className="text-xs text-[#55473B] font-medium mt-0.5">
                  {redFlagAlert.reason || 'Emergency red flag activated. Press below to convert back to normal routine OPD if this is a false alarm.'}
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-shrink-0">
              {!redFlagAlert.isConfirmed && onConfirmEmergency && (
                <button
                  type="button"
                  id="step1-confirm-emergency-btn"
                  onClick={onConfirmEmergency}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#BA3C2A] hover:bg-[#9E2E1E] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer animate-pulse"
                  title="Confirm Emergency Situation and Dispatch Rapid Response Orderly"
                >
                  <ShieldAlert className="w-4 h-4 text-white" />
                  <span>{language === 'hi' ? 'आपातकाल की पुष्टि करें' : 'CONFIRM EMERGENCY'}</span>
                </button>
              )}
              {redFlagAlert.isConfirmed && (
                <span className="w-full sm:w-auto px-3 py-2 bg-[#2D6A4F] text-white rounded-xl text-xs font-black flex items-center justify-center gap-1.5 shadow-xs">
                  <CheckCircle2 className="w-4 h-4 text-[#A3D9B8]" />
                  <span>{language === 'hi' ? 'स्थिति पुष्ट' : 'EMERGENCY CONFIRMED'}</span>
                </span>
              )}
              {onRevertToNormal && (
                <button
                  type="button"
                  id="step1-revert-emergency-btn"
                  onClick={onRevertToNormal}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#EBF1EC] hover:bg-[#D5EADB] text-[#244C30] border-2 border-[#3E5B47] text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Convert Emergency back to Normal Routine OPD"
                >
                  <RotateCcw className="w-4 h-4 text-[#3E5B47]" />
                  <span>{language === 'hi' ? 'सामान्य में बदलें' : 'CONVERT TO NORMAL'}</span>
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-[#FAEEEA] border-2 border-[#BA3C2A] rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#BA3C2A] text-white rounded-xl flex-shrink-0 animate-bounce">
                <Siren className="w-5 h-5" />
              </div>
              <div>
                <span className="text-xs font-black uppercase text-[#BA3C2A] tracking-wider flex items-center gap-1.5">
                  <span>{dict.emergencyTriagePrompt || 'PRIORITY 1 EMERGENCY SAFETY TRIAGE (आपातकालीन)'}</span>
                </span>
                <p className="text-xs text-[#55473B] font-medium mt-0.5">
                  {language === 'hi'
                    ? 'तेज़ सीने में दर्द, सांस लेने में अत्यधिक तकलीफ, या बेहोशी की हालत में तुरंत यहाँ दबाएं।'
                    : 'Chest pain, severe breathlessness, profuse bleeding, or collapse? Tap here for immediate code red dispatch.'}
                </p>
              </div>
            </div>
            <button
              type="button"
              id="step1-emergency-btn"
              onClick={() =>
                onTriggerEmergency?.('Patient pressed persistent EMERGENCY button on Kiosk Screen 1')
              }
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#BA3C2A] hover:bg-[#9E2E1E] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-1.5 flex-shrink-0 cursor-pointer"
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{language === 'hi' ? 'आपातकालीन मदद' : 'EMERGENCY / आपातकाल'}</span>
            </button>
          </div>
        )}

        {/* Switch between ABHA ID and Manual Registration */}
        <div className="flex border-b border-[#EAE3D6] pb-4 gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => setActiveTab('abha')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === 'abha'
                ? 'bg-[#3E5B47] text-white shadow-sm'
                : 'bg-[#F4EFE6] text-[#695B4F] hover:bg-[#EDE6DA]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>ABHA ID / QR</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-xs sm:text-sm transition-all ${
              activeTab === 'manual'
                ? 'bg-[#3E5B47] text-white shadow-sm'
                : 'bg-[#F4EFE6] text-[#695B4F] hover:bg-[#EDE6DA]'
            }`}
          >
            <User className="w-4 h-4" />
            <span>{dict.orManualLabel}</span>
          </button>
        </div>

        {activeTab === 'abha' ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#685B4F] mb-1.5">
                {dict.abhaInputLabel}
              </label>
              <div className="flex flex-col sm:flex-row gap-2.5">
                <input
                  type="text"
                  id="abha-id-input"
                  placeholder={dict.abhaPlaceholder || 'e.g. 91-8273-1928-4421'}
                  value={patient.abhaId}
                  onChange={(e) => setPatient({ ...patient, abhaId: e.target.value })}
                  className="flex-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-4 py-3 text-sm sm:text-base text-[#2D2621] focus:outline-none focus:border-[#3E5B47] focus:ring-2 focus:ring-[#3E5B47]/20 font-mono tracking-wide"
                />
                <button
                  type="button"
                  onClick={() => setShowQrModal(true)}
                  id="scan-qr-btn"
                  className="bg-[#F4EFE6] hover:bg-[#EDE6DA] text-[#3E5B47] border border-[#DDD3C5] px-4 py-3 rounded-xl font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all flex-shrink-0"
                >
                  <QrCode className="w-4 h-4 text-[#3E5B47]" />
                  <span>{dict.scanQrBtn}</span>
                </button>
              </div>
              <p className="text-xs text-[#847466] mt-1.5">
                {dict.dpdpaFullNotice || t.consentNotice}
              </p>
            </div>

            {/* Demographic Inputs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
              <div>
                <label className="block text-xs font-semibold text-[#66584C] mb-1">
                  {dict.fullNameLabel}
                </label>
                <input
                  type="text"
                  value={patient.fullName}
                  onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                  placeholder={dict.fullNamePlaceholder}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#66584C] mb-1">
                  {dict.ageLabel}
                </label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={patient.age || ''}
                  onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                  placeholder="e.g. 54"
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#66584C] mb-1">
                  {dict.genderLabel}
                </label>
                <select
                  value={patient.gender}
                  onChange={(e) => setPatient({ ...patient, gender: e.target.value as any })}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                >
                  <option value="Male">{dict.genderMale}</option>
                  <option value="Female">{dict.genderFemale}</option>
                  <option value="Other">{dict.genderOther}</option>
                </select>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-[#66584C] mb-1">
                {dict.fullNameLabel}
              </label>
              <input
                type="text"
                value={patient.fullName}
                onChange={(e) => setPatient({ ...patient, fullName: e.target.value })}
                placeholder={dict.fullNamePlaceholder}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#66584C] mb-1">
                {dict.phoneLabel}
              </label>
              <input
                type="tel"
                value={patient.phone}
                onChange={(e) => setPatient({ ...patient, phone: e.target.value })}
                placeholder={dict.phonePlaceholder}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#66584C] mb-1">
                {dict.ageLabel}
              </label>
              <input
                type="number"
                value={patient.age || ''}
                onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) || 0 })}
                placeholder="e.g. 45"
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#66584C] mb-1">
                {dict.genderLabel}
              </label>
              <select
                value={patient.gender}
                onChange={(e) => setPatient({ ...patient, gender: e.target.value as any })}
                className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
              >
                <option value="Male">{dict.genderMale}</option>
                <option value="Female">{dict.genderFemale}</option>
                <option value="Other">{dict.genderOther}</option>
              </select>
            </div>
          </div>
        )}

        {/* Clinical OPD Department & Care Mode Selection */}
        <div className="pt-5 border-t border-[#EAE3D6]">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div>
              <label className="text-sm font-bold text-[#2D2621] block">{dict.deptLabel}</label>
              <span className="text-xs text-[#7A6C5F]">
                {dict.step1Sub}
              </span>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full border border-[#D5E2D7] bg-[#EBF1EC] text-[#3E5B47]">
              {patient.clinicalMode === 'ayush'
                ? 'AYUSH Dashavidha Pariksha'
                : 'Allopathic Clinical Protocol'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {localizedDepartments.map((dept) => {
              const isSelected = patient.selectedDepartment === dept.name;

              const renderIcon = () => {
                switch (dept.iconType) {
                  case 'heart':
                    return <HeartPulse className="w-5 h-5 text-[#BA3C2A]" />;
                  case 'wind':
                    return <Wind className="w-5 h-5 text-[#2D5A7A]" />;
                  case 'flame':
                    return <Flame className="w-5 h-5 text-[#B36B00]" />;
                  case 'bone':
                    return <Bone className="w-5 h-5 text-[#635345]" />;
                  case 'brain':
                    return <Brain className="w-5 h-5 text-[#5B4687]" />;
                  case 'baby':
                    return <Baby className="w-5 h-5 text-[#A0453D]" />;
                  case 'leaf':
                    return <Leaf className="w-5 h-5 text-[#365342]" />;
                  case 'droplets':
                    return <Droplets className="w-5 h-5 text-[#2D6A53]" />;
                  case 'eye':
                    return <Eye className="w-5 h-5 text-[#3E5280]" />;
                  case 'stethoscope':
                  default:
                    return <Stethoscope className="w-5 h-5 text-[#3E5B47]" />;
                }
              };

              return (
                <button
                  key={dept.id}
                  type="button"
                  onClick={() =>
                    setPatient({
                      ...patient,
                      selectedDepartment: dept.name,
                      clinicalMode: dept.mode,
                    })
                  }
                  className={`p-3.5 rounded-2xl border text-left flex items-start gap-3.5 transition-all duration-200 group relative ${
                    isSelected
                      ? dept.mode === 'ayush'
                        ? 'bg-[#EBF1EC] border-[#3E5B47] text-[#2D2621] shadow-sm ring-2 ring-[#3E5B47]/30'
                        : 'bg-[#FAF4E8] border-[#A37736] text-[#2D2621] shadow-sm ring-2 ring-[#A37736]/30'
                      : 'bg-[#FFFFFF] border-[#E8E2D8] text-[#55473B] hover:bg-[#FAF7F2] hover:border-[#D6CCC0]'
                  }`}
                >
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105 border ${
                      dept.iconType === 'heart'
                        ? 'bg-[#FAEEEA] border-[#EACEC6]'
                        : dept.iconType === 'wind'
                        ? 'bg-[#EBF3F8] border-[#CCE0ED]'
                        : dept.iconType === 'flame'
                        ? 'bg-[#FAF4E8] border-[#EEDDB8]'
                        : dept.iconType === 'bone'
                        ? 'bg-[#F2ECE4] border-[#DDD2C4]'
                        : dept.iconType === 'brain'
                        ? 'bg-[#F1EEF8] border-[#D8D0EB]'
                        : dept.iconType === 'baby'
                        ? 'bg-[#F9ECEB] border-[#EBCBC8]'
                        : dept.iconType === 'leaf'
                        ? 'bg-[#EBF1EC] border-[#D0DFD2]'
                        : dept.iconType === 'droplets'
                        ? 'bg-[#E6F3EE] border-[#C3E4D7]'
                        : dept.iconType === 'eye'
                        ? 'bg-[#EEF1F7] border-[#CFD8EB]'
                        : 'bg-[#EBF1EC] border-[#D0DFD2]'
                    }`}
                  >
                    {renderIcon()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1.5 flex-wrap">
                      <p className="text-xs sm:text-sm font-bold text-[#2D2621] truncate group-hover:text-[#1F1915]">
                        {dept.name}
                      </p>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${dept.badgeBg} ${dept.badgeText} border-current/20`}
                      >
                        {dept.branchLabel}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#7A6C5F] mt-1 leading-snug">
                      {dept.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Other Department Specification Input */}
          {patient.selectedDepartment &&
            (patient.selectedDepartment.toLowerCase().includes('other') ||
              patient.selectedDepartment.includes('अन्य')) && (
              <div className="mt-3.5 p-4 rounded-2xl bg-[#FAF4E8] border border-[#E8D4B0] space-y-2.5 animate-in fade-in">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-[#5C451D] flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-[#8C6D3B]" />
                    <span>{dict.specifyHealthProblem || 'Please specify your health problem or preferred specialty:'}</span>
                  </label>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-[#E0CFB4] text-[#8C6D3B]">
                    {dict.coversAllOpd || 'Covers all other OPD needs'}
                  </span>
                </div>
                <input
                  type="text"
                  value={patient.otherDepartmentSpecification || ''}
                  onChange={(e) =>
                    setPatient((prev) => ({
                      ...prev,
                      otherDepartmentSpecification: e.target.value,
                    }))
                  }
                  placeholder="e.g. Toothache / Dental problem, Physiotherapy / Rehab, Diet & Nutrition, Skin allergy, Unexplained weakness..."
                  className="w-full bg-white border border-[#DDD5C7] rounded-xl px-4 py-2.5 text-xs sm:text-sm text-[#2D2621] focus:outline-none focus:border-[#8C6D3B] focus:ring-1 focus:ring-[#8C6D3B]"
                />
                <p className="text-[11px] text-[#7A644D] leading-relaxed">
                  {dict.triageOfficerNotice || 'Our hospital OPD triage officer will examine your specific health concern and route you to the appropriate medical specialist room without delay.'}
                </p>
              </div>
            )}
        </div>

        {/* DPDPA 2023 & ABDM Consent Gate */}
        <div className="p-4 rounded-xl bg-[#FAF8F5] border border-[#E7E0D2] text-xs text-[#5E5145] space-y-3">
          <div className="flex items-center gap-2 text-[#3E5B47] font-bold text-sm">
            <ShieldCheck className="w-5 h-5 text-[#3E5B47] flex-shrink-0" />
            <span>{dict.dpdpaGateTitle || 'DPDPA 2023 Statutory Consent & ABDM Privacy Gate'}</span>
          </div>

          <p className="leading-relaxed text-[#685A4D]">
            {dict.dpdpaFullNotice || t.consentNotice}
          </p>

          <label className="flex items-start gap-3 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              id="consent-checkbox"
              checked={consent.granted}
              onChange={(e) => setConsent({ ...consent, granted: e.target.checked })}
              className="mt-0.5 w-4 h-4 text-[#3E5B47] bg-white border-[#C8BEAE] rounded focus:ring-[#3E5B47]"
            />
            <span className="text-[#2D2621] font-semibold">{dict.consentNotice}</span>
          </label>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-between pt-2">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="px-5 py-3 rounded-xl border border-[#D5CCBF] bg-white text-[#4A3B30] hover:bg-[#F4EFE6] font-bold text-xs sm:text-sm flex items-center gap-2 cursor-pointer transition-all shadow-xs"
            >
              <ArrowLeft className="w-4 h-4 text-[#3E5B47]" />
              <span>{dict.backToClinicalInterview || 'Back to Clinical Interview'}</span>
            </button>
          ) : (
            <div />
          )}

          <button
            type="button"
            onClick={onNext}
            id="step1-continue-btn"
            disabled={!isFormValid}
            className={`px-6 py-3.5 rounded-xl font-bold text-xs sm:text-base flex items-center gap-2.5 transition-all shadow-sm ${
              isFormValid
                ? 'bg-[#3E5B47] hover:bg-[#324B3A] text-white active:scale-98 cursor-pointer'
                : 'bg-[#EAE4D8] text-[#96877A] cursor-not-allowed'
            }`}
          >
            <span>{dict.saveAndContinueRecords || 'Save & Continue to Digitize Records'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Simulated QR Scan Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] border border-[#E0D7C9] rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <h3 className="text-lg font-bold text-[#2D2621]">
              {dict.abhaScannerModalTitle || 'ABHA QR Code Scanner'}
            </h3>
            <div className="w-48 h-48 mx-auto border-2 border-dashed border-[#3E5B47] rounded-xl flex items-center justify-center bg-[#FAF8F5] relative overflow-hidden">
              <QrCode className="w-24 h-24 text-[#3E5B47] opacity-80 animate-pulse" />
              <div className="absolute inset-x-0 h-1 bg-[#3E5B47] top-1/2 shadow-[0_0_8px_#3E5B47] animate-bounce" />
            </div>
            <p className="text-xs text-[#706255]">
              {dict.scanQrBtn}: Hold your ABHA card or Aarogya Setu QR code before the kiosk camera...
            </p>
            <div className="flex gap-2 justify-center">
              <button
                type="button"
                onClick={() => {
                  loadDemoProfile('diabetic');
                  setShowQrModal(false);
                }}
                className="bg-[#3E5B47] text-white px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-[#324B3A]"
              >
                {dict.simulateScanBtn || 'Simulate ABHA Scan'}
              </button>
              <button
                type="button"
                onClick={() => setShowQrModal(false)}
                className="bg-[#F0EAE1] text-[#55473B] px-3.5 py-2 rounded-xl text-xs font-semibold hover:bg-[#E6DEC2]"
              >
                {dict.closeBtn || 'Close'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
