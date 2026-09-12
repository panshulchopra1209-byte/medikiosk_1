import { LanguageCode } from '../types';
import { EXTRA_TRANSLATIONS } from './extraTranslations';

export interface SiteDictionary {
  // Brand & Header
  appName: string;
  appBadge: string;
  complianceBadge: string;
  bedsVacantLabel: string;
  hospitalDefaultName: string;
  navKiosk: string;
  navPhysician: string;
  navStaff: string;
  navAuth: string;
  navAccount: string;
  audioOn: string;
  audioOff: string;
  changeLanguage: string;
  emergencyAlertTitle: string;
  triageRed: string;
  triageGreen: string;

  // Navigation & User Controls
  navLogout?: string;
  backToKiosk?: string;
  loggedInAs?: string;
  signOutBtn?: string;
  closeBtn?: string;
  simulateScanBtn?: string;
  replayQuestion?: string;
  clearInput?: string;
  dpdpaGateTitle?: string;
  dpdpaFullNotice?: string;
  dpdpaProtected?: string;
  abhaScannerModalTitle?: string;
  patientLabel?: string;
  ageGenderLabel?: string;
  abhaIdLabel?: string;
  triagePriorityLabel?: string;
  emergencyCaseTitle?: string;
  emergencyCaseDesc?: string;
  tokenSlipHeader?: string;
  opdTokenNo?: string;
  printPhysicalSlipBtn?: string;
  sendToDoctorQueueBtn?: string;
  sentToOpdQueueBtn?: string;
  backToRecordsBtn?: string;
  loadRecordsSample?: string;
  capturePrescriptionTitle?: string;
  uploadFormatsDesc?: string;
  digitizedTimelineTitle?: string;
  recordsCountLabel?: string;
  abnormalValuesCountLabel?: string;
  noRecordsYetMsg?: string;
  quickTouchAnswersPrompt?: string;
  tapToRefine?: string;
  suggestedClinicalFollowup?: string;
  commonOpdSymptoms?: string;
  criticalBadge?: string;
  symptomSearchTitle?: string;
  mainFocusBadge?: string;
  listeningRealTime?: string;
  selectedFromQuick?: string;
  typeOrMicHint?: string;
  speakAction?: string;
  stopAction?: string;
  recordSymptomAction?: string;
  matchingConditionsLabel?: string;
  consultationDialogueRecordTitle?: string;
  exchangesRecordedLabel?: string;
  patientRole?: string;
  aiRole?: string;
  aiFormulatingQuestion?: string;
  painScaleTitle?: string;
  ayushDashavidhaStatusTitle?: string;
  backToIdentityBtn?: string;
  nextDigitizeRecordsBtn?: string;
  back?: string;
  submit?: string;
  activeTab?: string;
  naturalMultilingualIntake?: string;
  doctorReadyProtocol?: string;
  tellUsHealthConcerns?: string;
  voiceTouchDesc?: string;
  autoTriageEnabled?: string;
  speakAtNormalPace?: string;
  breadcrumbHome?: string;
  breadcrumbKiosk?: string;
  breadcrumbPhysician?: string;
  breadcrumbStaff?: string;
  distributedQueueTitle?: string;
  falseAlarmDismiss?: string;
  confirmEmergencyBtn?: string;
  emergencyConfirmedBadge?: string;
  emergencyTriagePrompt?: string;
  breadcrumbAuth?: string;
  breadcrumbStep?: string;

  authTitle?: string;
  authSubtitle?: string;
  patientConfirmationSpeech?: string;
  intakeVerifiedBadge?: string;
  directHisIntegrationReady?: string;
  emergencyRedTriageDesc?: string;
  chiefPresentingComplaintsLabel?: string;
  hpiSocratesLabel?: string;
  ayushDashavidhaParikshaLabel?: string;
  pastMedicalSurgicalHistoryLabel?: string;
  activeMedicationsAllergiesLabel?: string;
  criticalOutOfRangeLabsLabel?: string;
  prescriptionSafetyNotesLabel?: string;
  scannablePhysicianHisLabel?: string;
  draftForDoctorVerification?: string;

  // Physician Screen & OPD Queue
  opdPatientQueue?: string;
  activeBadge?: string;
  searchPatientPlaceholder?: string;
  signClinicalNote?: string;
  consultationTimeSaved?: string;
  physicianEditNotice?: string;
  redFlagAlertTitle?: string;
  reviewOfSystemsLifestyle?: string;
  lifestyleDiet?: string;
  lifestyleSleep?: string;
  lifestyleSmoking?: string;
  abnormalLabsWarnings?: string;
  autoExtractedBadge?: string;
  physicianNotesPrescription?: string;
  physicianNotesPlaceholder?: string;
  signedCredentialNotice?: string;
  completeConsultation?: string;
  savedSyncedAbdm?: string;
  chronologicalPastRecords?: string;
  noPastRecordsScanned?: string;
  diagnosesExtracted?: string;
  hospitalClinic?: string;
  medicationsExtracted?: string;
  ayushNidanaTitle?: string;
  niaStandards?: string;
  prakritiLabel?: string;
  vikritiLabel?: string;
  agniKoshthaLabel?: string;
  aharaViharaTitle?: string;
  selectPatientPrompt?: string;

  // Hospital Staff & Bed Ops Portal
  staffConsoleTitle?: string;
  liveSyncedBadge?: string;
  saveBroadcastBtn?: string;
  previewKioskBtn?: string;
  opdRoomBtn?: string;
  saveSuccessMsg?: string;
  availableBedsCard?: string;
  capacityAvailable?: string;
  activeDoctorsCard?: string;
  onDutyInOpd?: string;
  clinicalServicesCard?: string;
  offeredInHospital?: string;
  abdmHfrStatusCard?: string;
  registryVerified?: string;
  tabBeds?: string;
  tabHospital?: string;
  tabDoctors?: string;
  tabTreatments?: string;
  bedInventoryTitle?: string;
  bedInventorySubtitle?: string;
  bedsVacantRightNow?: string;
  occupancyLabel?: string;
  occupiedLabel?: string;
  totalLabel?: string;
  adjustVacantBeds?: string;
  totalBedCapacity?: string;
  bedAllocationStatus?: string;
  facilitySettingsTitle?: string;
  facilitySettingsSub?: string;
  facilityNameLabel?: string;
  hfrIdLabel?: string;
  facilityTypeLabel?: string;
  stateLabel?: string;
  districtLabel?: string;
  emergencyHelplineLabel?: string;
  ambulanceContactLabel?: string;
  doctorsRosterTitle?: string;
  doctorsRosterSub?: string;
  addDoctorBtn?: string;
  docNameLabel?: string;
  docDeptLabel?: string;
  docSpecialityLabel?: string;
  docRoomLabel?: string;
  cancelBtn?: string;
  saveDoctorRosterBtn?: string;
  assignedRoomLabel?: string;
  timingsLabel?: string;
  phoneIntercomLabel?: string;
  removeFromRoster?: string;
  servicesCatalogTitle?: string;
  servicesCatalogSub?: string;
  serviceNameLabel?: string;
  addServiceBtn?: string;
  quickAddServices?: string;
  availableServicesOffered?: string;
  statusOnDuty?: string;
  statusInOpd?: string;
  statusOnBreak?: string;
  statusOffDuty?: string;

  // Additional Common Intake & UI Keys
  regTypeLabel?: string;
  regTypeSub?: string;
  forMyself?: string;
  forDependent?: string;
  autoFillProfile?: string;
  familyRegTitle?: string;
  familyRegNotice?: string;
  assistedCaregiverMode?: string;
  relationshipLabel?: string;
  relChild?: string;
  relParent?: string;
  relSpouse?: string;
  relRelative?: string;
  guardianSectionTitle?: string;
  linkedToUser?: string;
  guardianNameLabel?: string;
  guardianPhoneLabel?: string;
  autoFillSuccess?: string;
  specifyHealthProblem?: string;
  triageOfficerNotice?: string;
  backToClinicalInterview?: string;
  saveAndContinueRecords?: string;
  continueToIdentityBtn?: string;
  logOutSession?: string;
  continueToPortal?: string;
  persistentDbBadge?: string;
  sendOtpRegisterBtn?: string;
  enterRegOtpLabel?: string;
  verifyAndRegisterBtn?: string;
  resendOtpBtn?: string;
  changeDetailsBtn?: string;
  noLabMarkers?: string;
  selectFacilityModalTitle?: string;
  selectFacilitySubtitle?: string;
  hospitalCampusesTab?: string;
  opdWingsTab?: string;
  filterLocationPlaceholder?: string;
  nearMeGps?: string;
  locating?: string;
  autoDetectedCenter?: string;
  selectTargetWing?: string;
  currentLocationSelected?: string;
  bedsVacantChip?: string;
  activeSelected?: string;
  clearSearch?: string;
  noHospitalsFound?: string;
  closestDistance?: string;
  gpsLocatingError?: string;
  gpsPermissionDenied?: string;
  govtApexCenter?: string;
  selectBtn?: string;
  ayushProtocol?: string;
  modernAllopathy?: string;
  abdmHfrNotice?: string;
  coversAllOpd?: string;
  modernMedicine?: string;
  ayushHolistic?: string;
  clinicalCareMode?: string;
  regOtpDispatched?: string;
  sentTo?: string;
  changeNumber?: string;
  checkSmsNotice?: string;
  staffPortalNotice?: string;
  persistentDbNotice?: string;

  // Stepper
  step1Title: string;
  step1Sub: string;
  step2Title: string;
  step2Sub: string;
  step3Title: string;
  step3Sub: string;
  step4Title: string;
  step4Sub: string;
  newIntakeSession: string;

  // Step 1 - Identity
  step1Header: string;
  step1Desc: string;
  clinicalParadigmLabel: string;
  allopathyLabel: string;
  allopathyDesc: string;
  ayushLabel: string;
  ayushDesc: string;
  abhaInputLabel: string;
  abhaPlaceholder: string;
  scanQrBtn: string;
  orManualLabel: string;
  fullNameLabel: string;
  fullNamePlaceholder: string;
  ageLabel: string;
  genderLabel: string;
  genderMale: string;
  genderFemale: string;
  genderOther: string;
  phoneLabel: string;
  phonePlaceholder: string;
  deptLabel: string;
  quickTouchPatients: string;
  consentNotice: string;
  continueBtn: string;

  // Step 2 - Clinical Interview & URSA
  step2Header: string;
  step2Desc: string;
  searchSymptomPlaceholder: string;
  recordSymptomBtn: string;
  voiceInputBtn: string;
  listeningNow: string;
  stopVoiceBtn: string;
  quickTouchAnswers: string;
  consultationDialogue: string;
  dialogueExchanges: string;
  aiFormulating: string;
  painScaleLabel: string;
  ayushAssessmentTitle: string;
  backToIdentity: string;
  continueToRecords: string;
  skipToRecords: string;
  optionalHistoryTitle: string;
  optionalHistoryDesc: string;
  noPastHistoryBadge: string;
  noMedicationsBadge: string;

  // Step 3 - Documents & Prescriptions
  step3Header: string;
  step3Desc: string;
  scanDocCamera: string;
  uploadDocFiles: string;
  ocrProcessing: string;
  scannedRecordsCatalog: string;
  extractedTelemetryTitle: string;
  continueToSummary: string;
  backToInterview: string;

  // Step 4 - Intake Summary & Token Slip
  step4Header: string;
  step4Desc: string;
  tokenPassBadge: string;
  officialReceiptTitle: string;
  listenAudioBtn: string;
  printSlipBtn: string;
  submitToQueueBtn: string;
  queueSuccessAlert: string;
  chiefComplaintTitle: string;
  hpiTitle: string;
  pastHistoryTitle: string;
  medsTitle: string;
  reviewOfSystemsTitle: string;
  abnormalLabsTitle: string;
  drugInteractionsTitle: string;

  // Physician Screen
  physicianRoomTitle: string;
  physicianSubtitle: string;
  waitingPatientsTitle: string;
  selectPatientNotice: string;
  signNoteBtn: string;
  signedStatus: string;
  fhirBundleBtn: string;
  timeSavedNotice: string;
  tabSummary: string;
  tabDocuments: string;
  tabAyush: string;

  // Auth View
  authPatientTab: string;
  authStaffTab: string;
  authLoginSubTab: string;
  authRegisterSubTab: string;
  authPhoneOrAbhaLabel: string;
  authPhonePlaceholder: string;
  authSendOtpBtn: string;
  authSendingOtp: string;
  authOtpSentSuccess: string;
  authOtpInputLabel: string;
  authOtpPlaceholder: string;
  authVerifyBtn: string;
  authVerifying: string;
  authRegisterBtn: string;
  authStaffEmailLabel: string;
  authStaffRoleLabel: string;
  authStaffPasswordLabel: string;
  authStaffLoginBtn: string;

  // Staff Portal
  staffPortalTitle: string;
  staffPortalSub: string;
  bedManagementTitle: string;
  doctorsDirectoryTitle: string;
  treatmentsTitle: string;
  saveChangesBtn: string;
  savingChanges: string;

  // Voice Assistant URSA Announcements
  ursaIntroSpeech: string;
  ursaLangChangedSpeech: string;
}

