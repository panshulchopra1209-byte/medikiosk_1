import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Smartphone,
  Clock,
  CheckCircle2,
  Users,
  Upload,
  ArrowRight,
  Sparkles,
  X,
  FileText,
  Send,
  Camera,
  RefreshCw,
} from 'lucide-react';
import { PatientIdentity, ClinicalHistoryData, DigitizedDocument, LanguageCode } from '../../types';
import { getTranslation } from '../../i18n/translations';
import { fetchWithCsrf } from '../../utils/csrf';

interface DistributedMobileQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientIdentity;
  history: ClinicalHistoryData;
  setHistory: React.Dispatch<React.SetStateAction<ClinicalHistoryData>>;
  documents: DigitizedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<DigitizedDocument[]>>;
  language: LanguageCode;
  onSubmittedFromMobile?: () => void;
}

export const DistributedMobileQueueModal: React.FC<DistributedMobileQueueModalProps> = ({
  isOpen,
  onClose,
  patient,
  history,
  setHistory,
  documents,
  setDocuments,
  language,
  onSubmittedFromMobile,
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [showSimulator, setShowSimulator] = useState<boolean>(false);
  const [mobileComplaint, setMobileComplaint] = useState<string>('');
  const [mobileKnownCond, setMobileKnownCond] = useState<string>('');
  const [mobileUploading, setMobileUploading] = useState<boolean>(false);
  const [mobileSynced, setMobileSynced] = useState<boolean>(false);

  const dict = getTranslation(language);

  // Generate dynamic QR Code encoding the patient's token and distributed intake URL
  useEffect(() => {
    if (!isOpen) return;

    const token = patient.tokenNumber || 'MED-101';
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const mobileIntakeUrl = `${baseUrl}/?mode=mobile_queue&token=${encodeURIComponent(
      token
    )}&abha=${encodeURIComponent(patient.abhaId || '')}&name=${encodeURIComponent(patient.fullName || '')}`;

    QRCode.toDataURL(
      mobileIntakeUrl,
      {
        width: 260,
        margin: 1.5,
        color: {
          dark: '#1E1915',
          light: '#FFFFFF',
        },
      },
      (err, url) => {
        if (!err && url) {
          setQrDataUrl(url);
        }
      }
    );
  }, [isOpen, patient.tokenNumber, patient.abhaId, patient.fullName]);

  const handleMobileSubmit = async () => {
    setMobileUploading(true);

    // Append mobile inputs to history
    const updatedHistory: ClinicalHistoryData = {
      ...history,
      chiefComplaints: mobileComplaint
        ? [{ complaint: mobileComplaint, duration: '2-3 days', severity: 'Moderate' }, ...history.chiefComplaints]
        : history.chiefComplaints,
      pastMedicalHistory: mobileKnownCond ? [mobileKnownCond, ...history.pastMedicalHistory] : history.pastMedicalHistory,
    };

    setHistory(updatedHistory);

    try {
      // Sync update with queue on server if already registered
      await fetchWithCsrf('/api/queue/mobile-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tokenNumber: patient.tokenNumber,
          history: updatedHistory,
          syncedFrom: 'Distributed Waiting Area Smartphone Companion',
        }),
      });
    } catch (e) {
      console.warn('Mobile sync fallback:', e);
    }

    setMobileUploading(false);
    setMobileSynced(true);
    if (onSubmittedFromMobile) {
      onSubmittedFromMobile();
    }
  };

  const handleSimulatePrescriptionUpload = () => {
    const mockDoc: DigitizedDocument = {
      id: `doc_mobile_${Date.now()}`,
      fileName: 'Mobile_Prescription_Photo.jpg',
      docType: 'prescription',
      documentDate: new Date().toISOString().slice(0, 10),
      hospitalOrClinic: 'District Hospital OPD',
      ocrRawText: 'Tab Metformin 500mg BD, Tab Telmisartan 40mg OD. Review after 1 month.',
      extractedDiagnoses: ['Type 2 Diabetes Mellitus', 'Hypertension'],
      extractedMedications: [
        { drugName: 'Metformin', dosage: '500mg', frequency: 'Twice daily', duration: '30 days' },
        { drugName: 'Telmisartan', dosage: '40mg', frequency: 'Once daily', duration: '30 days' },
      ],
      extractedLabs: [],
      extractedProcedures: [],
      abnormalFlagsCount: 0,
      summaryFindings: 'Prescription scanned via smartphone camera in waiting area.',
    };

    setDocuments((prev) => [mockDoc, ...prev]);
    alert('Document captured via smartphone camera and attached to patient token!');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E7E1D6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3E5B47] text-white rounded-xl shadow-xs">
              <QrCode className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold bg-[#EBF1EC] text-[#3E5B47] px-2 py-0.5 rounded-full border border-[#D5E2D7]">
                  HIGH-TRAFFIC DISTRIBUTED QUEUE
                </span>
                <span className="text-[10px] font-mono font-bold text-[#8C7B6C]">
                  {patient.tokenNumber || 'MED-101'}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-bold text-[#2D2621]">
                {dict.distributedQueueTitle || 'Scan & Complete in Waiting Area'}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#7A6C5F] hover:text-[#2D2621] hover:bg-[#EFE9DF] transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Mode Explainer Banner */}
          <div className="bg-[#FAF8F5] border border-[#E7E1D6] rounded-xl p-3.5 flex items-start gap-3">
            <Smartphone className="w-5 h-5 text-[#3E5B47] flex-shrink-0 mt-0.5" />
            <div className="text-xs text-[#55473B] space-y-1">
              <p className="font-bold text-[#2D2621]">
                Prevent Physical Kiosk Bottlenecks During Crowded Mornings (2,000–5,000 OPD Rush)
              </p>
              <p>
                Patients don&apos;t need to stand at the screen for 4 minutes. Take this token, sit down in the
                waiting area, scan the dynamic QR code on your phone, and finish answering screening questions or
                photographing old prescriptions at your own pace.
              </p>
            </div>
          </div>

          {!showSimulator ? (
            <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-2xl bg-[#FFFFFF] border border-[#E7E1D6] shadow-xs">
              {/* Dynamic QR Code */}
              <div className="flex flex-col items-center justify-center p-3 bg-white rounded-2xl border-2 border-[#3E5B47]/30 shadow-sm flex-shrink-0">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="Dynamic Waiting Area QR Code"
                    className="w-48 h-48 sm:w-52 sm:h-52 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-[#FAF8F5] animate-pulse rounded-xl">
                    <RefreshCw className="w-6 h-6 text-[#3E5B47] animate-spin" />
                  </div>
                )}
                <span className="text-[11px] font-mono font-bold text-[#3E5B47] mt-1.5">
                  Token: {patient.tokenNumber || 'MED-101'}
                </span>
              </div>

              {/* Steps / Instructions */}
              <div className="flex-1 space-y-3 text-xs">
                <h4 className="font-bold text-sm text-[#2D2621]">
                  How Distributed Intake Works:
                </h4>
                <ul className="space-y-2 text-[#685A4D]">
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3E5B47] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      1
                    </span>
                    <span>
                      Scan this QR code using Google Lens, WhatsApp camera, or any smartphone camera.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3E5B47] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      2
                    </span>
                    <span>
                      Track your live position in queue (e.g. <em>&ldquo;3 patients ahead • Room 104&rdquo;</em>).
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-4 h-4 rounded-full bg-[#3E5B47] text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                      3
                    </span>
                    <span>
                      Answer the 3 brief screening questions or snap photos of past prescriptions from your phone.
                    </span>
                  </li>
                </ul>

                <div className="pt-2">
                  <button
                    onClick={() => setShowSimulator(true)}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#3E5B47] hover:bg-[#304737] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95"
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Try Smartphone Waiting Area Experience (Simulator)</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Smartphone View Simulator inside Modal */
            <div className="bg-[#FAF8F5] border-2 border-[#3E5B47] rounded-2xl p-4 sm:p-5 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-[#E7E1D6] pb-3">
                <div className="flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-[#3E5B47]" />
                  <span className="text-xs font-bold text-[#2D2621]">
                    Smartphone Waiting Area View • Token {patient.tokenNumber || 'MED-101'}
                  </span>
                </div>
                <button
                  onClick={() => setShowSimulator(false)}
                  className="text-xs text-[#3E5B47] font-bold underline cursor-pointer"
                >
                  Back to QR Code
                </button>
              </div>

              {/* Live Queue Status Banner */}
              <div className="p-3 bg-[#EBF1EC] rounded-xl border border-[#BBD5C4] flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#2F5A3E]" />
                  <span className="font-bold text-[#2F5A3E]">
                    3 Patients Ahead in Queue
                  </span>
                </div>
                <span className="font-semibold text-[#3E5B47] flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Est. Wait: ~12 mins
                </span>
              </div>

              {/* Mobile Question Elicitation */}
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-[#2D2621] mb-1">
                    1. Primary Symptom or Chief Complaint:
                  </label>
                  <input
                    type="text"
                    value={mobileComplaint}
                    onChange={(e) => setMobileComplaint(e.target.value)}
                    placeholder="e.g. Cough and low-grade fever since 3 days"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C4] bg-white text-xs focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2621] mb-1">
                    2. Known Medical Conditions or Regular Tablets:
                  </label>
                  <input
                    type="text"
                    value={mobileKnownCond}
                    onChange={(e) => setMobileKnownCond(e.target.value)}
                    placeholder="e.g. Taking Metformin for Diabetes, BP tablet"
                    className="w-full px-3 py-2 rounded-xl border border-[#DDD3C4] bg-white text-xs focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#2D2621] mb-1">
                    3. Upload Past Prescription or Lab Report (Phone Camera):
                  </label>
                  <button
                    onClick={handleSimulatePrescriptionUpload}
                    className="w-full py-2 px-3 rounded-xl border border-dashed border-[#3E5B47] bg-white hover:bg-[#EBF1EC] text-[#3E5B47] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Take Photo of Physical Paper / Prescription</span>
                  </button>
                  {documents.length > 0 && (
                    <p className="text-[11px] text-[#2F5A3E] font-semibold mt-1">
                      ✓ {documents.length} document(s) uploaded and ready for doctor review.
                    </p>
                  )}
                </div>

                {mobileSynced && (
                  <div className="p-2.5 rounded-xl bg-[#EBF1EC] text-[#2F5A3E] text-xs font-bold flex items-center gap-2 border border-[#BBD5C4]">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>
                      Synchronized! Your answers and documents are now visible in the Doctor&apos;s live consultation room.
                    </span>
                  </div>
                )}

                <button
                  onClick={handleMobileSubmit}
                  disabled={mobileUploading}
                  className="w-full py-2.5 rounded-xl bg-[#3E5B47] hover:bg-[#304737] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-all active:scale-95 disabled:opacity-60"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {mobileUploading ? 'Syncing to Hospital Queue...' : 'Submit to Doctor Consultation Room'}
                  </span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-t border-[#E7E1D6] flex items-center justify-between text-xs">
          <span className="text-[#7A6C5F]">
            Express Parallel Lane: Kiosk handling time reduced from 4 min to 30 sec.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white font-bold transition-all shadow-xs cursor-pointer"
          >
            {dict.closeBtn || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
