import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Flame,
  Send,
  Leaf,
  Activity,
  UserCheck,
  Search,
  X,
  CheckCircle2,
  MapPin,
  Building2,
  HeartPulse,
  Stethoscope,
  ShieldCheck,
  Users,
  MessageSquare,
  FileText,
  RotateCcw,
  Smile,
  Thermometer,
  Eye,
  Droplets,
  ScanLine,
  Ticket,
  Smartphone,
  Zap,
  Siren,
  ShieldAlert,
} from 'lucide-react';
import {
  PatientIdentity,
  ClinicalHistoryData,
  RedFlagAlert,
  LanguageCode,
  DialogueMessage,
  SocratesHPI,
  HospitalFacilityInfo,
} from '../../types';
import { I18N_PROMPTS } from '../../data/mockTemplates';
import { getTranslation } from '../../i18n/translations';
import {
  getLocalizedWelcomePrompt,
  getLocalizedInitialChips,
  getLocalizedSymptomPresets,
} from '../../i18n/localizedData';
import { speakPrompt, createSpeechRecognizer } from '../../utils/speech';
import { fetchWithCsrf, safeParseResponse } from '../../utils/csrf';
import clinicalVoiceImg from '../../assets/images/clinical_voice_intake_1788930570013.jpg';
import welcomeImg from '../../assets/images/kiosk_clinical_welcome_1788929610427.jpg';
import ayushImg from '../../assets/images/ayush_holistic_care_1788929625756.jpg';
import { ClinicalSearchBarWithLocation } from './ClinicalSearchBarWithLocation';
import { INITIAL_HOSPITAL_FACILITY } from '../../data/hospitalLocations';

// Client-side medical decipherer for instantaneous recognition of common OPD presentations
function quickDecipherClinicalTerm(input: string, lang: LanguageCode, isAyush: boolean = false) {
  const lower = (input || '').toLowerCase().trim();
  if (!lower) return null;

  if (lower === 'covid' || lower.includes('covid') || lower.includes('corona') || lower.includes('sars-cov-2') || lower.includes('omicron')) {
    return {
      decipheredCondition: 'COVID-19 (Suspected SARS-CoV-2 / Acute Respiratory Illness)',
      clinicalCategory: 'Infectious / Pulmonology',
      recommendedDepartment: 'General Medicine / आंतरिक चिकित्सा',
      questionText: lang === 'hi'
        ? 'हमने COVID-19 (कोरोना वायरस संक्रमण) के संभावित लक्षण दर्ज किए हैं। यह परेशानी आपको कितने दिनों से है, और क्या आपको बुखार, खांसी, स्वाद/गंध न आना या सांस लेने में तकलीफ है?'
        : 'We have noted suspected COVID-19 (SARS-CoV-2). Since how many days have you had symptoms, and are you experiencing fever, cough, loss of smell/taste, or breathlessness?',
      audioPrompt: lang === 'hi'
        ? 'COVID-19 के लक्षण दर्ज किए गए हैं। कृपया बताएं कि कितने दिनों से बुखार, खांसी या सांस लेने में परेशानी है।'
        : 'Suspected COVID-19 noted. Please let us know your duration and if you have fever, cough, or breathing difficulty.',
      quickChips: lang === 'hi'
        ? ['1 से 3 दिन से (बुखार व खांसी)', 'स्वाद व गंध चली गई है', 'सांस लेने में भारीपन (SpO2)', 'हल्की सर्दी व गले में खराश', 'रैपिड किट में पॉजिटिव']
        : ['1 - 3 days (Fever & Cough)', 'Loss of taste / smell', 'Shortness of breath / SpO2 low', 'Mild cold & sore throat', 'Tested positive on Rapid Kit'],
      isEmergency: false,
    };
  }

  if (lower.includes('sugar') || lower.includes('diabet') || lower.includes('madhumeha')) {
    return {
      decipheredCondition: 'Type 2 Diabetes Mellitus / Glycemic Management',
      clinicalCategory: 'Endocrine & Metabolic',
      recommendedDepartment: 'General Medicine / आंतरिक चिकित्सा',
      questionText: lang === 'hi'
        ? 'हमने डायबिटीज / ब्लड शुगर की समस्या दर्ज की है। आपकी हाल की शुगर रिपोर्ट क्या थी, और क्या बार-बार प्यास, पेशाब या कमजोरी की शिकायत है?'
        : 'We have recorded your Diabetes / Blood Sugar concern. What was your most recent blood glucose level, and are you experiencing excessive thirst, frequent urination, or fatigue?',
      audioPrompt: lang === 'hi'
        ? 'ब्लड शुगर की समस्या दर्ज की गई है। कृपया बताएं कि हाल की रिपोर्ट क्या थी।'
        : 'Diabetes concern recorded. Please share your recent sugar level.',
      quickChips: lang === 'hi'
        ? ['पुरानी शुगर की दवा ले रहे हैं', 'शुगर 200 से अधिक आई है', 'प्यास व पेशाब ज्यादा लगना', 'नियमित 3 महीने की जांच']
        : ['Known diabetic on Metformin', 'Recent high reading (>200 mg/dL)', 'Frequent urination & thirst', 'Routine 3-month checkup'],
      isEmergency: false,
    };
  }

  if (lower === 'bp' || lower.includes('blood pressure') || lower.includes('high bp')) {
    return {
      decipheredCondition: 'Essential Hypertension / Blood Pressure Evaluation',
      clinicalCategory: 'Cardiovascular',
      recommendedDepartment: 'Cardiology / हृदय रोग',
      questionText: lang === 'hi'
        ? 'हमने ब्लड प्रेशर (हाई बीपी) की समस्या दर्ज की है। क्या हाल ही में बीपी नपवाया है, और क्या सिरदर्द, चक्कर या घबराहट महसूस हो रही है?'
        : 'We have noted Blood Pressure (Hypertension) concern. Have you checked your BP recently, and are you feeling headache, dizziness, or neck stiffness?',
      audioPrompt: lang === 'hi'
        ? 'ब्लड प्रेशर की समस्या दर्ज की गई है। कृपया बताएं क्या सिर में भारीपन है।'
        : 'Hypertension concern recorded. Please share if you have headache or dizziness.',
      quickChips: lang === 'hi'
        ? ['हाई बीपी की दवा चालू है', 'बीपी 150/95 से ऊपर आया है', 'सिरदर्द और चक्कर आ रहे हैं', 'सालाना नियमित जांच']
        : ['Known BP patient on tablets', 'Recent high BP (>150/95)', 'Headache & dizziness', 'Routine annual BP check'],
      isEmergency: false,
    };
  }

  return null;
}

interface Step2ConversationProps {
  patient: PatientIdentity;
  setPatient?: React.Dispatch<React.SetStateAction<PatientIdentity>>;
  history: ClinicalHistoryData;
  setHistory: React.Dispatch<React.SetStateAction<ClinicalHistoryData>>;
  redFlagAlert: RedFlagAlert | null;
  setRedFlagAlert: React.Dispatch<React.SetStateAction<RedFlagAlert | null>>;
  language: LanguageCode;
  onNext: () => void;
  onBack?: () => void;
  audioMuted: boolean;
  hospitalFacility?: HospitalFacilityInfo;
  onUpdateFacility?: (facility: HospitalFacilityInfo) => void;
  kioskStep?: number;
  onStepChange?: (step: 1 | 2 | 3 | 4) => void;
  onResetSession?: () => void;
  onTriggerEmergency?: (reason?: string, phrase?: string) => void;
  onConfirmEmergency?: () => void;
  onRevertToNormal?: () => void;
  onOpenDistributedQueue?: () => void;
}

