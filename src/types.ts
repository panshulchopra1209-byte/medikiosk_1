/**
 * MediKiosk - Data Types & Ontologies
 * Designed for Indian OPD & AYUSH Clinical Intake (ABDM & DPDPA 2023 Compliant)
 */

export type ClinicalMode = 'allopathy' | 'ayush';

export type LanguageCode = 'en' | 'hi' | 'bn' | 'te' | 'ta' | 'mr' | 'gu' | 'pa';

export interface LanguageOption {
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}

export type TriageLevel = 'RED' | 'YELLOW' | 'GREEN';

export interface RedFlagAlert {
  isEmergency: boolean;
  severity: TriageLevel;
  triggerPhrase?: string;
  matchedPhrase?: string;
  reason: string;
  recommendedAction: string;
  detectedAt?: string;
  isConfirmed?: boolean;
  confirmedAt?: string;
}

export interface PatientIdentity {
  abhaId: string; // e.g. 91-8273-1928-4421 or name@abdm
  fullName: string;
  age: number;
  gender: 'Male' | 'Female' | 'Other';
  phone: string;
  language: LanguageCode;
  selectedDepartment: string;
  otherDepartmentSpecification?: string; // Specific description when "Other" is chosen
  clinicalMode: ClinicalMode;
  tokenNumber: string;
  registrationDate: string;
  // Family / Dependent support
  isDependent?: boolean;
  dependentRelation?: 'Child' | 'Elderly Parent' | 'Spouse' | 'Sibling' | 'Dependent Relative';
  guardianName?: string;
  guardianPhone?: string;
  specialAssistance?: string[]; // e.g. ['Wheelchair Support', 'Hearing/Vision Assistance']
}

export interface ConsentRecord {
  granted: boolean;
  grantedAt: string;
  audioConsentPlayed: boolean;
  dpdpaCompliant: boolean;
  purposes: string[];
  revocable: boolean;
}

export interface SocratesHPI {
  site?: string;
  onset?: string;
  character?: string;
  radiation?: string;
  associations?: string[];
  timingDuration?: string;
  exacerbatingRelieving?: string;
  severityScale?: number; // 1 to 10
}

export interface AyushAssessment {
  prakriti: {
    vata: number; // percentage or scale
    pitta: number;
    kapha: number;
    dominant: string;
  };
  vikriti: string; // Current dosha imbalance
  agni: 'Mandagni' | 'Tikshnagni' | 'Vishamagni' | 'Samagni'; // Digestive fire
  koshtha: 'Krura' | 'Mridu' | 'Madhya'; // Bowel habit
  aharaShakti: 'Pravara' | 'Madhyama' | 'Avara'; // Food intake/digestion power
  vyayamaShakti: 'Pravara' | 'Madhyama' | 'Avara'; // Physical endurance
  sara: string; // Tissue excellence
  satmya: string; // Adaptability
  sattva: 'Pravara' | 'Madhyama' | 'Avara'; // Mental strength
  vaya: string; // Age stage
  aharaViharaNotes?: string; // Diet & daily routine notes
}

export interface ExtractedLabResult {
  testName: string;
  value: string;
  numericValue?: number;
  unit?: string;
  referenceRange?: string;
  isAbnormal: boolean;
  status: 'HIGH' | 'LOW' | 'CRITICAL' | 'NORMAL';
  flagNote?: string;
}

export interface ExtractedMedication {
  drugName: string;
  dosage: string;
  frequency: string;
  duration?: string;
  route?: string;
  prescribedBy?: string;
}

export interface DigitizedDocument {
  id: string;
  fileName: string;
  docType: 'prescription' | 'lab_report' | 'discharge_summary' | 'imaging';
  documentDate: string;
  hospitalOrClinic?: string;
  ocrRawText: string;
  extractedDiagnoses: string[];
  extractedMedications: ExtractedMedication[];
  extractedLabs: ExtractedLabResult[];
  extractedProcedures: string[];
  thumbnailUrl?: string;
  abnormalFlagsCount: number;
  isHandwritten?: boolean;
  summaryFindings?: string;
}

