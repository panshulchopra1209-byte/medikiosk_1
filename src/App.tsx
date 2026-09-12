import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Step1Identity } from './components/PatientKiosk/Step1Identity';
import { Step2Conversation } from './components/PatientKiosk/Step2Conversation';
import { Step3Documents } from './components/PatientKiosk/Step3Documents';
import { Step4Summary } from './components/PatientKiosk/Step4Summary';
import { PhysicianScreen } from './components/PhysicianDashboard/PhysicianScreen';
import { AuthView } from './components/Auth/AuthView';
import { HospitalStaffPortal } from './components/HospitalStaffPortal/HospitalStaffPortal';
import { ABDMModal } from './components/ABDMModal';
import { EmergencyCodeRedModal } from './components/PatientKiosk/EmergencyCodeRedModal';
import { DistributedMobileQueueModal } from './components/PatientKiosk/DistributedMobileQueueModal';
import {
  isOperatingOffline,
  enqueueOfflinePatient,
  setupOfflineQueueAutoSync,
} from './utils/offlineEdgeSync';
import {
  PatientIdentity,
  ConsentRecord,
  ClinicalHistoryData,
  DigitizedDocument,
  StructuredClinicalSummary,
  RedFlagAlert,
  LanguageCode,
  OPDQueueItem,
  AppView,
  HospitalFacilityInfo,
  HospitalStaffUser,
} from './types';
import {
  INITIAL_HOSPITAL_FACILITY,
  SAMPLE_STAFF_USERS,
  SAMPLE_DOCUMENTS,
} from './data/mockTemplates';
import {
  UserCheck,
  MessageSquare,
  FileText,
  CheckCircle2,
  RotateCcw,
  ShieldCheck,
  Building2,
  Lock,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { getTranslation } from './i18n/translations';
import {
  announceUrsaLanguageChange,
  setGlobalAudioMuted,
  isAudioGloballyMuted,
  stopSpeaking,
} from './utils/speech';
import { fetchWithCsrf, safeParseResponse } from './utils/csrf';

const INITIAL_PATIENT: PatientIdentity = {
  abhaId: '',
  fullName: '',
  age: 0,
  gender: 'Male',
  phone: '',
  language: 'en',
  selectedDepartment: 'General Medicine / आंतरिक चिकित्सा',
  clinicalMode: 'allopathy',
  tokenNumber: 'MED-101',
  registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
};

const INITIAL_CONSENT: ConsentRecord = {
  granted: false,
  grantedAt: new Date().toISOString(),
  audioConsentPlayed: false,
  dpdpaCompliant: true,
  purposes: [
    'Clinical History Elicitation',
    'Document Digitization',
    'Physician Consultation Support',
    'ABDM FHIR Record Generation',
  ],
  revocable: true,
};

// Strict empty history: no pre-filled past medical history or medications
const INITIAL_HISTORY: ClinicalHistoryData = {
  chiefComplaints: [],
  hpiNarrative: '',
  hpi: {},
  pastMedicalHistory: [], // STRICTLY EMPTY - Never add anything unless patient provides
  pastSurgicalHistory: [],
  currentMedications: [], // STRICTLY EMPTY - Never add medications unless patient provides
  drugAllergies: [],
  familyHistory: [],
  personalLifestyle: {
    smoking: 'No',
    alcohol: 'No',
    diet: 'Standard',
    occupation: '',
    sleep: 'Normal',
  },
  reviewOfSystems: {},
};

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('kiosk');
  const [kioskStep, setKioskStep] = useState<1 | 2 | 3 | 4>(1);
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [audioMuted, setAudioMuted] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem('medikiosk_audio_muted');
      if (stored !== null) return stored === 'true';
    } catch {}
    return false;
  });

  const handleToggleAudio = () => {
    setAudioMuted((prev) => {
      const next = !prev;
      setGlobalAudioMuted(next);
      if (next) {
        stopSpeaking();
      }
      return next;
    });
  };

  // Hospital Facility Management State
  const [hospitalFacility, setHospitalFacility] =
    useState<HospitalFacilityInfo>(INITIAL_HOSPITAL_FACILITY);
  const [staffUser, setStaffUser] = useState<HospitalStaffUser | null>(null);
  const [loggedInPatient, setLoggedInPatient] = useState<PatientIdentity | null>(null);

  // Kiosk Session State
  const [patient, setPatient] = useState<PatientIdentity>(INITIAL_PATIENT);
  const [consent, setConsent] = useState<ConsentRecord>(INITIAL_CONSENT);
  const [history, setHistory] = useState<ClinicalHistoryData>(INITIAL_HISTORY);
  const [documents, setDocuments] = useState<DigitizedDocument[]>([]);
  const [redFlagAlert, setRedFlagAlert] = useState<RedFlagAlert | null>(null);

  const [summary, setSummary] = useState<StructuredClinicalSummary>({
    patientId: '',
    tokenNumber: 'MED-101',
    generatedAt: new Date().toISOString(),
    triage: {
      isEmergency: false,
      severity: 'GREEN',
      reason: 'Routine OPD Evaluation',
      recommendedAction: 'Standard consultation',
    },
    chiefComplaintSummary: 'Awaiting clinical input',
    hpiFormatted: 'No active symptoms recorded yet.',
    pastHistorySummary: 'No past medical history reported by patient.',
    medicationAndAllergySummary:
      'No active medications reported by patient. Allergies: None documented.',
    reviewOfSystemsSummary: 'Review of systems not yet recorded.',
    digitizedRecordsSummary: 'No physical documents submitted.',
    abnormalValuesList: [],
    potentialDrugInteractions: [],
    physicianNotes: '',
    physicianConfirmed: false,
  });

  // OPD Queue & Security State
  const [queue, setQueue] = useState<OPDQueueItem[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [fhirModalItem, setFhirModalItem] = useState<OPDQueueItem | null>(null);
  const [csrfToken, setCsrfToken] = useState<string>('');

  // Emergency Triage Modal & Distributed Queue Modal State
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [isDistributedQueueModalOpen, setIsDistributedQueueModalOpen] = useState(false);

  // Trigger emergency code red triage flow immediately
  const handleTriggerEmergency = (reason?: string, phrase?: string) => {
    const alert: RedFlagAlert = {
      isEmergency: true,
      severity: 'RED',
      reason: reason || 'Acute Red Flag Symptom Triggered (Chest Pain / Triage Code Red)',
      matchedPhrase: phrase || '',
      recommendedAction: 'Immediate casualty triage and physician escort',
    };
    setRedFlagAlert(alert);
    setIsEmergencyModalOpen(true);
  };

  // Convert emergency triage status back to normal routine OPD
  const handleRevertToNormal = () => {
    setRedFlagAlert(null);
    setIsEmergencyModalOpen(false);

    // Revert emergency token to normal routine OPD token if it was set to EMG-
    setPatient((prev) => {
      let normalToken = prev.tokenNumber;
      if (!normalToken || normalToken.startsWith('EMG-')) {
        normalToken =
          prev.clinicalMode === 'ayush'
            ? `AYU-${Math.floor(100 + Math.random() * 900)}`
            : `MED-${Math.floor(100 + Math.random() * 900)}`;
      }
      return { ...prev, tokenNumber: normalToken };
    });

    // Revert summary triage to routine GREEN
    setSummary((prev) => ({
      ...prev,
      triage: {
        isEmergency: false,
        severity: 'GREEN',
        reason: 'Routine OPD Evaluation (Converted from Emergency)',
        recommendedAction: 'Standard consultation',
      },
    }));

    // If current patient is in queue, update their record in the queue
    if (selectedPatientId) {
      updateQueuePatient(selectedPatientId, {
        triage: {
          isEmergency: false,
          severity: 'GREEN',
          reason: 'Routine OPD Evaluation (Converted to Normal)',
          recommendedAction: 'Standard consultation order',
          detectedAt: new Date().toLocaleTimeString(),
        },
      });
    }
  };

  // Confirm emergency situation and dispatch rapid response
  const handleConfirmEmergency = (token?: string) => {
    const assignedToken =
      token ||
      (patient.tokenNumber && patient.tokenNumber.startsWith('EMG-')
        ? patient.tokenNumber
        : `EMG-RED-${Math.floor(100 + Math.random() * 900)}`);

    setPatient((prev) => ({
      ...prev,
      tokenNumber: assignedToken,
    }));

    setRedFlagAlert((prev) => ({
      isEmergency: true,
      severity: 'RED',
      reason: prev?.reason || 'Critical Emergency Situation Confirmed',
      matchedPhrase: prev?.matchedPhrase,
      recommendedAction: 'Rapid response team dispatched • Immediate casualty triage',
      isConfirmed: true,
      confirmedAt: new Date().toLocaleTimeString(),
    }));

    setSummary((prev) => ({
      ...prev,
      triage: {
        isEmergency: true,
        severity: 'RED',
        reason: 'Critical Emergency Situation Confirmed',
        recommendedAction: 'Immediate casualty triage and rapid response escort',
        isConfirmed: true,
        confirmedAt: new Date().toLocaleTimeString(),
      },
    }));

    if (selectedPatientId) {
      updateQueuePatient(selectedPatientId, {
        status: 'PRIORITY_EMERGENCY',
        triage: {
          isEmergency: true,
          severity: 'RED',
          reason: 'Critical Emergency Situation Confirmed',
          recommendedAction: 'Immediate casualty triage and rapid response escort',
          isConfirmed: true,
          confirmedAt: new Date().toLocaleTimeString(),
        },
      });
    }

    setIsEmergencyModalOpen(true);
  };

  // Hospital staff guard: Patient kiosk should not be visible or accessible when hospital staff is logged in
  useEffect(() => {
    if (staffUser && currentView === 'kiosk') {
      setCurrentView('staff_portal');
    }
  }, [staffUser, currentView]);

  const handleViewChange = (view: AppView) => {
    if (staffUser && view === 'kiosk') {
      setCurrentView('staff_portal');
      return;
    }
    setCurrentView(view);
  };

  const handleOpenDistributedQueue = () => {
    setIsDistributedQueueModalOpen(true);
  };

  // Refresh queue & hospital facility state
  const refreshBackendData = async () => {
    try {
      const [queueRes, facilityRes] = await Promise.all([
        fetch('/api/queue'),
        fetch('/api/hospital-facility'),
      ]);
      const [queueData, facilityData] = await Promise.all([
        queueRes.json(),
        facilityRes.json(),
      ]);

      if (queueData.success && queueData.queue) {
        setQueue(queueData.queue);
      }
      if (facilityData.success && facilityData.facility) {
        const savedHospitalName = localStorage.getItem('medikiosk_selected_hospital_name');
        if (savedHospitalName && facilityData.facility.name !== savedHospitalName) {
          try {
            const savedFac = localStorage.getItem('medikiosk_hospital_facility');
            if (savedFac) {
              const parsed = JSON.parse(savedFac);
              setHospitalFacility(parsed);
              fetchWithCsrf('/api/hospital-facility', {
                method: 'PUT',
                body: JSON.stringify(parsed),
              }).catch(() => {});
              return;
            }
          } catch {}
        }
        setHospitalFacility(facilityData.facility);
        try {
          localStorage.setItem('medikiosk_hospital_facility', JSON.stringify(facilityData.facility));
          localStorage.setItem('medikiosk_selected_hospital_name', facilityData.facility.name);
        } catch {}
      }
    } catch (err) {
      // Quiet background poll fallback
    }
  };

  // Load initial queue, hospital facility data, and bootstrap CSRF token + real-time polling
  useEffect(() => {
    async function initApp() {
      try {
        const csrfRes = await fetch('/api/csrf-token');
        const csrfData = await csrfRes.json();
        if (csrfData.success && csrfData.csrfToken) {
          setCsrfToken(csrfData.csrfToken);
        }
        const savedFacility = localStorage.getItem('medikiosk_hospital_facility');
        if (savedFacility) {
          try {
            const parsed = JSON.parse(savedFacility);
            setHospitalFacility(parsed);
            await fetchWithCsrf('/api/hospital-facility', {
              method: 'PUT',
              body: JSON.stringify(parsed),
            });
          } catch {}
        }
        await refreshBackendData();
      } catch (err) {
        console.error('Failed to initialize app data:', err);
      }
    }
    initApp();

    // Initialize offline edge sync listener (submits pending records when edge connection restores)
    const cleanupOfflineSync = setupOfflineQueueAutoSync();

    // 3.5s real-time poll for live bed inventory & OPD queue syncing across patient kiosk, staff portal & physician OPD
    const interval = setInterval(refreshBackendData, 3500);
    return () => {
      cleanupOfflineSync();
      clearInterval(interval);
    };
  }, []);

  // Update language on patient object when header language changes
  const handleLanguageChange = (lang: LanguageCode) => {
    setLanguage(lang);
    setPatient((prev) => ({ ...prev, language: lang }));
    announceUrsaLanguageChange(lang, audioMuted);
  };

  // Push completed kiosk intake into the OPD Queue
  const handleSubmitToQueue = async () => {
    const newItem: OPDQueueItem = {
      id: `queue_${Date.now()}`,
      patient: { ...patient },
      consent: { ...consent },
      history: { ...history },
      documents: [...documents],
      summary: { ...summary, physicianConfirmed: false },
      triage: redFlagAlert || {
        isEmergency: false,
        severity: 'GREEN',
        reason: 'Routine Intake',
        recommendedAction: 'Standard OPD order of consultation.',
        detectedAt: new Date().toLocaleTimeString(),
      },
      status: 'WAITING',
      submittedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };

    if (isOperatingOffline()) {
      enqueueOfflinePatient(newItem);
      setQueue((prev) => [newItem, ...prev]);
      setSelectedPatientId(newItem.id);
      setTimeout(() => {
        setCurrentView('physician');
      }, 700);
      return;
    }

    try {
      const res = await fetchWithCsrf('/api/queue', {
        method: 'POST',
        body: JSON.stringify(newItem),
      });
      const parsed = await safeParseResponse<{ success: boolean; queueItem: OPDQueueItem }>(res);
      if (parsed.ok && parsed.data?.success) {
        setQueue((prev) => [parsed.data?.queueItem || newItem, ...prev]);
        setSelectedPatientId(newItem.id);
      } else {
        // Fallback to offline store if backend store is syncing or offline
        enqueueOfflinePatient(newItem);
        setQueue((prev) => [newItem, ...prev]);
        setSelectedPatientId(newItem.id);
      }
    } catch (err) {
      console.warn('Queue submission fallback to local/offline state:', err);
      enqueueOfflinePatient(newItem);
      setQueue((prev) => [newItem, ...prev]);
      setSelectedPatientId(newItem.id);
    } finally {
      // Automatically direct to physician OPD tab so that they can view their OPD queue status
      setTimeout(() => {
        setCurrentView('physician');
      }, 700);
    }
  };

  // Update facility details from Staff Portal or Patient Location Selector
  const handleUpdateFacility = async (updated: HospitalFacilityInfo) => {
    setHospitalFacility(updated);
    try {
      localStorage.setItem('medikiosk_hospital_facility', JSON.stringify(updated));
      localStorage.setItem('medikiosk_selected_hospital_name', updated.name);
    } catch {}
    try {
      await fetchWithCsrf('/api/hospital-facility', {
        method: 'PUT',
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Failed to update hospital facility on backend:', e);
    }
  };

  // Reset Kiosk for next patient with strictly blank medical history
  const handleResetKiosk = () => {
    setKioskStep(1);
    setPatient({
      abhaId: '',
      fullName: '',
      age: 0,
      gender: 'Male',
      phone: '',
      language: language,
      selectedDepartment: 'General Medicine / आंतरिक चिकित्सा',
      clinicalMode: 'allopathy',
      tokenNumber: `MED-${Math.floor(100 + Math.random() * 900)}`,
      registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    });
    setConsent({
      granted: false,
      grantedAt: new Date().toISOString(),
      audioConsentPlayed: false,
      dpdpaCompliant: true,
      purposes: [
        'Clinical History Elicitation',
        'Document Digitization',
        'Physician Consultation Support',
      ],
      revocable: true,
    });
    setHistory({
      chiefComplaints: [],
      hpiNarrative: '',
      hpi: {},
      pastMedicalHistory: [], // STRICTLY EMPTY
      pastSurgicalHistory: [],
      currentMedications: [], // STRICTLY EMPTY
      drugAllergies: [],
      familyHistory: [],
      personalLifestyle: {
        smoking: 'No',
        alcohol: 'No',
        diet: 'Standard',
        occupation: '',
        sleep: 'Normal',
      },
      reviewOfSystems: {},
    });
    setDocuments([]);
    setRedFlagAlert(null);
  };

  const updateQueuePatient = async (id: string, updates: Partial<OPDQueueItem>) => {
    setQueue((prev) =>
      prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );

    try {
      await fetchWithCsrf(`/api/queue/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (e) {
      console.warn('Failed to patch queue on backend:', e);
    }
  };

  const handleQuickCheckInPatient = (patientToQueue: PatientIdentity) => {
    const token =
      patientToQueue.tokenNumber || `OPD-${Math.floor(100 + Math.random() * 900)}`;
    const updatedPatient: PatientIdentity = {
      ...patientToQueue,
      tokenNumber: token,
      registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
    };
    setLoggedInPatient(updatedPatient);
    setPatient(updatedPatient);

    const newItem: OPDQueueItem = {
      id: `q_user_${Date.now()}`,
      patient: updatedPatient,
      consent: consent,
      triage: {
        severity: 'GREEN',
        isEmergency: false,
        reason: 'OPD Regular Check-in: Awaiting clinical triage evaluation.',
        recommendedAction: 'Proceed to waiting area for doctor consultation.',
        detectedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      history: {
        chiefComplaints: [
          {
            complaint:
              updatedPatient.otherDepartmentSpecification ||
              'General outpatient health checkup',
            duration: 'Ongoing',
            severity: 'Mild',
          },
        ],
        hpi: {
          site: 'General',
          onset: 'Gradual',
          character: 'Non-acute',
          radiation: 'None',
          associations: [],
          timingDuration: 'Intermittent',
          exacerbatingRelieving: 'None',
          severityScale: 2,
        },
        hpiNarrative: `Patient ${updatedPatient.fullName} checked in for ${
          updatedPatient.selectedDepartment || 'General Medicine'
        }.`,
        pastMedicalHistory: [],
        pastSurgicalHistory: [],
        currentMedications: [],
        drugAllergies: [],
        familyHistory: [],
        personalLifestyle: {
          smoking: 'Non-smoker',
          alcohol: 'Non-drinker',
          diet: 'Standard',
          occupation: 'General',
          sleep: 'Normal',
        },
        reviewOfSystems: {},
      },
      documents: [],
      summary: {
        patientId: updatedPatient.abhaId || token,
        tokenNumber: token,
        generatedAt: new Date().toISOString().slice(0, 16).replace('T', ' '),
        triage: {
          severity: 'GREEN',
          isEmergency: false,
          reason: 'Routine outpatient consultation queue',
          recommendedAction: 'Wait in designated OPD area for token announcement',
        },
        chiefComplaintSummary:
          updatedPatient.otherDepartmentSpecification ||
          'Outpatient consultation check-in',
        hpiFormatted: 'Patient registered in hospital outpatient queue.',
        pastHistorySummary: 'None recorded at quick check-in',
        medicationAndAllergySummary: 'No critical allergies reported.',
        reviewOfSystemsSummary: 'To be reviewed by attending physician',
        digitizedRecordsSummary: 'No documents attached',
        abnormalValuesList: [],
        potentialDrugInteractions: [],
        physicianNotes: 'Awaiting physician examination.',
        physicianConfirmed: false,
      },
      status: 'WAITING',
      submittedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setQueue((prev) => [...prev, newItem]);
    setSelectedPatientId(newItem.id);
  };

  const t = getTranslation(language);

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#2D2621] flex flex-col font-sans selection:bg-[#3E5B47] selection:text-white">
      {/* Top Navigation & Hospital Facility Header */}
      <Header
        currentView={currentView}
        onViewChange={handleViewChange}
        language={language}
        onLanguageChange={handleLanguageChange}
        audioMuted={audioMuted}
        onToggleAudio={handleToggleAudio}
        activeRedFlag={redFlagAlert}
        waitingCount={queue.filter((q) => q.status === 'WAITING').length}
        hospitalFacility={hospitalFacility}
        staffUser={staffUser}
        onStaffLogout={() => {
          setStaffUser(null);
          setCurrentView('auth');
        }}
        loggedInPatient={loggedInPatient}
        onPatientLogout={() => {
          setLoggedInPatient(null);
          handleResetKiosk();
        }}
        onTriggerEmergency={() =>
          handleTriggerEmergency('Emergency Button Triggered via Header Bar')
        }
        onConfirmEmergency={() => handleConfirmEmergency()}
        onDismissEmergency={handleRevertToNormal}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-10 py-6">
        {currentView === 'kiosk' && (
          <div className="space-y-6">
            {/* Step Progress Stepper (Displayed at top for Steps 2, 3, 4; For Step 1 it is positioned directly below the search bar on the front page) */}
            {kioskStep > 1 && (
              <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-3.5 sm:p-4 shadow-xs">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  {/* Steps indicator with numbers, icons, shadow, bold text, and darker hover state */}
                  <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto py-1">
                    {[
                      { step: 1, label: t.step1Title, sub: t.step1Sub, icon: MessageSquare },
                      { step: 2, label: t.step2Title, sub: t.step2Sub, icon: UserCheck },
                      { step: 3, label: t.step3Title, sub: t.step3Sub, icon: FileText },
                      { step: 4, label: t.step4Title, sub: t.step4Sub, icon: CheckCircle2 },
                    ].map((s) => {
                      const isPassed = kioskStep > s.step;
                      const isCurrent = kioskStep === s.step;
                      const Icon = s.icon;

                      return (
                        <button
                          key={s.step}
                          onClick={() => setKioskStep(s.step as any)}
                          className={`flex items-center gap-2.5 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-200 whitespace-nowrap border cursor-pointer ${
                            isCurrent
                              ? 'bg-[#3E5B47] text-white font-extrabold shadow-md border-[#2F4636] ring-2 ring-[#3E5B47]/20 hover:bg-[#304737]'
                              : isPassed
                              ? 'bg-[#EBF1EC] text-[#3E5B47] font-bold border-[#D5E2D7] hover:bg-[#DCE7DE] hover:text-[#253B2D] hover:shadow-md hover:font-extrabold hover:border-[#B5D0BC]'
                              : 'text-[#6C5E52] font-semibold border-transparent hover:text-[#18130F] hover:bg-[#EAE2D5] hover:font-extrabold hover:shadow-md hover:border-[#C4B7A7]'
                          }`}
                        >
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black flex-shrink-0 transition-colors ${
                              isCurrent
                                ? 'bg-white text-[#3E5B47] shadow-xs'
                                : isPassed
                                ? 'bg-[#3E5B47] text-white'
                                : 'bg-[#DDD5C7] text-[#55473B]'
                            }`}
                          >
                            {isPassed ? '✓' : s.step}
                          </div>
                          <span className="font-bold leading-tight tracking-normal">
                            {s.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Reset button to start new session */}
                  <button
                    onClick={handleResetKiosk}
                    className="flex items-center gap-1.5 text-xs text-[#55473B] hover:text-[#2D2621] bg-[#FAF8F5] hover:bg-[#F2ECE4] px-3.5 py-2.5 rounded-xl border border-[#DDD5C7] transition-all font-bold shadow-xs hover:shadow-md cursor-pointer active:scale-95"
                  >
                    <RotateCcw className="w-3.5 h-3.5 text-[#3E5B47]" />
                    <span>{t.newIntakeSession}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Kiosk Step Router */}
            {kioskStep === 1 && (
              <Step2Conversation
                patient={patient}
                setPatient={setPatient}
                history={history}
                setHistory={setHistory}
                redFlagAlert={redFlagAlert}
                setRedFlagAlert={setRedFlagAlert}
                language={language}
                onNext={() => setKioskStep(2)}
                audioMuted={audioMuted}
                hospitalFacility={hospitalFacility}
                onUpdateFacility={handleUpdateFacility}
                kioskStep={kioskStep}
                onStepChange={(step) => setKioskStep(step)}
                onResetSession={handleResetKiosk}
                onTriggerEmergency={(reason, phrase) => handleTriggerEmergency(reason, phrase)}
                onConfirmEmergency={() => handleConfirmEmergency()}
                onRevertToNormal={handleRevertToNormal}
                onOpenDistributedQueue={handleOpenDistributedQueue}
              />
            )}

            {kioskStep === 2 && (
              <Step1Identity
                patient={patient}
                setPatient={setPatient}
                consent={consent}
                setConsent={setConsent}
                language={language}
                onNext={() => setKioskStep(3)}
                onBack={() => setKioskStep(1)}
                audioMuted={audioMuted}
                loggedInPatient={loggedInPatient}
                redFlagAlert={redFlagAlert}
                onTriggerEmergency={(reason) => handleTriggerEmergency(reason)}
                onConfirmEmergency={() => handleConfirmEmergency()}
                onRevertToNormal={handleRevertToNormal}
                onOpenDistributedQueue={handleOpenDistributedQueue}
              />
            )}

            {kioskStep === 3 && (
              <Step3Documents
                documents={documents}
                setDocuments={setDocuments}
                language={language}
                onNext={() => setKioskStep(4)}
                onBack={() => setKioskStep(2)}
                audioMuted={audioMuted}
              />
            )}

            {kioskStep === 4 && (
              <Step4Summary
                patient={patient}
                history={history}
                documents={documents}
                summary={summary}
                setSummary={setSummary}
                redFlagAlert={redFlagAlert}
                language={language}
                onSubmitToQueue={handleSubmitToQueue}
                onBack={() => setKioskStep(3)}
                audioMuted={audioMuted}
                onConfirmEmergency={() => handleConfirmEmergency()}
                onRevertToNormal={handleRevertToNormal}
                queueItem={
                  queue.find(
                    (q) =>
                      q.patient.tokenNumber === patient.tokenNumber ||
                      (patient.abhaId && q.patient.abhaId === patient.abhaId)
                  ) || null
                }
                facility={hospitalFacility}
                onOpenDistributedQueue={handleOpenDistributedQueue}
              />
            )}
          </div>
        )}

        {/* Physician OPD Consultation Room View */}
        {currentView === 'physician' && (
          <PhysicianScreen
            queue={queue}
            selectedPatientId={selectedPatientId}
            onSelectPatient={setSelectedPatientId}
            onUpdatePatient={updateQueuePatient}
            onOpenFhirModal={setFhirModalItem}
            t={t}
            language={language}
            staffUser={staffUser}
            loggedInPatient={loggedInPatient}
            onGoToStaffLogin={() => setCurrentView('auth')}
            onGoToKiosk={staffUser ? undefined : () => setCurrentView('kiosk')}
            onDemoStaffLogin={() => {
              setStaffUser(SAMPLE_STAFF_USERS[0]);
              setLoggedInPatient(null);
            }}
            onCheckInPatient={handleQuickCheckInPatient}
          />
        )}

        {/* Dedicated Login / Register View (Patient & Staff) */}
        {currentView === 'auth' && (
          <AuthView
            onPatientLogin={(patientData) => {
              setPatient(patientData);
              setLoggedInPatient(patientData);
              setStaffUser(null);
              setKioskStep(1);
              setCurrentView('kiosk');
            }}
            onStaffLogin={(staff) => {
              setStaffUser(staff);
              setLoggedInPatient(null);
              setCurrentView('staff_portal');
            }}
            language={language}
            onGoToKiosk={staffUser ? undefined : () => setCurrentView('kiosk')}
            loggedInPatient={loggedInPatient}
            staffUser={staffUser}
            onLogout={() => {
              setStaffUser(null);
              setLoggedInPatient(null);
              handleResetKiosk();
            }}
          />
        )}

        {/* Hospital Staff Portal View */}
        {currentView === 'staff_portal' && (
          <HospitalStaffPortal
            facility={hospitalFacility}
            onUpdateFacility={handleUpdateFacility}
            staffUser={staffUser}
            loggedInPatient={loggedInPatient}
            isPatientView={!staffUser}
            onDemoStaffLogin={() => {
              setStaffUser(SAMPLE_STAFF_USERS[0]);
              setLoggedInPatient(null);
            }}
            onGoToStaffLogin={() => setCurrentView('auth')}
            onLogout={() => {
              setStaffUser(null);
              setLoggedInPatient(null);
              setCurrentView('auth');
            }}
            onSwitchToKiosk={() => {
              if (!staffUser) {
                setCurrentView('kiosk');
              }
            }}
            onSwitchToPhysician={() => setCurrentView('physician')}
            t={t}
            language={language}
            queue={queue}
            onRefreshQueue={refreshBackendData}
          />
        )}
      </main>

      {/* ABDM FHIR R4 Bundle Modal */}
      <ABDMModal item={fhirModalItem} onClose={() => setFhirModalItem(null)} />

      {/* Emergency Code Red Triage Modal */}
      <EmergencyCodeRedModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        onDismissFalseAlarm={handleRevertToNormal}
        onConfirmEmergency={() => handleConfirmEmergency()}
        isConfirmed={redFlagAlert?.isConfirmed || false}
        triggerReason={redFlagAlert?.reason || 'Critical Triage Red-Flag Identified'}
        triggerPhrase={redFlagAlert?.matchedPhrase}
        patient={patient}
        language={language}
        onEmergencyIssued={(emergencyToken) => {
          setPatient((prev) => ({ ...prev, tokenNumber: emergencyToken }));
        }}
      />

      {/* Distributed Mobile Waiting Area QR Modal */}
      <DistributedMobileQueueModal
        isOpen={isDistributedQueueModalOpen}
        onClose={() => setIsDistributedQueueModalOpen(false)}
        patient={patient}
        history={history}
        setHistory={setHistory}
        documents={documents}
        setDocuments={setDocuments}
        language={language}
        onSubmittedFromMobile={() => {
          setIsDistributedQueueModalOpen(false);
          refreshBackendData();
        }}
      />

      {/* Footer Info & Regulatory Notice with Enhanced Design */}
      <footer className="border-t border-[#E7E1D6] bg-[#FFFFFF] py-3.5 text-xs text-[#7A6C5F] shadow-2xs">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap">
            <ShieldCheck className="w-4 h-4 text-[#3E5B47]" />
            <span className="font-semibold text-[#55473B]">
              {hospitalFacility.name} • {t.appName}
            </span>
            <span className="text-[10px] bg-[#EFE9DF] text-[#3E5B47] px-2 py-0.5 rounded-full border border-[#DDD3C4] font-bold">
              {t.complianceBadge}
            </span>
            {csrfToken && (
              <span className="inline-flex items-center gap-1 bg-[#EBF1EC] text-[#3E5B47] px-2 py-0.5 rounded text-[10px] border border-[#D5E2D7] font-mono font-bold">
                CSRF Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-4 text-[#8C7B6C] flex-wrap">
            <button
              onClick={() => setCurrentView('staff_portal')}
              className="text-[#3E5B47] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.navStaff} ({hospitalFacility.bedInventory.reduce((s, b) => s + b.available, 0)} Beds Open)</span>
            </button>
            <span>•</span>
            {staffUser || loggedInPatient ? (
              <button
                onClick={() => {
                  setStaffUser(null);
                  setLoggedInPatient(null);
                  handleResetKiosk();
                  setCurrentView('auth');
                }}
                className="text-[#BA3C2A] hover:underline font-extrabold flex items-center gap-1.5 cursor-pointer bg-[#FAF0ED] px-2.5 py-1 rounded-lg border border-[#F2D6CF]"
                title="Log out of current active session to stop multiple login"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Log Out ({staffUser?.name || loggedInPatient?.fullName})</span>
              </button>
            ) : (
              <button
                onClick={() => setCurrentView('auth')}
                className="text-[#685A4D] hover:underline font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Hospital Login</span>
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
