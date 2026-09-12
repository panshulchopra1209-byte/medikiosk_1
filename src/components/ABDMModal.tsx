import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  Download,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { OPDQueueItem } from '../types';

interface ABDMModalProps {
  item: OPDQueueItem | null;
  onClose: () => void;
}

export const ABDMModal: React.FC<ABDMModalProps> = ({ item, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!item) return null;

  const fhirBundle = {
    resourceType: 'Bundle',
    id: `bundle-${item.patient.abhaId.replace(/[^a-zA-Z0-9]/g, '')}`,
    meta: {
      versionId: '1',
      lastUpdated: new Date().toISOString(),
      profile: ['https://nrces.in/ndhm/fhir/r4/StructureDefinition/ClinicalArtifactBundle'],
    },
    identifier: {
      system: 'https://abdm.gov.in/bundles',
      value: `ABDM-INTAKE-${item.id}`,
    },
    type: 'document',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:patient-${item.patient.abhaId}`,
        resource: {
          resourceType: 'Patient',
          id: item.patient.abhaId,
          identifier: [
            {
              system: 'https://healthid.ndhm.gov.in',
              value: item.patient.abhaId,
            },
          ],
          name: [{ text: item.patient.fullName }],
          telecom: [{ system: 'phone', value: item.patient.phone }],
          gender: item.patient.gender.toLowerCase(),
          birthDate: `${new Date().getFullYear() - item.patient.age}-01-01`,
        },
      },
      {
        fullUrl: `urn:uuid:encounter-${item.id}`,
        resource: {
          resourceType: 'Encounter',
          status: 'arrived',
          class: { code: 'AMB', display: 'ambulatory' },
          subject: { reference: `Patient/${item.patient.abhaId}` },
          period: { start: item.submittedAt },
          serviceType: { text: item.patient.selectedDepartment },
        },
      },
      {
        fullUrl: `urn:uuid:composition-${item.id}`,
        resource: {
          resourceType: 'Composition',
          status: 'final',
          type: {
            coding: [
              {
                system: 'http://snomed.info/sct',
                code: '371530004',
                display: 'Clinical consultation report',
              },
            ],
            text: `${item.patient.clinicalMode.toUpperCase()} OPD Intake Record`,
          },
          subject: { reference: `Patient/${item.patient.abhaId}` },
          date: item.submittedAt,
          title: 'MediKiosk Clinical Intake Summary',
          section: [
            {
              title: 'Chief Complaints',
              text: {
                status: 'generated',
                div: `<div>${item.summary.chiefComplaintSummary}</div>`,
              },
            },
            {
              title: 'History of Present Illness',
              text: {
                status: 'generated',
                div: `<div>${item.summary.hpiFormatted}</div>`,
              },
            },
            {
              title: 'Triage Status',
              text: {
                status: 'generated',
                div: `<div>Severity: ${item.triage.severity} (Reason: ${item.triage.reason})</div>`,
              },
            },
            {
              title: 'Attached Documents',
              text: {
                status: 'generated',
                div: `<div>${item.documents.length} historical records processed with OCR.</div>`,
              },
            },
          ],
        },
      },
    ],
  };

  const jsonString = JSON.stringify(fhirBundle, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ABDM_FHIR_${item.patient.tokenNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-[#EAE3D6] flex items-center justify-between bg-[#FAF8F5]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EBF1EC] text-[#3E5B47] border border-[#D5E2D7] flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                <span>ABDM FHIR R4 Clinical Artifact Bundle</span>
                <span className="text-xs font-mono bg-[#EBF1EC] text-[#3E5B47] border border-[#D5E2D7] px-2 py-0.5 rounded font-bold">
                  NRCeS Compliant
                </span>
              </h3>
              <p className="text-xs text-[#7A6C5F]">
                Patient: <strong>{item.patient.fullName}</strong> | ABHA: {item.patient.abhaId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8C7B6C] hover:text-[#2D2621] hover:bg-[#F2ECE4]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: JSON Viewer */}
        <div className="p-4 flex-1 overflow-y-auto bg-[#FAF8F5] font-mono text-xs text-[#2D2621] border-b border-[#EAE3D6]">
          <pre className="whitespace-pre-wrap">{jsonString}</pre>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#FFFFFF] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#55473B]">
            <CheckCircle2 className="w-4 h-4 text-[#3E5B47]" />
            <span>Ready for Ayushman Bharat Health Information Exchange (HIE-CM)</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-[#FAF8F5] hover:bg-[#F2ECE4] text-[#55473B] border border-[#DDD5C7] flex items-center gap-1.5 font-semibold transition-all shadow-xs"
            >
              {copied ? <Check className="w-4 h-4 text-[#3E5B47]" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied' : 'Copy JSON'}</span>
            </button>

            <button
              onClick={handleDownload}
              className="px-3.5 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white flex items-center gap-1.5 font-bold transition-all shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>Download Bundle</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
