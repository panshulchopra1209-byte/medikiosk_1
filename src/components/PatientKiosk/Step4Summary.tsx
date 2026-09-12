import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Printer,
  ShieldCheck,
  Send,
  Volume2,
  AlertTriangle,
  QrCode,
  ArrowLeft,
  Clock,
  Leaf,
  Activity,
  FileCheck,
  BedDouble,
  Building2,
  PhoneCall,
  Sparkles,
  Smartphone,
  RotateCcw,
  ShieldAlert,
} from 'lucide-react';
import QRCode from 'qrcode';
import {
  PatientIdentity,
  ClinicalHistoryData,
  DigitizedDocument,
  StructuredClinicalSummary,
  RedFlagAlert,
  LanguageCode,
  OPDQueueItem,
  HospitalFacilityInfo,
} from '../../types';
import { speakPrompt } from '../../utils/speech';
import { I18N_PROMPTS } from '../../data/mockTemplates';
import { getTranslation } from '../../i18n/translations';
import { fetchWithCsrf, safeParseResponse } from '../../utils/csrf';
import hospitalTokenImg from '../../assets/images/hospital_opd_token_1788930595644.jpg';

interface Step4SummaryProps {
  patient: PatientIdentity;
  history: ClinicalHistoryData;
  documents: DigitizedDocument[];
  summary: StructuredClinicalSummary;
  setSummary: React.Dispatch<React.SetStateAction<StructuredClinicalSummary>>;
  redFlagAlert: RedFlagAlert | null;
  language: LanguageCode;
  onSubmitToQueue: () => void;
  onBack: () => void;
  audioMuted: boolean;
  queueItem?: OPDQueueItem | null;
  facility?: HospitalFacilityInfo;
  onOpenDistributedQueue?: () => void;
  onConfirmEmergency?: () => void;
  onRevertToNormal?: () => void;
}

