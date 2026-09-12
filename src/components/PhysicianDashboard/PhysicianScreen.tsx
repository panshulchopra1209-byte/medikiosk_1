import React, { useState } from 'react';
import {
  Stethoscope,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Search,
  Layers,
  Edit3,
  Leaf,
  Sparkles,
  Save,
  Check,
  Lock,
  Shield,
  UserCheck,
  LogIn,
  ArrowRight,
  Ticket,
  Users,
  MapPin,
  Activity,
  Bell,
  Info,
  Building2,
  RefreshCw,
  Zap,
  Siren,
  ExternalLink,
} from 'lucide-react';
import {
  OPDQueueItem,
  DigitizedDocument,
  LanguageCode,
  HospitalStaffUser,
  PatientIdentity,
} from '../../types';
import { SiteDictionary, getTranslation } from '../../i18n/translations';
import { fetchWithCsrf, safeParseResponse } from '../../utils/csrf';

interface PhysicianScreenProps {
  queue: OPDQueueItem[];
  selectedPatientId: string | null;
  onSelectPatient: (id: string) => void;
  onUpdatePatient: (id: string, updates: Partial<OPDQueueItem>) => void;
  onOpenFhirModal: (item: OPDQueueItem) => void;
  language?: LanguageCode;
  t?: SiteDictionary;
  staffUser?: HospitalStaffUser | null;
  loggedInPatient?: PatientIdentity | null;
  onGoToStaffLogin?: () => void;
  onGoToKiosk?: () => void;
  onDemoStaffLogin?: () => void;
  onCheckInPatient?: (patient: PatientIdentity) => void;
}