export const TRANSLATIONS: Record<LanguageCode, SiteDictionary> = {
  en: {
    appName: 'MediKiosk',
    appBadge: 'AI Clinical Intake',
    complianceBadge: 'ABDM & DPDPA Compliant',
    bedsVacantLabel: 'Beds Vacant',
    hospitalDefaultName: 'Govt. Medical College & Apex AYUSH Institute',
    navKiosk: 'Patient Kiosk',
    navPhysician: 'Physician OPD',
    navStaff: 'Staff & Bed Ops',
    navAuth: 'Login / Register',
    navAccount: 'Account',
    audioOn: 'Audio On',
    audioOff: 'Audio Muted',
    changeLanguage: 'Change Language',
    emergencyAlertTitle: 'EMERGENCY RED-FLAG DETECTED',
    triageRed: 'Emergency Red',
    triageGreen: 'Routine OPD',

    step1Title: 'Clinical Interview',
    step1Sub: 'Symptom Search & Intake',
    step2Title: 'Patient Identity',
    step2Sub: 'Identity & ABHA',
    step3Title: 'Scan Records',
    step3Sub: 'Prescriptions & Labs',
    step4Title: 'Intake Summary',
    step4Sub: 'OPD Token Slip',
    newIntakeSession: 'New Intake Session',

    step1Header: 'Patient Identity Verification & Clinical Routing',
    step1Desc: 'Enter 14-digit ABHA Number or Mobile OTP to link official medical records.',
    clinicalParadigmLabel: 'Clinical Treatment Paradigm',
    allopathyLabel: 'Allopathy (Modern OPD)',
    allopathyDesc: 'Internal Medicine, Cardiology, Pulmonology, Orthopaedics & Surgery',
    ayushLabel: 'Ayurveda & AYUSH OPD',
    ayushDesc: 'Kayachikitsa, Panchakarma, Agni & Dashavidha Pariksha Intake',
    abhaInputLabel: 'Ayushman Bharat Health Account (ABHA) ID',
    abhaPlaceholder: 'e.g. 91-8273-1928-4421 or mobile',
    scanQrBtn: 'Scan ABHA Card QR',
    orManualLabel: 'Or Enter Demographics Manually',
    fullNameLabel: 'Patient Full Name',
    fullNamePlaceholder: 'Enter full legal name',
    ageLabel: 'Age (Years)',
    genderLabel: 'Biological Gender',
    genderMale: 'Male',
    genderFemale: 'Female',
    genderOther: 'Other',
    phoneLabel: 'Registered Mobile Number',
    phonePlaceholder: '10-digit mobile number',
    deptLabel: 'Target Consultation Department',
    quickTouchPatients: 'Quick-Touch Patient Profiles (Testing & Demo)',
    consentNotice: 'Consent is collected strictly in compliance with Digital Personal Data Protection Act (DPDPA 2023). Data is encrypted and shared only with your attending physician.',
    continueBtn: 'Save & Continue to Clinical Interview',

    step2Header: 'Clinical Symptom Dialogue with URSA',
    step2Desc: 'Speak naturally or search symptoms. URSA elicits chief complaints using the clinical SOCRATES protocol.',
    searchSymptomPlaceholder: 'Type or search symptoms (e.g., chest pain, burning in feet, knee swelling)...',
    recordSymptomBtn: 'Record Symptom',
    voiceInputBtn: 'URSA Voice Mic',
    listeningNow: 'URSA Listening... Speak now',
    stopVoiceBtn: 'Stop Voice Input',
    quickTouchAnswers: 'Frequently Reported Symptoms in OPD',
    consultationDialogue: 'Clinical Consultation Transcript',
    dialogueExchanges: 'exchanges recorded',
    aiFormulating: 'URSA formulating follow-up clinical enquiry...',
    painScaleLabel: 'Pain / Discomfort Intensity (1 - 10)',
    ayushAssessmentTitle: 'Ayurveda Dashavidha Pariksha Status',
    backToIdentity: 'Back to Identity',
    continueToRecords: 'Continue to Document Scan',
    skipToRecords: 'Skip to Document Scan',
    optionalHistoryTitle: 'Medical History & Current Medications',
    optionalHistoryDesc: 'Strict Data Rule: MediKiosk never invents or assumes past conditions. Only what you enter will be recorded.',
    noPastHistoryBadge: 'No past medical history reported by patient',
    noMedicationsBadge: 'No active medications reported by patient',

    step3Header: 'Digitize Prior Prescriptions & Lab Reports',
    step3Desc: 'Scan or photograph previous doctor slips, lab results, and discharge papers.',
    scanDocCamera: 'Capture via Camera OCR',
    uploadDocFiles: 'Upload Medical Documents',
    ocrProcessing: 'Digitizing handwriting and extracting lab values...',
    scannedRecordsCatalog: 'Digitized Patient Documents',
    extractedTelemetryTitle: 'Telemetry & Highlighted Lab Alerts',
    continueToSummary: 'Generate Doctor Intake Summary',
    backToInterview: 'Back to Interview',

    step4Header: 'OPD Clinical Intake Slip & Verification',
    step4Desc: 'Oral dialogue and digitized papers formulated into an ABDM doctor-ready clinical draft.',
    tokenPassBadge: 'Official OPD Consultation Pass',
    officialReceiptTitle: 'OPD Clinical Intake Token Slip',
    listenAudioBtn: 'Listen with URSA',
    printSlipBtn: 'Print Token Slip',
    submitToQueueBtn: 'Submit to Physician OPD Queue',
    queueSuccessAlert: 'Successfully submitted to OPD Queue. Please proceed to consultation room.',
    chiefComplaintTitle: '1. Chief Presenting Complaints:',
    hpiTitle: '2. History of Present Illness (SOCRATES Framework):',
    pastHistoryTitle: '3. Past Medical & Surgical History:',
    medsTitle: '4. Current Medications & Documented Allergies:',
    reviewOfSystemsTitle: '5. Review of Systems & Lifestyle:',
    abnormalLabsTitle: 'Highlighted Laboratory Abnormalities:',
    drugInteractionsTitle: 'Clinical Interaction Notices:',

    physicianRoomTitle: 'Physician OPD Room & Queue',
    physicianSubtitle: 'Review incoming AI-structured intake drafts, adjust diagnosis, and sign clinical encounters.',
    waitingPatientsTitle: 'Waiting Room Patient Queue',
    selectPatientNotice: 'Select a patient from the queue on the left to review intake draft.',
    signNoteBtn: 'Sign Clinical Encounter',
    signedStatus: 'Encounter Signed & Locked',
    fhirBundleBtn: 'Generate ABDM FHIR R4',
    timeSavedNotice: 'MediKiosk saved ~5.5 minutes of intake transcription per patient.',
    tabSummary: 'Structured Clinical Summary',
    tabDocuments: 'Scanned Prescriptions & Reports',
    tabAyush: 'AYUSH Dashavidha Assessment',

    authPatientTab: 'Patient Portal',
    authStaffTab: 'Hospital Staff & Admin',
    authLoginSubTab: 'Login via ABHA / OTP',
    authRegisterSubTab: 'Register New Patient',
    authPhoneOrAbhaLabel: '14-digit ABHA Number or 10-digit Mobile Number',
    authPhonePlaceholder: 'e.g. 9876543210 or 91-8273-1928-4421',
    authSendOtpBtn: 'Send OTP to Mobile',
    authSendingOtp: 'Dispatching OTP...',
    authOtpSentSuccess: 'OTP dispatched via ABDM SMS Gateway to your phone',
    authOtpInputLabel: 'Enter 6-Digit SMS Verification OTP',
    authOtpPlaceholder: 'Enter 6-digit code from SMS',
    authVerifyBtn: 'Verify OTP & Continue',
    authVerifying: 'Verifying with ABDM...',
    authRegisterBtn: 'Register & Generate Token',
    authStaffEmailLabel: 'Hospital Staff ID / Registered Email',
    authStaffRoleLabel: 'Hospital Role',
    authStaffPasswordLabel: 'Authorized Staff Password',
    authStaffLoginBtn: 'Access Hospital Operations Portal',

    staffPortalTitle: 'Hospital Staff Resource Management',
    staffPortalSub: 'Manage live bed vacancy, on-duty physicians, hospital name, and clinical treatment offerings.',
    bedManagementTitle: 'Live Bed Vacancy & Inventory',
    doctorsDirectoryTitle: 'On-Duty Doctors & Consultation Rooms',
    treatmentsTitle: 'Available Medical & AYUSH Treatments',
    saveChangesBtn: 'Save Changes to Hospital Database',
    savingChanges: 'Saving securely...',

    ursaIntroSpeech: 'Hello, I am URSA, your AI clinical intake assistant. Please speak your health complaints clearly.',
    ursaLangChangedSpeech: 'Language changed to English. I am URSA, your AI clinical assistant. Please state your main health complaint.',
  },

  hi: {
    appName: 'मेडीकियोस्क',
    appBadge: 'AI क्लिनिकल पंजीकरण',
    complianceBadge: 'ABDM व DPDPA 2023 प्रमाणित',
    bedsVacantLabel: 'बिस्तर खाली',
    hospitalDefaultName: 'राजकीय मेडिकल कॉलेज एवं शीर्ष आयुष संस्थान',
    navKiosk: 'रोगी कियोस्क',
    navPhysician: 'डॉक्टर ओपीडी',
    navStaff: 'अस्पताल स्टाफ व बेड',
    navAuth: 'लॉगिन / पंजीकरण',
    navAccount: 'खाता',
    audioOn: 'आवाज़ चालू',
    audioOff: 'आवाज़ बंद',
    changeLanguage: 'भाषा बदलें',
    emergencyAlertTitle: 'आपातकालीन रेड-फ्लैग चेतावनी',
    triageRed: 'इमर्जन्सी रेड',
    triageGreen: 'सामान्य ओपीडी',

    step1Title: 'क्लिनिकल साक्षात्कार',
    step1Sub: 'लक्षण खोज व परामर्श',
    step2Title: 'रोगी की पहचान',
    step2Sub: 'पहचान व आभा आईडी',
    step3Title: 'पर्चियां स्कैन करें',
    step3Sub: 'पुरानी रिपोर्ट व पर्ची',
    step4Title: 'ओपीडी टोकन पर्ची',
    step4Sub: 'डॉक्टर सारांश',
    newIntakeSession: 'नया रोगी सत्र',

    step1Header: 'रोगी पहचान सत्यापन व विभाग चयन',
    step1Desc: 'अपना 14-अंकों का आभा नंबर या मोबाइल नंबर दर्ज करें ताकि पुराना रिकॉर्ड सुरक्षित रूप से जुड़ सके।',
    clinicalParadigmLabel: 'चिकित्सा पद्धति का चयन',
    allopathyLabel: 'एलोपैथी (आधुनिक चिकित्सा)',
    allopathyDesc: 'आंतरिक चिकित्सा, हृदय, फेफड़े, हड्डी व सामान्य ओपीडी',
    ayushLabel: 'आयुर्वेद व आयुष ओपीडी',
    ayushDesc: 'कायचिकित्सा, पंचकर्म, अग्नि व दशविध परीक्षा ओपीडी',
    abhaInputLabel: 'आयुष्मान भारत हेल्थ अकाउंट (ABHA) आईडी',
    abhaPlaceholder: 'उदा. 91-8273-1928-4421 या मोबाइल',
    scanQrBtn: 'आभा कार्ड क्यूआर स्कैन करें',
    orManualLabel: 'या मैन्युअल रूप से जानकारी भरें',
    fullNameLabel: 'रोगी का पूरा नाम',
    fullNamePlaceholder: 'सरकारी पहचान अनुसार पूरा नाम लिखें',
    ageLabel: 'उम्र (वर्ष)',
    genderLabel: 'लिंग',
    genderMale: 'पुरुष',
    genderFemale: 'महिला',
    genderOther: 'अन्य',
    phoneLabel: 'पंजीकृत मोबाइल नंबर',
    phonePlaceholder: '10 अंकों का मोबाइल नंबर',
    deptLabel: 'परामर्श के लिए संबंधित विभाग',
    quickTouchPatients: 'परीक्षण हेतु तुरंत रोगी प्रोफाइल चुनें',
    consentNotice: 'आपकी जानकारी डिजिटल पर्सनल डेटा प्रोटेक्शन एक्ट (DPDPA 2023) के तहत पूरी तरह सुरक्षित है। यह केवल आपके परामर्शदाता डॉक्टर को दिखाई जाएगी।',
    continueBtn: 'सहेजें और क्लिनिकल बातचीत शुरू करें',

    step2Header: 'उरसा (URSA) के साथ क्लिनिकल बातचीत',
    step2Desc: 'माइक दबाकर बोलें या लक्षण खोजें। उरसा आपकी बीमारी की पूरी जानकारी सोक्रेटीस (SOCRATES) प्रोटोकॉल अनुसार दर्ज करेगी।',
    searchSymptomPlaceholder: 'अपनी तकलीफ खोजें या लिखें (जैसे: छाती में दर्द, पैरों में जलन, जोड़ों में सूजन)...',
    recordSymptomBtn: 'लक्षण दर्ज करें',
    voiceInputBtn: 'उरसा माइक बोलें',
    listeningNow: 'उरसा सुन रही है... कृपया बोलें',
    stopVoiceBtn: 'माइक बंद करें',
    quickTouchAnswers: 'ओपीडी में अक्सर रिपोर्ट होने वाले मुख्य लक्षण',
    consultationDialogue: 'क्लिनिकल बातचीत का विवरण',
    dialogueExchanges: 'संवाद दर्ज',
    aiFormulating: 'उरसा अगला क्लिनिकल प्रश्न तैयार कर रही है...',
    painScaleLabel: 'दर्द / कष्ट की तीव्रता (1 से 10)',
    ayushAssessmentTitle: 'आयुर्वेदिक दशविध परीक्षा स्थिति',
    backToIdentity: 'पहचान पर वापस जाएं',
    continueToRecords: 'दस्तावेज़ स्कैन पर आगे बढ़ें',
    skipToRecords: 'दस्तावेज़ स्कैन पर जाएं',
    optionalHistoryTitle: 'पुरानी बीमारी व वर्तमान दवाएं (यदि रोगी ने बताई हों)',
    optionalHistoryDesc: 'सख्त डेटा नियम: मेडीकियोस्क मनगढ़ंत जानकारी नहीं जोड़ता। केवल आपके द्वारा दी गई जानकारी ही दर्ज होगी।',
    noPastHistoryBadge: 'रोगी द्वारा कोई पुरानी बीमारी दर्ज नहीं कराई गई',
    noMedicationsBadge: 'रोगी द्वारा कोई सक्रिय दवा दर्ज नहीं कराई गई',

    step3Header: 'पुरानी पर्चियां व लैब रिपोर्ट डिजिटाइज़ करें',
    step3Desc: 'पूर्व डॉक्टर की हस्तलिखित पर्चियां, रक्त परीक्षण व डिस्चार्ज समरी कैमरे के सामने रखें।',
    scanDocCamera: 'कैमरा ओसीआर से स्कैन करें',
    uploadDocFiles: 'चिकित्सा दस्तावेज़ अपलोड करें',
    ocrProcessing: 'हस्तलेखन पढ़ा जा रहा है व लैब वैल्यू निकाली जा रही हैं...',
    scannedRecordsCatalog: 'स्कैन किए गए रोगी दस्तावेज़',
    extractedTelemetryTitle: 'निकाली गई लैब रिपोर्ट व चेतावनी',
    continueToSummary: 'डॉक्टर क्लिनिकल सारांश बनाएं',
    backToInterview: 'बातचीत पर वापस जाएं',

    step4Header: 'ओपीडी क्लिनिकल टोकन पर्ची व सत्यापन',
    step4Desc: 'आपकी बातचीत और पुराने रिकॉर्ड्स को डॉक्टर के लिए तैयार सारांश में बदल दिया गया है।',
    tokenPassBadge: 'आधिकारिक ओपीडी परामर्श पास',
    officialReceiptTitle: 'ओपीडी क्लिनिकल टोकन पर्ची',
    listenAudioBtn: 'उरसा से सुनें',
    printSlipBtn: 'टोकन पर्ची प्रिंट करें',
    submitToQueueBtn: 'डॉक्टर ओपीडी कतार में भेजें',
    queueSuccessAlert: 'सफलतापूर्वक ओपीडी कतार में प्रेषित। कृपया परामर्श कक्ष के बाहर प्रतीक्षा करें।',
    chiefComplaintTitle: '1. मुख्य शिकायत (Chief Complaint):',
    hpiTitle: '2. बीमारी का विस्तृत इतिहास (HPI - SOCRATES):',
    pastHistoryTitle: '3. पूर्व बीमारी व ऑपरेशन का इतिहास:',
    medsTitle: '4. वर्तमान दवाइयां व एलर्जी:',
    reviewOfSystemsTitle: '5. शारीरिक प्रणालियों की जांच व जीवनशैली:',
    abnormalLabsTitle: 'असामान्य लैब रिपोर्ट व चेतावनी:',
    drugInteractionsTitle: 'दवा परस्पर प्रभाव सूचना:',

    physicianRoomTitle: 'डॉक्टर ओपीडी कक्ष व कतार',
    physicianSubtitle: 'आने वाले मरीजों के एआई-तैयार सारांश की जांच करें, निदान जोड़ें और पर्ची पर हस्ताक्षर करें।',
    waitingPatientsTitle: 'प्रतीक्षारत रोगियों की कतार',
    selectPatientNotice: 'रोगी का विवरण देखने के लिए बाईं ओर सूची में से चुनें।',
    signNoteBtn: 'क्लिनिकल पर्ची पर हस्ताक्षर करें',
    signedStatus: 'पर्ची हस्ताक्षरित व लॉक है',
    fhirBundleBtn: 'ABDM FHIR R4 बंडल देखें',
    timeSavedNotice: 'मेडीकियोस्क ने प्रति मरीज लगभग 5.5 मिनट का समय बचाया।',
    tabSummary: 'संरचित क्लिनिकल सारांश',
    tabDocuments: 'स्कैन की गई पर्चियां व रिपोर्ट',
    tabAyush: 'आयुष दशविध परीक्षा विवरण',

    authPatientTab: 'रोगी पोर्टल',
    authStaffTab: 'अस्पताल स्टाफ व प्रशासन',
    authLoginSubTab: 'आभा / ओटीपी से लॉगिन',
    authRegisterSubTab: 'नया रोगी पंजीकरण',
    authPhoneOrAbhaLabel: '14-अंकों का आभा नंबर या 10-अंकों का मोबाइल नंबर',
    authPhonePlaceholder: 'उदा. 9876543210 या 91-8273-1928-4421',
    authSendOtpBtn: 'मोबाइल पर ओटीपी भेजें',
    authSendingOtp: 'ओटीपी भेजा जा रहा है...',
    authOtpSentSuccess: 'आपके मोबाइल नंबर पर एसएमएस द्वारा ओटीपी भेज दिया गया है',
    authOtpInputLabel: 'प्राप्त 6-अंकों का एसएमएस ओटीपी दर्ज करें',
    authOtpPlaceholder: 'एसएमएस में आया 6 अंकों का कोड लिखें',
    authVerifyBtn: 'ओटीपी सत्यापित करें व आगे बढ़ें',
    authVerifying: 'सत्यापन जारी है...',
    authRegisterBtn: 'पंजीकृत करें व टोकन लें',
    authStaffEmailLabel: 'स्टाफ आईडी या पंजीकृत अस्पताल ईमेल',
    authStaffRoleLabel: 'अस्पताल में पद / भूमिका',
    authStaffPasswordLabel: 'अधिकृत पासवर्ड',
    authStaffLoginBtn: 'अस्पताल संचालन पोर्टल खोलें',

    staffPortalTitle: 'अस्पताल स्टाफ व संसाधन प्रबंधन',
    staffPortalSub: 'खाली बेड, ड्यूटी पर डॉक्टर, अस्पताल का नाम और उपलब्ध उपचारों का प्रबंधन करें।',
    bedManagementTitle: 'खाली बिस्तर व इन्वेंट्री प्रबंधन',
    doctorsDirectoryTitle: 'ड्यूटी पर डॉक्टरों की सूची व कक्ष',
    treatmentsTitle: 'उपलब्ध चिकित्सा व आयुष उपचार',
    saveChangesBtn: 'अस्पताल डेटाबेस में सहेजें',
    savingChanges: 'सुरक्षित रूप से सहेजा जा रहा है...',

    ursaIntroSpeech: 'नमस्ते, मैं उरसा (URSA) हूँ, आपकी AI क्लिनिकल सहायिका। कृपया अपनी स्वास्थ्य समस्या बताएं।',
    ursaLangChangedSpeech: 'भाषा हिन्दी में बदल दी गई है। मैं उरसा हूँ, आपकी AI क्लिनिकल सहायिका। कृपया अपनी स्वास्थ्य समस्या बताएं।',
  },

  bn: {
    appName: 'মেডিকিওস্ক',
    appBadge: 'এআই ক্লিনিকাল ইন্টেক',
    complianceBadge: 'ABDM ও DPDPA ২০২৩ অনুমোদিত',
    bedsVacantLabel: 'বেড খালি',
    hospitalDefaultName: 'সরকারি মেডিকেল কলেজ ও আয়ুশ ইনস্টিটিউট',
    navKiosk: 'রোগী কিওস্ক',
    navPhysician: 'ডাক্তার ওপিডি',
    navStaff: 'স্টাফ ও বেড ব্যবস্থাপনা',
    navAuth: 'লগইন / নিবন্ধন',
    navAccount: 'অ্যাকাউন্ট',
    audioOn: 'ভয়েস চালু',
    audioOff: 'অডিও বন্ধ',
    changeLanguage: 'ভাষা পরিবর্তন করুন',
    emergencyAlertTitle: 'জরুরী রেড-ফ্ল্যাগ সতর্কতা',
    triageRed: 'ইমার্জেন্সি রেড',
    triageGreen: 'নিয়মিত ওপিডি',

    step1Title: 'ক্লিনিকাল সাক্ষাৎকার',
    step1Sub: 'লক্ষণ অনুসন্ধান ও সংলাপ',
    step2Title: 'রোগীর পরিচয়',
    step2Sub: 'পরিচয় ও আভা',
    step3Title: 'নথিপত্র স্ক্যান',
    step3Sub: 'প্রেসক্রিপশন ও রিপোর্ট',
    step4Title: 'ইন্টেক সারসংক্ষেপ',
    step4Sub: 'ওপিডি টোকেন স্লিপ',
    newIntakeSession: 'নতুন সেশন',

    step1Header: 'রোগীর পরিচয় যাচাই ও বিভাগ নির্বাচন',
    step1Desc: 'মেডিকেল রেকর্ড যুক্ত করতে আপনার ১৪ সংখ্যার আভা আইডি বা মোবাইল নম্বর দিন।',
    clinicalParadigmLabel: 'চিকিৎসা পদ্ধতি',
    allopathyLabel: 'অ্যালোপ্যাথি (আধুনিক ওপিডি)',
    allopathyDesc: 'মেডিসিন, কার্ডিওলজি, পালমোনোলজি ও সার্জারি',
    ayushLabel: 'আয়ুর্বেদ ও আয়ুশ ওপিডি',
    ayushDesc: 'কায়চিকিৎসা, পঞ্চকর্ম ও দশবিধ পরীক্ষা',
    abhaInputLabel: 'আয়ুষ্মান ভারত হেলথ অ্যাকাউন্ট (ABHA) আইডি',
    abhaPlaceholder: 'যেমন: 91-8273-1928-4421 বা মোবাইল',
    scanQrBtn: 'আভা কিউআর কোড স্ক্যান করুন',
    orManualLabel: 'অথবা নিজে তথ্য পূরণ করুন',
    fullNameLabel: 'রোগীর পুরো নাম',
    fullNamePlaceholder: 'সম্পূর্ণ নাম লিখুন',
    ageLabel: 'বয়স (বছর)',
    genderLabel: 'লিঙ্গ',
    genderMale: 'পুরুষ',
    genderFemale: 'মহিলা',
    genderOther: 'অন্যান্য',
    phoneLabel: 'মোবাইল নম্বর',
    phonePlaceholder: '১০ সংখ্যার মোবাইল নম্বর',
    deptLabel: 'পরামর্শ বিভাগ',
    quickTouchPatients: 'দ্রুত ডেমো প্রোফাইল',
    consentNotice: 'আপনার তথ্য DPDPA ২০২৩ ও ABDM নির্দেশিকা অনুসারে সম্পূর্ণ সুরক্ষিত।',
    continueBtn: 'সংরক্ষণ ও কথোপকথনে এগিয়ে যান',

    step2Header: 'উরসার (URSA) সাথে ক্লিনিকাল সাক্ষাৎকার',
    step2Desc: 'কথা বলুন বা লক্ষণ অনুসন্ধান করুন। উরসা আপনার অসুস্থতার সম্পূর্ণ বিবরণ প্রস্তুত করবে।',
    searchSymptomPlaceholder: 'লক্ষণ খুঁজুন বা টাইপ করুন (যেমন: বুকে ব্যথা, পায়ে অবশ ভাব)...',
    recordSymptomBtn: 'লক্ষণ রেকর্ড করুন',
    voiceInputBtn: 'উরসা ভয়েস মাইক',
    listeningNow: 'উরসা শুনছে... কথা বলুন',
    stopVoiceBtn: 'মাইক বন্ধ করুন',
    quickTouchAnswers: 'ওপিডিতে প্রায়শই দেখা দেওয়া লক্ষণসমূহ',
    consultationDialogue: 'ক্লিনিকাল কথোপকথন রেকর্ড',
    dialogueExchanges: 'বিনিময় রেকর্ড করা হয়েছে',
    aiFormulating: 'উরসা পরবর্তী ক্লিনিকাল প্রশ্ন তৈরি করছে...',
    painScaleLabel: 'ব্যথা / কষ্টের মাত্রা (১ থেকে ১০)',
    ayushAssessmentTitle: 'আয়ুর্বেদ দশবিধ পরীক্ষা রিপোর্ট',
    backToIdentity: 'পরিচয়ে ফিরে যান',
    continueToRecords: 'নথি স্ক্যানে এগিয়ে যান',
    skipToRecords: 'নথি স্ক্যানে যান',
    optionalHistoryTitle: 'পূর্ববর্তী রোগের ইতিহাস ও চলমান ওষুধ (যদি রোগী প্রদান করেন)',
    optionalHistoryDesc: 'কঠোর নিয়ম: রোগীর তথ্য ছাড়া কোনো অনুমানভিত্তিক ওষুধ বা রোগ যুক্ত করা হবে না।',
    noPastHistoryBadge: 'রোগী দ্বারা কোনো পূর্ববর্তী রোগ জানানো হয়নি',
    noMedicationsBadge: 'রোগী দ্বারা কোনো চলমান ওষুধ জানানো হয়নি',

    step3Header: 'পুরানো প্রেসক্রিপশন ও ল্যাব রিপোর্ট ডিজিটাইজ করুন',
    step3Desc: 'ডাক্তারের হাতের লেখা ও পরীক্ষার রিপোর্ট ক্যামেরার সামনে রাখুন।',
    scanDocCamera: 'ক্যামেরা ওপিআর দিয়ে স্ক্যান করুন',
    uploadDocFiles: 'ডকুমেন্ট আপলোড করুন',
    ocrProcessing: 'হাতের লেখা পড়া হচ্ছে...',
    scannedRecordsCatalog: 'স্ক্যান করা নথিপত্র',
    extractedTelemetryTitle: 'ল্যাব অ্যালার্ট ও তথ্য',
    continueToSummary: 'ডাক্তার সামারি তৈরি করুন',
    backToInterview: 'সাক্ষাৎকারে ফিরে যান',

    step4Header: 'ওপিডি ক্লিনিকাল টোকেন স্লিপ',
    step4Desc: 'আপনার কথোপকথন এবং রিপোর্ট ডাক্তারের উপযোগী সারসংক্ষেপে রূপান্তরিত হয়েছে।',
    tokenPassBadge: 'অফিসিয়াল ওপিডি পরামর্শ পাস',
    officialReceiptTitle: 'ওপিডি টোকেন স্লিপ',
    listenAudioBtn: 'উরসার সাথে শুনুন',
    printSlipBtn: 'টোকেন প্রিন্ট করুন',
    submitToQueueBtn: 'ওপিডি কিউতে পাঠান',
    queueSuccessAlert: 'সফলভাবে ওপিডি কিউতে পাঠানো হয়েছে। ডাক্তারের কক্ষের সামনে অপেক্ষা করুন।',
    chiefComplaintTitle: '১. প্রধান সমস্যা:',
    hpiTitle: '২. বর্তমান রোগের ইতিহাস (SOCRATES):',
    pastHistoryTitle: '৩. পূর্ববর্তী রোগের ইতিহাস:',
    medsTitle: '৪. চলমান ওষুধ ও অ্যালার্জি:',
    reviewOfSystemsTitle: '৫. শারীরিক তন্ত্র ও জীবনধারা:',
    abnormalLabsTitle: 'ল্যাব পরীক্ষার অস্বাভাবিক তথ্য:',
    drugInteractionsTitle: 'ওষুধের সতর্কতা:',

    physicianRoomTitle: 'ডাক্তার ওপিডি রুম ও কিউ',
    physicianSubtitle: 'এআই-প্রস্তুত সামারি পরীক্ষা করুন ও প্রেসক্রিপশন স্বাক্ষর করুন।',
    waitingPatientsTitle: 'অপেক্ষারত রোগীদের তালিকা',
    selectPatientNotice: 'বাম পাশের তালিকা থেকে রোগী নির্বাচন করুন।',
    signNoteBtn: 'পরামর্শপত্রে স্বাক্ষর করুন',
    signedStatus: 'স্বাক্ষরিত ও সুরক্ষিত',
    fhirBundleBtn: 'ABDM FHIR R4 বান্ডেল',
    timeSavedNotice: 'মেডিকিওস্ক প্রতি রোগীর জন্য প্রায় ৫.৫ মিনিট সময় সাশ্রয় করেছে।',
    tabSummary: 'ক্লিনিকাল সারসংক্ষেপ',
    tabDocuments: 'স্ক্যান করা রিপোর্টসমূহ',
    tabAyush: 'আয়ুশ মূল্যায়ন',

    authPatientTab: 'রোগী পোর্টাল',
    authStaffTab: 'হাসপাতাল কর্মী ও প্রশাসন',
    authLoginSubTab: 'আভা / ওটিপি লগইন',
    authRegisterSubTab: 'নতুন রোগী নিবন্ধন',
    authPhoneOrAbhaLabel: '১৪ সংখ্যার আভা নম্বর বা ১০ সংখ্যার মোবাইল',
    authPhonePlaceholder: 'যেমন: 9876543210',
    authSendOtpBtn: 'মোবাইলে ওটিপি পাঠান',
    authSendingOtp: 'ওটিপি পাঠানো হচ্ছে...',
    authOtpSentSuccess: 'আপনার মোবাইলে ওটিপি পাঠানো হয়েছে',
    authOtpInputLabel: '৬ সংখ্যার ওটিপি কোড লিখুন',
    authOtpPlaceholder: 'এসএমএস কোড লিখুন',
    authVerifyBtn: 'ওটিপি যাচাই ও প্রবেশ',
    authVerifying: 'যাচাই করা হচ্ছে...',
    authRegisterBtn: 'নিবন্ধন ও টোকেন নিন',
    authStaffEmailLabel: 'স্টাফ আইডি বা নিবন্ধিত ইমেইল',
    authStaffRoleLabel: 'ভূমিকা',
    authStaffPasswordLabel: 'পাসওয়ার্ড',
    authStaffLoginBtn: 'হাসপাতাল পোর্টালে প্রবেশ',

    staffPortalTitle: 'হাসপাতাল সম্পদ ও বেড ব্যবস্থাপনা',
    staffPortalSub: 'খালি বেড, অন-ডিউটি ডাক্তার ও উপলব্ধ চিকিৎসা পরিচালনা করুন।',
    bedManagementTitle: 'লাইভ বেড প্রাপ্যতা',
    doctorsDirectoryTitle: 'অন-ডিউটি ডাক্তারদের তালিকা',
    treatmentsTitle: 'উপলব্ধ চিকিৎসা সেবা',
    saveChangesBtn: 'ডাটাবেসে পরিবর্তন সংরক্ষণ করুন',
    savingChanges: 'সংরক্ষণ করা হচ্ছে...',

    ursaIntroSpeech: 'নমস্কার, আমি উরসা (URSA), আপনার এআই ক্লিনিকাল সহকারী। আপনার স্বাস্থ্য সমস্যা বলুন।',
    ursaLangChangedSpeech: 'ভাষা বাংলায় পরিবর্তিত হয়েছে। আমি উরসা (URSA), আপনার ক্লিনিকাল সহকারী।',
  },

  ta: {
    appName: 'மெடிகியோஸ்க்',
    appBadge: 'AI மருத்துவப் பதிவு',
    complianceBadge: 'ABDM & DPDPA 2023 அங்கீகரிக்கப்பட்டது',
    bedsVacantLabel: 'படுக்கைகள் காலி',
    hospitalDefaultName: 'அரசு மருத்துவக் கல்லூரி & ஆயுஷ் நிறுவனம்',
    navKiosk: 'நோயாளி கியோஸ்க்',
    navPhysician: 'மருத்துவர் OPD',
    navStaff: 'ஊழியர் & படுக்கை மேலாண்மை',
    navAuth: 'உள்நுழைவு / பதிவு',
    navAccount: 'கணக்கு',
    audioOn: 'குரல் ஆன்',
    audioOff: 'ஒலி முடக்கப்பட்டது',
    changeLanguage: 'மொழி மாற்றவும்',
    emergencyAlertTitle: 'அவசர எச்சரிக்கை கண்டறியப்பட்டது',
    triageRed: 'அவசர நிலை சிகப்பு',
    triageGreen: 'சாதாரண OPD',

    step1Title: 'மருத்துவ உரையாடல்',
    step1Sub: 'அறிகுறி தேடல் & தொடர்பு',
    step2Title: 'நோயாளி அடையாளம்',
    step2Sub: 'அடையாளம் & ABHA',
    step3Title: 'ஆவணங்கள் ஸ்கேன்',
    step3Sub: 'மருத்துவர் சீட்டுகள்',
    step4Title: 'சுருக்கம் & டோக்கன்',
    step4Sub: 'OPD டோக்கன் சீட்டு',
    newIntakeSession: 'புதிய நோயாளி',

    step1Header: 'நோயாளி சரிபார்ப்பு & பிரிவு தேர்வு',
    step1Desc: 'உங்கள் 14 இலக்க ABHA எண் அல்லது மொபைல் எண்ணை உள்ளிடவும்.',
    clinicalParadigmLabel: 'சிகிச்சை முறை தேர்வு',
    allopathyLabel: 'அலோபதி (நவீன மருத்துவம்)',
    allopathyDesc: 'பொது மருத்துவம், இதயம், நுரையீரல், எலும்பு',
    ayushLabel: 'ஆயுர்வேதம் & ஆயுஷ் OPD',
    ayushDesc: 'காயசிகிச்சை, பஞ்சகர்மா, நாடி பரிசோதனை',
    abhaInputLabel: 'ஆயுஷ்மான் பாரத் ஹெல்த் கணக்கு (ABHA) ஐடி',
    abhaPlaceholder: 'எ.கா: 91-8273-1928-4421',
    scanQrBtn: 'ABHA QR ஸ்கேன் செய்க',
    orManualLabel: 'அல்லது விவரங்களை நேரடியாக உள்ளிடவும்',
    fullNameLabel: 'முழு பெயர்',
    fullNamePlaceholder: 'அரசு ஆவணங்களில் உள்ள பெயர்',
    ageLabel: 'வயது (ஆண்டுகள்)',
    genderLabel: 'பாலினம்',
    genderMale: 'ஆண்',
    genderFemale: 'பெண்',
    genderOther: 'மற்றவை',
    phoneLabel: 'மொபைல் எண்',
    phonePlaceholder: '10 இலக்க மொபைல் எண்',
    deptLabel: 'பிரிவு தேர்வு',
    quickTouchPatients: 'மாதிரி சுயவிவரங்கள்',
    consentNotice: 'உங்கள் தகவல்கள் DPDPA 2023 சட்டத்தின் கீழ் முழுமையாக பாதுகாக்கப்படுகின்றன.',
    continueBtn: 'சேமித்து உரையாடலைத் தொடங்கவும்',

    step2Header: 'உர்சாவுடன் (URSA) மருத்துவ உரையாடல்',
    step2Desc: 'இயல்பாகப் பேசுங்கள் அல்லது அறிகுறிகளைத் தேடுங்கள். உர்சா உங்கள் நோயின் முழு விவரங்களையும் பதிவு செய்யும்.',
    searchSymptomPlaceholder: 'அறிகுறிகளைத் தட்டச்சு செய்யவும் (எ.கா: நெஞ்சு வலி, மூட்டு வலி)...',
    recordSymptomBtn: 'அறிகுறியைப் பதிவு செய்க',
    voiceInputBtn: 'உர்சா மைக் பேசுங்கள்',
    listeningNow: 'உர்சா கேட்கிறது... பேசுங்கள்',
    stopVoiceBtn: 'மைக்கை நிறுத்துங்கள்',
    quickTouchAnswers: 'அடிக்கடி பதிவாகும் அறிகுறிகள்',
    consultationDialogue: 'மருத்துவ உரையாடல் பதிவு',
    dialogueExchanges: 'உரையாடல்கள் பதிவாகின',
    aiFormulating: 'உர்சா அடுத்த கேள்வியைத் தயாரிக்கிறது...',
    painScaleLabel: 'வலி / அசௌகரிய அளவு (1 முதல் 10 வரை)',
    ayushAssessmentTitle: 'ஆயுர்வேத பரிசோதனை நிலை',
    backToIdentity: 'அடையாளத்திற்குத் திரும்பு',
    continueToRecords: 'ஆவண ஸ்கேனுக்குச் செல்லவும்',
    skipToRecords: 'ஆவண ஸ்கேனைத் தவிர்க்கவும்',
    optionalHistoryTitle: 'முந்தைய மருத்துவ வரலாறு & தற்போதைய மருந்துகள்',
    optionalHistoryDesc: 'கண்டிப்பான விதி: நோயாளி தராத எந்த தகவலும் அல்லது மருந்துகளும் தானாக சேர்க்கப்படாது.',
    noPastHistoryBadge: 'நோயாளி எந்த முந்தைய நோயையும் தெரிவிக்கவில்லை',
    noMedicationsBadge: 'நோயாளி எந்த மருந்துகளையும் தெரிவிக்கவில்லை',

    step3Header: 'முந்தைய சீட்டுகள் & லேப் அறிக்கைகளை ஸ்கேன் செய்க',
    step3Desc: 'பழைய சீட்டுகளை கேமராவின் முன் வைக்கவும்.',
    scanDocCamera: 'கேமரா மூலம் ஸ்கேன் செய்க',
    uploadDocFiles: 'கோப்புகளைப் பதிவேற்றவும்',
    ocrProcessing: 'எழுத்துக்கள் படிக்கப்படுகின்றன...',
    scannedRecordsCatalog: 'ஸ்கேன் செய்யப்பட்ட ஆவணங்கள்',
    extractedTelemetryTitle: 'ஆய்வக அறிக்கைகள் & எச்சரிக்கைகள்',
    continueToSummary: 'மருத்துவ சுருக்கத்தை உருவாக்கவும்',
    backToInterview: 'உரையாடலுக்குத் திரும்பு',

    step4Header: 'OPD டோக்கன் சீட்டு & சரிபார்ப்பு',
    step4Desc: 'உங்கள் தகவல்கள் மருத்துவர் பார்க்கும் வகையில் சுருக்கமாக தொகுக்கப்பட்டுள்ளது.',
    tokenPassBadge: 'அதிகாரப்பூர்வ OPD பாஸ்',
    officialReceiptTitle: 'OPD மருத்துவ டோக்கன் சீட்டு',
    listenAudioBtn: 'உர்சாவுடன் கேளுங்கள்',
    printSlipBtn: 'டோக்கனை அச்சிடுக',
    submitToQueueBtn: 'மருத்துவர் வரிசையில் சேர்க்கவும்',
    queueSuccessAlert: 'வெற்றிகரமாக வரிசையில் சேர்க்கப்பட்டது. ஆலோசனை அறைக்கு வெளியே காத்திருக்கவும்.',
    chiefComplaintTitle: '1. முதன்மை புகார்:',
    hpiTitle: '2. நோயின் தற்போதைய வரலாறு (SOCRATES):',
    pastHistoryTitle: '3. முந்தைய மருத்துவ வரலாறு:',
    medsTitle: '4. தற்போதைய மருந்துகள் & அலர்ஜி:',
    reviewOfSystemsTitle: '5. உடல் அமைப்புகள் & வாழ்க்கை முறை:',
    abnormalLabsTitle: 'ஆய்வக அசாதாரண அளவுகள்:',
    drugInteractionsTitle: 'மருந்து முன்னெச்சரிக்கை:',

    physicianRoomTitle: 'மருத்துவர் OPD அறை & வரிசை',
    physicianSubtitle: 'AI தயாரித்த சுருக்கத்தை ஆய்வு செய்து கையொப்பமிடுங்கள்.',
    waitingPatientsTitle: 'காத்திருக்கும் நோயாளிகள் பட்டியல்',
    selectPatientNotice: 'இடது புறப் பட்டியலில் இருந்து நோயாளியைத் தேர்ந்தெடுக்கவும்.',
    signNoteBtn: 'மருத்துவக் குறிப்பில் கையொப்பமிடுங்கள்',
    signedStatus: 'கையொப்பமிடப்பட்டு பூட்டப்பட்டது',
    fhirBundleBtn: 'ABDM FHIR R4 அறிக்கை',
    timeSavedNotice: 'மெடிகியோஸ்க் நோயாளிக்கு சுமார் 5.5 நிமிட நேரத்தை மிச்சப்படுத்தியது.',
    tabSummary: 'மருத்துவ சுருக்கம்',
    tabDocuments: 'ஸ்கேன் செய்யப்பட்ட அறிக்கைகள்',
    tabAyush: 'ஆயுஷ் மதிப்பீடு',

    authPatientTab: 'நோயாளி போர்டல்',
    authStaffTab: 'மருத்துவமனை ஊழியர் & நிர்வாகம்',
    authLoginSubTab: 'ABHA / OTP மூலம் உள்நுழைவு',
    authRegisterSubTab: 'புதிய நோயாளி பதிவு',
    authPhoneOrAbhaLabel: '14 இலக்க ABHA எண் அல்லது 10 இலக்க மொபைல் எண்',
    authPhonePlaceholder: 'எ.கா: 9876543210',
    authSendOtpBtn: 'மொபைலுக்கு OTP அனுப்பவும்',
    authSendingOtp: 'OTP அனுப்பப்படுகிறது...',
    authOtpSentSuccess: 'உங்கள் மொபைல் எண்ணுக்கு SMS OTP அனுப்பப்பட்டது',
    authOtpInputLabel: '6 இலக்க OTP குறியீட்டை உள்ளிடவும்',
    authOtpPlaceholder: 'SMS குறியீடு',
    authVerifyBtn: 'OTP சரிபார்த்து உள்நுழைக',
    authVerifying: 'சரிபார்க்கப்படுகிறது...',
    authRegisterBtn: 'பதிவு செய்து டோக்கன் பெறுக',
    authStaffEmailLabel: 'ஊழியர் ஐடி / மின்னஞ்சல்',
    authStaffRoleLabel: 'பணி நிலை',
    authStaffPasswordLabel: 'கடவுச்சொல்',
    authStaffLoginBtn: 'நிர்வாக போர்ட்டலைத் திறக்கவும்',

    staffPortalTitle: 'படுக்கை & வள மேலாண்மை போர்ட்டல்',
    staffPortalSub: 'காலி படுக்கைகள், மருத்துவர்கள் மற்றும் சிகிச்சை விவரங்களை நிர்வகிக்கவும்.',
    bedManagementTitle: 'நேரடி படுக்கை இருப்பு',
    doctorsDirectoryTitle: 'பணியில் உள்ள மருத்துவர்கள்',
    treatmentsTitle: 'கிடைக்கும் சிகிச்சைகள்',
    saveChangesBtn: 'மாற்றங்களைச் சேமிக்கவும்',
    savingChanges: 'சேமிக்கப்படுகிறது...',

    ursaIntroSpeech: 'வணக்கம், நான் உர்சா (URSA), உங்கள் மருத்துவ உதவியாளர். உங்கள் உடல்நலக் கோளாறைக் கூறுங்கள்.',
    ursaLangChangedSpeech: 'மொழி தமிழில் மாற்றப்பட்டது. நான் உர்சா (URSA), உங்கள் மருத்துவ உதவியாளர்.',
  },

  te: {
    appName: 'మెడికియోస్క్',
    appBadge: 'AI క్లినికల్ ఇంటేక్',
    complianceBadge: 'ABDM & DPDPA 2023 సర్టిఫైడ్',
    bedsVacantLabel: 'బెడ్లు ఖాళీ',
    hospitalDefaultName: 'ప్రభుత్వ మెడికల్ కాలేజీ & ఆయుష్ ఇన్స్టిట్యూట్',
    navKiosk: 'రోగి కియోస్క్',
    navPhysician: 'డాక్టర్ OPD',
    navStaff: 'సిబ్బంది & బెడ్ మేనేజ్మెంట్',
    navAuth: 'లాగిన్ / రిజిస్టర్',
    navAccount: 'ఖాతా',
    audioOn: 'వాయిస్ ఆన్',
    audioOff: 'ఆడియో మ్యూట్',
    changeLanguage: 'భాషను మార్చండి',
    emergencyAlertTitle: 'ఎమర్జెన్సీ రెడ్-ఫ్లాగ్ హెచ్చరిక',
    triageRed: 'ఎమర్జెన్సీ రెడ్',
    triageGreen: 'రొటీన్ OPD',

    step1Title: 'క్లినికల్ సంభాషణ',
    step1Sub: 'లక్షణాలు శోధన & మాటలు',
    step2Title: 'రోగి గుర్తింపు',
    step2Sub: 'గుర్తింపు & ABHA',
    step3Title: 'రికార్డుల స్కాన్',
    step3Sub: 'ప్రిస్క్రిప్షన్లు & ల్యాబ్లు',
    step4Title: 'ఇంటేక్ సారాంశం',
    step4Sub: 'OPD టోకెన్ స్లిప్',
    newIntakeSession: 'కొత్త సెషన్',

    step1Header: 'రోగి గుర్తింపు ధృవీకరణ & విభాగం ఎంపిక',
    step1Desc: 'మీ వైద్య రికార్డులను లింక్ చేయడానికి 14 అంకెల ABHA లేదా మొబైల్ నంబర్ నమోదు చేయండి.',
    clinicalParadigmLabel: 'చికిత్సా విధానం',
    allopathyLabel: 'అల్లోపతి (ఆధునిక OPD)',
    allopathyDesc: 'జనరల్ మెడిసిన్, గుండె, ఊపిరితిత్తులు, ఆర్థోపెడిక్స్',
    ayushLabel: 'ఆయుర్వేద & ఆయుష్ OPD',
    ayushDesc: 'కాయచికిత్స, పంచకర్మ, దశవిధ పరీక్ష',
    abhaInputLabel: 'ఆయుష్మాన్ భారత్ హెల్త్ అకౌంట్ (ABHA) ID',
    abhaPlaceholder: 'ఉదా: 91-8273-1928-4421 లేదా మొబైల్',
    scanQrBtn: 'ABHA QR కోడ్ స్కాన్ చేయండి',
    orManualLabel: 'లేదా వివరాలను మాన్యువల్గా నమోదు చేయండి',
    fullNameLabel: 'రోగి పూర్తి పేరు',
    fullNamePlaceholder: 'పూర్తి పేరు నమోదు చేయండి',
    ageLabel: 'వయస్సు (సంవత్సరాలు)',
    genderLabel: 'లింగం',
    genderMale: 'పురుషుడు',
    genderFemale: 'స్త్రీ',
    genderOther: 'ఇతర',
    phoneLabel: 'మొబైల్ నంబర్',
    phonePlaceholder: '10 అంకెల మొబైల్ నంబర్',
    deptLabel: 'సంప్రదింపుల విభాగం',
    quickTouchPatients: 'డెమో ప్రొఫైల్స్',
    consentNotice: 'మీ వివరాలు DPDPA 2023 మరియు ABDM నిబంధనల ప్రకారం పూర్తిగా సురక్షితం.',
    continueBtn: 'సేవ్ చేసి సంభాషణను ప్రారంభించండి',

    step2Header: 'ఉర్సా (URSA)తో క్లినికల్ సంభాషణ',
    step2Desc: 'సహజంగా మాట్లాడండి లేదా శోధించండి. ఉర్సా మీ లక్షణాల వివరాలను నమోదు చేస్తుంది.',
    searchSymptomPlaceholder: 'లక్షణాలను శోధించండి (ఉదా: ఛాతీ నొప్పి, కాళ్లలో తిమ్మిరి)...',
    recordSymptomBtn: 'లక్షణాన్ని నమోదు చేయండి',
    voiceInputBtn: 'ఉర్సా మైక్ మాట్లాడండి',
    listeningNow: 'ఉర్సా వింటోంది... మాట్లాడండి',
    stopVoiceBtn: 'మైక్ ఆపండి',
    quickTouchAnswers: 'సాధారణంగా నమోదయ్యే లక్షణాలు',
    consultationDialogue: 'సంభాషణ వివరాలు',
    dialogueExchanges: 'మార్పిడులు నమోదయ్యాయి',
    aiFormulating: 'ఉర్సా తదుపరి ప్రశ్నను సిద్ధం చేస్తోంది...',
    painScaleLabel: 'నొప్పి తీవ్రత (1 నుండి 10 వరకు)',
    ayushAssessmentTitle: 'ఆయుర్వేద దశవిధ పరీక్ష నివేదిక',
    backToIdentity: 'గుర్తింపుకు తిరిగి వెళ్లండి',
    continueToRecords: 'డాక్యుమెంట్ స్కాన్కు కొనసాగించండి',
    skipToRecords: 'డాక్యుమెంట్ స్కాన్కు వెళ్లండి',
    optionalHistoryTitle: 'గత వైద్య చరిత్ర & ప్రస్తుత మందులు',
    optionalHistoryDesc: 'కఠినమైన నియమం: రోగి ఇచ్చిన సమాచారం మాత్రమే నమోదు చేయబడుతుంది, ఏమీ ఊహించబడదు.',
    noPastHistoryBadge: 'రోగి ద్వారా ఎలాంటి గత చరిత్ర నివేదించబడలేదు',
    noMedicationsBadge: 'రోగి ద్వారా ఎలాంటి మందులు నివేదించబడలేదు',

    step3Header: 'పాత ప్రిస్క్రిప్షన్లు & ల్యాబ్ రిపోర్టులను స్కాన్ చేయండి',
    step3Desc: 'పాత కాగితాలను కెమెరా ముందు ఉంచండి.',
    scanDocCamera: 'కెమెరా OCRతో స్కాన్ చేయండి',
    uploadDocFiles: 'ఫైళ్లను అప్లోడ్ చేయండి',
    ocrProcessing: 'అక్షరాలు చదవబడుతున్నాయి...',
    scannedRecordsCatalog: 'స్కాన్ చేసిన పత్రాలు',
    extractedTelemetryTitle: 'ల్యాబ్ అలర్టులు & విలువలు',
    continueToSummary: 'డాక్టర్ సారాంశాన్ని సిద్ధం చేయండి',
    backToInterview: 'సంభాషణకు తిరిగి వెళ్లండి',

    step4Header: 'OPD క్లినికల్ టోకెన్ స్లిప్ & ధృవీకరణ',
    step4Desc: 'మీ సంభాషణ మరియు రికార్డులు డాక్టర్ కోసం క్లినికల్ డ్రాఫ్ట్గా సిద్ధం చేయబడ్డాయి.',
    tokenPassBadge: 'అధికారిక OPD కన్సల్టేషన్ పాస్',
    officialReceiptTitle: 'OPD క్లినికల్ టోకెన్ స్లిప్',
    listenAudioBtn: 'ఉర్సాతో వినండి',
    printSlipBtn: 'టోకెన్ ప్రింట్ చేయండి',
    submitToQueueBtn: 'డాక్టర్ క్యూలో చేర్చండి',
    queueSuccessAlert: 'విజయవంతంగా క్యూలో చేర్చబడింది. కన్సల్టేషన్ గది వెలుపల వేచి ఉండండి.',
    chiefComplaintTitle: '1. ప్రధాన ఫిర్యాదు:',
    hpiTitle: '2. ప్రస్తుత అనారోగ్య చరిత్ర (SOCRATES):',
    pastHistoryTitle: '3. గత వైద్య చరిత్ర:',
    medsTitle: '4. ప్రస్తుత మందులు & అలర్జీలు:',
    reviewOfSystemsTitle: '5. శారీరక వ్యవస్థలు & జీవనశైలి:',
    abnormalLabsTitle: 'ల్యాబ్ నివేదిక హెచ్చరికలు:',
    drugInteractionsTitle: 'మందుల పరస్పర చర్యలు:',

    physicianRoomTitle: 'వైద్యుని OPD గది & క్యూ',
    physicianSubtitle: 'AI డ్రాఫ్ట్ను సమీక్షించండి, చికిత్సను నిర్ణయించండి మరియు సంతకం చేయండి.',
    waitingPatientsTitle: 'వేచి ఉన్న రోగుల జాబితా',
    selectPatientNotice: 'ఎడమ వైపు జాబితా నుండి రోగిని ఎంచుకోండి.',
    signNoteBtn: 'ప్రిస్క్రిప్షన్పై సంతకం చేయండి',
    signedStatus: 'సంతకం చేయబడింది & లాక్ చేయబడింది',
    fhirBundleBtn: 'ABDM FHIR R4 బండిల్',
    timeSavedNotice: 'మెడికియోస్క్ ప్రతి రోగికి సుమారు 5.5 నిమిషాల సమయాన్ని ఆదా చేసింది.',
    tabSummary: 'క్లినికల్ సారాంశం',
    tabDocuments: 'స్కాన్ చేసిన పత్రాలు',
    tabAyush: 'ఆయుష్ మూల్యాంకనం',

    authPatientTab: 'రోగి పోర్టల్',
    authStaffTab: 'హాస్పిటల్ స్టాఫ్ & అడ్మిన్',
    authLoginSubTab: 'ABHA / OTPతో లాగిన్',
    authRegisterSubTab: 'కొత్త రోగి నమోదు',
    authPhoneOrAbhaLabel: '14 అంకెల ABHA లేదా 10 అంకెల మొబైల్ నంబర్',
    authPhonePlaceholder: 'ఉదా: 9876543210',
    authSendOtpBtn: 'మొబైల్కు OTP పంపండి',
    authSendingOtp: 'OTP పంపబడుతోంది...',
    authOtpSentSuccess: 'మీ మొబైల్కు SMS OTP పంపబడింది',
    authOtpInputLabel: '6 అంకెల SMS OTPని నమోదు చేయండి',
    authOtpPlaceholder: 'SMS కోడ్',
    authVerifyBtn: 'OTPని ధృవీకరించి కొనసాగండి',
    authVerifying: 'ధృవీకరిస్తోంది...',
    authRegisterBtn: 'నమోదు చేసి టోకెన్ పొందండి',
    authStaffEmailLabel: 'స్టాఫ్ ID లేదా నమోదిత ఇమెయిల్',
    authStaffRoleLabel: 'పాత్ర',
    authStaffPasswordLabel: 'పాస్వర్డ్',
    authStaffLoginBtn: 'హాస్పిటల్ పోర్టల్ తెరవండి',

    staffPortalTitle: 'హాస్పిటల్ వనరులు & బెడ్ మేనేజ్మెంట్',
    staffPortalSub: 'ఖాళీ బెడ్లు, వైద్యులు మరియు చికిత్సలను నిర్వహించండి.',
    bedManagementTitle: 'ప్రత్యక్ష బెడ్ లభ్యత',
    doctorsDirectoryTitle: 'విధుల్లో ఉన్న వైద్యులు',
    treatmentsTitle: 'అందుబాటులో ఉన్న చికిత్సలు',
    saveChangesBtn: 'మార్పులను సేవ్ చేయండి',
    savingChanges: 'సేవ్ చేస్తోంది...',

    ursaIntroSpeech: 'నమస్కారం, నేను ఉర్సా (URSA), మీ క్లినికల్ అసిస్టెంట్ను. మీ ఆరోగ్య సమస్యను చెప్పండి.',
    ursaLangChangedSpeech: 'భాష తెలుగులోకి మార్చబడింది. నేను ఉర్సా (URSA), మీ క్లినికల్ అసిస్టెంట్ను.',
  },

  mr: {
    appName: 'मेडीकिओस्क',
    appBadge: 'AI क्लिनिकल इंटेक',
    complianceBadge: 'ABDM व DPDPA २०२३ प्रमाणित',
    bedsVacantLabel: 'खाटा रिक्त',
    hospitalDefaultName: 'शासकीय वैद्यकीय महाविद्यालय व आयुष संस्था',
    navKiosk: 'रुग्ण किओस्क',
    navPhysician: 'डॉक्टर ओपीडी',
    navStaff: 'कर्मचारी व खाट व्यवस्थापन',
    navAuth: 'लॉगिन / नोंदणी',
    navAccount: 'खाते',
    audioOn: 'आवाज चालू',
    audioOff: 'आवाज बंद',
    changeLanguage: 'भाषा बदला',
    emergencyAlertTitle: 'तातडीचा रेड-फ्लॅग इशारा',
    triageRed: 'इमर्जन्सी रेड',
    triageGreen: 'नियमित ओपीडी',

    step1Title: 'क्लिनिकल संवाद',
    step1Sub: 'लक्षणे शोध व संभाषण',
    step2Title: 'रुग्णाची ओळख',
    step2Sub: 'ओळख व आभा आयडी',
    step3Title: 'कागदपत्रे स्कॅन',
    step3Sub: 'जुनी प्रिस्क्रिप्शन व लॅब',
    step4Title: 'इंटेक सारांश',
    step4Sub: 'ओपीडी टोकन स्लिप',
    newIntakeSession: 'नवीन सत्र',

    step1Header: 'रुग्ण ओळख पडताळणी व विभाग निवड',
    step1Desc: 'वैद्यकीय नोंदी जोडण्यासाठी १४ अंकी आभा क्रमांक किंवा मोबाईल क्रमांक टाका.',
    clinicalParadigmLabel: 'उपचार पद्धती',
    allopathyLabel: 'अ‍ॅलोपॅथी (आधुनिक ओपीडी)',
    allopathyDesc: 'जनरल मेडिसिन, हृदयरोग, श्वसनरोग व अस्थिरोग',
    ayushLabel: 'आयुर्वेद व आयुष ओपीडी',
    ayushDesc: 'कायचिकित्सा, पंचकर्म व दशविध परीक्षा',
    abhaInputLabel: 'आयुष्मान भारत हेल्थ अकाउंट (ABHA) आयडी',
    abhaPlaceholder: 'उदा. 91-8273-1928-4421 किंवा मोबाईल',
    scanQrBtn: 'आभा QR कोड स्कॅन करा',
    orManualLabel: 'किंवा माहिती व्यक्तिशः भरा',
    fullNameLabel: 'रुग्णाचे संपूर्ण नाव',
    fullNamePlaceholder: 'पूर्ण नाव लिहा',
    ageLabel: 'वय (वर्षे)',
    genderLabel: 'लिंग',
    genderMale: 'पुरुष',
    genderFemale: 'स्त्री',
    genderOther: 'इतर',
    phoneLabel: 'मोबाईल क्रमांक',
    phonePlaceholder: '१० अंकी मोबाईल क्रमांक',
    deptLabel: 'सल्लामसलत विभाग',
    quickTouchPatients: 'डेमो रुग्ण प्रोफाईल',
    consentNotice: 'आपली माहिती DPDPA २०२३ आणि ABDM नियमांनुसार पूर्णपणे सुरक्षित आहे.',
    continueBtn: 'जतन करा आणि संवाद सुरू करा',

    step2Header: 'उर्सा (URSA) सोबत क्लिनिकल संवाद',
    step2Desc: 'माईक दाबून बोला किंवा लक्षणे शोधा. उर्सा आपल्या आजाराची संपूर्ण नोंद करेल.',
    searchSymptomPlaceholder: 'लक्षणे शोधा किंवा लिहा (उदा: छातीत दुखणे, पायात मुंग्या)...',
    recordSymptomBtn: 'लक्षण नोंदवा',
    voiceInputBtn: 'उर्सा माईक बोला',
    listeningNow: 'उर्सा ऐकत आहे... बोला',
    stopVoiceBtn: 'माईक बंद करा',
    quickTouchAnswers: 'ओपीडीमध्ये वारंवार नोंदवली जाणारी लक्षणे',
    consultationDialogue: 'क्लिनिकल संभाषण नोंद',
    dialogueExchanges: 'संवाद नोंदवले गेले',
    aiFormulating: 'उर्सा पुढील प्रश्न तयार करत आहे...',
    painScaleLabel: 'वेदनेची तीव्रता (१ ते १०)',
    ayushAssessmentTitle: 'आयुर्वेद दशविध परीक्षा स्थिती',
    backToIdentity: 'ओळखीकडे परत जा',
    continueToRecords: 'कागदपत्र स्कॅनकडे जा',
    skipToRecords: 'कागदपत्र स्कॅनकडे जा',
    optionalHistoryTitle: 'मागील वैद्यकीय इतिहास व सध्याची औषधे',
    optionalHistoryDesc: 'कडक नियम: रुग्णाने दिलेली माहितीच नोंदवली जाईल, कोणतेही औषध स्वतःहून सुचवले जाणार नाही.',
    noPastHistoryBadge: 'रुग्णाने कोणताही जुना आजार नोंदवलेला नाही',
    noMedicationsBadge: 'रुग्णाने कोणतीही चालू औषधे नोंदवलेली नाहीत',

    step3Header: 'जुनी प्रिस्क्रिप्शन व लॅब रिपोर्ट स्कॅन करा',
    step3Desc: 'डॉक्टरांच्या जुन्या पावत्या कॅमेऱ्यासमोर धरा.',
    scanDocCamera: 'कॅमेरा OCR ने स्कॅन करा',
    uploadDocFiles: 'कागदपत्रे अपलोड करा',
    ocrProcessing: 'हस्ताक्षर वाचले जात आहे...',
    scannedRecordsCatalog: 'स्कॅन केलेली कागदपत्रे',
    extractedTelemetryTitle: 'लॅब रिपोर्ट व सूचना',
    continueToSummary: 'डॉक्टर सारांश तयार करा',
    backToInterview: 'संवादाकडे परत जा',

    step4Header: 'ओपीडी क्लिनिकल टोकन स्लिप',
    step4Desc: 'आपला संवाद डॉक्टरांसाठी सारांश स्वरूपात तयार करण्यात आला आहे.',
    tokenPassBadge: 'अधिकृत ओपीडी पास',
    officialReceiptTitle: 'ओपीडी क्लिनिकल टोकन स्लिप',
    listenAudioBtn: 'उर्साकडून ऐका',
    printSlipBtn: 'टोकन प्रिंट करा',
    submitToQueueBtn: 'डॉक्टर ओपीडी रांगेत पाठवा',
    queueSuccessAlert: 'यशस्वीरीत्या ओपीडी रांगेत पाठवले. कृपया खोलीबाहेर थांबा.',
    chiefComplaintTitle: '१. मुख्य तक्रार:',
    hpiTitle: '२. आजाराचा सविस्तर इतिहास (SOCRATES):',
    pastHistoryTitle: '३. मागील आजारांचा इतिहास:',
    medsTitle: '४. सध्याची औषधे व अ‍ॅलर्जी:',
    reviewOfSystemsTitle: '५. शारीरिक तपासणी व जीवनशैली:',
    abnormalLabsTitle: 'असामान्य लॅब तपासणी इशारा:',
    drugInteractionsTitle: 'औषध परस्पर क्रिया सूचना:',

    physicianRoomTitle: 'डॉक्टर ओपीडी कक्ष व रांग',
    physicianSubtitle: 'AI सारांशाची तपासणी करा व स्वाक्षरी करा.',
    waitingPatientsTitle: 'प्रतीक्षेत असणाऱ्या रुग्णांची यादी',
    selectPatientNotice: 'डाव्या बाजूच्या यादीतून रुग्ण निवडा.',
    signNoteBtn: 'क्लिनिकल नोटवर स्वाक्षरी करा',
    signedStatus: 'स्वाक्षरी झालेली व सुरक्षित',
    fhirBundleBtn: 'ABDM FHIR R4 बंडल',
    timeSavedNotice: 'मेडीकिओस्कने प्रत्येक रुग्णाचा सुमारे ५.५ मिनिटांचा वेळ वाचवला.',
    tabSummary: 'क्लिनिकल सारांश',
    tabDocuments: 'स्कॅन केलेले अहवाल',
    tabAyush: 'आयुष मूल्यमापन',

    authPatientTab: 'रुग्ण पोर्टल',
    authStaffTab: 'रुग्णालय कर्मचारी व प्रशासन',
    authLoginSubTab: 'आभा / ओटीपी लॉगिन',
    authRegisterSubTab: 'नवीन रुग्ण नोंदणी',
    authPhoneOrAbhaLabel: '१४ अंकी आभा किंवा १० अंकी मोबाईल क्रमांक',
    authPhonePlaceholder: 'उदा: 9876543210',
    authSendOtpBtn: 'मोबाईलवर ओटीपी पाठवा',
    authSendingOtp: 'ओटीपी पाठवत आहे...',
    authOtpSentSuccess: 'आपल्या मोबाईलवर एसएमएसद्वारे ओटीपी पाठवला गेला आहे',
    authOtpInputLabel: 'प्राप्त ६ अंकी ओटीपी टाका',
    authOtpPlaceholder: 'एसएमएस कोड',
    authVerifyBtn: 'ओटीपी पडताळा व पुढे जा',
    authVerifying: 'पडताळणी सुरू आहे...',
    authRegisterBtn: 'नोंदणी करा व टोकन घ्या',
    authStaffEmailLabel: 'स्टाफ आयडी किंवा नोंदणीकृत ईमेल',
    authStaffRoleLabel: 'भूमिका',
    authStaffPasswordLabel: 'पासवर्ड',
    authStaffLoginBtn: 'प्रशासकीय पोर्टल उघडा',

    staffPortalTitle: 'रुग्णालय खाट व संसाधन व्यवस्थापन',
    staffPortalSub: 'रिक्त खाटा, डॉक्टर आणि उपलब्ध उपचार व्यवस्थापित करा.',
    bedManagementTitle: 'रिक्त खाटांची स्थिती',
    doctorsDirectoryTitle: 'ड्यूटीवरील डॉक्टर',
    treatmentsTitle: 'उपलब्ध उपचार',
    saveChangesBtn: 'बदल जतन करा',
    savingChanges: 'जतन करत आहे...',

    ursaIntroSpeech: 'नमस्कार, मी उर्सा (URSA), आपली क्लिनिकल सहाय्यक. कृपया आपली आरोग्य तक्रार सांगा.',
    ursaLangChangedSpeech: 'भाषा मराठीत बदलली आहे. मी उर्सा (URSA), आपली क्लिनिकल सहाय्यक.',
  },

  gu: {
    appName: 'મેડિકિયોસ્ક',
    appBadge: 'AI ક્લિનિકલ ઇન્ટેક',
    complianceBadge: 'ABDM અને DPDPA ૨૦૨૩ પ્રમાણિત',
    bedsVacantLabel: 'ખાટલા ખાલી',
    hospitalDefaultName: 'સરકારી મેડિકલ કોલેજ અને આયુષ સંસ્થા',
    navKiosk: 'દર્દી કિઓસ્ક',
    navPhysician: 'ડોક્ટર OPD',
    navStaff: 'સ્ટાફ અને બેડ વ્યવસ્થા',
    navAuth: 'લૉગિન / નોંધણી',
    navAccount: 'ખાતું',
    audioOn: 'અવાજ ચાલુ',
    audioOff: 'અવાજ બંધ',
    changeLanguage: 'ભાષા બદલો',
    emergencyAlertTitle: 'ઇમરજન્સી રેડ-ફ્લેગ ચેતવણી',
    triageRed: 'ઇમરજન્સી રેડ',
    triageGreen: 'નિયમિત OPD',

    step1Title: 'ક્લિનિકલ સંવાદ',
    step1Sub: 'લક્ષણો શોધ અને વાતચીત',
    step2Title: 'દર્દીની ઓળખ',
    step2Sub: 'ઓળખ અને આભા',
    step3Title: 'કાગળો સ્કેન કરો',
    step3Sub: 'દવાની ચિઠ્ઠી અને લેબ',
    step4Title: 'ઇન્ટેક સારાંશ',
    step4Sub: 'OPD ટોકન સ્લિપ',
    newIntakeSession: 'નવું સત્ર',

    step1Header: 'દર્દી ઓળખ ચકાસણી અને વિભાગ પસંદગી',
    step1Desc: 'મેડિકલ રેકોર્ડ જોડવા માટે તમારો ૧૪ અંકનો આભા નંબર અથવા મોબાઈલ નંબર દાખલ કરો.',
    clinicalParadigmLabel: 'સારવાર પદ્ધતિ',
    allopathyLabel: 'એલોપેથી (આધુનિક OPD)',
    allopathyDesc: 'જનરલ મેડિસિન, કાર્ડિયોલોજી, ફેફસાં અને હાડકાં',
    ayushLabel: 'આયુર્વેદ અને આયુષ OPD',
    ayushDesc: 'કાયચિકિત્સા, પંચકર્મ અને દશવિધ પરીક્ષા',
    abhaInputLabel: 'આયુષ્માન ભારત હેલ્થ એકાઉન્ટ (ABHA) ID',
    abhaPlaceholder: 'દા.ત. 91-8273-1928-4421 અથવા મોબાઈલ',
    scanQrBtn: 'આભા QR કોડ સ્કેન કરો',
    orManualLabel: 'અથવા વિગતો જાતે ભરો',
    fullNameLabel: 'દર્દીનું પૂરું નામ',
    fullNamePlaceholder: 'પૂરું નામ લખો',
    ageLabel: 'ઉંમર (વર્ષ)',
    genderLabel: 'જાતિ',
    genderMale: 'પુરુષ',
    genderFemale: 'સ્ત્રી',
    genderOther: 'અન્ય',
    phoneLabel: 'મોબાઈલ નંબર',
    phonePlaceholder: '૧૦ અંકનો મોબાઈલ નંબર',
    deptLabel: 'સલાહ વિભાગ',
    quickTouchPatients: 'ડેમો પ્રોફાઇલ',
    consentNotice: 'તમારી વિગતો DPDPA ૨૦૨૩ અને ABDM અનુસાર સંપૂર્ણ સુરક્ષિત છે.',
    continueBtn: 'સાચવો અને સંવાદ શરૂ કરો',

    step2Header: 'ઉર્સા (URSA) સાથે ક્લિનિકલ સંવાદ',
    step2Desc: 'સ્વાભાવિક રીતે બોલો અથવા લક્ષણો શોધો. ઉર્સા તમારી તકલીફની સંપૂર્ણ વિગતો નોંધશે.',
    searchSymptomPlaceholder: 'લક્ષણો શોધો અથવા લખો (દા.ત. છાતીમાં દુખાવો, પગમાં બળતરા)...',
    recordSymptomBtn: 'લક્ષણ નોંધો',
    voiceInputBtn: 'ઉર્સા માઇક બોલો',
    listeningNow: 'ઉર્સા સાંભળી રહી છે... બોલો',
    stopVoiceBtn: 'માઇક બંધ કરો',
    quickTouchAnswers: 'વારંવાર નોંધાતા મુખ્ય લક્ષણો',
    consultationDialogue: 'ક્લિનિકલ વાતચીત નોંધ',
    dialogueExchanges: 'સંવાદો નોંધાયા',
    aiFormulating: 'ઉર્સા આગામી પ્રશ્ન તૈયાર કરી રહી છે...',
    painScaleLabel: 'દુખાવાની તીવ્રતા (૧ થી ૧૦)',
    ayushAssessmentTitle: 'આયુર્વેદ દશવિધ પરીક્ષા સ્થિતિ',
    backToIdentity: 'ઓળખ પર પાછા જાઓ',
    continueToRecords: 'દસ્તાવેજ સ્કેન પર આગળ વધો',
    skipToRecords: 'દસ્તાવેજ સ્કેન પર જાઓ',
    optionalHistoryTitle: 'જૂની બીમારી અને હાલની દવાઓ',
    optionalHistoryDesc: 'કડક નિયમ: દર્દી દ્વારા અપાયેલી વિગત જ લખાશે, જાતે કોઈ દવા ઉમેરાશે નહીં.',
    noPastHistoryBadge: 'દર્દી દ્વારા કોઈ જૂની બીમારી નોંધાવાઈ નથી',
    noMedicationsBadge: 'દર્દી દ્વારા કોઈ ચાલુ દવા નોંધાવાઈ નથી',

    step3Header: 'જૂની દવાની ચિઠ્ઠી અને લેબ રિપોર્ટ સ્કેન કરો',
    step3Desc: 'ડોક્ટરની જૂની ચિઠ્ઠીઓ કેમેરા સામે રાખો.',
    scanDocCamera: 'કેમેરા OCR થી સ્કેન કરો',
    uploadDocFiles: 'ફાઈલ અપલોડ કરો',
    ocrProcessing: 'હસ્તાક્ષર વંચાઈ રહ્યા છે...',
    scannedRecordsCatalog: 'સ્કેન થયેલા કાગળો',
    extractedTelemetryTitle: 'લેબ રિપોર્ટ અને ચેતવણી',
    continueToSummary: 'ડોક્ટર સારાંશ બનાવો',
    backToInterview: 'વાતચીત પર પાછા જાઓ',

    step4Header: 'OPD ક્લિનિકલ ટોકન સ્લિપ',
    step4Desc: 'તમારી વાતચીત અને રિપોર્ટ્સ ડોક્ટર માટે સારાંશમાં તૈયાર કરવામાં આવ્યા છે.',
    tokenPassBadge: 'સત્તાવાર OPD પાસ',
    officialReceiptTitle: 'OPD ક્લિનિકલ ટોકન સ્લિપ',
    listenAudioBtn: 'ઉર્સા સાથે સાંભળો',
    printSlipBtn: 'ટોકન પ્રિન્ટ કરો',
    submitToQueueBtn: 'ડોક્ટર OPD કતારમાં મોકલો',
    queueSuccessAlert: 'સફળતાપૂર્વક કતારમાં મોકલાયું. રૂમની બહાર પ્રતીક્ષા કરો.',
    chiefComplaintTitle: '૧. મુખ્ય તકલીફ:',
    hpiTitle: '૨. બીમારીનો વિગતવાર ઇતિહાસ (SOCRATES):',
    pastHistoryTitle: '૩. જૂની બીમારીનો ઇતિહાસ:',
    medsTitle: '૪. ચાલુ દવાઓ અને એલર્જી:',
    reviewOfSystemsTitle: '૫. શારીરિક તપાસ અને જીવનશૈલી:',
    abnormalLabsTitle: 'લેબ રિપોર્ટ એલર્ટ:',
    drugInteractionsTitle: 'દવા ચેતવણી:',

    physicianRoomTitle: 'ડોક્ટર OPD રૂમ અને કતાર',
    physicianSubtitle: 'AI સારાંશની ચકાસણી કરો અને સહી કરો.',
    waitingPatientsTitle: 'રાહ જોતા દર્દીઓની યાદી',
    selectPatientNotice: 'ડાબી બાજુની યાદીમાંથી દર્દી પસંદ કરો.',
    signNoteBtn: 'ક્લિનિકલ નોંધ પર સહી કરો',
    signedStatus: 'સહી કરેલ અને સુરક્ષિત',
    fhirBundleBtn: 'ABDM FHIR R4 બંડલ',
    timeSavedNotice: 'મેડિકિયોસ્કે દર્દી દીઠ આશરે ૫.૫ મિનિટનો સમય બચાવ્યો.',
    tabSummary: 'ક્લિનિકલ સારાંશ',
    tabDocuments: 'સ્કેન થયેલા રિપોર્ટ્સ',
    tabAyush: 'આયુષ મૂલ્યાંકન',

    authPatientTab: 'દર્દી પોર્ટલ',
    authStaffTab: 'હોસ્પિટલ સ્ટાફ અને એડમિન',
    authLoginSubTab: 'આભા / OTP થી લૉગિન',
    authRegisterSubTab: 'નવા દર્દીની નોંધણી',
    authPhoneOrAbhaLabel: '૧૪ અંકનો આભા અથવા ૧૦ અંકનો મોબાઈલ નંબર',
    authPhonePlaceholder: 'દા.ત. 9876543210',
    authSendOtpBtn: 'મોબાઈલ પર OTP મોકલો',
    authSendingOtp: 'OTP મોકલાઈ રહ્યો છે...',
    authOtpSentSuccess: 'તમારા મોબાઈલ પર SMS દ્વારા OTP મોકલી દેવાયો છે',
    authOtpInputLabel: 'મળેલો ૬ અંકનો SMS OTP લખો',
    authOtpPlaceholder: 'SMS કોડ',
    authVerifyBtn: 'OTP ચકાસો અને આગળ વધો',
    authVerifying: 'ચકાસી રહ્યું છે...',
    authRegisterBtn: 'નોંધણી કરો અને ટોકન લો',
    authStaffEmailLabel: 'સ્ટાફ ID અથવા ઈમેઈલ',
    authStaffRoleLabel: 'ભૂમિકા',
    authStaffPasswordLabel: 'પાસવર્ડ',
    authStaffLoginBtn: 'હોસ્પિટલ પોર્ટલ ખોલો',

    staffPortalTitle: 'હોસ્પિટલ સંસાધન અને બેડ વ્યવસ્થાપન',
    staffPortalSub: 'ખાલી પલંગ, ફરજ પરના ડોકટરો અને સારવારનું સંચાલન કરો.',
    bedManagementTitle: 'લાઈવ બેડની ઉપલબ્ધતા',
    doctorsDirectoryTitle: 'હાજર ડોકટરો',
    treatmentsTitle: 'ઉપલબ્ધ સારવારો',
    saveChangesBtn: 'ફેરફારો સાચવો',
    savingChanges: 'સાચવી રહ્યું છે...',

    ursaIntroSpeech: 'નમસ્તે, હું ઉર્સા (URSA), આપની ક્લિનિકલ સહાયક છું. તમારી તકલીફ જણાવો.',
    ursaLangChangedSpeech: 'ભાષા ગુજરાતીમાં બદલાઈ ગઈ છે. હું ઉર્સા (URSA), આપની ક્લિનિકલ સહાયક છું.',
  },
  pa: {
    appName: 'ਮੈਡੀਕਿਓਸਕ',
    appBadge: 'ਏਆਈ ਕਲੀਨਿਕਲ ਇਨਟੇਕ',
    complianceBadge: 'ABDM ਅਤੇ DPDPA ਪ੍ਰਮਾਣਿਤ',
    bedsVacantLabel: 'ਖਾਲੀ ਬੈੱਡ',
    hospitalDefaultName: 'ਸਰਕਾਰੀ ਮੈਡੀਕਲ ਕਾਲਜ ਅਤੇ ਆਯੁਸ਼ ਸੰਸਥਾਨ',
    navKiosk: 'ਮਰੀਜ਼ ਕਿਓਸਕ',
    navPhysician: 'ਡਾਕਟਰ ਓਪੀਡੀ',
    navStaff: 'ਸਟਾਫ਼ ਅਤੇ ਬੈੱਡ ਪ੍ਰਬੰਧਨ',
    navAuth: 'ਲੌਗਇਨ / ਰਜਿਸਟਰ',
    navAccount: 'ਖਾਤਾ',
    audioOn: 'ਆਵਾਜ਼ ਚਾਲੂ',
    audioOff: 'ਆਵਾਜ਼ ਬੰਦ',
    changeLanguage: 'ਭਾਸ਼ਾ ਬਦਲੋ',
    emergencyAlertTitle: 'ਐਮਰਜੈਂਸੀ ਰੈੱਡ-ਫਲੈਗ ਲੱਛਣ ਮਿਲਿਆ',
    triageRed: 'ਐਮਰਜੈਂਸੀ ਰੈੱਡ',
    triageGreen: 'ਰੁਟੀਨ ਓਪੀਡੀ',

    step1Title: 'ਕਲੀਨਿਕਲ ਗੱਲਬਾਤ',
    step1Sub: 'ਲੱਛਣਾਂ ਦੀ ਜਾਂਚ ਅਤੇ ਏਆਈ ਟ੍ਰਾਈਏਜ',
    step2Title: 'ਮਰੀਜ਼ ਦੀ ਪਛਾਣ',
    step2Sub: 'ਜਨਸੰਖਿਆ ਅਤੇ ABHA ਆਈਡੀ',
    step3Title: 'ਪਰਚੀ ਸਕੈਨ',
    step3Sub: 'ਪੁਰਾਣੀਆਂ ਪਰਚੀਆਂ ਅਤੇ ਰਿਪੋਰਟਾਂ',
    step4Title: 'ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼',
    step4Sub: 'ਓਪੀਡੀ ਟੋਕਨ ਪਰਚੀ',
    newIntakeSession: 'ਨਵਾਂ ਮਰੀਜ਼ ਸ਼ੁਰੂ ਕਰੋ',

    step1Header: 'ਮਰੀਜ਼ ਦੀ ਪਛਾਣ ਅਤੇ ABHA ਤਸਦੀਕ',
    step1Desc: 'ਆਪਣਾ ABHA ਨੰਬਰ ਦਰਜ ਕਰੋ, QR ਸਕੈਨ ਕਰੋ ਜਾਂ ਆਪਣੀ ਜਾਣਕਾਰੀ ਭਰੋ।',
    clinicalParadigmLabel: 'ਇਲਾਜ ਪ੍ਰਣਾਲੀ ਚੁਣੋ:',
    allopathyLabel: 'ਐਲੋਪੈਥੀ / ਆਧੁਨਿਕ ਦਵਾਈ',
    allopathyDesc: 'ਜਨਰਲ ਮੈਡੀਸਿਨ, ਕਾਰਡੀਓਲੌਜੀ, ਛਾਤੀ ਰੋਗ ਅਤੇ ਸਰਜਰੀ ਓਪੀਡੀ',
    ayushLabel: 'ਆਯੁਸ਼ (AYUSH) ਸੰਪੂਰਨ ਚਿਕਿਤਸਾ',
    ayushDesc: 'ਆਯੁਰਵੇਦ, ਯੋਗਾ, ਯੂਨਾਨੀ, ਸਿੱਧਾ ਅਤੇ ਹੋਮਿਓਪੈਥੀ',
    abhaInputLabel: '੧੪ ਅੰਕਾਂ ਦਾ ABHA ਆਈਡੀ ਜਾਂ ਮੋਬਾਈਲ ਨੰਬਰ',
    abhaPlaceholder: 'ਜਿਵੇਂ 12-3456-7890-1234 ਜਾਂ ਮੋਬਾਈਲ',
    scanQrBtn: 'ABHA ਕਾਰਡ ਸਕੈਨ ਕਰੋ',
    orManualLabel: 'ਜਾਂ ਹੇਠਾਂ ਆਪਣਾ ਵੇਰਵਾ ਲਿਖੋ',
    fullNameLabel: 'ਪੂਰਾ ਨਾਮ',
    fullNamePlaceholder: 'ਮਰੀਜ਼ ਦਾ ਪੂਰਾ ਨਾਮ',
    ageLabel: 'ਉਮਰ',
    genderLabel: 'ਲਿੰਗ',
    genderMale: 'ਪੁਰਸ਼',
    genderFemale: 'ਔਰਤ',
    genderOther: 'ਹੋਰ',
    phoneLabel: 'ਮੋਬਾਈਲ ਨੰਬਰ',
    phonePlaceholder: '੧੦ ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
    deptLabel: 'ਓਪੀਡੀ ਵਿਭਾਗ',
    quickTouchPatients: 'ਟੈਸਟਿੰਗ ਲਈ ਨਮੂਨਾ ਮਰੀਜ਼ ਚੁਣੋ:',
    consentNotice: 'DPDPA 2023 ਅਤੇ ABDM ਨਿਯਮਾਂ ਅਧੀਨ ਤੁਹਾਡਾ ਡਾਟਾ ਪੂਰੀ ਤਰ੍ਹਾਂ ਸੁਰੱਖਿਅਤ ਅਤੇ ਐਨਕ੍ਰਿਪਟਡ ਹੈ।',
    continueBtn: 'ਜਾਰੀ ਰੱਖੋ ਅਤੇ ਅਗਲੇ ਕਦਮ ਤੇ ਜਾਓ',

    step2Header: 'ਕਲੀਨਿਕਲ ਇੰਟਰਵਿਊ ਅਤੇ ਲੱਛਣ ਸੰਵਾਦ',
    step2Desc: 'ਆਪਣੇ ਲੱਛਣ ਦੱਸੋ ਜਾਂ ਬੋਲੋ। ਸਾਡਾ ਏਆਈ ਤੁਹਾਡੀ ਡਾਕਟਰੀ ਸਾਰਾਂਸ਼ ਤਿਆਰ ਕਰੇਗਾ।',
    searchSymptomPlaceholder: 'ਲੱਛਣ ਖੋਜੋ ਜਾਂ ਬੋਲੋ (ਜਿਵੇਂ ਛਾਤੀ ਵਿੱਚ ਦਰਦ, ਬੁਖ਼ਾਰ, ਖੰਘ)...',
    recordSymptomBtn: 'ਲੱਛਣ ਦਰਜ ਕਰੋ',
    voiceInputBtn: 'ਮਾਈਕ੍ਰੋਫ਼ੋਨ ਰਾਹੀਂ ਬੋਲੋ',
    listeningNow: 'ਸੁਣ ਰਿਹਾ ਹਾਂ... ਕਿਰਪਾ ਕਰਕੇ ਬੋਲੋ',
    stopVoiceBtn: 'ਰੋਕੋ',
    quickTouchAnswers: 'ਆਮ ਲੱਛਣ ਅਤੇ ਤੁਰੰਤ ਜਵਾਬ:',
    consultationDialogue: 'ਕਲੀਨਿਕਲ ਗੱਲਬਾਤ ਰਿਕਾਰਡ',
    dialogueExchanges: 'ਗੱਲਬਾਤ ਦਰਜ',
    aiFormulating: 'ਏਆਈ ਅਗਲਾ ਕਲੀਨਿਕਲ ਸਵਾਲ ਤਿਆਰ ਕਰ ਰਿਹਾ ਹੈ...',
    painScaleLabel: 'ਦਰਦ ਦਾ ਪੈਮਾਨਾ (੧ ਤੋਂ ੧੦):',
    ayushAssessmentTitle: 'ਆਯੁਰਵੇਦ ਦਸ਼ਵਿਧ ਪ੍ਰੀਖਿਆ ਮੁਲਾਂਕਣ',
    backToIdentity: 'ਪਿੱਛੇ ਜਾਓ',
    continueToRecords: 'ਅੱਗੇ ਵਧੋ: ਰਿਪੋਰਟਾਂ ਸਕੈਨ ਕਰੋ',
    skipToRecords: 'ਰਿਪੋਰਟਾਂ ਸਕੈਨਿੰਗ ਛੱਡੋ',
    optionalHistoryTitle: 'ਪਿਛਲੀ ਬਿਮਾਰੀ ਅਤੇ ਦਵਾਈਆਂ (ਚੋਣਵਾਂ)',
    optionalHistoryDesc: 'ਕੋਈ ਪੁਰਾਣੀ ਬਿਮਾਰੀ (ਸ਼ੂਗਰ, ਬੀਪੀ) ਜਾਂ ਚੱਲ ਰਹੀਆਂ ਦਵਾਈਆਂ ਦਰਜ ਕਰੋ।',
    noPastHistoryBadge: 'ਕੋਈ ਪੁਰਾਣੀ ਬਿਮਾਰੀ ਨਹੀਂ',
    noMedicationsBadge: 'ਕੋਈ ਨਿਯਮਤ ਦਵਾਈਆਂ ਨਹੀਂ',

    step3Header: 'ਪੁਰਾਣੀਆਂ ਪਰਚੀਆਂ ਅਤੇ ਰਿਪੋਰਟਾਂ ਸਕੈਨ (OCR)',
    step3Desc: 'ਡਾਕਟਰ ਦੀ ਲਿਖੀ ਪਰਚੀ ਜਾਂ ਲੈਬ ਰਿਪੋਰਟ ਅਪਲੋਡ ਕਰੋ। ਏਆਈ ਆਪਣੇ ਆਪ ਜਾਣਕਾਰੀ ਪੜ੍ਹ ਲਵੇਗਾ।',
    scanDocCamera: 'ਕੈਮਰੇ ਨਾਲ ਫੋਟੋ ਲਵੋ',
    uploadDocFiles: 'ਦਸਤਾਵੇਜ਼ ਅਪਲੋਡ ਕਰੋ (JPG, PNG, PDF)',
    ocrProcessing: 'ਏਆਈ ਮੈਡੀਕਲ ਦਸਤਾਵੇਜ਼ ਪੜ੍ਹ ਰਿਹਾ ਹੈ...',
    scannedRecordsCatalog: 'ਸਕੈਨ ਕੀਤੇ ਗਏ ਦਸਤਾਵੇਜ਼',
    extractedTelemetryTitle: 'ਪਰਚੀ ਵਿੱਚੋਂ ਮਿਲੇ ਅਹਿਮ ਨੁਕਤੇ',
    continueToSummary: 'ਅੱਗੇ: ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼ ਅਤੇ ਟੋਕਨ ਲਵੋ',
    backToInterview: 'ਪਿੱਛੇ: ਕਲੀਨਿਕਲ ਗੱਲਬਾਤ',

    step4Header: 'ਅਧਿਕਾਰਤ ਓਪੀਡੀ ਟੋਕਨ ਪਰਚੀ ਅਤੇ ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼',
    step4Desc: 'ਤੁਹਾਡਾ ਕਲੀਨਿਕਲ ਇਨਟੇਕ ਮੁਕੰਮਲ ਹੋ ਗਿਆ ਹੈ। ਟੋਕਨ ਪਰਚੀ ਪ੍ਰਿੰਟ ਕਰੋ ਜਾਂ ਡਾਕਟਰ ਕਤਾਰ ਵਿੱਚ ਭੇਜੋ।',
    tokenPassBadge: 'ਕਲੀਨਿਕਲ ਟੋਕਨ ਪਾਸ ਜਾਰੀ',
    officialReceiptTitle: 'ਸਰਕਾਰੀ ਓਪੀਡੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਰਸੀਦ',
    listenAudioBtn: 'ਆਡੀਓ ਸਾਰਾਂਸ਼ ਸੁਣੋ',
    printSlipBtn: 'ਪਰਚੀ ਪ੍ਰਿੰਟ ਕਰੋ',
    submitToQueueBtn: 'ਡਾਕਟਰ ਦੀ ਕਤਾਰ ਵਿੱਚ ਭੇਜੋ',
    queueSuccessAlert: 'ਟੋਕਨ ਸਫਲਤਾਪੂਰਵਕ ਡਾਕਟਰ ਕੰਸਲਟੇਸ਼ਨ ਕਤਾਰ ਵਿੱਚ ਜਮ੍ਹਾ ਹੋ ਗਿਆ ਹੈ!',
    chiefComplaintTitle: 'ਮੁੱਖ ਲੱਛਣ / ਤਕਲੀਫ਼ (Chief Complaint)',
    hpiTitle: 'ਮੌਜੂਦਾ ਬਿਮਾਰੀ ਦਾ ਵਿਸਥਾਰ (HPI)',
    pastHistoryTitle: 'ਪੁਰਾਣਾ ਮੈਡੀਕਲ ਇਤਿਹਾਸ',
    medsTitle: 'ਮੌਜੂਦਾ ਦਵਾਈਆਂ',
    reviewOfSystemsTitle: 'ਸਰੀਰਕ ਪ੍ਰਣਾਲੀ ਸਮੀਖਿਆ',
    abnormalLabsTitle: 'ਲੈਬ ਰਿਪੋਰਟਾਂ ਵਿੱਚ ਚੇਤਾਵਨੀਆਂ',
    drugInteractionsTitle: 'ਸੰਭਾਵੀ ਦਵਾਈਆਂ ਦਾ ਟਕਰਾਅ',

    physicianRoomTitle: 'ਡਾਕਟਰ ਓਪੀਡੀ ਕੰਸਲਟੇਸ਼ਨ ਰੂਮ',
    physicianSubtitle: 'ਕਿਓਸਕ ਤੋਂ ਤਿਆਰ ਮਰੀਜ਼ਾਂ ਦੇ ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼ ਦੇਖੋ ਅਤੇ ਨੋਟਸ ਸਾਈਨ ਕਰੋ।',
    waitingPatientsTitle: 'ਉਡੀਕ ਕਰ ਰਹੇ ਮਰੀਜ਼',
    selectPatientNotice: 'ਵੇਰਵੇ ਦੇਖਣ ਲਈ ਖੱਬੇ ਪਾਸਿਓਂ ਕੋਈ ਮਰੀਜ਼ ਚੁਣੋ।',
    signNoteBtn: 'ਕਲੀਨਿਕਲ ਨੋਟ ਸਾਈਨ ਕਰੋ',
    signedStatus: 'ਸਾਈਨ ਹੋ ਗਿਆ (ABDM ਰਿਕਾਰਡ)',
    fhirBundleBtn: 'FHIR JSON ਡਾਊਨਲੋਡ ਕਰੋ',
    timeSavedNotice: 'ਏਆਈ ਇਨਟੇਕ ਨੇ ਡਾਕਟਰ ਦਾ ਸਮਾਂ ਬਚਾਇਆ',
    tabSummary: 'ਕਲੀਨਿਕਲ ਸਾਰਾਂਸ਼',
    tabDocuments: 'ਸਕੈਨ ਕੀਤੀਆਂ ਰਿਪੋਰਟਾਂ',
    tabAyush: 'ਆਯੁਸ਼ ਮੁਲਾਂਕਣ',

    authPatientTab: 'ਮਰੀਜ਼ ਪੋਰਟਲ',
    authStaffTab: 'ਹਸਪਤਾਲ ਸਟਾਫ਼ ਅਤੇ ਐਡਮਿਨ',
    authLoginSubTab: 'ABHA / OTP ਨਾਲ ਲੌਗਇਨ',
    authRegisterSubTab: 'ਨਵੇਂ ਮਰੀਜ਼ ਦੀ ਰਜਿਸਟ੍ਰੇਸ਼ਨ',
    authPhoneOrAbhaLabel: '੧੪ ਅੰਕਾਂ ਦਾ ABHA ਜਾਂ ੧੦ ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
    authPhonePlaceholder: 'ਜਿਵੇਂ 9876543210',
    authSendOtpBtn: 'ਮੋਬਾਈਲ ਤੇ OTP ਭੇਜੋ',
    authSendingOtp: 'OTP ਭੇਜਿਆ ਜਾ ਰਿਹਾ ਹੈ...',
    authOtpSentSuccess: 'ਤੁਹਾਡੇ ਮੋਬਾਈਲ ਤੇ SMS ਰਾਹੀਂ OTP ਭੇਜ ਦਿੱਤਾ ਗਿਆ ਹੈ',
    authOtpInputLabel: 'ਮਿਲਿਆ ੬ ਅੰਕਾਂ ਦਾ SMS OTP ਦਰਜ ਕਰੋ',
    authOtpPlaceholder: 'SMS ਕੋਡ',
    authVerifyBtn: 'OTP ਤਸਦੀਕ ਕਰੋ ਅਤੇ ਅੱਗੇ ਵਧੋ',
    authVerifying: 'ਤਸਦੀਕ ਹੋ ਰਿਹਾ ਹੈ...',
    authRegisterBtn: 'ਰਜਿਸਟਰ ਕਰੋ ਅਤੇ ਟੋਕਨ ਲਵੋ',
    authStaffEmailLabel: 'ਸਟਾਫ਼ ਆਈਡੀ ਜਾਂ ਈਮੇਲ',
    authStaffRoleLabel: 'ਭੂਮਿਕਾ',
    authStaffPasswordLabel: 'ਪਾਸਵਰਡ',
    authStaffLoginBtn: 'ਹਸਪਤਾਲ ਪੋਰਟਲ ਖੋਲ੍ਹੋ',

    staffPortalTitle: 'ਹਸਪਤਾਲ ਸਾਧਨ ਅਤੇ ਬੈੱਡ ਪ੍ਰਬੰਧਨ',
    staffPortalSub: 'ਖਾਲੀ ਬੈੱਡ, ਡਿਊਟੀ ਤੇ ਤਾਇਨਾਤ ਡਾਕਟਰ ਅਤੇ ਇਲਾਜ ਪ੍ਰਬੰਧਿਤ ਕਰੋ।',
    bedManagementTitle: 'ਲਾਈਵ ਬੈੱਡ ਉਪਲਬਧਤਾ',
    doctorsDirectoryTitle: 'ਹਾਜ਼ਰ ਡਾਕਟਰ',
    treatmentsTitle: 'ਉਪਲਬਧ ਇਲਾਜ ਸੇਵਾਵਾਂ',
    saveChangesBtn: 'ਤਬਦੀਲੀਆਂ ਸੁਰੱਖਿਅਤ ਕਰੋ',
    savingChanges: 'ਸੁਰੱਖਿਅਤ ਹੋ ਰਿਹਾ ਹੈ...',

    ursaIntroSpeech: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ, ਮੈਂ ਉਰਸਾ (URSA), ਤੁਹਾਡੀ ਕਲੀਨਿਕਲ ਸਹਾਇਕ ਹਾਂ। ਆਪਣੀ ਤਕਲੀਫ਼ ਦੱਸੋ।',
    ursaLangChangedSpeech: 'ਭਾਸ਼ਾ ਪੰਜਾਬੀ ਵਿੱਚ ਬਦਲ ਦਿੱਤੀ ਗਈ ਹੈ। ਮੈਂ ਉਰਸਾ (URSA), ਤੁਹਾਡੀ ਕਲੀਨਿਕਲ ਸਹਾਇਕ ਹਾਂ।',
  },
};

export function getTranslation(lang: LanguageCode): Required<SiteDictionary> {
  const baseEn = TRANSLATIONS['en'];
  const baseLang = TRANSLATIONS[lang] || baseEn;
  const extraEn = EXTRA_TRANSLATIONS['en'] || {};
  const extraLang = EXTRA_TRANSLATIONS[lang] || {};
  return {
    ...baseEn,
    ...extraEn,
    ...baseLang,
    ...extraLang,
  } as Required<SiteDictionary>;
}