export const Step2Conversation: React.FC<Step2ConversationProps> = ({
  patient,
  setPatient,
  history,
  setHistory,
  redFlagAlert,
  setRedFlagAlert,
  language,
  onNext,
  onBack,
  audioMuted,
  hospitalFacility = INITIAL_HOSPITAL_FACILITY,
  onUpdateFacility,
  kioskStep = 1,
  onStepChange,
  onResetSession,
  onTriggerEmergency,
  onConfirmEmergency,
  onRevertToNormal,
  onOpenDistributedQueue,
}) => {
  const [messages, setMessages] = useState<DialogueMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [dialogueTextInput, setDialogueTextInput] = useState('');
  const [dialogueStage, setDialogueStage] = useState<'initial' | 'awaiting_time' | 'recorded'>('initial');
  const [isListening, setIsListening] = useState(false);
  const [currentQuickChips, setCurrentQuickChips] = useState<string[]>([]);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [selectedSeverity, setSelectedSeverity] = useState<number>(history.hpi.severityScale || 5);
  const [selectedChipValue, setSelectedChipValue] = useState<string | null>(null);

  // OPD Crowd Status is determined exclusively by Hospital Staff (or facility crowd surge)
  const isVeryHighCrowd =
    hospitalFacility.crowdLevel === 'very_high' ||
    (typeof window !== 'undefined' && localStorage.getItem('medikiosk_crowd_level') === 'very_high') ||
    (hospitalFacility.totalPatientsWaiting !== undefined && hospitalFacility.totalPatientsWaiting >= 45);

  const dict = getTranslation(language);
  const t = I18N_PROMPTS[language] || I18N_PROMPTS.en;
  const chatBottomRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);
  const recognizerRef = useRef<any>(null);

  const isAyush = patient.clinicalMode === 'ayush';
  const localizedPresets = getLocalizedSymptomPresets(language, patient.clinicalMode);

  // Helper functions for required prompt sequences
  const getPainTimePromptText = (lang: LanguageCode): string => {
    switch (lang) {
      case 'hi':
        return 'From how much time are you in pain (आप कितने समय से दर्द या तकलीफ में हैं?)';
      case 'bn':
        return 'From how much time are you in pain (কতক্ষণ ধরে আপনি ব্যথায় ভুগছেন?)';
      case 'ta':
        return 'From how much time are you in pain (எவ்வளவு நேரமாக நீங்கள் வலியை உணர்கிறீர்கள்?)';
      case 'te':
        return 'From how much time are you in pain (మీరు ఎంత సమయం నుండి నొప్పితో బాధపడుతున్నారు?)';
      case 'mr':
        return 'From how much time are you in pain (तुम्हाला किती वेळापासून वेदना होत आहेत?)';
      case 'gu':
        return 'From how much time are you in pain (તમને કેટલા સમયથી દુખાવો થઈ રહ્યો છે?)';
      default:
        return 'From how much time are you in pain';
    }
  };

  const getResponseRecordedText = (lang: LanguageCode): string => {
    switch (lang) {
      case 'hi':
        return 'Your response has been recorded (आपकी प्रतिक्रिया दर्ज कर ली गई है)';
      case 'bn':
        return 'Your response has been recorded (আপনার প্রতিক্রিয়া রেকর্ড করা হয়েছে)';
      case 'ta':
        return 'Your response has been recorded (உங்கள் பதில் பதிவு செய்யப்பட்டது)';
      case 'te':
        return 'Your response has been recorded (మీ ప్రతిస్పందన నమోదు చేయబడింది)';
      case 'mr':
        return 'Your response has been recorded (तुमचा प्रतिसाद नोंदवला गेला आहे)';
      case 'gu':
        return 'Your response has been recorded (તમારો પ્રતિભાવ નોંધી લેવામાં આવ્યો છે)';
      default:
        return 'Your response has been recorded';
    }
  };

  const getLocalizedTimeChips = (lang: LanguageCode): string[] => {
    switch (lang) {
      case 'hi':
        return [
          '24 घंटे से कम (Less than 24 hours)',
          '1 - 3 दिन (1 - 3 days)',
          'लगभग 1 हफ्ता (About 1 week)',
          '1 महीने से ज्यादा (More than a month)',
        ];
      case 'bn':
        return [
          '২৪ ঘণ্টার কম (Less than 24 hours)',
          '১ - ৩ দিন (1 - 3 days)',
          'প্রায় ১ সপ্তাহ (About 1 week)',
          '১ মাসের বেশি (More than a month)',
        ];
      case 'ta':
        return [
          '24 மணி நேரத்திற்கும் குறைவாக (<24 hrs)',
          '1 - 3 நாட்கள் (1 - 3 days)',
          'சுமார் 1 வாரம் (About 1 week)',
          '1 மாதத்திற்கும் மேலாக (>1 month)',
        ];
      case 'te':
        return [
          '24 గంటల కంటే తక్కువ (<24 hrs)',
          '1 - 3 రోజులు (1 - 3 days)',
          'సుమారు 1 వారం (About 1 week)',
          '1 నెల కంటే ఎక్కువ (>1 month)',
        ];
      case 'mr':
        return [
          '२४ तासांपेक्षा कमी (<24 hrs)',
          '१ - ३ दिवस (1 - 3 days)',
          'सुमारे १ आठवडा (About 1 week)',
          '१ महिन्यापेक्षा जास्त (>1 month)',
        ];
      case 'gu':
        return [
          '૨૪ કલાકથી ઓછો સમય (<24 hrs)',
          '૧ - ૩ દિવસ (1 - 3 days)',
          'આશરે ૧ અઠવાડિયું (About 1 week)',
          '૧ મહિનાથી વધુ (>1 month)',
        ];
      default:
        return ['Less than 24 hours', '1 - 3 days', 'About 1 week', 'More than a month'];
    }
  };

  // Initialize initial question on mount or language switch
  useEffect(() => {
    const initialText = getLocalizedWelcomePrompt(
      language,
      patient.clinicalMode,
      patient.fullName
    );
    const defaultChips = getLocalizedInitialChips(language, patient.clinicalMode);

    const initialMsg: DialogueMessage = {
      id: 'msg_init',
      sender: 'ai',
      text: initialText,
      audioPrompt: initialText,
      suggestedChips: defaultChips,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([initialMsg]);
    setCurrentQuickChips(defaultChips);
    setDialogueStage('initial');
    setDialogueTextInput('');

    if (!audioMuted) {
      speakPrompt(initialText, language);
    }
  }, [language, patient.clinicalMode, patient.fullName]);

  // Reset stage if chiefComplaints cleared (e.g. New Session)
  useEffect(() => {
    if (history.chiefComplaints.length === 0) {
      setDialogueStage('initial');
      setDialogueTextInput('');
    }
  }, [history.chiefComplaints.length]);

  // Scroll ONLY the inner chat messages container when user adds a response, NEVER scrolling the main window
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    // Only scroll within the chat box if user has actively exchanged messages
    if (messages.length > 1 && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, isLoadingAI]);

  // Handle patient speech or text submission
  const handlePatientResponse = async (patientSpeech: string, isQuickResponse = false) => {
    const trimmed = patientSpeech.trim();
    if (!trimmed) return;

    const patientMsg: DialogueMessage = {
      id: `msg_p_${Date.now()}`,
      sender: 'patient',
      text: trimmed,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, patientMsg]);
    setInputText('');
    setDialogueTextInput('');
    setSelectedChipValue(null);
    setIsLoadingAI(true);

    // 1. Red Flag Evaluation (Chest Pain, Severe Dyspnea, Stroke)
    const lower = trimmed.toLowerCase();
    const isChestPain =
      lower.includes('chest') ||
      lower.includes('heart') ||
      lower.includes('सीना') ||
      lower.includes('ছাতি') ||
      lower.includes('நெஞ்சு') ||
      lower.includes('గుండె');

    const isSevereBreath =
      lower.includes('breath') ||
      lower.includes('breathing') ||
      lower.includes('सांस') ||
      lower.includes('হাঁপানি') ||
      lower.includes('மூச்சு');

    const isStroke =
      lower.includes('weakness on one side') ||
      lower.includes('slurred') ||
      lower.includes('paralysis');

    const isCriticalRedFlag =
      isChestPain ||
      isSevereBreath ||
      isStroke ||
      lower.includes('unconscious') ||
      lower.includes('heart attack') ||
      lower.includes('collapsed') ||
      lower.includes('emergency') ||
      lower.includes('bleeding profusely') ||
      lower.includes('बेहोश') ||
      lower.includes('आपातकाल');

    if (isCriticalRedFlag) {
      const redAlert: RedFlagAlert = {
        isEmergency: true,
        severity: 'RED',
        triggerPhrase: trimmed,
        reason: isChestPain
          ? 'Potential acute coronary syndrome (ACS) / Angina detected'
          : isStroke
          ? 'Acute focal neurological deficit / Stroke signs'
          : isSevereBreath
          ? 'Severe acute respiratory distress'
          : 'Critical clinical red flag detected during intake',
        recommendedAction: 'Immediate triage redirection: Emergency / Casualty Room 101.',
        detectedAt: new Date().toLocaleTimeString(),
      };
      setRedFlagAlert(redAlert);

      if (onTriggerEmergency) {
        onTriggerEmergency(redAlert.reason, trimmed);
        return;
      }
    }

    try {
      // 2. Specific prompt sequence requirements:
      const isDirectNextRequest =
        lower.includes('next step') ||
        lower.includes('proceed to next') ||
        lower.includes('move to next') ||
        lower.includes('move onto next') ||
        lower.includes('move onto the next') ||
        lower.includes('next') ||
        lower.includes('proceed') ||
        lower.includes('continue') ||
        lower.includes('move on') ||
        lower.includes('done') ||
        lower.includes('finish') ||
        lower.includes('अगला') ||
        lower.includes('अगले') ||
        lower.includes('आगे') ||
        lower.includes('ਅਗਲਾ') ||
        lower.includes('ਅੱਗੇ') ||
        lower.includes('ਚੱਲੋ') ||
        lower.includes('ਠੀਕ ਹੈ');

      const isAffirmative =
        lower === 'yes' ||
        lower === 'y' ||
        lower === 'yeah' ||
        lower === 'yup' ||
        lower === 'yes please' ||
        lower === 'yes next' ||
        lower === 'sure' ||
        lower === 'ok' ||
        lower === 'okay' ||
        lower === 'ha' ||
        lower === 'haan' ||
        lower === 'हाँ' ||
        lower === 'हां' ||
        lower === 'जी' ||
        lower === 'जी हाँ' ||
        lower === 'जी हां' ||
        lower === 'हाँजी' ||
        lower === 'ਹਾਂ' ||
        lower === 'ਹਾਂਜੀ' ||
        lower === 'ਹਾਂ ਜੀ' ||
        lower === 'ਆਹੋ' ||
        lower.startsWith('yes') ||
        lower.startsWith('yeah') ||
        lower.startsWith('sure') ||
        lower.startsWith('haan') ||
        lower.startsWith('हाँ') ||
        lower.startsWith('ਹਾਂ');

      const isCompletionOrNothingElse =
        lower === 'no' ||
        lower === 'nahin' ||
        lower === 'nahi' ||
        lower === 'नहीं' ||
        lower === 'ਨਾ' ||
        lower.includes('nothing else') ||
        lower.includes('that is all') ||
        lower.includes("that's all") ||
        lower.includes('bas') ||
        lower.includes('aur kuch nahi') ||
        lower.includes('aur nahi') ||
        lower.includes('no other');

      const isScanRecordsIntent =
        lower.includes('scan') ||
        lower.includes('prescription') ||
        lower.includes('report') ||
        lower.includes('document') ||
        lower.includes('पर्ची');

      const isAddAnotherSymptomIntent =
        lower.includes('another symptom') ||
        lower.includes('one more') ||
        lower.includes('add symptom') ||
        lower.includes('और लक्षण') ||
        lower.includes('दूसरी समस्या');

      // A. If direct next step requested, or patient says "yes" / "done" / "proceed" / "no more symptoms":
      if (
        isDirectNextRequest ||
        isAffirmative ||
        (dialogueStage === 'recorded' && isCompletionOrNothingElse) ||
        (history.chiefComplaints.length > 0 && isAffirmative)
      ) {
        setHistory((prev) => ({
          ...prev,
          chiefComplaints:
            prev.chiefComplaints.length > 0
              ? prev.chiefComplaints
              : ['General Health Evaluation & OPD Consultation'],
        }));

        const completionPrompt =
          language === 'hi'
            ? 'आपकी क्लिनिकल जानकारी सफलतापूर्वक दर्ज कर ली गई है। अगले चरण (मरीज पहचान एवं ABHA सत्यापन) पर आगे बढ़ रहे हैं...'
            : language === 'pa'
            ? 'ਤੁਹਾਡੀ ਕਲੀਨਿਕਲ ਜਾਣਕਾਰੀ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ। ਅਗਲੇ ਪੜਾਅ (ਮਰੀਜ਼ ਪਛਾਣ ਅਤੇ ABHA ਤਸਦੀਕ) ਵੱਲ ਵਧ ਰਹੇ ਹਾਂ...'
            : 'Your clinical intake has been successfully recorded. Moving to the next step: Patient Identity & ABHA Verification...';

        const aiMsg: DialogueMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: completionPrompt,
          audioPrompt: completionPrompt,
          suggestedChips: ['Proceeding ➔'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setDialogueStage('completed');
        setIsLoadingAI(false);

        if (!audioMuted) {
          speakPrompt(completionPrompt, language);
        }

        setTimeout(() => {
          onNext();
        }, 400);
        return;
      }

      // B. If patient wants to scan prescriptions / reports:
      if (isScanRecordsIntent && (dialogueStage === 'recorded' || history.chiefComplaints.length > 0)) {
        const scanPrompt =
          language === 'hi'
            ? 'पर्ची एवं मेडिकल रिपोर्ट स्कैनिंग (OCR) चरण पर आगे बढ़ रहे हैं...'
            : 'Moving to Step 3: Prescription & Medical Document OCR scanning...';

        const aiMsg: DialogueMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: scanPrompt,
          audioPrompt: scanPrompt,
          suggestedChips: ['Scanning Documents ➔'],
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setDialogueStage('completed');
        setIsLoadingAI(false);

        if (!audioMuted) {
          speakPrompt(scanPrompt, language);
        }

        setTimeout(() => {
          if (onStepChange) {
            onStepChange(3);
          } else {
            onNext();
          }
        }, 400);
        return;
      }

      // C. If patient wants to add another symptom:
      if (isAddAnotherSymptomIntent) {
        setDialogueStage('initial');
        const defaultChips = getLocalizedInitialChips(language, patient.clinicalMode);
        setCurrentQuickChips(defaultChips);
        const askPrompt =
          language === 'hi'
            ? 'कृपया अपनी दूसरी समस्या या लक्षण बताएं या लिखें:'
            : 'Please describe your additional symptom or health issue:';
        const askMsg: DialogueMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: askPrompt,
          audioPrompt: askPrompt,
          suggestedChips: defaultChips,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setMessages((prev) => [...prev, askMsg]);
        setIsLoadingAI(false);
        if (!audioMuted) {
          speakPrompt(askPrompt, language);
        }
        return;
      }

      // D. If dialogue is currently awaiting duration/answer to follow-up:
      if (dialogueStage === 'awaiting_time') {
        setHistory((prev) => {
          const updatedHpi: SocratesHPI = { ...prev.hpi, onset: trimmed };
          return {
            ...prev,
            hpi: updatedHpi,
            hpiNarrative: prev.hpiNarrative
              ? `${prev.hpiNarrative} Details: "${trimmed}".`
              : `Patient reported duration/detail: "${trimmed}".`,
          };
        });

        const recordedPrompt =
          language === 'hi'
            ? `आपकी जानकारी दर्ज कर ली गई है: "${trimmed}"। क्या आप अगले चरण पर जाना चाहते हैं, पर्ची स्कैन करना चाहते हैं, या कोई अन्य लक्षण बताना चाहते हैं?`
            : `Your response has been recorded: "${trimmed}". Would you like to proceed to the next step, scan medical records, or add another symptom?`;

        const nextChips = [
          'Proceed to Next Step ➔',
          'Scan Prescriptions / Reports',
          'Add another symptom',
          'Rate pain scale (1-10)',
        ];

        const aiMsg: DialogueMessage = {
          id: `msg_ai_${Date.now()}`,
          sender: 'ai',
          text: recordedPrompt,
          audioPrompt: recordedPrompt,
          suggestedChips: nextChips,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setCurrentQuickChips(nextChips);
        setDialogueStage('recorded');

        if (!audioMuted) {
          speakPrompt(recordedPrompt, language);
        }
        return;
      }

      // B. Patient inputs a complaint (e.g. "covid", "fever", "chest pain", "sugar", or selects a preset):
      // First, get client-side immediate deciphering for guaranteed instant mapping
      const clientDecipher = quickDecipherClinicalTerm(trimmed, language, patient.isAyushRegistration);

      let finalDeciphered = clientDecipher ? clientDecipher.decipheredCondition : trimmed;
      let finalQuestion = clientDecipher ? clientDecipher.questionText : null;
      let finalAudioPrompt = clientDecipher ? clientDecipher.audioPrompt : null;
      let finalChips = clientDecipher ? clientDecipher.quickChips : null;

      // Query server AI dialogue endpoint with deciphered clinical taxonomy
      try {
        const aiResponse = await fetchWithCsrf('/api/ai/adaptive-dialogue', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            patientInput: trimmed,
            historyState: {
              chiefComplaints: history.chiefComplaints,
              hpiNarrative: history.hpiNarrative,
            },
            language,
            department: patient.selectedDepartment,
            isAyush: patient.isAyushRegistration,
          }),
        });

        const parsed = await safeParseResponse(aiResponse);
        const aiData = parsed.ok ? parsed.data : null;
        if (aiData && aiData.success) {
          if (aiData.shouldProceedToNext || aiData.isCompletion) {
            setHistory((prev) => ({
              ...prev,
              chiefComplaints:
                prev.chiefComplaints.length > 0
                  ? prev.chiefComplaints
                  : ['General Health Evaluation & OPD Consultation'],
            }));

            const completionPrompt =
              aiData.questionText ||
              (language === 'hi'
                ? 'आपकी क्लिनिकल जानकारी सफलतापूर्वक दर्ज कर ली गई है। अगले चरण (मरीज पहचान एवं ABHA सत्यापन) पर आगे बढ़ रहे हैं...'
                : language === 'pa'
                ? 'ਤੁਹਾਡੀ ਕਲੀਨਿਕਲ ਜਾਣਕਾਰੀ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਕਰ ਲਈ ਗਈ ਹੈ। ਅਗਲੇ ਪੜਾਅ (ਮਰੀਜ਼ ਪਛਾਣ ਅਤੇ ABHA ਤਸਦੀਕ) ਵੱਲ ਵਧ ਰਹੇ ਹਾਂ...'
                : 'Your clinical intake has been successfully recorded. Moving to the next step: Patient Identity & ABHA Verification...');

            const aiMsg: DialogueMessage = {
              id: `msg_ai_${Date.now()}`,
              sender: 'ai',
              text: completionPrompt,
              audioPrompt: aiData.audioPrompt || completionPrompt,
              suggestedChips: ['Proceeding ➔'],
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            };

            setMessages((prev) => [...prev, aiMsg]);
            setDialogueStage('completed');
            setIsLoadingAI(false);

            if (!audioMuted) {
              speakPrompt(aiData.audioPrompt || completionPrompt, language);
            }

            setTimeout(() => {
              onNext();
            }, 400);
            return;
          }

          if (aiData.decipheredCondition) {
            finalDeciphered = aiData.decipheredCondition;
          }
          if (aiData.questionText) {
            finalQuestion = aiData.questionText;
          }
          if (aiData.audioPrompt) {
            finalAudioPrompt = aiData.audioPrompt;
          }
          if (aiData.quickChips && aiData.quickChips.length > 0) {
            finalChips = aiData.quickChips;
          }
          if (aiData.triage && aiData.triage.isEmergency) {
            setRedFlagAlert(aiData.triage);
          }
          if (aiData.recommendedDepartment && setPatient) {
            setPatient((prev) => {
              if (
                !prev.selectedDepartment ||
                prev.selectedDepartment === 'General Medicine' ||
                prev.selectedDepartment === 'General Medicine / Internal Medicine'
              ) {
                return { ...prev, selectedDepartment: aiData.recommendedDepartment };
              }
              return prev;
            });
          }
        }
      } catch (err) {
        console.warn('AI dialogue API call error, falling back to local taxonomy:', err);
      }

      // Save deciphered clinical term into chiefComplaints
      setHistory((prev) => {
        const newComplaints = [...prev.chiefComplaints];
        if (!newComplaints.includes(finalDeciphered)) {
          newComplaints.push(finalDeciphered);
        }

        const updatedHpi: SocratesHPI = { ...prev.hpi };
        if (
          !updatedHpi.site &&
          (lower.includes('chest') ||
            lower.includes('knee') ||
            lower.includes('head') ||
            lower.includes('stomach') ||
            lower.includes('back'))
        ) {
          updatedHpi.site = trimmed;
        }

        return {
          ...prev,
          chiefComplaints: newComplaints,
          hpi: updatedHpi,
          hpiNarrative: prev.hpiNarrative
            ? `${prev.hpiNarrative} Complaint: "${finalDeciphered}" (patient noted: "${trimmed}").`
            : `Patient presented with: "${finalDeciphered}" (patient noted: "${trimmed}").`,
        };
      });

      // Default question fallback if neither AI nor local decipherer returned text
      if (!finalQuestion) {
        finalQuestion = getPainTimePromptText(language);
        finalAudioPrompt = finalQuestion;
        finalChips = getLocalizedTimeChips(language);
      }

      const aiMsg: DialogueMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: finalQuestion,
        audioPrompt: finalAudioPrompt || finalQuestion,
        suggestedChips: finalChips || getLocalizedTimeChips(language),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, aiMsg]);
      setCurrentQuickChips(finalChips || getLocalizedTimeChips(language));
      setDialogueStage('awaiting_time');

      if (!audioMuted) {
        speakPrompt(finalAudioPrompt || finalQuestion, language);
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Toggle voice speech recognition
  const toggleSpeechRecognition = () => {
    if (isListening) {
      if (recognizerRef.current) {
        recognizerRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const recognizer = createSpeechRecognizer(
      language,
      (transcript, isFinal) => {
        setInputText(transcript);
        setDialogueTextInput(transcript);
        if (isFinal) {
          setIsListening(false);
          handlePatientResponse(transcript, false);
        }
      },
      (err) => {
        console.warn('Speech recognizer error:', err);
        setIsListening(false);
      }
    );

    if (recognizer) {
      recognizerRef.current = recognizer;
      try {
        recognizer.start();
        setIsListening(true);
      } catch (e) {
        console.warn('Failed to start voice recognition:', e);
      }
    } else {
      const presets = getLocalizedSymptomPresets(language, patient.clinicalMode);
      if (presets.length > 0) {
        const randomPreset = presets[Math.floor(Math.random() * presets.length)];
        setInputText(randomPreset.label);
        setDialogueTextInput(randomPreset.label);
      }
    }
  };

  const handleSelectQuickAnswer = (text: string, isPresetCritical = false) => {
    // Action chip triggers
    if (text.includes('Proceed to Next') || text.includes('Next: Patient Identity') || text.includes('Next Step') || text.includes('Proceeding')) {
      onNext();
      return;
    }

    if (text.includes('Scan Prescriptions') || text.includes('Reports') || text.includes('पर्ची स्कैन')) {
      if (onStepChange) {
        onStepChange(3);
      } else {
        onNext();
      }
      return;
    }

    if (text === 'Add another symptom' || text.includes('another symptom')) {
      setDialogueStage('initial');
      const defaultChips = getLocalizedInitialChips(language, patient.clinicalMode);
      setCurrentQuickChips(defaultChips);
      const askPrompt =
        language === 'hi'
          ? 'कृपया अपनी दूसरी समस्या या लक्षण बताएं या लिखें:'
          : 'Please tell or write your other symptom or problem:';
      const askMsg: DialogueMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: askPrompt,
        audioPrompt: askPrompt,
        suggestedChips: defaultChips,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, askMsg]);
      if (!audioMuted) {
        speakPrompt(askPrompt, language);
      }
      return;
    }

    if (text.includes('pain scale') || text.includes('Rate pain') || text.includes('1-10')) {
      const ratePrompt =
        language === 'hi'
          ? 'कृपया नीचे दिए गए 1 से 10 के पैमाने पर अपने दर्द का स्तर चुनें।'
          : 'Please select your pain severity from 1 to 10 on the scale below.';
      const rateMsg: DialogueMessage = {
        id: `msg_ai_${Date.now()}`,
        sender: 'ai',
        text: ratePrompt,
        audioPrompt: ratePrompt,
        suggestedChips: ['Proceed to Next Step ➔', 'Add another symptom'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, rateMsg]);
      if (!audioMuted) {
        speakPrompt(ratePrompt, language);
      }
      return;
    }

    setInputText(text);
    setDialogueTextInput(text);
    setSelectedChipValue(text);
    handlePatientResponse(text, true);
  };

  // Submit from the Consultation Dialogue Record text box
  const handleSendDialogueText = () => {
    const text = dialogueTextInput.trim();
    if (!text || isLoadingAI) return;
    setDialogueTextInput('');
    handlePatientResponse(text, false);
  };

  const handleSelectFacility = (facility: HospitalFacilityInfo) => {
    if (onUpdateFacility) {
      onUpdateFacility(facility);
    }
  };

  const handleSelectDepartment = (deptName: string, isAyushMode: boolean) => {
    if (setPatient) {
      setPatient((prev) => ({
        ...prev,
        selectedDepartment: deptName,
        clinicalMode: isAyushMode ? 'ayush' : 'allopathy',
      }));
    }
  };

  return (
    <div className="w-full space-y-5 animate-in fade-in duration-200">
      {/* ============================================================ */}
      {/* 1. WARM WELCOMING HERO (Moved from Patient Identity to Front) */}
      {/* ============================================================ */}
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-3xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12">
          {/* Photography Banner with Warm Clinical Aesthetic */}
          <div className="md:col-span-4 relative bg-[#F2EDE4] min-h-[160px] md:min-h-full">
            <img
              src={patient.clinicalMode === 'ayush' ? ayushImg : welcomeImg}
              alt="MediKiosk Clinical Welcome"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
            <div className="absolute bottom-3 left-3 text-white space-y-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/20">
                  {patient.clinicalMode === 'ayush' ? 'AYUSH Holistic Care' : 'Smart OPD Kiosk'}
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-[#3E5B47]/80 text-white backdrop-blur-xs border border-white/20 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> ABDM & DPDPA
                </span>
              </div>
              <p className="text-xs font-semibold text-white/95 drop-shadow-xs truncate max-w-[240px]">
                {hospitalFacility.name}
              </p>
            </div>
          </div>

          {/* Hero Content with Welcoming Headline & Clean Clinic Intro */}
          <div className="md:col-span-8 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-[#EBF1EC] text-[#3E5B47] text-xs px-3 py-1 rounded-full font-bold border border-[#D5E2D7]">
                  <span className="w-2 h-2 rounded-full bg-[#3E5B47] animate-pulse" />
                  {dict.step1Title || 'Step 1: Clinical Symptom Interview'}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
                    if (lastAi && !audioMuted) {
                      speakPrompt(lastAi.audioPrompt || lastAi.text, language);
                    }
                  }}
                  id="welcome-voice-audio-btn"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#3E5B47] hover:text-[#283C2F] bg-[#F4EFE6] hover:bg-[#EAE2D5] px-3 py-1.5 rounded-xl border border-[#DDD3C5] transition-all cursor-pointer shadow-2xs"
                >
                  <Volume2 className="w-4 h-4 text-[#3E5B47]" />
                  <span>{dict.replayQuestion || 'Replay Voice'}</span>
                </button>
              </div>

              {/* Welcoming headline: "Welcome to MediKiosk 👋 How are you feeling today?" with bold, clear typography */}
              <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-[#1E1915] mt-3 tracking-tight leading-tight flex items-center gap-2.5 flex-wrap">
                <span className="text-[#1E1915]">
                  {language === 'hi'
                    ? 'MediKiosk में आपका स्वागत है 👋'
                    : language === 'pa'
                    ? 'ਮੈਡੀਕਿਓਸਕ ਵਿੱਚ ਤੁਹਾਡਾ ਸਵਾਗਤ ਹੈ 👋'
                    : language === 'bn'
                    ? 'MediKiosk-এ স্বাগতম 👋'
                    : language === 'ta'
                    ? 'மெடிகியோஸ்க்கிற்கு வரவேற்கிறோம் 👋'
                    : language === 'te'
                    ? 'మెడికియోస్క్‌కి స్వాగతం 👋'
                    : language === 'mr'
                    ? 'मेडीकिऑस्क मध्ये आपले स्वागत आहे 👋'
                    : language === 'gu'
                    ? 'મેડિકિઓસ્કમાં આપનું સ્વાગત છે 👋'
                    : 'Welcome to MediKiosk 👋'}
                </span>
                <span className="text-[#244C30] font-extrabold tracking-tight">
                  {language === 'hi'
                    ? 'आज आप कैसा महसूस कर रहे हैं?'
                    : language === 'pa'
                    ? 'ਅੱਜ ਤੁਸੀਂ ਕਿਵੇਂ ਮਹਿਸੂਸ ਕਰ ਰਹੇ ਹੋ?'
                    : language === 'bn'
                    ? 'আজ আপনি কেমন অনুভব করছেন?'
                    : language === 'ta'
                    ? 'இன்று உங்கள் உடல்நிலை எப்படி உள்ளது?'
                    : language === 'te'
                    ? 'ఈరోజు మీ ఆరోగ్యం ఎలా ఉంది?'
                    : language === 'mr'
                    ? 'आज आपल्याला कसे वाटत आहे?'
                    : language === 'gu'
                    ? 'આજે આપ કેવું અનુભવી રહ્યા છો?'
                    : 'How are you feeling today?'}
                </span>
              </h1>
              <p className="text-sm sm:text-[15px] text-[#5C4F44] mt-2 leading-relaxed max-w-2xl font-normal">
                {language === 'hi'
                  ? 'नीचे अपने लक्षण बताएं या अपनी पसंदीदा भाषा में बोलें। हमारा क्लिनिकल एआई आपकी जांच करेगा, किसी भी आपातकालीन रेड-फ्लैग की पहचान करेगा, और आपका ओपीडी टोकन तैयार करेगा।'
                  : language === 'pa'
                  ? 'ਹੇਠਾਂ ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ ਜਾਂ ਆਪਣੀ ਪਸੰਦੀਦਾ ਭਾਸ਼ਾ ਵਿੱਚ ਬੋਲੋ। ਸਾਡਾ ਕਲੀਨਿਕਲ ਏਆਈ ਤੁਹਾਡੀ ਜਾਂਚ ਕਰੇਗਾ, ਕਿਸੇ ਵੀ ਐਮਰਜੈਂਸੀ ਰੈੱਡ-ਫਲੈਗ ਦੀ ਪਛਾਣ ਕਰੇਗਾ, ਅਤੇ ਤੁਹਾਡਾ ਓਪੀਡੀ ਟੋਕਨ ਤਿਆਰ ਕਰੇਗਾ।'
                  : language === 'bn'
                  ? 'নীচে আপনার লক্ষণগুলি লিখুন বা আপনার পছন্দের ভাষায় কথা বলুন। আমাদের এআই কোনো জরুরি রেড-ফ্ল্যাগ থাকলে চিহ্নিত করবে এবং আপনার ওপিডি টোকেন প্রস্তুত করবে।'
                  : language === 'ta'
                  ? 'கீழே உங்கள் அறிகுறிகளைக் குறிப்பிடவும் அல்லது உங்கள் விருப்ப மொழியில் பேசவும். எங்கள் மருத்துவ AI உங்கள் அவசர நிலைகளைக் கண்டறிந்து OPD டோக்கனை உருவாக்கும்.'
                  : language === 'te'
                  ? 'మీ లక్షణాలను క్రింద నమోదు చేయండి లేదా మాట్లాడండి. మా AI అత్యవసర సమస్యలను గుర్తించి మీ OPD టోకెన్‌ను సిద్ధం చేస్తుంది.'
                  : language === 'mr'
                  ? 'खाली आपली लक्षणे सांगा किंवा आपल्या भाषेत बोला. आमचे क्लिनिकल एआय आणीबाणीचे लक्षण ओळखून आपला ओपीडी टोकन तयार करेल.'
                  : language === 'gu'
                  ? 'નીચે તમારા લક્ષણો જણાવો અથવા તમારી ભાષામાં બોલો. અમારું ક્લિનિકલ એઆઈ ઈમરજન્સી રેડ-ફ્લેગ તપાસીને તમારું OPD ટોકન તૈયાર કરશે.'
                  : 'Describe your symptoms below or speak in your preferred language. Our clinical AI will guide your triage, identify any emergency red-flags, and generate your OPD consultation token.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 1.5 CROWD DENSITY STATUS & CONDITIONAL EXPRESS OPD INTAKE    */}
      {/* ============================================================ */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 px-4 py-3 bg-[#F4EFE6] border border-[#DDD3C4] rounded-2xl text-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-extrabold text-[#3D3228] flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#3E5B47]" />
            <span>OPD Crowd Status:</span>
          </span>
          <span
            className={`px-2.5 py-0.5 rounded-full font-black text-[11px] uppercase tracking-wider ${
              isVeryHighCrowd
                ? 'bg-[#BA3C2A] text-white animate-pulse'
                : 'bg-[#DDE8DF] text-[#244C30] border border-[#BBD5C4]'
            }`}
          >
            {isVeryHighCrowd ? 'High Crowd Surge (Rush Hour Active)' : 'Normal OPD Flow (Comprehensive Intake)'}
          </span>
          <span className="text-[11px] text-[#6E5D4F] hidden md:inline">
            {isVeryHighCrowd
              ? 'Hospital staff enabled express lane rapid intake to eliminate patient queue backlog.'
              : 'Standard comprehensive clinical intake in progress.'}
          </span>
        </div>

        <div className="text-[11px] text-[#7A6C5F] font-bold flex items-center gap-1.5 self-end sm:self-auto bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#DDD3C4]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#3E5B47]" />
          <span>Controlled by Hospital Staff</span>
        </div>
      </div>

      {/* Express OPD Intake: ONLY ACTIVE WHEN CROWD IS VERY HIGH (TIMER COMPLETELY REMOVED) */}
      {isVeryHighCrowd && (
        <div className="bg-[#FFFFFF] border-2 border-[#BA3C2A]/30 rounded-3xl p-4 sm:p-5 shadow-sm space-y-3 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EAE3D6] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FDE8E5] text-[#BA3C2A] flex items-center justify-center flex-shrink-0">
                <Zap className="w-5 h-5 text-[#BA3C2A]" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-extrabold text-sm text-[#1E1915]">
                    {language === 'hi'
                      ? 'एक्सप्रेस ओपीडी इनटेक — केवल 3 आवश्यक स्क्रीनिंग प्रश्न'
                      : 'Express OPD Surge Intake — 3 Essential Screening Questions'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FDE8E5] text-[#BA3C2A] border border-[#F8B4AC]">
                    Rush Hour Surge Mode
                  </span>
                </div>
                <p className="text-xs text-[#6C5E52] mt-0.5">
                  {language === 'hi'
                    ? 'अत्यधिक भीड़ के कारण त्वरित इनटेक सक्रिय: केवल 3 मुख्य प्रश्नों के उत्तर दें या अपनी सीट पर फोन से पूरा करें।'
                    : 'Surge traffic active (high patient rush): Fast 3-question screening enabled to prevent registration queues.'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end flex-shrink-0">
              {/* Distributed Queue QR Trigger */}
              <button
                type="button"
                id="step2-open-distributed-modal-btn"
                onClick={onOpenDistributedQueue}
                className="px-3.5 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#2E4535] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Print token & finish screening questionnaire on smartphone while seated"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>{language === 'hi' ? 'फोन पर भरें (QR)' : 'Waiting Area QR'}</span>
              </button>
            </div>
          </div>

          {/* 3-Question Stepper Progress */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                (history.hpi.chiefComplaints || []).length > 0
                  ? 'bg-[#EBF1EC] border-[#BBD5C4] text-[#244C30] font-bold'
                  : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#55473B]'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#3E5B47] text-white flex items-center justify-center text-[10px] font-bold">
                1
              </div>
              <div>
                <span className="block font-bold">Q1: Chief Complaint</span>
                <span className="text-[10px] text-[#786A5E]">
                  {(history.hpi.chiefComplaints || []).length > 0
                    ? history.hpi.chiefComplaints.join(', ')
                    : 'Symptom & Duration'}
                </span>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                history.hpi.severityScale !== undefined
                  ? 'bg-[#EBF1EC] border-[#BBD5C4] text-[#244C30] font-bold'
                  : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#55473B]'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#3E5B47] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </div>
              <div>
                <span className="block font-bold">Q2: Severity & Red Flags</span>
                <span className="text-[10px] text-[#786A5E]">
                  {history.hpi.severityScale ? `Severity ${history.hpi.severityScale}/10` : 'Screening triage'}
                </span>
              </div>
            </div>

            <div
              className={`p-2.5 rounded-xl border flex items-center gap-2 ${
                (history.pastMedicalHistory || []).length > 0
                  ? 'bg-[#EBF1EC] border-[#BBD5C4] text-[#244C30] font-bold'
                  : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#55473B]'
              }`}
            >
              <div className="w-5 h-5 rounded-full bg-[#3E5B47] text-white flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div>
                <span className="block font-bold">Q3: Conditions / Meds</span>
                <span className="text-[10px] text-[#786A5E]">
                  {(history.pastMedicalHistory || []).length > 0
                    ? history.pastMedicalHistory.join(', ')
                    : 'BP, Diabetes, Regular meds'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. THE MAIN UNIFIED SEARCH BAR WITH LOCATION TAB BESIDE IT   */}
      {/* ============================================================ */}
      <div className="bg-[#FFFFFF] border-2 border-[#D8CEBE] rounded-3xl p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#3E5B47] flex items-center justify-center">
              <Search className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#1E1915] tracking-tight">
                {language === 'hi'
                  ? 'लक्षण खोजें या विभाग परामर्श चुनें'
                  : language === 'pa'
                  ? 'ਲੱਛਣ ਖੋਜੋ ਜਾਂ ਵਿਭਾਗ ਕੰਸਲਟੇਸ਼ਨ ਚੁਣੋ'
                  : language === 'bn'
                  ? 'লক্ষণ খুঁজুন বা বিভাগীয় পরামর্শ নিন'
                  : language === 'ta'
                  ? 'அறிகுறிகளைத் தேடுங்கள் அல்லது பிரிவைத் தேர்ந்தெடுக்கவும்'
                  : language === 'te'
                  ? 'లక్షణాలను శోధించండి లేదా విభాగాన్ని ఎంచుకోండి'
                  : language === 'mr'
                  ? 'लक्षणे शोधा किंवा विभाग निवडा'
                  : language === 'gu'
                  ? 'લક્ષણો શોધો અથવા વિભાગ પસંદ કરો'
                  : 'Search symptoms or consult department'}
              </h2>
              <p className="text-xs sm:text-[13px] text-[#6E5F52] mt-0.5">
                {language === 'hi'
                  ? 'अपनी स्वास्थ्य समस्या लिखें या बोलें, और अपने नजदीकी अस्पताल व विभाग का चयन करें।'
                  : language === 'pa'
                  ? 'ਆਪਣੀ ਸਿਹਤ ਸਮੱਸਿਆ ਲਿਖੋ ਜਾਂ ਬੋਲੋ, ਅਤੇ ਆਪਣੇ ਨੇੜਲੇ ਹਸਪਤਾਲ ਤੇ ਵਿਭਾਗ ਦੀ ਚੋਣ ਕਰੋ।'
                  : language === 'bn'
                  ? 'আপনার সমস্যাটি টাইপ করুন বা বলুন, এবং হাসপাতাল ও বিভাগ নির্বাচন করুন।'
                  : language === 'ta'
                  ? 'உங்கள் புகாரை உள்ளிடவும் அல்லது பேசவும், மருத்துவமனை மற்றும் பிரிவைத் தேர்ந்தெடுக்கவும்.'
                  : language === 'te'
                  ? 'మీ సమస్యను టైప్ చేయండి లేదా మాట్లాడండి, మరియు ఆసుపత్రి మరియు విభాగాన్ని ఎంచుకోండి.'
                  : language === 'mr'
                  ? 'आपली तक्रार लिहा किंवा बोला, आणि रुग्णालय व विभाग निवडा.'
                  : language === 'gu'
                  ? 'તમારી સમસ્યા લખો અથવા બોલો, અને હોસ્પિટલ તેમજ વિભાગ પસંદ કરો.'
                  : 'Type or speak your complaint, and select your target hospital location & department.'}
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#8C7B6C] bg-[#FAF8F5] px-2.5 py-1 rounded-lg border border-[#DDD3C4] flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#3E5B47]" /> {hospitalFacility.district}, {hospitalFacility.state}
          </span>
        </div>

        <div className="pt-1">
          <ClinicalSearchBarWithLocation
            inputText={inputText}
            setInputText={setInputText}
            onSubmit={(text) => handlePatientResponse(text)}
            isListening={isListening}
            onToggleVoice={toggleSpeechRecognition}
            hospitalFacility={hospitalFacility}
            onSelectFacility={handleSelectFacility}
            selectedDepartment={patient.selectedDepartment}
            onSelectDepartment={handleSelectDepartment}
            language={language}
            suggestedPresets={localizedPresets}
            isLoading={isLoadingAI}
          />
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. STEPS DISPLAYED DIRECTLY BELOW THE SEARCH BAR (As Requested) */}
      {/* ============================================================ */}
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-3.5 sm:p-4 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Steps Indicator Buttons */}
          <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1 w-full lg:w-auto">
            {[
              {
                step: 1,
                label: `1. ${dict.step1Title || 'Clinical Interview'}`,
                sub: dict.step1Sub || 'Symptom Search & AI Triage',
                icon: MessageSquare,
                badge: 'Active',
              },
              {
                step: 2,
                label: `2. ${dict.step2Title || 'Patient Identity'}`,
                sub: dict.step2Sub || 'Demographics & ABHA ID',
                icon: UserCheck,
              },
              {
                step: 3,
                label: `3. ${dict.step3Title || 'Scan Record'}`,
                sub: dict.step3Sub || 'Prescriptions & Reports',
                icon: FileText,
              },
              {
                step: 4,
                label: `4. ${dict.step4Title || 'Intake Summary'}`,
                sub: dict.step4Sub || 'OPD Token Slip',
                icon: CheckCircle2,
              },
            ].map((s) => {
              const isCurrent = s.step === 1;
              const Icon = s.icon;

              return (
                <button
                  key={s.step}
                  type="button"
                  onClick={() => onStepChange && onStepChange(s.step as any)}
                  className={`flex items-center gap-2.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 whitespace-nowrap border cursor-pointer ${
                    isCurrent
                      ? 'bg-[#3E5B47] text-white font-extrabold shadow-md border-[#2F4636] ring-2 ring-[#3E5B47]/20 hover:bg-[#304737]'
                      : 'text-[#6C5E52] font-semibold border-[#E4DDD2] bg-[#FAF8F5] hover:text-[#18130F] hover:bg-[#EAE2D5] hover:font-bold hover:shadow-xs'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-white text-[#3E5B47] shadow-xs'
                        : 'bg-[#DDD5C7] text-[#55473B]'
                    }`}
                  >
                    {s.step}
                  </div>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-[#8C7B6C]'}`} />
                  <div className="text-left">
                    <span className="font-bold block leading-tight">
                      {s.label}
                    </span>
                    <span
                      className={`text-[10px] hidden sm:block ${
                        isCurrent ? 'text-emerald-100 font-medium' : 'text-[#8C7B6C]'
                      }`}
                    >
                      {s.sub}
                    </span>
                  </div>
                  {isCurrent && (
                    <span className="hidden md:inline-block ml-1 px-2 py-0.5 rounded-full bg-white/20 text-[9px] uppercase font-bold tracking-wider">
                      {dict.activeTab || 'Active'}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Reset button to start new session */}
          {onResetSession && (
            <button
              type="button"
              onClick={onResetSession}
              className="flex items-center gap-1.5 text-xs text-[#55473B] hover:text-[#2D2621] bg-[#FAF8F5] hover:bg-[#F2ECE4] px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] transition-all font-bold shadow-xs hover:shadow-md cursor-pointer active:scale-95 ml-auto lg:ml-0"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[#3E5B47]" />
              <span>{dict.newIntakeSession || 'New Session'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Quick Touch Suggestions & Common OPD Complaints (4 Cards Above Removed) */}
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <span className="text-xs font-bold text-[#554639] uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#9E4F36]" />
            {language === 'hi'
              ? 'त्वरित उत्तर व सामान्य लक्षण (परामर्श के लिए क्लिक करें):'
              : language === 'pa'
              ? 'ਤੁਰੰਤ ਜਵਾਬ ਅਤੇ ਆਮ ਲੱਛਣ (ਕੰਸਲਟੇਸ਼ਨ ਲਈ ਕਲਿੱਕ ਕਰੋ):'
              : 'Quick Touch Answers & Common Complaints (Click to Consult):'}
          </span>
          <span className="text-[11px] text-[#8A796B]">
            {dict.tapToRefine || 'Tap any option to load or refine'}
          </span>
        </div>

        {/* Dynamic Follow-up Chips from AI */}
        {currentQuickChips.length > 0 && (
          <div className="flex flex-wrap gap-2.5 pt-1">
            {currentQuickChips.map((chip, idx) => {
              const isPrimaryAction = chip.includes('Proceed to Next') || chip.includes('Next');
              return (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectQuickAnswer(chip)}
                  disabled={isLoadingAI}
                  className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm transition-all active:scale-95 cursor-pointer shadow-2xs leading-snug break-words text-left ${
                    isPrimaryAction
                      ? 'bg-[#3E5B47] text-white hover:bg-[#304737] border border-[#2F4636] font-bold ring-2 ring-[#3E5B47]/25 shadow-xs'
                      : 'bg-[#FAF7F2] hover:bg-[#EFE9DF] text-[#2D2621] border border-[#DDD3C4] hover:border-[#3E5B47] font-semibold'
                  }`}
                >
                  {chip}
                </button>
              );
            })}
          </div>
        )}

        {/* Common Preset Complaints Grid - Full symptom names, no awkward truncation, spacious layout */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
          {localizedPresets.slice(0, 6).map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectQuickAnswer(preset.label, preset.redFlagPotential)}
              className={`p-3.5 sm:p-4 rounded-2xl text-left border-2 transition-all cursor-pointer shadow-2xs hover:shadow-xs active:scale-[0.99] flex flex-col justify-between gap-3 ${
                preset.redFlagPotential
                  ? 'bg-[#FFF6F4] border-[#F2BFB6] text-[#2D2621] hover:bg-[#FDECE8] hover:border-[#BA3C2A]'
                  : 'bg-[#FFFFFF] border-[#E8E1D5] text-[#2D2621] hover:bg-[#FAF8F5] hover:border-[#3E5B47]'
              }`}
            >
              <div className="flex items-start justify-between gap-2.5">
                <span className="text-xs sm:text-sm font-bold text-[#1E1915] leading-snug break-words">
                  {preset.label}
                </span>
                {preset.redFlagPotential ? (
                  <span className="flex-shrink-0 text-[10px] font-black text-[#BA3C2A] bg-[#FAEEEA] border border-[#EACEC6] px-2 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                    ⚠️ Critical
                  </span>
                ) : (
                  <span className="flex-shrink-0 text-[10px] font-bold text-[#2F5A3E] bg-[#EBF1EC] border border-[#BBD5C4] px-2 py-0.5 rounded-full capitalize whitespace-nowrap">
                    {preset.dept}
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-[11px] text-[#7A6C5F] pt-2 border-t border-[#F0EBE1]">
                <span className="capitalize">{preset.dept} Clinic</span>
                <span className="text-[#3E5B47] font-bold flex items-center gap-1">
                  Select &rarr;
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Emergency Red-Flag Alert if detected */}
      {redFlagAlert && redFlagAlert.isEmergency && (
        <div className="bg-[#FAEEEA] border-2 border-[#BA3C2A] text-[#2D2621] rounded-2xl p-4 sm:p-5 shadow-sm animate-in fade-in duration-200">
          <div className="flex items-start gap-3.5">
            <div className="p-2 bg-[#BA3C2A] text-white rounded-xl flex-shrink-0">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <h4 className="text-base font-bold text-[#BA3C2A]">
                  {dict.emergencyAlertTitle || 'EMERGENCY RED-FLAG ALERT'}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="bg-[#BA3C2A] text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {dict.triageRed || 'Priority 1 Triage'}
                  </span>
                  {!redFlagAlert.isConfirmed && onConfirmEmergency && (
                    <button
                      type="button"
                      id="step2-confirm-emergency-btn"
                      onClick={onConfirmEmergency}
                      className="px-3 py-1 text-xs font-black text-white bg-[#BA3C2A] border border-[#9E2E1E] rounded-xl hover:bg-[#9E2E1E] cursor-pointer flex items-center gap-1.5 transition-all shadow-xs active:scale-95 animate-pulse"
                      title="Confirm Emergency Situation and Dispatch Rapid Response Team"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-white" />
                      <span>{language === 'hi' ? 'आपातकाल की पुष्टि करें' : 'Confirm Emergency'}</span>
                    </button>
                  )}
                  {redFlagAlert.isConfirmed && (
                    <span className="px-2.5 py-1 text-[11px] font-black text-[#244C30] bg-[#EBF1EC] border border-[#3E5B47] rounded-xl flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-[#3E5B47]" />
                      <span>{language === 'hi' ? 'पुष्ट स्थिति' : 'Confirmed'}</span>
                    </span>
                  )}
                  <button
                    type="button"
                    id="step2-revert-emergency-btn"
                    onClick={onRevertToNormal || (() => setRedFlagAlert(null))}
                    className="px-3 py-1 text-xs font-black text-[#244C30] bg-[#EBF1EC] border-2 border-[#3E5B47] rounded-xl hover:bg-[#D8EADB] cursor-pointer flex items-center gap-1.5 transition-all shadow-xs active:scale-95"
                    title="Convert Emergency back to Normal Routine OPD"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#3E5B47]" />
                    <span>{language === 'hi' ? 'सामान्य में बदलें' : 'Convert to Normal'}</span>
                  </button>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-[#4E3E34] mt-1 leading-relaxed">
                {redFlagAlert.reason} — <strong>{redFlagAlert.recommendedAction}</strong>
              </p>
              <p className="text-[11px] text-[#BA3C2A] font-medium mt-1">
                {dict.emergencyCaseDesc}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 2. INTERACTIVE DIALOGUE FEED & PAIN SEVERITY SCALE           */}
      {/* ============================================================ */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] shadow-sm flex flex-col overflow-hidden">
        {/* Dialogue Feed Header */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-b border-[#EAE3D6] flex items-center justify-between">
          <span className="text-xs font-bold text-[#685A4D] uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-[#3E5B47]" />
            <span>
              {dict.consultationDialogueRecordTitle || 'Clinical Consultation Dialogue Record'}
            </span>
          </span>
          <span className="text-[11px] text-[#8C7B6C]">
            {messages.length} {dict.exchangesRecordedLabel || 'exchanges recorded'}
          </span>
        </div>

        {/* Messages Feed */}
        <div
          ref={messagesContainerRef}
          className="p-4 sm:p-5 max-h-[360px] min-h-[220px] overflow-y-auto space-y-4 bg-[#FBF9F6]"
        >
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'patient' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-[#3E5B47] flex items-center justify-center text-white flex-shrink-0 shadow-xs">
                  <Activity className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-sm sm:text-base leading-relaxed ${
                  msg.sender === 'patient'
                    ? 'bg-[#284B38] text-white shadow-xs rounded-br-xs'
                    : 'bg-[#FFFFFF] text-[#2D2621] border border-[#E7E1D6] shadow-xs rounded-bl-xs'
                }`}
              >
                <p className="font-medium">{msg.text}</p>

                {/* Clinical deciphering indicator for colloquial patient input */}
                {msg.sender === 'patient' && (() => {
                  const tLower = msg.text.toLowerCase();
                  const matched = history.chiefComplaints.find((c) => {
                    const cLower = c.toLowerCase();
                    return (
                      (tLower.includes('covid') && c.includes('COVID')) ||
                      (tLower.includes('sugar') && c.includes('Diabetes')) ||
                      (tLower.includes('bp') && c.includes('Hypertension')) ||
                      (cLower.includes(tLower) && cLower !== tLower)
                    );
                  });
                  if (matched) {
                    return (
                      <div className="mt-2 pt-1.5 border-t border-white/20 flex items-center gap-1.5">
                        <span className="inline-flex items-center gap-1 bg-emerald-950/70 text-emerald-200 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-400/30">
                          <CheckCircle2 className="w-3 h-3 text-emerald-300" />
                          AI Deciphered: {matched}
                        </span>
                      </div>
                    );
                  }
                  return null;
                })()}

                <div
                  className={`mt-1.5 flex items-center justify-between text-[11px] ${
                    msg.sender === 'patient' ? 'text-[#C7DAC9]' : 'text-[#8C7B6C]'
                  }`}
                >
                  <span>
                    {msg.sender === 'patient'
                      ? dict.patientRole || 'Patient'
                      : dict.aiRole || 'MediKiosk AI'}
                  </span>
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {msg.sender === 'patient' && (
                <div className="w-8 h-8 rounded-xl bg-[#EFE9DF] text-[#3E5B47] border border-[#DDD3C4] flex items-center justify-center flex-shrink-0 shadow-xs">
                  <UserCheck className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isLoadingAI && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-[#3E5B47] flex items-center justify-center text-white flex-shrink-0 animate-pulse">
                <Activity className="w-4 h-4" />
              </div>
              <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl px-4 py-2.5 text-xs text-[#3E5B47] flex items-center gap-2 shadow-xs">
                <span className="w-2 h-2 rounded-full bg-[#3E5B47] animate-ping" />
                <span>
                  {dict.aiFormulatingQuestion || 'Formulating clinical follow-up question...'}
                </span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Dedicated Patient Text Box Input Provision inside Dialogue Record */}
        <div id="dialogue-record-text-box-container" className="p-3.5 sm:p-4 bg-[#FAF8F5] border-t border-[#EAE3D6] space-y-2.5">
          <div className="flex items-center justify-between">
            <label
              htmlFor="dialogue-record-text-input"
              className="text-xs font-bold text-[#3E342B] flex items-center gap-1.5"
            >
              <MessageSquare className="w-4 h-4 text-[#3E5B47]" />
              <span>
                {language === 'hi'
                  ? 'अपनी समस्या या लक्षण इस टेक्स्ट बॉक्स में लिखें:'
                  : language === 'pa'
                  ? 'ਆਪਣੀ ਸਮੱਸਿਆ ਜਾਂ ਲੱਛਣ ਇਸ ਟੈਕਸਟ ਬਾਕਸ ਵਿੱਚ ਲਿਖੋ:'
                  : 'Write your problem or symptoms in this text box:'}
              </span>
            </label>
            <span className="text-[10px] text-[#7A6C5F] font-medium hidden sm:inline-block">
              {language === 'hi'
                ? 'दर्ज करने के लिए Enter दबाएं या सबमिट पर क्लिक करें'
                : language === 'pa'
                ? 'ਦਰਜ ਕਰਨ ਲਈ ਐਂਟਰ ਦਬਾਓ ਜਾਂ ਸਬਮਿਟ ਕਰੋ'
                : 'Press Enter or click Submit to record'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                id="dialogue-record-text-input"
                type="text"
                value={dialogueTextInput}
                onChange={(e) => setDialogueTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSendDialogueText();
                  }
                }}
                disabled={isLoadingAI}
                placeholder={
                  dialogueStage === 'awaiting_time'
                    ? (language === 'hi'
                        ? 'अवधि लिखें (जैसे 2 दिन से, कल से)...'
                        : language === 'pa'
                        ? 'ਸਮਾਂ ਦੱਸੋ (ਜਿਵੇਂ 2 ਦਿਨਾਂ ਤੋਂ, ਕੱਲ੍ਹ ਤੋਂ)...'
                        : 'Type your duration or answer (e.g. 2 days, since yesterday)...')
                    : dialogueStage === 'recorded'
                    ? (language === 'hi'
                        ? 'अगले चरण पर जाने के लिए "हाँ" लिखें, या कोई अन्य लक्षण बताएं...'
                        : language === 'pa'
                        ? 'ਅਗਲੇ ਪੜਾਅ ਲਈ "ਹਾਂ" ਲਿਖੋ, ਜਾਂ ਕੋਈ ਹੋਰ ਲੱਛਣ ਦੱਸੋ...'
                        : 'Type "yes" to proceed to next step, or describe another symptom...')
                    : (language === 'hi'
                        ? 'अपनी स्वास्थ्य समस्या या लक्षण अपने शब्दों में यहाँ लिखें...'
                        : language === 'pa'
                        ? 'ਆਪਣੀ ਸਿਹਤ ਸਮੱਸਿਆ ਜਾਂ ਲੱਛਣ ਆਪਣੇ ਸ਼ਬਦਾਂ ਵਿੱਚ ਇੱਥੇ ਲਿਖੋ...'
                        : 'Write your health problem, symptoms, or complaint here in your own words...')
                }
                className="w-full pl-3.5 pr-9 py-2.5 bg-white border border-[#DDD5C7] rounded-xl text-xs sm:text-sm text-[#2D2621] placeholder:text-[#8C7B6C] focus:outline-none focus:border-[#3E5B47] focus:ring-2 focus:ring-[#3E5B47]/20 transition-all shadow-2xs"
              />
              {dialogueTextInput && (
                <button
                  type="button"
                  onClick={() => setDialogueTextInput('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C7B6C] hover:text-[#2D2621] p-1 cursor-pointer"
                  title="Clear text"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Voice Dictation Button for text box */}
            <button
              type="button"
              onClick={toggleSpeechRecognition}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-center cursor-pointer ${
                isListening
                  ? 'bg-[#BA3C2A] text-white border-[#BA3C2A] animate-pulse ring-2 ring-[#BA3C2A]/30'
                  : 'bg-white text-[#55473B] border-[#DDD5C7] hover:bg-[#F2ECE4] hover:text-[#2D2621]'
              }`}
              title={isListening ? 'Stop microphone' : 'Speak to record in text box'}
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            {/* Submit Button */}
            <button
              id="dialogue-record-send-btn"
              type="button"
              onClick={handleSendDialogueText}
              disabled={isLoadingAI || !dialogueTextInput.trim()}
              className="px-4 py-2.5 bg-[#3E5B47] hover:bg-[#324B3A] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-xl flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{dict.submit || 'Submit'}</span>
            </button>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#7A6C5F]">
            <span>
              {language === 'hi'
                ? '💡 आप इस बॉक्स में लिख सकते हैं या ऊपर दिए गए त्वरित विकल्पों पर क्लिक कर सकते हैं।'
                : language === 'pa'
                ? '💡 ਤੁਸੀਂ ਇਸ ਬਾਕਸ ਵਿੱਚ ਲਿਖ ਸਕਦੇ ਹੋ ਜਾਂ ਉੱਪਰ ਦਿੱਤੇ ਵਿਕਲਪਾਂ ਤੇ ਕਲਿੱਕ ਕਰ ਸਕਦੇ ਹੋ।'
                : '💡 You can write your problem in this text box or tap any quick touch answer above.'}
            </span>
            {dialogueStage === 'awaiting_time' && (
              <span className="font-semibold text-[#BA3C2A] bg-[#FAEEEA] px-2 py-0.5 rounded-md border border-[#EACEC6]">
                {language === 'hi' ? 'अवधि प्रतीक्षारत' : language === 'pa' ? 'ਸਮਾਂ ਉਡੀਕ ਰਿਹਾ ਹੈ' : 'Awaiting duration'}
              </span>
            )}
            {dialogueStage === 'recorded' && (
              <span className="font-semibold text-[#3E5B47] bg-[#EBF1EC] px-2 py-0.5 rounded-md border border-[#D5E2D7] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> {language === 'hi' ? 'प्रतिक्रिया दर्ज की गई' : language === 'pa' ? 'ਜਵਾਬ ਦਰਜ ਹੋ ਗਿਆ' : 'Response recorded'}
              </span>
            )}
          </div>
        </div>

        {/* Pain Severity Scale (1 - 10) */}
        <div className="px-4 py-3 bg-[#FAF8F5] border-t border-[#EAE3D6] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#68594D]">
            <Flame className="w-4 h-4 text-[#9E4F36]" />
            <span className="font-semibold">
              {dict.painScaleTitle || 'Pain / Discomfort Scale (1-10):'}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
              const isSel = selectedSeverity === num;
              return (
                <button
                  key={num}
                  type="button"
                  onClick={() => {
                    setSelectedSeverity(num);
                    setHistory((prev) => ({
                      ...prev,
                      hpi: { ...prev.hpi, severityScale: num },
                    }));
                  }}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    isSel
                      ? num >= 7
                        ? 'bg-[#BA3C2A] text-white scale-110 shadow-xs'
                        : 'bg-[#3E5B47] text-white scale-110 shadow-xs'
                      : num >= 7
                      ? 'bg-[#FAEEEA] text-[#BA3C2A] hover:bg-[#F4DFD8]'
                      : 'bg-[#F2EDE4] text-[#55473B] hover:bg-[#E9E1D5]'
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AYUSH Assessment Preview if active */}
      {isAyush && (
        <div className="bg-[#EBF1EC] border border-[#CDE0D2] rounded-2xl p-4 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-[#365342] flex items-center gap-1.5">
              <Leaf className="w-4 h-4" />
              <span>
                {dict.ayushDashavidhaStatusTitle || 'Ayurveda Dashavidha Pariksha Status'}
              </span>
            </span>
            <span className="text-[#4A6753] font-mono">Agni: Mandagni | Kostha: Krura</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[#4E4136]">
            <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D7E4D8]">
              <span className="text-[#83766A] block text-[10px] font-semibold">
                Prakriti (Constitution):
              </span>
              <strong className="text-[#2D2621]">Vata-Pitta (Vata 45%, Pitta 35%)</strong>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D7E4D8]">
              <span className="text-[#83766A] block text-[10px] font-semibold">
                Vikriti (Imbalance):
              </span>
              <strong className="text-[#2D2621]">Vata-Kapha (Sama Dosha)</strong>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D7E4D8]">
              <span className="text-[#83766A] block text-[10px] font-semibold">
                Ahara Shakti (Digestion):
              </span>
              <strong className="text-[#2D2621]">Avara Shakti (Diminished)</strong>
            </div>
            <div className="bg-[#FFFFFF] p-2.5 rounded-xl border border-[#D7E4D8]">
              <span className="text-[#83766A] block text-[10px] font-semibold">
                Dietary Etiology:
              </span>
              <strong className="text-[#2D2621]">Daytime sleep & oily heavy diet</strong>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* 3. NAVIGATION CONTROLS                                       */}
      {/* ============================================================ */}
      <div className="flex items-center justify-between pt-2">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-3 rounded-xl border border-[#DED6CA] bg-[#FAF8F5] text-[#55473B] hover:bg-[#F2ECE4] text-xs sm:text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>{dict.back || 'Back'}</span>
          </button>
        ) : (
          <div />
        )}

        <button
          type="button"
          onClick={onNext}
          id="step2-continue-btn"
          className="px-6 py-3.5 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white font-bold text-xs sm:text-base flex items-center gap-2.5 shadow-sm active:scale-98 cursor-pointer"
        >
          <span>
            {(dict as any).continueToIdentityBtn || 'Next: Patient Identity & ABHA Verification'}
          </span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
