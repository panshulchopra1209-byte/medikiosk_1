import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Clock,
  Trash2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  AlertTriangle,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { DigitizedDocument, LanguageCode } from '../../types';
import { SAMPLE_DOCUMENTS, I18N_PROMPTS } from '../../data/mockTemplates';
import { getTranslation } from '../../i18n/translations';
import { speakPrompt } from '../../utils/speech';
import { fetchWithCsrf, safeParseResponse } from '../../utils/csrf';
import medicalOcrImg from '../../assets/images/medical_document_ocr_1788930583595.jpg';

interface Step3DocumentsProps {
  documents: DigitizedDocument[];
  setDocuments: React.Dispatch<React.SetStateAction<DigitizedDocument[]>>;
  language: LanguageCode;
  onNext: () => void;
  onBack: () => void;
  audioMuted: boolean;
}

export const Step3Documents: React.FC<Step3DocumentsProps> = ({
  documents,
  setDocuments,
  language,
  onNext,
  onBack,
  audioMuted,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedDocPreview, setSelectedDocPreview] = useState<DigitizedDocument | null>(
    documents[0] || null
  );

  const dict = getTranslation(language);
  const t = I18N_PROMPTS[language] || I18N_PROMPTS.en;

  const playStepAudio = () => {
    if (audioMuted) return;
    speakPrompt(t.scanningPrompt, language);
  };

  const handleAddSampleDoc = (sampleId: string) => {
    const found = SAMPLE_DOCUMENTS.find((d) => d.id === sampleId);
    if (!found) return;

    if (documents.some((d) => d.id === found.id)) {
      setSelectedDocPreview(found);
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      setDocuments((prev) => {
        const nextList = [...prev, found];
        return nextList.sort(
          (a, b) => new Date(b.documentDate).getTime() - new Date(a.documentDate).getTime()
        );
      });
      setSelectedDocPreview(found);
      setIsProcessing(false);
    }, 400);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;

      try {
        const res = await fetchWithCsrf('/api/ai/ocr-document', {
          method: 'POST',
          body: JSON.stringify({
            base64Data: base64,
            mimeType: file.type || 'image/jpeg',
          }),
        });
        const parsed = await safeParseResponse<{ success: boolean; document: DigitizedDocument }>(res);
        if (parsed.ok && parsed.data?.success && parsed.data?.document) {
          const newDoc: DigitizedDocument = {
            ...parsed.data.document,
            fileName: file.name,
          };
          setDocuments((prev) => [newDoc, ...prev]);
          setSelectedDocPreview(newDoc);
        }
      } catch (err) {
        console.warn('OCR error fallback:', err);
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const removeDoc = (id: string) => {
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    if (selectedDocPreview?.id === id) {
      setSelectedDocPreview(null);
    }
  };

  const totalAbnormal = documents.reduce((sum, d) => sum + (d.abnormalFlagsCount || 0), 0);

  return (
    <div className="w-full space-y-6">
      {/* Header Banner */}
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl overflow-hidden shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12">
          <div className="md:col-span-4 relative h-36 md:h-auto bg-[#F4EFE6]">
            <img
              src={medicalOcrImg}
              alt="Medical Record Scanner"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-2.5 left-3 text-white">
              <span className="text-[10px] font-bold uppercase tracking-wider bg-black/60 px-2 py-0.5 rounded border border-white/20">
                {dict.appBadge}
              </span>
            </div>
          </div>

          <div className="md:col-span-8 p-5 flex flex-col justify-between">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <span className="text-[11px] font-semibold text-[#3E5B47] bg-[#EBF1EC] px-2.5 py-1 rounded-full border border-[#D5E2D7]">
                  {dict.step3Title}
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#2D2621] mt-1.5">
                  {dict.step3Sub}
                </h2>
                <p className="text-xs sm:text-sm text-[#736456] mt-0.5">
                  {t.scanningPrompt}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={playStepAudio}
                  className="text-xs font-semibold text-[#3E5B47] bg-[#F4EFE6] px-3 py-1.5 rounded-xl border border-[#DDD3C5] hover:bg-[#EFE8DD] transition-colors"
                >
                  {dict.audioOn}
                </button>
              </div>
            </div>

            {/* Quick Sample Presets */}
            <div className="mt-4 pt-3 border-t border-[#EFE9DF]">
              <p className="text-xs font-bold text-[#837467] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#9E4F36]" />
                <span>{dict.loadRecordsSample || 'Load Hospital Records for Testing (Click to Add):'}</span>
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {SAMPLE_DOCUMENTS.map((sample) => {
                  const isAdded = documents.some((d) => d.id === sample.id);
                  return (
                    <button
                      key={sample.id}
                      type="button"
                      onClick={() => handleAddSampleDoc(sample.id)}
                      disabled={isProcessing}
                      className={`p-2.5 rounded-xl border text-left transition-all flex flex-col justify-between text-xs ${
                        isAdded
                          ? 'bg-[#EBF1EC] border-[#3E5B47] text-[#2D2621] shadow-xs'
                          : 'bg-[#FAF8F5] border-[#E5DFD5] text-[#55473B] hover:bg-[#F2ECE4]'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <span className="font-bold truncate text-[#2D2621]">
                            {sample.fileName}
                          </span>
                          {isAdded && <CheckCircle2 className="w-3.5 h-3.5 text-[#3E5B47]" />}
                        </div>
                        <p className="text-[11px] text-[#7A6C5F] mt-0.5 line-clamp-2">
                          {sample.summaryFindings}
                        </p>
                      </div>
                      <div className="mt-1.5 text-[10px] text-[#918173] flex items-center justify-between border-t border-[#EAE3D6] pt-1">
                        <span>{sample.documentDate}</span>
                        {sample.abnormalFlagsCount > 0 && (
                          <span className="text-[#BA3C2A] font-bold">
                            {sample.abnormalFlagsCount} {dict.criticalBadge || 'Critical'}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upload and Timeline Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Upload Box */}
        <label className="border-2 border-dashed border-[#C5B9AA] hover:border-[#3E5B47] bg-[#FFFFFF] hover:bg-[#FAF8F5] rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all shadow-xs group">
          <input
            type="file"
            accept="image/*,.pdf"
            onChange={handleFileUpload}
            className="hidden"
            disabled={isProcessing}
          />
          <div className="w-14 h-14 rounded-2xl bg-[#EBF1EC] text-[#3E5B47] flex items-center justify-center mb-3 transition-transform group-hover:scale-105">
            <Upload className="w-7 h-7" />
          </div>
          <span className="text-sm font-bold text-[#2D2621] mb-1">
            {dict.capturePrescriptionTitle || 'Capture / Upload Paper Prescription'}
          </span>
          <span className="text-xs text-[#7A6C5F] max-w-xs">
            {dict.uploadFormatsDesc || 'Supports JPG, PNG, and PDF files. AI automatically parses doctor handwriting and biochemistry panels.'}
          </span>
        </label>

        {/* Timeline List */}
        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-[#2D2621] flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#3E5B47]" />
                <span>
                  {dict.digitizedTimelineTitle || 'Digitized Timeline'} ({documents.length} {dict.recordsCountLabel || 'Records'})
                </span>
              </h3>
              {totalAbnormal > 0 && (
                <span className="bg-[#FAEEEA] text-[#BA3C2A] border border-[#EACEC6] text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span>
                    {totalAbnormal} {dict.abnormalValuesCountLabel || 'Abnormal Values'}
                  </span>
                </span>
              )}
            </div>

            {documents.length === 0 ? (
              <div className="py-8 text-center text-xs text-[#8C7B6C]">
                {dict.noRecordsYetMsg || 'No records attached yet. Select a sample above or upload a prescription.'}
              </div>
            ) : (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setSelectedDocPreview(doc)}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      selectedDocPreview?.id === doc.id
                        ? 'bg-[#FAF4E8] border-[#A37736] text-[#2D2621]'
                        : 'bg-[#FAF8F5] border-[#E8E2D8] text-[#55473B] hover:bg-[#F2ECE4]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <FileText className="w-4 h-4 text-[#3E5B47] flex-shrink-0" />
                      <div className="truncate">
                        <p className="font-bold truncate">{doc.fileName}</p>
                        <span className="text-[11px] text-[#867669]">
                          {doc.documentDate} • {doc.hospitalOrClinic || 'Clinic'}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {doc.abnormalFlagsCount > 0 && (
                        <span className="bg-[#FAEEEA] text-[#BA3C2A] text-[10px] px-1.5 py-0.5 rounded font-bold border border-[#EACEC6]">
                          {doc.abnormalFlagsCount} High
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeDoc(doc.id);
                        }}
                        className="text-[#968678] hover:text-[#BA3C2A] p-1"
                        title="Remove Document"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-[#EAE3D6] text-xs text-[#867669] flex items-center justify-between">
            <span>{dict.complianceBadge}</span>
            <span className="text-[#3E5B47] font-semibold">ABDM FHIR Ready</span>
          </div>
        </div>
      </div>

      {/* Selected Document Extraction Details */}
      {selectedDocPreview && (
        <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#EAE3D6]">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#3E5B47]" />
              <h4 className="text-sm font-bold text-[#2D2621]">
                Extracted Intelligence: {selectedDocPreview.fileName}
              </h4>
            </div>
            <span className="text-xs text-[#867669] font-mono">
              Date: {selectedDocPreview.documentDate}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            {/* Left: Diagnoses & Prescriptions */}
            <div className="space-y-3">
              <div>
                <span className="font-bold text-[#66574B] block mb-1">
                  Extracted Diagnoses:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedDocPreview.extractedDiagnoses?.length ? (
                    selectedDocPreview.extractedDiagnoses.map((dx, i) => (
                      <span
                        key={i}
                        className="bg-[#EBF1EC] text-[#365342] border border-[#CDE0D2] px-2.5 py-1 rounded-lg text-xs font-semibold"
                      >
                        {dx}
                      </span>
                    ))
                  ) : (
                    <span className="text-[#918173] italic">None specified</span>
                  )}
                </div>
              </div>

              {selectedDocPreview.extractedMedications?.length > 0 && (
                <div>
                  <span className="font-bold text-[#66574B] block mb-1">
                    Extracted Medications:
                  </span>
                  <div className="bg-[#FAF8F5] border border-[#E5DFD5] rounded-xl overflow-hidden">
                    <table className="w-full text-left">
                      <thead className="bg-[#F0EAE1] text-[11px] text-[#695B4F] border-b border-[#E5DFD5]">
                        <tr>
                          <th className="p-2">Medicine</th>
                          <th className="p-2">Dose</th>
                          <th className="p-2">Frequency</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#EAE3D6] text-[11px]">
                        {selectedDocPreview.extractedMedications.map((m, idx) => (
                          <tr key={idx}>
                            <td className="p-2 font-bold text-[#2D2621]">{m.drugName}</td>
                            <td className="p-2 text-[#55473B]">{m.dosage}</td>
                            <td className="p-2 text-[#3E5B47] font-semibold">{m.frequency}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Right: Lab Parameters */}
            <div>
              <span className="font-bold text-[#66574B] block mb-1">
                Extracted Biomarkers & Out-of-Range Highlights:
              </span>
              {selectedDocPreview.extractedLabValues?.length ? (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {selectedDocPreview.extractedLabValues.map((lab, i) => (
                    <div
                      key={i}
                      className={`p-2 rounded-xl border flex items-center justify-between text-xs ${
                        lab.isAbnormal
                          ? 'bg-[#FAEEEA] border-[#EACEC6] text-[#BA3C2A]'
                          : 'bg-[#FAF8F5] border-[#E8E2D8] text-[#55473B]'
                      }`}
                    >
                      <div>
                        <span className="font-bold">{lab.testName}: </span>
                        <span className="font-mono font-bold">
                          {lab.value} {lab.unit}
                        </span>
                        {lab.referenceRange && (
                          <span className="text-[10px] opacity-75 ml-1">
                            (Ref: {lab.referenceRange})
                          </span>
                        )}
                      </div>
                      {lab.isAbnormal && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#BA3C2A] text-white">
                          CRITICAL
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[#8C7B6C] italic bg-[#FAF8F5] p-3 rounded-xl border border-[#E8E2D8]">
                  No biochemical lab markers in this document.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between pt-2">
        <button
          type="button"
          onClick={onBack}
          className="px-5 py-3 rounded-xl border border-[#DED6CA] bg-[#FAF8F5] text-[#55473B] hover:bg-[#F2ECE4] text-xs sm:text-sm font-semibold flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{dict.step2Title}</span>
        </button>

        <button
          type="button"
          onClick={onNext}
          id="step3-continue-btn"
          className="px-6 py-3.5 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white font-bold text-xs sm:text-base flex items-center gap-2.5 shadow-sm active:scale-98"
        >
          <span>{dict.step4Title}</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