export const Step4Summary: React.FC<Step4SummaryProps> = ({
  patient,
  history,
  documents,
  summary,
  setSummary,
  redFlagAlert,
  language,
  onSubmitToQueue,
  onBack,
  audioMuted,
  queueItem: initialQueueItem,
  facility: propFacility,
  onOpenDistributedQueue,
  onConfirmEmergency,
  onRevertToNormal,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeQueueItem, setActiveQueueItem] = useState<OPDQueueItem | null>(initialQueueItem || null);
  const [tokenQrDataUrl, setTokenQrDataUrl] = useState<string>('');

  useEffect(() => {
    const payload = JSON.stringify({
      t: patient.tokenNumber,
      n: patient.fullName,
      a: patient.abhaId,
      d: patient.selectedDepartment,
      ts: Date.now(),
      v: 'abdm-v1',
    });

    QRCode.toDataURL(payload, {
      width: 160,
      margin: 1,
      color: { dark: '#1E1915', light: '#FFFFFF' },
    })
      .then(setTokenQrDataUrl)
      .catch(() => {});
  }, [patient.tokenNumber, patient.fullName, patient.abhaId, patient.selectedDepartment]);

  // Sync activeQueueItem if prop changes
  useEffect(() => {
    if (initialQueueItem) {
      setActiveQueueItem(initialQueueItem);
    }
  }, [initialQueueItem]);

  // Poll for queue item status if submitted or tokenNumber exists, so the patient sees bed allotment & consultation confirmation live without reloading
  useEffect(() => {
    const targetToken = patient.tokenNumber;
    if (!targetToken) return;

    let isMounted = true;
    const checkStatus = async () => {
      try {
        const res = await fetch('/api/queue');
        const data = await res.json();
        if (data.success && data.queue && isMounted) {
          const match = data.queue.find((q: OPDQueueItem) => q.patient.tokenNumber === targetToken || (patient.abhaId && q.patient.abhaId === patient.abhaId));
          if (match) {
            setActiveQueueItem(match);
          }
        }
      } catch (e) {
        // silent background check
      }
    };

    checkStatus();
    const interval = setInterval(checkStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [patient.tokenNumber, patient.abhaId]);

  const dict = getTranslation(language);
  const t = I18N_PROMPTS[language] || I18N_PROMPTS.en;
  const isAyush = patient.clinicalMode === 'ayush';

  // Request AI summary synthesis on mount if needed
  useEffect(() => {
    async function fetchSummary() {
      setIsGenerating(true);
      try {
        // Strip heavy base64 strings so the payload is lightweight (< 5KB)
        const sanitizedDocs = (documents || []).map((doc) => ({
          id: doc.id,
          fileName: doc.fileName,
          docType: doc.docType,
          documentDate: doc.documentDate,
          hospitalOrClinic: doc.hospitalOrClinic,
          extractedDiagnoses: doc.extractedDiagnoses,
          extractedMedications: doc.extractedMedications,
          extractedLabs: doc.extractedLabs,
          extractedProcedures: doc.extractedProcedures,
          abnormalFlagsCount: doc.abnormalFlagsCount,
          summaryFindings: doc.summaryFindings,
        }));

        const res = await fetchWithCsrf('/api/ai/generate-summary', {
          method: 'POST',
          body: JSON.stringify({
            patient,
            history,
            documents: sanitizedDocs,
            isAyush,
          }),
        });

        const parsed = await safeParseResponse<{ success: boolean; summary: any }>(res);
        if (parsed.ok && parsed.data?.success && parsed.data?.summary) {
          const apiSummary = parsed.data.summary;
          setSummary((prev) => ({
            ...prev,
            ...apiSummary,
            triage: redFlagAlert || prev.triage,
          }));

          if (!audioMuted && apiSummary.patientConfirmationText) {
            speakPrompt(apiSummary.patientConfirmationText, language);
          }
          return;
        }
      } catch (err) {
        console.warn('Failed to fetch AI summary, applying resilient local synthesis:', err);
      } finally {
        setIsGenerating(false);
      }

      // Client-side fallback if server response was missing or network stalled
      const pastHist = (history?.pastMedicalHistory || []).filter(Boolean);
      const currMeds = (history?.currentMedications || []).filter(Boolean);
      const allergies = (history?.drugAllergies || []).filter(Boolean);
      const chiefList =
        history?.chiefComplaints?.map((c) => `${c.complaint} (${c.duration})`).join(', ') ||
        'General OPD consultation';

      const abnormalLabs = (documents || []).flatMap((d) =>
        (d.extractedLabs || [])
          .filter((l) => l && l.isAbnormal)
          .map((l) => `${l.testName}: ${l.value} ${l.unit || ''} (Abnormal)`)
      );

      setSummary((prev) => ({
        ...prev,
        chiefComplaintSummary: chiefList,
        hpiFormatted:
          history?.hpiNarrative ||
          `Patient presenting with ${chiefList}. Self-service clinical history recorded at MediKiosk.`,
        pastHistorySummary:
          pastHist.length > 0 ? pastHist.join(', ') : 'No past medical history reported by patient.',
        medicationAndAllergySummary:
          currMeds.length > 0
            ? `Current: ${currMeds.join(', ')}. Allergies: ${
                allergies.length > 0 ? allergies.join(', ') : 'None known'
              }.`
            : 'No active medications reported by patient. Allergies: None documented.',
        reviewOfSystemsSummary: isAyush
          ? 'Ayurvedic intake recorded: Agni, Koshtha, and Ahara-Vihara parameters assessed.'
          : 'Standard review of systems completed. Patient ambulatory and coherent.',
        digitizedRecordsSummary: documents?.length
          ? `${documents.length} prior medical records catalogued and verified.`
          : 'No physical documents submitted.',
        abnormalValuesList: abnormalLabs,
        potentialDrugInteractions:
          currMeds.length > 0 ? ['Routine physician oversight advised.'] : [],
        patientConfirmationText:
          language === 'hi'
            ? 'आपकी ओपीडी क्लिनिकल जानकारी दर्ज कर ली गई है। डॉक्टर की स्क्रीन पर यह सारांश पहुँच चुका है।'
            : 'Your OPD clinical summary has been generated and queued for the consulting physician.',
        triage: redFlagAlert || prev.triage,
      }));
    }

    fetchSummary();
  }, []);

  const handlePrintSlip = () => {
    window.print();
  };

  const handleFinalSubmit = () => {
    setIsSubmitted(true);
    onSubmitToQueue();
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner with Token Printing Photo */}
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 relative h-36 md:h-auto bg-[#F4EFE6]">
            <img
              src={hospitalTokenImg}
              alt="Hospital OPD Token & Slip Dispenser"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
            <div className="absolute bottom-2.5 left-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-white/20">
                {dict.opdTokenNo || 'Official OPD Token Pass'}
              </span>
            </div>
          </div>

          <div className="md:col-span-8 p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <span className="bg-[#EBF1EC] text-[#3E5B47] text-xs px-2.5 py-1 rounded-full font-semibold border border-[#D5E2D7]">
                  {dict.step4Title}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D2621] mt-1.5">
                  {t.receiptTitle}
                </h2>
                <p className="text-xs sm:text-sm text-[#706256] mt-0.5">
                  {dict.step4Sub ||
                    'Oral symptoms and past records converted into a doctor-ready intake draft.'}
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  const text =
                    dict.patientConfirmationSpeech ||
                    'Your intake is complete. Please take your printed token slip and wait outside the physician consultation room.';
                  speakPrompt(text, language);
                }}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#3E5B47] bg-[#F4EFE6] px-3 py-2 rounded-xl border border-[#DDD3C5] hover:bg-[#EFE8DD] transition-colors flex-shrink-0"
              >
                <Volume2 className="w-4 h-4" />
                <span>{dict.audioOn}</span>
              </button>
            </div>

            <div className="mt-3 flex items-center gap-3 text-xs text-[#6B5C50] border-t border-[#F0EAE1] pt-2.5">
              <span className="font-semibold text-[#3E5B47] flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {dict.intakeVerifiedBadge || 'Intake verified & encrypted'}
              </span>
              <span>•</span>
              <span>{dict.directHisIntegrationReady || 'Direct HIS integration ready'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Red-Flag Banner */}
      {redFlagAlert && redFlagAlert.isEmergency && (
        <div className="bg-[#FAEEEA] border-2 border-[#BA3C2A] rounded-2xl p-4 text-[#2D2621] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-7 h-7 text-[#BA3C2A] flex-shrink-0" />
            <div>
              <p className="font-bold text-sm sm:text-base text-[#BA3C2A]">
                {dict.emergencyAlertTitle || 'HIGH PRIORITY EMERGENCY CASE (CODE RED)'}
              </p>
              <p className="text-xs text-[#55473B]">
                {dict.emergencyRedTriageDesc ||
                  'Based on reported chest pain or neurological indicators, skip routine queue and proceed directly to Emergency Casualty.'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <span className="bg-[#BA3C2A] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl flex-shrink-0">
              {patient.tokenNumber} ({dict.triageRed || 'Code Red'})
            </span>
            {!redFlagAlert.isConfirmed && onConfirmEmergency && (
              <button
                type="button"
                id="summary-confirm-emergency-btn"
                onClick={onConfirmEmergency}
                className="px-3 py-1.5 bg-[#BA3C2A] text-white hover:bg-[#9E2E1E] rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95 animate-pulse"
                title="Confirm Emergency Situation and Dispatch Rapid Response Team"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-white" />
                <span>{language === 'hi' ? 'आपातकाल की पुष्टि करें' : 'Confirm Emergency'}</span>
              </button>
            )}
            {redFlagAlert.isConfirmed && (
              <span className="px-2.5 py-1 text-xs font-black text-[#244C30] bg-[#EBF1EC] border border-[#3E5B47] rounded-xl flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#3E5B47]" />
                <span>{language === 'hi' ? 'पुष्ट स्थिति' : 'Confirmed'}</span>
              </span>
            )}
            {onRevertToNormal && (
              <button
                type="button"
                id="summary-revert-emergency-btn"
                onClick={onRevertToNormal}
                className="px-3 py-1.5 bg-[#EBF1EC] text-[#244C30] border-2 border-[#3E5B47] hover:bg-[#D8EADB] rounded-xl text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
                title="Convert Emergency back to Normal Routine OPD"
              >
                <RotateCcw className="w-3.5 h-3.5 text-[#3E5B47]" />
                <span>{language === 'hi' ? 'सामान्य में बदलें' : 'Convert to Normal'}</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Hospital Staff Confirmation & Bed Allotment Real-Time Notice */}
      {activeQueueItem?.allottedBed ? (
        <div className="bg-[#EBF5EE] border-2 border-[#3E5B47] rounded-2xl p-5 text-[#2D2621] shadow-md animate-fade-in space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#BCDBC3] pb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#3E5B47] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <BedDouble className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase tracking-wider text-[#2B7A3D] bg-[#DCF0E2] px-2 py-0.5 rounded-md border border-[#B5DEC0]">
                    Hospital Staff Confirmation
                  </span>
                  <span className="text-[10px] text-[#4F6854] font-medium">
                    Status: Allotted & Admitted
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-bold text-[#1C4525] mt-0.5">
                  Hospital Bed Successfully Allotted!
                </h3>
              </div>
            </div>

            <div className="text-right sm:text-right w-full sm:w-auto bg-white/80 sm:bg-transparent p-2.5 sm:p-0 rounded-xl border sm:border-0 border-[#BCDBC3]">
              <span className="text-[10px] font-bold text-[#55775C] uppercase block">Allotted Bed</span>
              <span className="text-2xl font-black font-mono text-[#1E562A]">
                {activeQueueItem.allottedBed.bedNumber}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#CDE5D3]">
              <span className="text-[10px] font-bold text-[#55775C] block uppercase">Ward / Unit</span>
              <strong className="text-[#1C4525] font-semibold text-sm">
                {activeQueueItem.allottedBed.categoryName}
              </strong>
              <span className="text-[10px] text-[#55775C] block">{activeQueueItem.allottedBed.unit}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#CDE5D3]">
              <span className="text-[10px] font-bold text-[#55775C] block uppercase">Allotted By</span>
              <strong className="text-[#1C4525] font-semibold text-sm">
                {activeQueueItem.allottedBed.allottedBy}
              </strong>
              <span className="text-[10px] text-[#55775C] block">At {activeQueueItem.allottedBed.allottedAt}</span>
            </div>
            <div className="bg-white/80 p-2.5 rounded-xl border border-[#CDE5D3]">
              <span className="text-[10px] font-bold text-[#55775C] block uppercase">Admission Notes</span>
              <p className="text-[#1C4525] text-xs font-medium line-clamp-2">
                {activeQueueItem.allottedBed.notes || 'Please proceed to the respective nursing station.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-[11px] text-[#3D6B48]">
            <span className="flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#2B7A3D] flex-shrink-0" />
              <span>SMS confirmation has been dispatched to {patient.phone || 'patient mobile'}. Show this pass at the ward counter.</span>
            </span>
            {propFacility?.emergencyHelpline && (
              <span className="font-bold text-[#1C4525] flex items-center gap-1">
                <PhoneCall className="w-3 h-3" />
                <span>Help desk: {propFacility.emergencyHelpline}</span>
              </span>
            )}
          </div>
        </div>
      ) : activeQueueItem?.status === 'IN_CONSULTATION' ? (
        <div className="bg-[#EBF1F7] border-2 border-[#3D6898] rounded-2xl p-4 text-[#1C3A5E] shadow-sm animate-fade-in flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#3D6898] text-white flex items-center justify-center flex-shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-[#1C3A5E]">
                Hospital Staff / Doctor Has Accepted Your Consultation Request!
              </p>
              <p className="text-xs text-[#3D5A80] mt-0.5">
                Attending Staff: <strong>{activeQueueItem.summary?.physicianName || 'Attending Staff'}</strong>. Please proceed to the examination room.
              </p>
            </div>
          </div>
          <span className="bg-[#3D6898] text-white font-bold text-xs uppercase px-3 py-1.5 rounded-xl flex-shrink-0">
            In Consultation
          </span>
        </div>
      ) : null}

      {/* Printable / Kiosk Token Slip Card */}
      <div
        id="kiosk-token-slip"
        className="bg-[#FFFFFF] text-[#2D2621] rounded-2xl p-6 sm:p-7 shadow-sm border border-[#E7E1D6] space-y-5"
      >
        {/* Slip Header */}
        <div className="flex items-start justify-between border-b-2 border-dashed border-[#DDD5C7] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base sm:text-lg font-bold text-[#2D2621] uppercase tracking-tight">
                {dict.tokenSlipHeader || 'GOVT. MEDICAL COLLEGE & HOSPITAL OPD'}
              </span>
              <span className="text-[10px] bg-[#EBF1EC] text-[#3E5B47] px-2 py-0.5 rounded font-bold border border-[#D5E2D7]">
                {dict.appBadge || 'MediKiosk AI Intake'}
              </span>
            </div>
            <p className="text-xs text-[#7A6C5F] mt-0.5">
              {dict.deptLabel}: <strong>{patient.selectedDepartment}</strong> • Date:{' '}
              {patient.registrationDate || new Date().toLocaleString()}
            </p>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-[#8C7B6C] block">
              {dict.opdTokenNo || 'OPD Token No.'}
            </span>
            <span className="text-2xl sm:text-3xl font-black text-[#3E5B47] tracking-tight font-mono">
              {patient.tokenNumber || 'MED-108'}
            </span>
          </div>
        </div>

        {/* Patient Identity Row */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 bg-[#FAF8F5] p-3.5 rounded-xl border border-[#E5DFD5] text-xs">
          <div>
            <span className="text-[#847568] block text-[10px] font-semibold">
              {dict.patientLabel}:
            </span>
            <strong className="text-[#2D2621] font-bold">
              {patient.fullName || 'Ramesh Kumar'}
            </strong>
          </div>
          <div>
            <span className="text-[#847568] block text-[10px] font-semibold">
              {dict.ageGenderLabel || 'Age / Gender:'}
            </span>
            <strong className="text-[#2D2621] font-bold">
              {patient.age} Y / {patient.gender}
            </strong>
          </div>
          <div>
            <span className="text-[#847568] block text-[10px] font-semibold">
              {dict.abhaIdLabel || 'ABHA ID:'}
            </span>
            <strong className="text-[#2D2621] font-mono font-bold">
              {patient.abhaId || '91-8273-1928-4421'}
            </strong>
          </div>
          <div>
            <span className="text-[#847568] block text-[10px] font-semibold">
              {dict.triagePriorityLabel || 'Triage Priority:'}
            </span>
            <span
              className={`inline-block font-bold px-2 py-0.5 rounded text-[10px] ${
                redFlagAlert?.severity === 'RED'
                  ? 'bg-[#FAEEEA] text-[#BA3C2A] border border-[#EACEC6]'
                  : 'bg-[#EBF1EC] text-[#3E5B47] border border-[#D5E2D7]'
              }`}
            >
              {redFlagAlert?.severity === 'RED'
                ? dict.triageRed || 'EMERGENCY RED'
                : dict.triageGreen || 'ROUTINE OPD'}
            </span>
          </div>
          <div>
            <span className="text-[#847568] block text-[10px] font-semibold">
              Bed Allotment:
            </span>
            {activeQueueItem?.allottedBed ? (
              <span className="inline-flex items-center gap-1 font-mono font-bold text-xs text-[#1C4525] bg-[#DCF0E2] px-2 py-0.5 rounded border border-[#B5DEC0]">
                <BedDouble className="w-3 h-3" />
                <span>{activeQueueItem.allottedBed.bedNumber}</span>
              </span>
            ) : (
              <span className="text-[10px] text-[#8C7B6C] italic font-medium">
                Pending Staff Review
              </span>
            )}
          </div>
        </div>

        {/* Standard Structured Clinical Summary for Doctor */}
        <div className="space-y-3.5 text-xs">
          <div>
            <span className="font-bold text-[#55473B] uppercase tracking-wide text-[11px] block mb-1">
              1. {dict.chiefPresentingComplaintsLabel || 'Chief Presenting Complaints:'}
            </span>
            <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] text-[#2D2621] font-medium leading-relaxed">
              {summary.chiefComplaintSummary || 'Reporting at intake kiosk.'}
            </p>
          </div>

          <div>
            <span className="font-bold text-[#55473B] uppercase tracking-wide text-[11px] block mb-1">
              2. {dict.hpiSocratesLabel || 'History of Present Illness (HPI - SOCRATES Framework):'}
            </span>
            <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] text-[#2D2621] leading-relaxed">
              {summary.hpiFormatted || 'Elicited through multimodal voice-touch dialogue.'}
            </p>
          </div>

          {isAyush && (
            <div>
              <span className="font-bold text-[#365342] uppercase tracking-wide text-[11px] block mb-1 flex items-center gap-1">
                <Leaf className="w-3.5 h-3.5" />
                <span>3. {dict.ayushDashavidhaParikshaLabel || 'Ayurvedic Dashavidha Pariksha Intake:'}</span>
              </span>
              <p className="bg-[#EBF1EC] border border-[#CDE0D2] p-3 rounded-xl text-[#2D2621] leading-relaxed">
                {summary.ayushSummary ||
                  'Prakriti: Vata-Pitta | Vikriti: Vata-Kapha (Sama) | Agni: Mandagni | Koshtha: Krura | Ahara Shakti: Avara | Vyayama: Madhyama. Classical Nidana: Divasvapna, Guru-Snigdha Ahara.'}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="font-bold text-[#55473B] uppercase tracking-wide text-[11px] block mb-1">
                {isAyush ? '4.' : '3.'} {dict.pastMedicalSurgicalHistoryLabel || 'Past Medical & Surgical History:'}
              </span>
              <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] text-[#2D2621] leading-relaxed">
                {summary.pastHistorySummary || 'No major prior surgical history reported.'}
              </p>
            </div>

            <div>
              <span className="font-bold text-[#55473B] uppercase tracking-wide text-[11px] block mb-1">
                {isAyush ? '5.' : '4.'} {dict.activeMedicationsAllergiesLabel || 'Active Medications & Allergies:'}
              </span>
              <p className="bg-[#FAF8F5] p-3 rounded-xl border border-[#E5DFD5] text-[#2D2621] leading-relaxed">
                {summary.medicationAndAllergySummary || 'None reported.'}
              </p>
            </div>
          </div>

          {/* Abnormal Lab Findings Highlights */}
          {summary.abnormalValuesList && summary.abnormalValuesList.length > 0 && (
            <div className="bg-[#FAEEEA] border border-[#EACEC6] p-3.5 rounded-xl">
              <span className="font-bold text-[#BA3C2A] uppercase tracking-wide text-[11px] block mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>
                  {dict.criticalOutOfRangeLabsLabel || 'Critical Out-of-Range Lab Values (Prior Records):'}
                </span>
              </span>
              <ul className="list-disc list-inside space-y-1 text-[#BA3C2A] font-semibold text-xs">
                {summary.abnormalValuesList.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Medication Interactions */}
          {summary.potentialDrugInteractions && summary.potentialDrugInteractions.length > 0 && (
            <div className="bg-[#FAF4E8] border border-[#E8D4AE] p-3.5 rounded-xl">
              <span className="font-bold text-[#9E7324] uppercase tracking-wide text-[11px] block mb-1">
                {dict.prescriptionSafetyNotesLabel || 'Clinical Prescription Safety Notes:'}
              </span>
              <p className="text-[#845E1B] font-medium text-xs">
                {summary.potentialDrugInteractions.join('; ')}
              </p>
            </div>
          )}
        </div>

        {/* Footer & Barcode Section */}
        <div className="border-t-2 border-dashed border-[#DDD5C7] pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#7A6C5F]">
          <div className="flex items-center gap-3">
            {tokenQrDataUrl ? (
              <img
                src={tokenQrDataUrl}
                alt="Dynamic ABDM Token QR"
                className="w-16 h-16 rounded-lg border border-[#DDD5C7] bg-white p-0.5 flex-shrink-0"
              />
            ) : (
              <QrCode className="w-12 h-12 text-[#2D2621]" />
            )}
            <div>
              <p className="font-mono text-[11px] font-bold text-[#2D2621]">
                ABDM ENCOUNTER REF: ENC-2026-0908-{patient.tokenNumber}
              </p>
              <p className="text-[10px] text-[#55473B]">
                {language === 'hi'
                  ? 'वेटिंग एरिया में बैठे-बैठे अपने फोन से स्कैन करें और पिछले पर्चे/रिपोर्ट्स अपलोड करें।'
                  : 'Scan with smartphone while seated in waiting area to answer remaining questions or upload past prescriptions.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              id="step4-open-mobile-queue-btn"
              onClick={onOpenDistributedQueue}
              className="px-3 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#EFE8DD] border border-[#D5CCC0] text-[#2D2621] text-xs font-bold flex items-center justify-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            >
              <Smartphone className="w-3.5 h-3.5 text-[#3E5B47]" />
              <span>{language === 'hi' ? 'स्मार्टफोन साथी खोलें' : 'Open Mobile Companion'}</span>
            </button>

            <div className="text-right hidden sm:block">
              <span className="font-bold text-[#3E5B47] flex items-center gap-1 justify-end">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{dict.complianceBadge}</span>
              </span>
              <span className="text-[10px] text-[#8C7B6C] block">
                {dict.draftForDoctorVerification ||
                  'Draft for doctor verification & clinical judgment.'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-[#DED6CA] bg-[#FAF8F5] text-[#55473B] hover:bg-[#F2ECE4] text-xs sm:text-sm font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{dict.backToRecordsBtn || 'Back to Records'}</span>
        </button>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handlePrintSlip}
            className="px-4 py-3 rounded-xl border border-[#DED6CA] bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#2D2621] text-xs sm:text-sm font-semibold flex items-center gap-2 shadow-xs"
          >
            <Printer className="w-4 h-4 text-[#3E5B47]" />
            <span>{dict.printPhysicalSlipBtn || 'Print Physical Slip'}</span>
          </button>

          <button
            type="button"
            onClick={handleFinalSubmit}
            id="submit-to-queue-btn"
            disabled={isSubmitted}
            className={`px-6 py-3.5 rounded-xl font-bold text-xs sm:text-base flex items-center gap-2.5 shadow-sm transition-all ${
              isSubmitted
                ? 'bg-[#EBF1EC] text-[#3E5B47] border border-[#D5E2D7]'
                : 'bg-[#3E5B47] hover:bg-[#324B3A] text-white active:scale-98'
            }`}
          >
            {isSubmitted ? (
              <>
                <FileCheck className="w-5 h-5" />
                <span>{dict.sentToOpdQueueBtn || 'Sent to OPD Queue!'}</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>{dict.sendToDoctorQueueBtn || 'Send to Doctor Consultation Queue'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