export interface ClinicalHistoryData {
  chiefComplaints: Array<{
    complaint: string;
    duration: string;
    severity: string;
  }>;
  hpi: SocratesHPI;
  hpiNarrative: string;
  pastMedicalHistory: string[];
  pastSurgicalHistory: string[];
  currentMedications: string[];
  drugAllergies: string[];
  familyHistory: string[];
  personalLifestyle: {
    smoking: string;
    alcohol: string;
    diet: string;
    occupation: string;
    sleep: string;
  };
  reviewOfSystems: Record<string, string[]>; // e.g. Cardiovascular: ['palpitations'], Respiratory: ['cough']
  ayushAssessment?: AyushAssessment;
}

export interface StructuredClinicalSummary {
  patientId: string;
  tokenNumber: string;
  generatedAt: string;
  triage: RedFlagAlert;
  chiefComplaintSummary: string;
  hpiFormatted: string;
  pastHistorySummary: string;
  medicationAndAllergySummary: string;
  reviewOfSystemsSummary: string;
  ayushSummary?: string;
  digitizedRecordsSummary: string;
  abnormalValuesList: string[];
  potentialDrugInteractions: string[];
  physicianNotes: string;
  physicianConfirmed: boolean;
  physicianName?: string;
  fhirBundleId?: string;
}

export interface BedAllotmentInfo {
  bedNumber: string;
  categoryName: string;
  unit: string;
  allottedAt: string;
  allottedBy: string;
  status: 'ALLOTTED' | 'DISCHARGED';
  notes?: string;
}

export interface OPDQueueItem {
  id: string;
  patient: PatientIdentity;
  consent: ConsentRecord;
  history: ClinicalHistoryData;
  documents: DigitizedDocument[];
  summary: StructuredClinicalSummary;
  triage: RedFlagAlert;
  status: 'WAITING' | 'IN_CONSULTATION' | 'COMPLETED' | 'PRIORITY_EMERGENCY';
  submittedAt: string;
  allottedBed?: BedAllotmentInfo;
}

export interface DialogueMessage {
  id: string;
  sender: 'ai' | 'patient';
  text: string;
  audioPrompt?: string;
  suggestedChips?: string[];
  category?: 'complaint' | 'hpi' | 'past' | 'allergy' | 'ayush' | 'emergency';
  timestamp: string;
}

export type AppView = 'kiosk' | 'physician' | 'auth' | 'staff_portal';

export interface BedCategory {
  id: string;
  name: string;
  total: number;
  available: number;
  occupied: number;
  unit: string;
  type: 'general' | 'icu' | 'oxygen' | 'trauma' | 'pediatric';
}

export interface OnDutyDoctor {
  id: string;
  name: string;
  department: string;
  speciality: string;
  roomNumber: string;
  status: 'On Duty' | 'In OPD' | 'In Surgery' | 'On Round' | 'Off Duty';
  opdTimings: string;
  phoneOrExt?: string;
}

export interface HospitalFacilityInfo {
  name: string;
  hfrId: string;
  facilityType: string;
  state: string;
  district: string;
  emergencyHelpline: string;
  ambulanceContact: string;
  bedInventory: BedCategory[];
  doctors: OnDutyDoctor[];
  treatmentsAvailable: string[];
  totalPatientsWaiting?: number;
  crowdLevel?: 'normal' | 'very_high';
  lastUpdatedBy?: string;
  lastUpdatedAt?: string;
}

export interface HospitalStaffUser {
  id: string;
  staffId: string;
  name: string;
  role: 'Facility Administrator' | 'OPD In-Charge / Supervisor' | 'Consulting Physician' | 'Chief Medical Officer';
  department: string;
  email: string;
}