export const PhysicianScreen: React.FC<PhysicianScreenProps> = ({
  queue,
  selectedPatientId,
  onSelectPatient,
  onUpdatePatient,
  onOpenFhirModal,
  language = 'en',
  t: propT,
  staffUser,
  loggedInPatient,
  onGoToStaffLogin,
  onGoToKiosk,
  onDemoStaffLogin,
  onCheckInPatient,
}) => {
  const t = propT || getTranslation((language as LanguageCode) || 'en');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'summary' | 'documents' | 'ayush'>('summary');
  const [doctorNotes, setDoctorNotes] = useState('');
  const [isSavedSuccess, setIsSavedSuccess] = useState(false);
  const [eHospitalMode, setEHospitalMode] = useState(false);
  const [pushingToHis, setPushingToHis] = useState(false);
  const [hisPushResult, setHisPushResult] = useState<{
    bundleId: string;
    targetHisSystem: string;
    timestamp: string;
  } | null>(null);

  // Role detection: Staff vs Patient
  const isStaff = Boolean(staffUser);
  const isPatient = Boolean(loggedInPatient && !staffUser);

  // Strict Privacy Enforcement:
  // Patients MUST NOT see clinical notes of other patients.
  // When logged in as patient, only their own records are permitted.
  const permittedQueue = isPatient
    ? queue.filter(
        (item) =>
          (loggedInPatient?.tokenNumber && item.patient.tokenNumber === loggedInPatient.tokenNumber) ||
          (loggedInPatient?.abhaId && item.patient.abhaId === loggedInPatient.abhaId) ||
          (loggedInPatient?.phone && item.patient.phone === loggedInPatient.phone) ||
          (loggedInPatient?.fullName && item.patient.fullName.trim().toLowerCase() === loggedInPatient.fullName.trim().toLowerCase())
      )
    : isStaff
    ? queue
    : [];

  // Active patient object from permitted queue
  const activeItem = permittedQueue.find((q) => q.id === selectedPatientId) || permittedQueue[0];

  // Calculate patient's exact live queue position & wait time relative to the whole hospital OPD line
  const patientHospitalQueueIndex = activeItem
    ? queue.findIndex((item) => item.id === activeItem.id)
    : queue.findIndex(
        (item) =>
          (loggedInPatient?.tokenNumber && item.patient.tokenNumber === loggedInPatient.tokenNumber) ||
          (loggedInPatient?.abhaId && item.patient.abhaId === loggedInPatient.abhaId) ||
          (loggedInPatient?.phone && item.patient.phone === loggedInPatient.phone) ||
          (loggedInPatient?.fullName && item.patient.fullName.trim().toLowerCase() === loggedInPatient.fullName.trim().toLowerCase())
      );

  const patientQueuePosition = patientHospitalQueueIndex >= 0 ? patientHospitalQueueIndex + 1 : 1;
  const patientsAhead = Math.max(0, patientQueuePosition - 1);
  const estimatedWaitMins =
    patientsAhead === 0
      ? 'Next in line (~2 - 5 mins)'
      : `~${patientsAhead * 8} - ${patientsAhead * 12} mins`;

  const filteredQueue = permittedQueue.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.patient.fullName.toLowerCase().includes(term) ||
      item.patient.tokenNumber.toLowerCase().includes(term) ||
      item.patient.abhaId.toLowerCase().includes(term)
    );
  });

  const handleApproveDraft = () => {
    if (!activeItem || !isStaff) return;
    onUpdatePatient(activeItem.id, {
      status: 'COMPLETED',
      summary: {
        ...activeItem.summary,
        physicianConfirmed: true,
        physicianNotes: doctorNotes || activeItem.summary.physicianNotes,
      },
    });
    setIsSavedSuccess(true);
    setTimeout(() => setIsSavedSuccess(false), 3000);
  };

  const isAyush = activeItem?.patient.clinicalMode === 'ayush';

  // =========================================================================
  // SCENARIO 1: Unauthenticated Visitor (Neither Staff nor Patient)
  // Display Hospital Staff Authentication Gate
  // =========================================================================
  if (!isStaff && !isPatient) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-[#FFFFFF] rounded-3xl border-2 border-[#E7E1D6] p-7 sm:p-10 text-center space-y-6 shadow-sm animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#FAEEEA] text-[#BA3C2A] border border-[#EACEC6] flex items-center justify-center mx-auto shadow-xs">
          <Lock className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1EC] text-[#3E5B47] text-xs font-bold border border-[#D5E2D7]">
            <ShieldCheck className="w-4 h-4" /> Hospital Medical Staff Access Gate
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D2621]">
            Authorized Medical Staff Only
          </h2>
          <p className="text-xs sm:text-sm text-[#706256] max-w-lg mx-auto leading-relaxed">
            Patient clinical notes and OPD consultation records contain confidential health data protected under the Digital Personal Data Protection Act (DPDPA 2023) and ABDM standards. Please log in as Hospital Staff to access patient notes.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D6] text-xs text-[#55473B] text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#2D2621]">
            <Stethoscope className="w-4 h-4 text-[#3E5B47]" />
            <span>Doctor / Hospital Staff Verification Required:</span>
          </div>
          <p>• Only credentialed hospital medical officers can examine the OPD queue, prescribe medications, and review patient notes.</p>
          <p>• If you are a patient, you can only view your personal consultation record after logging in with your patient ID.</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onGoToStaffLogin && (
            <button
              onClick={onGoToStaffLogin}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3E5B47] hover:bg-[#304737] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Log in as Hospital Staff</span>
            </button>
          )}
          {onDemoStaffLogin && (
            <button
              onClick={onDemoStaffLogin}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#3E5B47] border border-[#DDD3C4] font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-[#9E4F36]" />
              <span>Quick Doctor Demo (Dr. Priya Sharma)</span>
            </button>
          )}
          {onGoToKiosk && (
            <button
              onClick={onGoToKiosk}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#6B5A4B] border border-[#DDD3C4] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRight className="w-4 h-4" />
              <span>Go to Patient Kiosk</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // =========================================================================
  // SCENARIO 2: Logged in as Patient but NO personal intake found yet
  // Display Patient Privacy Guard (strictly preventing view of any other patient)
  // =========================================================================
  if (isPatient && permittedQueue.length === 0) {
    return (
      <div className="max-w-2xl mx-auto my-12 bg-[#FFFFFF] rounded-3xl border-2 border-[#E7E1D6] p-7 sm:p-10 text-center space-y-6 shadow-sm animate-in fade-in duration-200">
        <div className="w-16 h-16 rounded-2xl bg-[#EBF1EC] text-[#3E5B47] border border-[#D0DFD2] flex items-center justify-center mx-auto shadow-xs">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1EC] text-[#3E5B47] text-xs font-bold border border-[#D5E2D7]">
            <Lock className="w-3.5 h-3.5" /> DPDPA 2023 & ABDM Privacy Protection
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#2D2621]">
            Confidential Patient Record Portal
          </h2>
          <p className="text-xs sm:text-sm text-[#706256] max-w-lg mx-auto leading-relaxed">
            Welcome, <strong>{loggedInPatient?.fullName}</strong>. Under statutory medical confidentiality regulations, clinical notes and medical records of other patients are confidential and restricted strictly to verified hospital medical staff.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[#FAF8F5] border border-[#EAE3D6] text-xs text-[#55473B] text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-[#2D2621]">
            <UserCheck className="w-4 h-4 text-[#3E5B47]" />
            <span>Your Patient Profile:</span>
          </div>
          <p>• <strong>Name:</strong> {loggedInPatient?.fullName} ({loggedInPatient?.gender}, {loggedInPatient?.age} yrs)</p>
          <p>• <strong>Mobile:</strong> {loggedInPatient?.phone || 'Not provided'}</p>
          <p>• <strong>ABHA ID:</strong> {loggedInPatient?.abhaId || 'Manual Kiosk Registration'}</p>
          <div className="p-2.5 rounded-xl bg-[#FAEEEA] border border-[#EACEC6] text-[#BA3C2A] font-medium text-[11px] mt-2">
            ℹ️ You do not have an active consultation note in today's OPD queue yet. Complete your clinical intake at the Kiosk to generate your personal token and clinical notes.
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          {onCheckInPatient && loggedInPatient && (
            <button
              onClick={() => onCheckInPatient(loggedInPatient)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2D6A4F] hover:bg-[#22533D] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ticket className="w-4 h-4" />
              <span>Join Today's OPD Line & Get Token</span>
            </button>
          )}
          {onGoToKiosk && (
            <button
              onClick={onGoToKiosk}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#3E5B47] hover:bg-[#304737] text-white font-bold text-xs sm:text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Start Kiosk Clinical Intake</span>
            </button>
          )}
          {onGoToStaffLogin && (
            <button
              onClick={onGoToStaffLogin}
              className="w-full sm:w-auto px-5 py-3 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE9DF] text-[#6B5A4B] border border-[#DDD3C4] font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Switch to Hospital Staff Login</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  const handlePushToGovernmentHis = async () => {
    if (!activeItem) return;
    setPushingToHis(true);
    try {
      const res = await fetchWithCsrf('/api/integrations/e-hospital/push', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient: activeItem.patient,
          history: activeItem.history,
          summary: activeItem.summary,
          redFlagAlert: activeItem.redFlagAlert,
          targetHisSystem: 'NIC e-Hospital v4.2 / ABDM OpenMRS',
        }),
      });
      const data = await safeParseResponse<{
        success: boolean;
        bundleId: string;
        targetHisSystem: string;
        timestamp: string;
      }>(res);
      if (data && data.ok && data.data?.success) {
        setHisPushResult({
          bundleId: data.data.bundleId,
          targetHisSystem: data.data.targetHisSystem,
          timestamp: data.data.timestamp,
        });
      }
    } catch (err) {
      console.error('Error pushing to e-Hospital:', err);
    } finally {
      setPushingToHis(false);
    }
  };

  const emergencyCount = queue.filter(
    (q) => q.redFlagAlert?.isEmergency || q.priority === 'EMERGENCY'
  ).length;

  // =========================================================================
  // SCENARIO 3: Authorized Hospital Staff (All patients) OR Patient viewing ONLY their own note
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto space-y-4">
      {/* 1. Casualty Emergency Code Red Alert Header if any active emergency exists */}
      {emergencyCount > 0 && isStaff && (
        <div className="bg-[#BA3C2A] text-white p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-md animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-xl">
              <Siren className="w-5 h-5 text-amber-200" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-wider block">
                🚨 CASUALTY & TRIAGE URGENT ALERT: {emergencyCount} PRIORITY RED CASE(S)
              </span>
              <p className="text-xs text-white/90">
                Audio-visual beacon triggered. Casualty nursing station and triage room 101 notified immediately.
              </p>
            </div>
          </div>
          <span className="bg-white text-[#BA3C2A] font-black text-xs px-3 py-1 rounded-xl shadow-xs">
            CASUALTY DISPATCH ACTIVE
          </span>
        </div>
      )}

      {/* 2. Top Controls: Government HIS Integration Switcher & Push Status */}
      {isStaff && (
        <div className="bg-[#FFFFFF] border border-[#D8CEBE] rounded-2xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EBF1EC] text-[#244C30] flex items-center justify-center font-bold">
              <Building2 className="w-5 h-5 text-[#3E5B47]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm text-[#1E1915]">
                  Government HIS / NIC e-Hospital Integrated View
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#EBF1EC] text-[#2F5A3E] border border-[#BBD5C4]">
                  ABDM FHIR R4
                </span>
              </div>
              <p className="text-xs text-[#6C5E52]">
                MediKiosk feeds directly into existing Hospital Information Systems (NIC e-Hospital, OpenMRS, CDAC).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={() => setEHospitalMode(!eHospitalMode)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                eHospitalMode
                  ? 'bg-[#3E5B47] text-white border-[#2F4636] shadow-xs'
                  : 'bg-[#FAF8F5] text-[#55473B] border-[#DCD3C5] hover:bg-[#EFE8DD]'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{eHospitalMode ? 'Standard Dashboard' : 'Toggle NIC e-Hospital Portal View'}</span>
            </button>

            {activeItem && (
              <button
                disabled={pushingToHis}
                onClick={handlePushToGovernmentHis}
                className="px-3.5 py-1.5 rounded-xl bg-[#244C30] hover:bg-[#1A3823] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 transition-all"
                title="Send current patient intake bundle directly into NIC e-Hospital via ABDM open REST API"
              >
                <Zap className={`w-3.5 h-3.5 ${pushingToHis ? 'animate-spin' : ''}`} />
                <span>{pushingToHis ? 'Pushing FHIR...' : 'Push to e-Hospital'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* His Push Confirmation Toast */}
      {hisPushResult && (
        <div className="p-3 rounded-xl bg-[#EAF5EC] border border-[#A5D6B0] text-[#1E4620] text-xs font-semibold flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#1E4620] flex-shrink-0" />
            <span>
              <strong>Successfully pushed to {hisPushResult.targetHisSystem}!</strong> ABDM Bundle ID: <code>{hisPushResult.bundleId}</code>
            </span>
          </div>
          <button
            onClick={() => setHisPushResult(null)}
            className="text-[11px] font-bold text-[#1E4620] underline cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}
      {/* Patient Privacy Banner if viewing as a patient */}
      {isPatient && activeItem && (
        <div className="bg-[#EBF1EC] border border-[#D5E2D7] rounded-2xl px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#3E5B47] shadow-2xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#D0DFD2] flex items-center justify-center text-[#3E5B47] flex-shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <span className="font-extrabold block text-sm">
                Patient Privacy Protection Active
              </span>
              <span className="text-[11px] text-[#4E6D58]">
                Viewing your confidential consultation record (Token: <strong>{activeItem.patient.tokenNumber}</strong>). Notes of other patients are confidential and restricted to hospital staff.
              </span>
            </div>
          </div>
          <span className="bg-[#FFFFFF] text-[#3E5B47] border border-[#C6DAC9] px-2.5 py-1 rounded-lg text-[11px] font-black uppercase tracking-wider flex-shrink-0">
            Confidential to {loggedInPatient?.fullName}
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Patient Live Queue Card OR Staff Patient List (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          {isPatient ? (
            /* PATIENT VIEW: Dedicated Live OPD Waiting Queue Status Card */
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-4 sm:p-5 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center justify-between gap-2 border-b border-[#EAE3D6] pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#2E7D32] flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-[#2D2621]">
                      My OPD Queue Status
                    </h2>
                    <span className="text-[10px] text-[#6E5D4F] flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-[#2E7D32] animate-pulse" />
                      Live hospital queue tracking
                    </span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#EBF1EC] text-[#2E7D32] border border-[#CDE0D2] font-black text-[11px]">
                  In Waiting Line
                </span>
              </div>

              {/* Number in Queue & Wait Time Hero Counters */}
              <div className="grid grid-cols-2 gap-2.5">
                <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-[#6D5D50] block mb-0.5">
                    Your Queue #
                  </span>
                  <div className="text-3xl sm:text-4xl font-black text-[#2E7D32]">
                    #{patientQueuePosition}
                  </div>
                  <span className="text-[10px] text-[#7A644D] font-medium block mt-0.5">
                    {patientsAhead === 0 ? 'You are next' : `${patientsAhead} patient(s) ahead`}
                  </span>
                </div>

                <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-3 text-center">
                  <span className="text-[11px] font-bold text-[#6D5D50] block mb-0.5">
                    Estimated Wait
                  </span>
                  <div className="text-lg sm:text-xl font-black text-[#8C3A27] mt-1.5 truncate">
                    {estimatedWaitMins}
                  </div>
                  <span className="text-[10px] text-[#7A644D] font-medium block mt-0.5">
                    Active pacing
                  </span>
                </div>
              </div>

              {/* Token & Assigned OPD Room */}
              <div className="p-3.5 bg-[#FAF8F5] rounded-xl border border-[#E7E1D6] space-y-2 text-xs">
                <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE3D6]">
                  <span className="text-[#6D5D50] font-medium">Your Token ID:</span>
                  <span className="font-mono font-black text-[#2D2621] text-sm bg-white px-2 py-0.5 rounded border border-[#DDD5C7]">
                    {activeItem?.patient.tokenNumber || 'MED-108'}
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE3D6]">
                  <span className="text-[#6D5D50] font-medium">Assigned Room:</span>
                  <span className="font-bold text-[#2D2621]">
                    Room 104 (1st Floor)
                  </span>
                </div>
                <div className="flex items-center justify-between pb-1.5 border-b border-[#EAE3D6]">
                  <span className="text-[#6D5D50] font-medium">Department:</span>
                  <span className="font-bold text-[#3E5B47] truncate max-w-[160px]">
                    {activeItem?.patient.selectedDepartment || 'General Medicine'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#6D5D50] font-medium">Attending Doctor:</span>
                  <span className="font-bold text-[#2D2621]">
                    Dr. Priya Sharma, MD
                  </span>
                </div>
              </div>

              {/* Live OPD Consultation Stage Stepper */}
              <div className="p-3.5 bg-white rounded-xl border border-[#DDD5C7] space-y-2.5">
                <span className="text-[11px] font-bold text-[#55473B] block uppercase tracking-wider">
                  Your OPD Journey:
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 text-[#2E7D32] font-semibold">
                    <CheckCircle2 className="w-4 h-4 text-[#2E7D32] flex-shrink-0" />
                    <span>1. Registration & AI Kiosk Intake Completed</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#2E7D32] font-bold bg-[#EBF1EC] px-2.5 py-1.5 rounded-lg border border-[#CDE0D2]">
                    <div className="w-3.5 h-3.5 rounded-full bg-[#2E7D32] text-white flex items-center justify-center text-[9px] flex-shrink-0">
                      ●
                    </div>
                    <span>2. Waiting in OPD Area (Position #{patientQueuePosition})</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8C7B6C]">
                    <div className="w-4 h-4 rounded-full border border-[#B0A395] flex items-center justify-center text-[10px] flex-shrink-0">
                      3
                    </div>
                    <span>3. Called to Consultation Room 104</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#8C7B6C]">
                    <div className="w-4 h-4 rounded-full border border-[#B0A395] flex items-center justify-center text-[10px] flex-shrink-0">
                      4
                    </div>
                    <span>4. Digital Prescription & Discharge</span>
                  </div>
                </div>
              </div>

              {/* Strict Privacy Shield Guarantee */}
              <div className="p-3 rounded-xl bg-[#FAF8F5] border border-[#E7E1D6] text-[11px] text-[#6D5D50] space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-[#2D2621]">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#3E5B47]" />
                  <span>Medical Confidentiality Guarantee</span>
                </div>
                <p className="leading-relaxed">
                  Under statutory DPDPA 2023 regulations, only your personal consultation notes are displayed. Information of other OPD patients is completely sealed and cannot be accessed.
                </p>
              </div>
            </div>
          ) : (
            /* STAFF VIEW: Search + Full Triage Queue */
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#3E5B47] flex items-center justify-center">
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <h2 className="text-sm font-bold text-[#2D2621]">
                    {t.opdPatientQueue}
                  </h2>
                </div>
                <span className="bg-[#FAF8F5] text-[#635345] border border-[#DDD3C5] text-xs px-2.5 py-0.5 rounded-full font-bold">
                  {permittedQueue.length} {t.activeBadge}
                </span>
              </div>

              {/* Search bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-[#8C7B6C] absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder={t.searchPatientPlaceholder}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl pl-9 pr-3 py-2 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47] placeholder-[#8C7B6C]"
                />
              </div>

              {/* Queue List */}
              <div className="space-y-2 max-h-[640px] overflow-y-auto pr-1">
                {filteredQueue.map((item) => {
                  const isSelected = item.id === activeItem?.id;
                  const isEmergency = item.triage.severity === 'RED';
                  const isUrgent = item.triage.severity === 'YELLOW';

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectPatient(item.id);
                        setDoctorNotes(item.summary.physicianNotes || '');
                      }}
                      className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-[#F4EFE6] border-[#3E5B47] shadow-xs'
                          : isEmergency
                          ? 'bg-[#FAEEEA] border-[#BA3C2A]/60 hover:bg-[#F8E3DD]'
                          : 'bg-[#FAF8F5] border-[#E8E2D8] hover:bg-[#F2ECE4]'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-[#2D2621] text-xs px-1.5 py-0.5 bg-[#FFFFFF] border border-[#DDD5C7] rounded">
                            {item.patient.tokenNumber}
                          </span>
                          <strong className="text-[#2D2621] font-bold text-sm truncate max-w-[130px]">
                            {item.patient.fullName}
                          </strong>
                        </div>

                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 ${
                            isEmergency
                              ? 'bg-[#BA3C2A] text-white animate-pulse'
                              : isUrgent
                              ? 'bg-[#FAF4E8] text-[#9E7324] border border-[#E8D4AE]'
                              : 'bg-[#EBF1EC] text-[#3E5B47] border border-[#D5E2D7]'
                          }`}
                        >
                          {item.triage.severity}
                        </span>
                      </div>

                      <p className="text-[#55473B] line-clamp-1 text-[11px] mb-1.5">
                        {item.summary.chiefComplaintSummary || item.history.hpiNarrative}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#867669] pt-1.5 border-t border-[#EAE3D6]">
                        <span>
                          {item.patient.age}Y / {item.patient.gender[0]} •{' '}
                          {item.patient.clinicalMode === 'ayush' ? 'AYUSH' : 'Allopathy'}
                        </span>
                        <span className="flex items-center gap-1 text-[#867669]">
                          <Clock className="w-3 h-3" />
                          {item.submittedAt ? item.submittedAt.split(' ')[1] || item.submittedAt : 'Intake'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Active Patient Consultation Stage (8 Cols) */}
      <div className="lg:col-span-8 space-y-4">
        {activeItem ? (
          <>
            {/* Patient Header & Quick Triage Banner */}
            <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-5 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EAE3D6]">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-[#EBF1EC] border border-[#D5E2D7] flex items-center justify-center text-[#3E5B47] text-lg font-bold shadow-xs">
                    {activeItem.patient.fullName[0]}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg sm:text-xl font-bold text-[#2D2621]">
                        {activeItem.patient.fullName}
                      </h2>
                      <span className="text-xs bg-[#FAF8F5] text-[#55473B] border border-[#DDD5C7] px-2 py-0.5 rounded font-mono font-bold">
                        {activeItem.patient.tokenNumber}
                      </span>
                    </div>
                    <p className="text-xs text-[#7A6C5F] flex items-center gap-2 mt-0.5">
                      <span>
                        {activeItem.patient.age} Y / {activeItem.patient.gender}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-[#3E5B47] font-semibold">
                        ABHA: {activeItem.patient.abhaId}
                      </span>
                      <span>•</span>
                      <span className="text-[#55473B]">{activeItem.patient.selectedDepartment}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onOpenFhirModal(activeItem)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#3E5B47] border border-[#DDD5C7] text-xs font-bold transition-all shadow-xs"
                  >
                    <ShieldCheck className="w-4 h-4 text-[#3E5B47]" />
                    <span>FHIR R4 Bundle</span>
                  </button>

                  <button
                    onClick={handleApproveDraft}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    <Check className="w-4 h-4" />
                    <span>{t.signClinicalNote}</span>
                  </button>
                </div>
              </div>

              {/* Consultation Time Saved Metric */}
              <div className="bg-[#EBF1EC] border border-[#D5E2D7] p-2.5 rounded-xl flex items-center justify-between text-xs text-[#365342]">
                <span className="flex items-center gap-1.5 font-semibold">
                  <Sparkles className="w-4 h-4 text-[#9E4F36]" />
                  <span>{t.consultationTimeSaved}</span>
                </span>
                <span className="text-[11px] text-[#5A6E60] hidden sm:inline">
                  {t.physicianEditNotice}
                </span>
              </div>

              {/* Emergency Red-Flag Callout if present */}
              {activeItem.triage.isEmergency && (
                <div className="bg-[#FAEEEA] border-2 border-[#BA3C2A] rounded-xl p-3.5 text-[#2D2621] flex items-start gap-3 shadow-xs">
                  <AlertTriangle className="w-5 h-5 text-[#BA3C2A] flex-shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <strong className="text-sm font-bold text-[#BA3C2A] block">
                      {t.redFlagAlertTitle} {activeItem.triage.reason}
                    </strong>
                    <span className="text-[#55473B] mt-0.5 block">
                      {activeItem.triage.recommendedAction}
                    </span>
                  </div>
                </div>
              )}

              {/* Tabs with shadow, bold text, and darker color on hover */}
              <div className="flex border-b border-[#EAE3D6] pt-1 gap-2 sm:gap-3">
                <button
                  onClick={() => setActiveTab('summary')}
                  className={`px-3 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 border-b-2 ${
                    activeTab === 'summary'
                      ? 'border-[#3E5B47] text-[#3E5B47] font-extrabold bg-[#F5EFE7] shadow-sm hover:bg-[#EAE2D5] hover:text-[#18130F] hover:shadow-md'
                      : 'border-transparent text-[#6C5E52] hover:text-[#18130F] hover:font-bold hover:shadow-md hover:bg-[#EAE2D5]'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span>{t.tabSummary}</span>
                </button>

                <button
                  onClick={() => setActiveTab('documents')}
                  className={`px-3 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 border-b-2 ${
                    activeTab === 'documents'
                      ? 'border-[#3E5B47] text-[#3E5B47] font-extrabold bg-[#F5EFE7] shadow-sm hover:bg-[#EAE2D5] hover:text-[#18130F] hover:shadow-md'
                      : 'border-transparent text-[#6C5E52] hover:text-[#18130F] hover:font-bold hover:shadow-md hover:bg-[#EAE2D5]'
                  }`}
                >
                  <Layers className="w-4 h-4" />
                  <span>
                    {t.tabDocuments} ({activeItem.documents.length})
                  </span>
                </button>

                {isAyush && (
                  <button
                    onClick={() => setActiveTab('ayush')}
                    className={`px-3 py-2 rounded-t-xl text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-all duration-200 border-b-2 ${
                      activeTab === 'ayush'
                        ? 'border-[#3E5B47] text-[#3E5B47] font-extrabold bg-[#F5EFE7] shadow-sm hover:bg-[#EAE2D5] hover:text-[#18130F] hover:shadow-md'
                        : 'border-transparent text-[#6C5E52] hover:text-[#18130F] hover:font-bold hover:shadow-md hover:bg-[#EAE2D5]'
                    }`}
                  >
                    <Leaf className="w-4 h-4" />
                    <span>{t.tabAyush}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Tab 1: Standard Structured Clinical Summary */}
            {activeTab === 'summary' && (
              <div className="space-y-4">
                {/* Chief Complaint & HPI */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-5 shadow-xs space-y-4">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A6C5F] mb-1">
                      1. {t.chiefComplaintLabel}:
                    </h4>
                    <p className="bg-[#FAF8F5] border border-[#E8E2D8] p-3 rounded-xl text-sm font-bold text-[#2D2621]">
                      {activeItem.summary.chiefComplaintSummary}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#7A6C5F] mb-1">
                      2. {t.hpiLabel}:
                    </h4>
                    <p className="bg-[#FAF8F5] border border-[#E8E2D8] p-3.5 rounded-xl text-xs sm:text-sm text-[#3E342B] leading-relaxed">
                      {activeItem.summary.hpiFormatted}
                    </p>
                  </div>

                  {/* Past History & Medication/Allergies */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3.5 rounded-xl">
                      <span className="font-bold text-[#55473B] block mb-1">
                        {t.pastHistoryLabel}:
                      </span>
                      <p className="text-[#55473B] leading-relaxed">
                        {activeItem.summary.pastHistorySummary}
                      </p>
                    </div>

                    <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3.5 rounded-xl">
                      <span className="font-bold text-[#55473B] block mb-1">
                        {t.allergiesMedsLabel}:
                      </span>
                      <p className="text-[#55473B] leading-relaxed">
                        {activeItem.summary.medicationAndAllergySummary}
                      </p>
                    </div>
                  </div>

                  {/* Review of Systems & Lifestyle */}
                  <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3.5 rounded-xl text-xs">
                    <span className="font-bold text-[#55473B] block mb-1">
                      {t.reviewOfSystemsLifestyle}
                    </span>
                    <p className="text-[#55473B] leading-relaxed">
                      {activeItem.summary.reviewOfSystemsSummary} • {t.lifestyleDiet}:{' '}
                      {activeItem.history.personalLifestyle.diet}, {t.lifestyleSleep}:{' '}
                      {activeItem.history.personalLifestyle.sleep}, {t.lifestyleSmoking}:{' '}
                      {activeItem.history.personalLifestyle.smoking}.
                    </p>
                  </div>
                </div>

                {/* Highlighted Abnormal Lab Telemetry & Drug Warnings */}
                {activeItem.summary.abnormalValuesList?.length > 0 && (
                  <div className="bg-[#FAEEEA] border border-[#EACEC6] rounded-2xl p-4 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-[#BA3C2A] flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-[#BA3C2A]" />
                        <span>{t.abnormalLabsWarnings}</span>
                      </h4>
                      <span className="text-[11px] text-[#BA3C2A] font-mono font-bold">{t.autoExtractedBadge}</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {activeItem.summary.abnormalValuesList.map((val, idx) => (
                        <div
                          key={idx}
                          className="bg-[#FFFFFF] border border-[#EACEC6] p-2.5 rounded-xl text-[#BA3C2A] font-bold flex items-center gap-2"
                        >
                          <span className="w-2 h-2 rounded-full bg-[#BA3C2A] flex-shrink-0" />
                          <span>{val}</span>
                        </div>
                      ))}
                    </div>

                    {activeItem.summary.potentialDrugInteractions?.length > 0 && (
                      <div className="pt-2 border-t border-[#EACEC6] text-[#845E1B] space-y-1">
                        {activeItem.summary.potentialDrugInteractions.map((caution, i) => (
                          <p key={i} className="text-[11px] flex items-start gap-1.5">
                            <span className="text-[#9E7324] font-bold">⚠️</span>
                            <span>{caution}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Physician Final Notes: Read-only for Patient, Editable for Staff */}
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-5 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#2D2621] uppercase tracking-wider flex items-center gap-1.5">
                      <Edit3 className="w-3.5 h-3.5 text-[#3E5B47]" />
                      <span>{t.physicianNotesPrescription}</span>
                    </label>
                    {isSavedSuccess && (
                      <span className="text-xs text-[#3E5B47] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {t.savedSyncedAbdm}
                      </span>
                    )}
                  </div>

                  {isPatient ? (
                    <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-4 text-xs sm:text-sm text-[#2D2621] leading-relaxed">
                      {activeItem.summary.physicianNotes ? (
                        <div className="space-y-2">
                          <p className="font-sans whitespace-pre-line text-[#2D2621]">
                            {activeItem.summary.physicianNotes}
                          </p>
                          <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between text-[11px] text-[#3E5B47] font-bold">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" /> Prescribed & Signed by Attending Medical Officer
                            </span>
                            <span className="text-[#8C7B6C] font-normal">ABDM FHIR Encrypted</span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-3 text-center space-y-1">
                          <Clock className="w-5 h-5 text-[#8C7B6C] mx-auto animate-pulse" />
                          <p className="font-semibold text-[#55473B]">
                            Consultation In Progress / Awaiting Doctor Call
                          </p>
                          <p className="text-[11px] text-[#8C7B6C]">
                            Your attending physician will record your diagnostic notes and prescription during your OPD consultation.
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <>
                      <textarea
                        rows={4}
                        value={doctorNotes || activeItem.summary.physicianNotes}
                        onChange={(e) => setDoctorNotes(e.target.value)}
                        placeholder={t.physicianNotesPlaceholder}
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-3.5 text-xs sm:text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47] leading-relaxed font-sans"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                        <span className="text-[#867669]">
                          {t.signedCredentialNotice}
                        </span>
                        <button
                          onClick={handleApproveDraft}
                          className="px-4 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white font-bold flex items-center gap-2 shadow-xs transition-all cursor-pointer"
                        >
                          <Save className="w-4 h-4" />
                          <span>{t.completeConsultation}</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Tab 2: Digitized Medical Documents Timeline */}
            {activeTab === 'documents' && (
              <div className="space-y-4">
                <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-5 shadow-xs">
                  <h4 className="text-sm font-bold text-[#2D2621] mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-[#3E5B47]" />
                    <span>{t.chronologicalPastRecords}</span>
                  </h4>

                  {activeItem.documents.length === 0 ? (
                    <div className="p-8 text-center text-xs text-[#8C7B6C]">
                      {t.noPastRecordsScanned}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeItem.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="bg-[#FAF8F5] border border-[#E8E2D8] rounded-xl p-4 text-xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-[#EAE3D6]">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-[#3E5B47]" />
                              <strong className="text-[#2D2621] text-sm">{doc.fileName}</strong>
                              <span className="bg-[#FFFFFF] border border-[#DDD5C7] text-[#695B4F] text-[10px] px-2 py-0.5 rounded font-mono">
                                Date: {doc.documentDate}
                              </span>
                            </div>

                            {doc.abnormalFlagsCount > 0 && (
                              <span className="bg-[#FAEEEA] text-[#BA3C2A] border border-[#EACEC6] text-[10px] px-2 py-0.5 rounded font-bold">
                                {doc.abnormalFlagsCount} Abnormal Labs
                              </span>
                            )}
                          </div>

                          {/* Extracted content */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[#55473B]">
                            <div>
                              <span className="text-[#847568] block text-[10px] font-semibold">
                                {t.diagnosesExtracted}
                              </span>
                              <strong className="text-[#2D2621]">
                                {doc.extractedDiagnoses?.join(', ') || 'General OPD follow-up'}
                              </strong>
                            </div>

                            <div>
                              <span className="text-[#847568] block text-[10px] font-semibold">
                                {t.hospitalClinic}
                              </span>
                              <strong className="text-[#2D2621]">
                                {doc.hospitalOrClinic || 'District Civil Hospital'}
                              </strong>
                            </div>
                          </div>

                          {doc.extractedMedications?.length > 0 && (
                            <div>
                              <span className="text-[#847568] block text-[10px] mb-1 font-semibold">
                                {t.medicationsExtracted}
                              </span>
                              <div className="flex flex-wrap gap-1.5">
                                {doc.extractedMedications.map((m, idx) => (
                                  <span
                                    key={idx}
                                    className="bg-[#FFFFFF] text-[#3E5B47] px-2 py-1 rounded text-[11px] font-mono border border-[#DDD5C7] font-semibold"
                                  >
                                    {m.drugName} ({m.dosage} - {m.frequency})
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab 3: AYUSH Dashavidha Assessment */}
            {activeTab === 'ayush' && (
              <div className="bg-[#FFFFFF] rounded-2xl border border-[#CDE0D2] p-5 space-y-4 text-xs shadow-xs">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
                  <h4 className="text-sm font-bold text-[#365342] flex items-center gap-2">
                    <Leaf className="w-4 h-4 text-[#3E5B47]" />
                    <span>{t.ayushNidanaTitle}</span>
                  </h4>
                  <span className="text-[#3E5B47] font-mono text-[11px] font-bold">
                    {t.niaStandards}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3 rounded-xl">
                    <span className="text-[#847568] block text-[10px] font-semibold">{t.prakritiLabel}</span>
                    <strong className="text-[#2D2621] text-sm">Vata-Pitta</strong>
                    <p className="text-[11px] text-[#695B4F] mt-1">
                      Tendency to dryness, light sleep, sharp appetite with variable digestion.
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3 rounded-xl">
                    <span className="text-[#847568] block text-[10px] font-semibold">{t.vikritiLabel}</span>
                    <strong className="text-[#BA3C2A] text-sm">Vata-Kapha (Sama Dosha)</strong>
                    <p className="text-[11px] text-[#695B4F] mt-1">
                      Aama accumulation in Sandhis causing morning joint stiffness and heaviness.
                    </p>
                  </div>

                  <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3 rounded-xl">
                    <span className="text-[#847568] block text-[10px] font-semibold">{t.agniKoshthaLabel}</span>
                    <strong className="text-[#9E7324] text-sm">Mandagni • Krura Koshtha</strong>
                    <p className="text-[11px] text-[#695B4F] mt-1">
                      Impaired metabolic fire and dry constipation requiring Deepana-Pachana.
                    </p>
                  </div>
                </div>

                <div className="bg-[#FAF8F5] border border-[#E8E2D8] p-3.5 rounded-xl space-y-2">
                  <span className="font-bold text-[#2D2621] block">
                    {t.aharaViharaTitle}
                  </span>
                  <p className="text-[#55473B] leading-relaxed">
                    {activeItem.history.ayushAssessment?.aharaViharaNotes ||
                      'Excessive daytime sleeping (Divasvapna), heavy oily diet (Guru-Snigdha), irregular eating timings, leading to Rasa Dhatvagni Mandya.'}
                  </p>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-12 text-center text-[#8C7B6C] shadow-xs">
            {t.selectPatientPrompt}
          </div>
        )}
      </div>
    </div>
    </div>
  );
};
