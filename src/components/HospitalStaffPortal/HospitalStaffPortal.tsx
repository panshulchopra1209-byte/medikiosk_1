import React, { useState, useEffect } from 'react';
import {
  Building2,
  BedDouble,
  Stethoscope,
  Activity,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
  RefreshCw,
  PhoneCall,
  MapPin,
  Clock,
  Shield,
  AlertTriangle,
  UserCheck,
  Award,
  Sparkles,
  ArrowUpRight,
  LogOut,
  Printer,
  FileText,
  User,
  ShieldCheck,
  MessageSquare,
  Signal,
  Copy,
  Send,
  Users,
  Zap,
} from 'lucide-react';
import { HospitalFacilityInfo, BedCategory, OnDutyDoctor, HospitalStaffUser, LanguageCode, OPDQueueItem, PatientIdentity } from '../../types';
import { fetchWithCsrf, safeParseResponse } from '../../utils/csrf';
import { SiteDictionary, getTranslation } from '../../i18n/translations';

interface HospitalStaffPortalProps {
  facility: HospitalFacilityInfo;
  onUpdateFacility: (updated: HospitalFacilityInfo) => void;
  staffUser: HospitalStaffUser | null;
  onLogout: () => void;
  onSwitchToKiosk: () => void;
  onSwitchToPhysician: () => void;
  language?: LanguageCode;
  t?: SiteDictionary;
  queue?: OPDQueueItem[];
  onRefreshQueue?: () => void;
  loggedInPatient?: PatientIdentity | null;
  isPatientView?: boolean;
  onGoToStaffLogin?: () => void;
  onDemoStaffLogin?: () => void;
}

export const HospitalStaffPortal: React.FC<HospitalStaffPortalProps> = ({
  facility,
  onUpdateFacility,
  staffUser,
  onLogout,
  onSwitchToKiosk,
  onSwitchToPhysician,
  language = 'en',
  t: propT,
  queue = [],
  onRefreshQueue,
  loggedInPatient,
  isPatientView = false,
  onGoToStaffLogin,
  onDemoStaffLogin,
}) => {
  const t = propT || getTranslation((language as LanguageCode) || 'en');
  const [activeTab, setActiveTab] = useState<'beds' | 'hospital' | 'doctors' | 'treatments'>('beds');

  // Role detection: is the user viewing as a patient?
  // If staffUser is authenticated, user is authorized hospital staff (never a patient).
  // If no staffUser exists, user is in restricted visitor / patient mode.
  const isPatient = Boolean(!staffUser);

  // Find logged-in patient's record in the hospital queue to check their personal bed status
  const patientRecord = loggedInPatient;
  const patientQueueItem = patientRecord
    ? queue.find(
        (q) =>
          (patientRecord.tokenNumber && q.patient.tokenNumber === patientRecord.tokenNumber) ||
          (patientRecord.abhaId && q.patient.abhaId === patientRecord.abhaId) ||
          (patientRecord.phone && q.patient.phone === patientRecord.phone) ||
          (patientRecord.fullName && q.patient.fullName.trim().toLowerCase() === patientRecord.fullName.trim().toLowerCase())
      )
    : null;
  const isPatientBedAllotted = Boolean(patientQueueItem?.allottedBed);

  // Form State initialized from props
  const [hospitalName, setHospitalName] = useState(facility.name);
  const [hfrId, setHfrId] = useState(facility.hfrId);
  const [facilityType, setFacilityType] = useState(facility.facilityType);
  const [stateName, setStateName] = useState(facility.state);
  const [districtName, setDistrictName] = useState(facility.district);
  const [emergencyHelpline, setEmergencyHelpline] = useState(facility.emergencyHelpline);
  const [ambulanceContact, setAmbulanceContact] = useState(facility.ambulanceContact);

  // Beds state
  const [beds, setBeds] = useState<BedCategory[]>(facility.bedInventory);

  // Synchronize bed inventory when facility prop updates
  useEffect(() => {
    if (facility.bedInventory) {
      setBeds(facility.bedInventory);
    }
  }, [facility.bedInventory]);

  // Handle Escape key to close any open modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsAllotModalOpen(false);
        setConfirmedAllotmentData(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Doctors state
  const [doctors, setDoctors] = useState<OnDutyDoctor[]>(facility.doctors);
  const [newDocName, setNewDocName] = useState('');
  const [newDocDept, setNewDocDept] = useState('General Medicine / आंतरिक चिकित्सा');
  const [newDocSpeciality, setNewDocSpeciality] = useState('');
  const [newDocRoom, setNewDocRoom] = useState('');
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // Treatments state
  const [treatments, setTreatments] = useState<string[]>(facility.treatmentsAvailable);
  const [newTreatment, setNewTreatment] = useState('');

  // Save feedback state
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Bed Allotment & Queue Management state
  const [isAllotModalOpen, setIsAllotModalOpen] = useState(false);
  const [selectedQueuePatientId, setSelectedQueuePatientId] = useState<string>('');
  const [targetBedCategory, setTargetBedCategory] = useState<string>(facility.bedInventory[0]?.id || '');
  const [customBedNumber, setCustomBedNumber] = useState<string>('');
  const [allotmentNotes, setAllotmentNotes] = useState<string>('');
  const [sendSmsOnAllot, setSendSmsOnAllot] = useState<boolean>(true);
  const [isAllotting, setIsAllotting] = useState<boolean>(false);
  const [allotStatusMsg, setAllotStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Bed Allotment Confirmation Pop-Up State
  const [confirmedAllotmentData, setConfirmedAllotmentData] = useState<{
    patientName: string;
    tokenNumber: string;
    age: number;
    gender: string;
    phone?: string;
    abhaId?: string;
    department: string;
    bedNumber: string;
    categoryName: string;
    unit: string;
    allottedAt: string;
    allottedBy: string;
    cause: string;
    chiefComplaints?: string[];
    triageSeverity?: string;
    triageReason?: string;
    smsSent: boolean;
    carrierDispatch?: {
      deliveredViaRealCarrier: boolean;
      provider: 'twilio' | 'fast2sms' | 'sandbox';
      info: string;
      messageId?: string;
      error?: string;
    };
    smsDeliveredNotification?: {
      sender: string;
      recipient: string;
      text: string;
      deliveredAt: string;
    };
  } | null>(null);

  // Desktop SMS Alert notification state (matching AuthView OTP desktop pattern)
  const [patientPhoneInput, setPatientPhoneInput] = useState<string>('');
  const [bedSmsAlert, setBedSmsAlert] = useState<{
    sender: string;
    recipient: string;
    text: string;
    deliveredAt: string;
  } | null>(null);
  const [carrierDispatch, setCarrierDispatch] = useState<{
    deliveredViaRealCarrier: boolean;
    provider: 'twilio' | 'fast2sms' | 'sandbox';
    info: string;
    messageId?: string;
    error?: string;
  } | null>(null);
  const [copiedSms, setCopiedSms] = useState<boolean>(false);
  const [resendPhoneInput, setResendPhoneInput] = useState<string>('');
  const [isResendingSms, setIsResendingSms] = useState<boolean>(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<{ text: string; success: boolean } | null>(null);

  // Helper when selecting a patient in allotment modal to pre-populate cause/complaints/phone
  const handleSelectPatient = (patientId: string) => {
    setSelectedQueuePatientId(patientId);
    const targetItem = queue.find((q) => q.id === patientId);
    if (targetItem) {
      if (targetItem.patient.phone) {
        setPatientPhoneInput(targetItem.patient.phone);
      }
      const autoCause = targetItem.allottedBed?.notes ||
        (targetItem.summary?.chiefComplaintSummary && targetItem.summary.chiefComplaintSummary !== 'Awaiting clinical input' ? targetItem.summary.chiefComplaintSummary : '') ||
        (targetItem.history?.chiefComplaints && targetItem.history.chiefComplaints.length > 0 ? targetItem.history.chiefComplaints.join(', ') : '') ||
        targetItem.triage?.reason || '';
      if (autoCause && !allotmentNotes) {
        setAllotmentNotes(autoCause);
      }
    }
  };

  // Helper to copy SMS text with feedback
  const handleCopySms = (textToCopy: string) => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopiedSms(true);
    setTimeout(() => setCopiedSms(false), 2500);
  };

  // Dispatch / Resend Bed Allotment SMS directly to any mobile number
  const handleResendBedSms = async (targetPhoneOverride?: string) => {
    const targetPhone = (targetPhoneOverride || resendPhoneInput.trim() || confirmedAllotmentData?.phone || '').trim();
    if (!targetPhone || targetPhone.length < 8) {
      setResendStatusMsg({ text: 'Please enter a valid 10-digit mobile number.', success: false });
      return;
    }

    setIsResendingSms(true);
    setResendStatusMsg(null);

    try {
      const res = await fetchWithCsrf('/api/sms/send-bed-confirmation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: targetPhone,
          patientName: confirmedAllotmentData?.patientName || 'Patient',
          bedNumber: confirmedAllotmentData?.bedNumber || 'Reserved',
          categoryName: confirmedAllotmentData?.categoryName || 'General Ward',
          unit: confirmedAllotmentData?.unit || 'Main Facility',
          tokenNumber: confirmedAllotmentData?.tokenNumber || '',
        }),
      });

      const parsed = await safeParseResponse<{
        success: boolean;
        message: string;
        error?: string;
        carrierDispatch?: {
          deliveredViaRealCarrier: boolean;
          provider: 'twilio' | 'fast2sms' | 'sandbox';
          info: string;
          messageId?: string;
          error?: string;
        };
        smsDeliveredNotification?: {
          sender: string;
          recipient: string;
          text: string;
          deliveredAt: string;
        };
      }>(res);

      if (parsed.ok && parsed.data?.success) {
        const newAlert = parsed.data.smsDeliveredNotification || null;
        const newCarrier = parsed.data.carrierDispatch || null;

        if (newAlert) setBedSmsAlert(newAlert);
        if (newCarrier) setCarrierDispatch(newCarrier);

        if (confirmedAllotmentData) {
          setConfirmedAllotmentData({
            ...confirmedAllotmentData,
            phone: targetPhone,
            smsSent: true,
            carrierDispatch: newCarrier || undefined,
            smsDeliveredNotification: newAlert || undefined,
          });
        }

        setResendStatusMsg({
          text: newCarrier?.deliveredViaRealCarrier
            ? `SMS dispatched via ${newCarrier.provider.toUpperCase()} to mobile (${targetPhone})!`
            : `SMS generated for ${targetPhone}. Active on desktop screen.`,
          success: true,
        });
      } else {
        setResendStatusMsg({
          text: parsed.data?.error || parsed.error || 'Failed to dispatch SMS.',
          success: false,
        });
      }
    } catch (err: any) {
      setResendStatusMsg({ text: 'SMS dispatch error: ' + err.message, success: false });
    } finally {
      setIsResendingSms(false);
    }
  };

  // Helper to open confirmation slip pop-up from existing queue record
  const handleViewAllotmentSlip = (item: OPDQueueItem) => {
    if (!item.allottedBed) return;
    setResendPhoneInput(item.patient.phone || '');
    setConfirmedAllotmentData({
      patientName: item.patient.fullName,
      tokenNumber: item.patient.tokenNumber,
      age: item.patient.age,
      gender: item.patient.gender,
      phone: item.patient.phone,
      abhaId: item.patient.abhaId,
      department: item.patient.selectedDepartment,
      bedNumber: item.allottedBed.bedNumber,
      categoryName: item.allottedBed.categoryName,
      unit: item.allottedBed.unit,
      allottedAt: item.allottedBed.allottedAt,
      allottedBy: item.allottedBed.allottedBy,
      cause: item.allottedBed.notes ||
        (item.summary?.chiefComplaintSummary && item.summary.chiefComplaintSummary !== 'Awaiting clinical input' ? item.summary.chiefComplaintSummary : '') ||
        (item.history?.chiefComplaints && item.history.chiefComplaints.length > 0 ? item.history.chiefComplaints.join(', ') : '') ||
        item.triage?.reason ||
        'Inpatient Admission & Clinical Monitoring',
      chiefComplaints: item.history?.chiefComplaints,
      triageSeverity: item.triage?.severity,
      triageReason: item.triage?.reason,
      smsSent: Boolean(item.patient.phone),
    });
  };

  // Handle consultation accept for queue patients
  const handleAcceptConsultation = async (patientQueueId: string) => {
    try {
      const activeStaffName = staffUser?.name || 'Medical Officer';
      const activeStaffRole = staffUser?.role || 'Staff';
      const res = await fetchWithCsrf(`/api/queue/${patientQueueId}/accept`, {
        method: 'POST',
        body: JSON.stringify({
          staffName: activeStaffName,
          physicianNotes: `Consultation accepted by ${activeStaffName} (${activeStaffRole}). Directing to examination room.`,
        }),
      });
      const parsed = await safeParseResponse<{ success: boolean; message?: string }>(res);
      if (parsed.ok && parsed.data?.success) {
        if (onRefreshQueue) onRefreshQueue();
        setAllotStatusMsg({
          text: parsed.data.message || 'Consultation request accepted successfully!',
          success: true,
        });
        setTimeout(() => setAllotStatusMsg(null), 4000);
      }
    } catch (err) {
      console.error('Failed to accept consultation:', err);
    }
  };

  // Handle Allot Bed submission (Hospital Staff Only)
  const handleConfirmAllotBed = async () => {
    if (isPatient || !staffUser) {
      setAllotStatusMsg({
        text: 'Access Denied: Inpatient bed allotment and transfers are strictly restricted to authorized hospital staff. Please authorize as staff.',
        success: false,
      });
      return;
    }

    if (!selectedQueuePatientId) {
      setAllotStatusMsg({ text: 'Please select a patient from the queue.', success: false });
      return;
    }
    if (!targetBedCategory) {
      setAllotStatusMsg({ text: 'Please choose a bed unit category.', success: false });
      return;
    }

    const selectedQueueItem = queue.find((q) => q.id === selectedQueuePatientId);
    const targetCat = beds.find((b) => b.id === targetBedCategory);

    const causeBookedFor = allotmentNotes.trim() ||
      (selectedQueueItem?.summary?.chiefComplaintSummary && selectedQueueItem.summary.chiefComplaintSummary !== 'Awaiting clinical input' ? selectedQueueItem.summary.chiefComplaintSummary : '') ||
      (selectedQueueItem?.history?.chiefComplaints && selectedQueueItem.history.chiefComplaints.length > 0 ? selectedQueueItem.history.chiefComplaints.join(', ') : '') ||
      selectedQueueItem?.triage?.reason ||
      'Inpatient Medical Care & Observation';

    setIsAllotting(true);
    setAllotStatusMsg(null);

    try {
      const activeStaff = staffUser || {
        id: 'staff-auto-1',
        staffId: 'STAFF-OPD-01',
        name: 'Hospital Admission Desk',
        role: 'OPD In-Charge / Supervisor' as const,
        department: 'Emergency & Inpatient Admissions',
        email: 'admissions@hospital.gov.in',
      };

      const res = await fetchWithCsrf(`/api/queue/${selectedQueuePatientId}/allot-bed`, {
        method: 'POST',
        headers: {
          'X-Staff-Role': activeStaff.role,
          'X-Staff-Id': activeStaff.staffId,
        },
        body: JSON.stringify({
          bedCategoryId: targetBedCategory,
          bedNumber: customBedNumber.trim() || undefined,
          staffName: activeStaff.name,
          staffRole: activeStaff.role,
          notes: causeBookedFor,
          sendSmsNotification: sendSmsOnAllot,
          phone: patientPhoneInput.trim() || undefined,
        }),
      });

      const parsed = await safeParseResponse<{
        success: boolean;
        message: string;
        error?: string;
        facility?: HospitalFacilityInfo;
        updatedItem?: OPDQueueItem;
        carrierDispatch?: {
          deliveredViaRealCarrier: boolean;
          provider: 'twilio' | 'fast2sms' | 'sandbox';
          info: string;
          messageId?: string;
          error?: string;
        };
        smsDeliveredNotification?: {
          sender: string;
          recipient: string;
          text: string;
          deliveredAt: string;
        };
      }>(res);

      if (parsed.ok && parsed.data?.success) {
        if (parsed.data.facility) {
          setBeds(parsed.data.facility.bedInventory);
          onUpdateFacility(parsed.data.facility);
        }
        if (onRefreshQueue) {
          onRefreshQueue();
        }

        const updatedBed = parsed.data.updatedItem?.allottedBed;
        const finalBedNumber = updatedBed?.bedNumber || customBedNumber.trim() || `${targetCat?.type.toUpperCase() || 'BED'}-${Math.floor(100 + Math.random() * 900)}`;
        const finalCatName = updatedBed?.categoryName || targetCat?.name || 'Inpatient Bed';
        const finalUnit = updatedBed?.unit || targetCat?.unit || 'Hospital Ward';
        const finalPatientName = parsed.data.updatedItem?.patient.fullName || selectedQueueItem?.patient.fullName || 'Patient';
        const finalToken = parsed.data.updatedItem?.patient.tokenNumber || selectedQueueItem?.patient.tokenNumber || 'MED-000';
        const finalAge = parsed.data.updatedItem?.patient.age ?? selectedQueueItem?.patient.age ?? 0;
        const finalGender = parsed.data.updatedItem?.patient.gender || selectedQueueItem?.patient.gender || 'Other';
        const finalPhone = patientPhoneInput.trim() || parsed.data.updatedItem?.patient.phone || selectedQueueItem?.patient.phone;
        const finalAbha = parsed.data.updatedItem?.patient.abhaId || selectedQueueItem?.patient.abhaId;
        const finalDept = parsed.data.updatedItem?.patient.selectedDepartment || selectedQueueItem?.patient.selectedDepartment || 'General Medicine';

        const activeSmsAlert = parsed.data.smsDeliveredNotification || null;
        const activeCarrier = parsed.data.carrierDispatch || null;

        if (activeSmsAlert) {
          setBedSmsAlert(activeSmsAlert);
        }
        if (activeCarrier) {
          setCarrierDispatch(activeCarrier);
        }

        // Close allotment input modal
        setIsAllotModalOpen(false);
        setCustomBedNumber('');
        setAllotmentNotes('');

        // Launch Bed Allotment Confirmation Pop-Up Modal
        setConfirmedAllotmentData({
          patientName: finalPatientName,
          tokenNumber: finalToken,
          age: finalAge,
          gender: finalGender,
          phone: finalPhone,
          abhaId: finalAbha,
          department: finalDept,
          bedNumber: finalBedNumber,
          categoryName: finalCatName,
          unit: finalUnit,
          allottedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric', year: 'numeric' }),
          allottedBy: `${activeStaff.name} (${activeStaff.role})`,
          cause: causeBookedFor,
          chiefComplaints: selectedQueueItem?.history?.chiefComplaints || parsed.data.updatedItem?.history?.chiefComplaints,
          triageSeverity: selectedQueueItem?.triage?.severity || parsed.data.updatedItem?.triage?.severity,
          triageReason: selectedQueueItem?.triage?.reason || parsed.data.updatedItem?.triage?.reason,
          smsSent: sendSmsOnAllot && Boolean(finalPhone),
          carrierDispatch: activeCarrier || undefined,
          smsDeliveredNotification: activeSmsAlert || undefined,
        });

        if (finalPhone) {
          setResendPhoneInput(finalPhone);
        }

        setAllotStatusMsg({ text: `Bed ${finalBedNumber} allotted and confirmed for ${finalPatientName}`, success: true });
        setTimeout(() => setAllotStatusMsg(null), 6000);
      } else {
        const errorText = parsed.data?.message || parsed.data?.error || parsed.error || 'Bed allotment failed. Please check ward vacancy.';
        setAllotStatusMsg({ text: errorText, success: false });
      }
    } catch (err: any) {
      setAllotStatusMsg({ text: 'Network error allotting bed: ' + err.message, success: false });
    } finally {
      setIsAllotting(false);
    }
  };

  // 1. Bed Management Handlers (Hospital Staff Only)
  const handleBedChange = (id: string, field: 'total' | 'available', delta: number) => {
    if (isPatient || !staffUser) return;
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const currentVal = b[field];
        const updatedVal = Math.max(0, currentVal + delta);

        // Auto calculate occupied
        if (field === 'available') {
          const clampedAvail = Math.min(b.total, updatedVal);
          return {
            ...b,
            available: clampedAvail,
            occupied: Math.max(0, b.total - clampedAvail),
          };
        } else {
          // updated total
          const newTotal = updatedVal;
          const clampedAvail = Math.min(newTotal, b.available);
          return {
            ...b,
            total: newTotal,
            available: clampedAvail,
            occupied: Math.max(0, newTotal - clampedAvail),
          };
        }
      })
    );
  };

  const handleBedDirectInput = (id: string, field: 'total' | 'available', val: number) => {
    if (isPatient || !staffUser) return;
    const num = isNaN(val) ? 0 : Math.max(0, val);
    setBeds((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        if (field === 'available') {
          const clampedAvail = Math.min(b.total, num);
          return {
            ...b,
            available: clampedAvail,
            occupied: Math.max(0, b.total - clampedAvail),
          };
        } else {
          const clampedAvail = Math.min(num, b.available);
          return {
            ...b,
            total: num,
            available: clampedAvail,
            occupied: Math.max(0, num - clampedAvail),
          };
        }
      })
    );
  };

  // 2. Doctor Management Handlers (Hospital Staff Only)
  const handleToggleDocStatus = (id: string, newStatus: OnDutyDoctor['status']) => {
    if (isPatient || !staffUser) return;
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );
  };

  const handleDocRoomChange = (id: string, room: string) => {
    if (isPatient || !staffUser) return;
    setDoctors((prev) =>
      prev.map((d) => (d.id === id ? { ...d, roomNumber: room } : d))
    );
  };

  const handleDeleteDoctor = (id: string) => {
    if (isPatient || !staffUser) return;
    setDoctors((prev) => prev.filter((d) => d.id !== id));
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPatient || !staffUser) return;
    if (!newDocName.trim()) return;

    const newDoc: OnDutyDoctor = {
      id: `doc_${Date.now()}`,
      name: newDocName.trim(),
      department: newDocDept,
      speciality: newDocSpeciality.trim() || 'General Specialist',
      roomNumber: newDocRoom.trim() || 'OPD Room 101',
      status: 'On Duty',
      opdTimings: '09:00 AM - 02:00 PM',
      phoneOrExt: `Ext ${Math.floor(100 + Math.random() * 899)}`,
    };

    setDoctors((prev) => [...prev, newDoc]);
    setNewDocName('');
    setNewDocSpeciality('');
    setNewDocRoom('');
    setIsAddingDoc(false);
  };

  // 3. Treatments Handlers (Hospital Staff Only)
  const handleAddTreatment = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPatient || !staffUser) return;
    if (!newTreatment.trim()) return;
    if (!treatments.includes(newTreatment.trim())) {
      setTreatments((prev) => [...prev, newTreatment.trim()]);
    }
    setNewTreatment('');
  };

  const handleDeleteTreatment = (index: number) => {
    if (isPatient || !staffUser) return;
    setTreatments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddSuggestedTreatment = (treatmentName: string) => {
    if (isPatient || !staffUser) return;
    if (!treatments.includes(treatmentName)) {
      setTreatments((prev) => [...prev, treatmentName]);
    }
  };

  // 4. Save & Broadcast Updates (Hospital Staff Only)
  const handleSaveAll = () => {
    if (isPatient || !staffUser) return;
    const updatedFacility: HospitalFacilityInfo = {
      name: hospitalName.trim() || facility.name,
      hfrId: hfrId.trim() || facility.hfrId,
      facilityType: facilityType.trim() || facility.facilityType,
      state: stateName.trim() || facility.state,
      district: districtName.trim() || facility.district,
      emergencyHelpline: emergencyHelpline.trim() || facility.emergencyHelpline,
      ambulanceContact: ambulanceContact.trim() || facility.ambulanceContact,
      bedInventory: beds,
      doctors,
      treatmentsAvailable: treatments,
      lastUpdatedBy: `${staffUser.name} (${staffUser.role})`,
      lastUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    onUpdateFacility(updatedFacility);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3500);
  };

  // Hospital Staff OPD Crowd Status Controller
  const handleSetCrowdStatus = (level: 'normal' | 'very_high') => {
    const updated: HospitalFacilityInfo = {
      ...facility,
      name: hospitalName.trim() || facility.name,
      crowdLevel: level,
      totalPatientsWaiting: level === 'very_high' ? Math.max(facility.totalPatientsWaiting || 0, 52) : 18,
      lastUpdatedBy: staffUser ? `${staffUser.name} (${staffUser.role})` : 'Hospital OPD In-Charge',
      lastUpdatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    try {
      localStorage.setItem('medikiosk_crowd_level', level);
    } catch {}
    onUpdateFacility(updated);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  // Summary Metrics
  const totalAvailableBeds = beds.reduce((acc, b) => acc + b.available, 0);
  const totalBedsCount = beds.reduce((acc, b) => acc + b.total, 0);
  const onDutyDocsCount = doctors.filter((d) => d.status === 'On Duty' || d.status === 'In OPD').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Top Banner: Credentials / Patient Identity & Quick Actions */}
      <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-[#F5ECE1] border border-[#DECFC0] flex items-center justify-center text-[#8C5D39] flex-shrink-0">
            {isPatient ? <BedDouble className="w-6 h-6 text-[#3E5B47]" /> : <Building2 className="w-6 h-6 text-[#8C5D39]" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#8C5D39] uppercase tracking-wider">
                {isPatient ? 'Hospital & Bed Information' : t.staffConsoleTitle}
              </span>
              <span className="text-[10px] bg-[#EBF1EC] text-[#3E5B47] font-semibold px-2 py-0.5 rounded-full border border-[#D3E2D6]">
                {isPatient ? 'Patient Portal' : t.liveSyncedBadge}
              </span>
            </div>
            <h2 className="text-xl font-bold text-[#2D2621]">
              {hospitalName}
            </h2>
            <p className="text-xs text-[#7A6C5F] mt-0.5">
              {isPatient ? (
                <>
                  Active Patient: <strong className="text-[#3E342B]">{loggedInPatient?.fullName || 'Registered Patient'}</strong>{' '}
                  <span className="text-[#8C7B6C]">(Token: {loggedInPatient?.tokenNumber || 'MED-000'} • {loggedInPatient?.selectedDepartment || 'General Medicine'})</span>
                </>
              ) : (
                <>
                  Logged in as: <strong className="text-[#3E342B]">{staffUser?.name || 'Medical Staff'}</strong> ({staffUser?.role || 'Staff'} • {staffUser?.department || 'Operations'})
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto justify-end">
          {isPatient && !staffUser && onGoToStaffLogin && (
            <button
              type="button"
              onClick={onGoToStaffLogin}
              className="px-3 py-2 bg-[#3E5B47] hover:bg-[#2C4233] text-white text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 shadow-xs"
              title="Hospital Staff Login"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Staff Login</span>
            </button>
          )}

          {!isPatient && (
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-4 py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-2 shadow-xs"
            >
              <Save className="w-4 h-4" />
              <span>{t.saveBroadcastBtn}</span>
            </button>
          )}

          {isPatient && (
            <button
              type="button"
              onClick={onSwitchToKiosk}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] hover:bg-[#EAE2D5] hover:shadow-md hover:font-bold hover:text-[#18130F] text-[#4F4135] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Activity className="w-3.5 h-3.5 text-[#3E5B47]" />
              <span>Return to Intake Kiosk</span>
            </button>
          )}

          {!isPatient && (
            <button
              type="button"
              onClick={onSwitchToPhysician}
              className="px-3 py-2 bg-[#FAF8F5] border border-[#DDD5C7] hover:bg-[#EAE2D5] hover:shadow-md hover:font-bold hover:text-[#18130F] text-[#4F4135] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            >
              <Stethoscope className="w-3.5 h-3.5 text-[#8C5D39]" />
              <span>{t.opdRoomBtn}</span>
            </button>
          )}

          <button
            type="button"
            onClick={onLogout}
            className="px-3 py-2 bg-[#FAEEEA] border border-[#E8D0C7] hover:bg-[#F2DDD5] hover:shadow-md hover:font-bold text-[#BA3C2A] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
            title={isPatient ? 'Log out of patient account' : 'Sign out of staff portal'}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{t.signOutBtn}</span>
          </button>
        </div>
      </div>

      {/* Patient Mode Clinical Access Notice */}
      {isPatient && (
        <div className="bg-[#FAF8F5] border border-[#E2DAD0] rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-[#55473B] shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#EBF1EC] text-[#3E5B47] border border-[#D5E2D7] flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-[#2D2621]">
                Patient View Mode • Clinical Access Restriction
              </p>
              <p className="text-[#6E5F52] text-[11px] mt-0.5">
                Hospital bed inventory, admission status, and ward vacancies are in read-only mode. Inpatient bed allotment, ward changes, and discharges are strictly managed by on-duty medical officers.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {onDemoStaffLogin && (
              <button
                type="button"
                onClick={onDemoStaffLogin}
                className="px-3 py-1.5 bg-[#3E5B47] hover:bg-[#2F523A] text-white font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all shadow-xs"
                title="Log in as on-duty Chief Medical Officer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Staff Sign-In (Dr. Sunita Rao)</span>
              </button>
            )}
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C5D39] bg-[#F5ECE1] px-3 py-1.5 rounded-lg border border-[#DECFC0] whitespace-nowrap">
              Self-Allotment Restricted
            </span>
          </div>
        </div>
      )}

      {/* Real-time Desktop SMS Notification Banner (matching AuthView OTP desktop pattern) */}
      {bedSmsAlert && (
        <div
          id="sms-notification-banner"
          className="bg-[#2D2621] text-white p-4 rounded-2xl border border-[#443831] shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-fadeIn"
        >
          <div className="flex items-start gap-3">
            <div
              className={`w-9 h-9 rounded-xl ${
                carrierDispatch?.deliveredViaRealCarrier ? 'bg-[#2E7D32]' : 'bg-[#3E5B47]'
              } text-white flex items-center justify-center flex-shrink-0 mt-0.5`}
            >
              {carrierDispatch?.deliveredViaRealCarrier ? (
                <Signal className="w-5 h-5" />
              ) : (
                <MessageSquare className="w-5 h-5" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-bold text-[#A8D3B2] uppercase tracking-wider">
                  {carrierDispatch?.deliveredViaRealCarrier
                    ? `📡 Real SMS Sent to Mobile (${bedSmsAlert.recipient})`
                    : `📲 Bed Confirmation SMS Dispatched (${bedSmsAlert.recipient})`}
                </span>
                <span className="text-[10px] bg-[#433830] text-[#D8CFC5] px-2 py-0.5 rounded font-mono">
                  Gateway: {carrierDispatch?.provider ? carrierDispatch.provider.toUpperCase() : bedSmsAlert.sender}
                </span>
                <span className="text-[10px] text-[#A89F95]">{bedSmsAlert.deliveredAt}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#F4EFE6] font-mono mt-1 font-semibold">
                "{bedSmsAlert.text}"
              </p>
              {carrierDispatch?.deliveredViaRealCarrier ? (
                <p className="text-[11px] text-[#A8D3B2] mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Carrier confirmed delivery to mobile handset. Please check your SMS inbox.</span>
                </p>
              ) : (
                <p className="text-[11px] text-[#D8CFC5] mt-1">
                  {carrierDispatch?.error
                    ? carrierDispatch.error
                    : 'Real telecom dispatch is active via Twilio / Fast2SMS. In this sandbox session, your bed allotment confirmation SMS is displayed on desktop.'}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
            <button
              type="button"
              onClick={() => handleCopySms(bedSmsAlert.text)}
              className="px-3.5 py-1.5 bg-[#3E5B47] hover:bg-[#4E7259] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all"
              title="Copy SMS confirmation text"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copiedSms ? 'Copied!' : 'Copy SMS'}</span>
            </button>
            <button
              type="button"
              onClick={() => setBedSmsAlert(null)}
              className="p-1.5 bg-[#433830] hover:bg-[#57483E] text-[#D8CFC5] hover:text-white rounded-lg transition-colors"
              title="Dismiss notification"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Success Notification Bar */}
      {saveSuccess && (
        <div className="bg-[#EBF1EC] border border-[#C2D8C6] text-[#2C4835] p-3.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-[#3E5B47] flex-shrink-0" />
          <span>
            {t.saveSuccessMsg} ({totalAvailableBeds} {t.availableBedsCard})
          </span>
        </div>
      )}

      {/* Real-time Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7A6C5F]">{t.availableBedsCard}</span>
            <BedDouble className="w-4 h-4 text-[#3E5B47]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2621] mt-1">
            {totalAvailableBeds}
            <span className="text-xs font-normal text-[#8A7969] ml-1">/ {totalBedsCount}</span>
          </div>
          <p className="text-[10px] text-[#3E5B47] font-semibold mt-0.5">
            {Math.round((totalAvailableBeds / (totalBedsCount || 1)) * 100)}% {t.capacityAvailable}
          </p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7A6C5F]">{t.activeDoctorsCard}</span>
            <Stethoscope className="w-4 h-4 text-[#8C5D39]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2621] mt-1">
            {onDutyDocsCount}
            <span className="text-xs font-normal text-[#8A7969] ml-1">/ {doctors.length}</span>
          </div>
          <p className="text-[10px] text-[#7A6C5F] mt-0.5">{t.onDutyInOpd}</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7A6C5F]">{t.clinicalServicesCard}</span>
            <Activity className="w-4 h-4 text-[#9E4F36]" />
          </div>
          <div className="text-2xl font-bold text-[#2D2621] mt-1">
            {treatments.length}
          </div>
          <p className="text-[10px] text-[#7A6C5F] mt-0.5">{t.offeredInHospital}</p>
        </div>

        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-xl p-3.5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#7A6C5F]">{t.abdmHfrStatusCard}</span>
            <Shield className="w-4 h-4 text-[#3E5B47]" />
          </div>
          <div className="text-xs font-mono font-bold text-[#2D2621] mt-1.5 truncate">
            {hfrId}
          </div>
          <p className="text-[10px] text-[#3E5B47] font-semibold mt-0.5">{t.registryVerified}</p>
        </div>
      </div>

      {/* OPD Crowd Status & Surge Triage Control (Controlled EXCLUSIVELY by Hospital Staff) */}
      <div className="bg-[#FFFFFF] border-2 border-[#DDD3C4] rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            facility.crowdLevel === 'very_high' ? 'bg-[#FDE8E5] text-[#BA3C2A]' : 'bg-[#EBF1EC] text-[#244C30]'
          }`}>
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-extrabold text-sm text-[#1E1915]">
                OPD Crowd Status & Surge Intake Control
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-black uppercase tracking-wider ${
                facility.crowdLevel === 'very_high'
                  ? 'bg-[#BA3C2A] text-white animate-pulse'
                  : 'bg-[#DDE8DF] text-[#244C30] border border-[#BBD5C4]'
              }`}>
                {facility.crowdLevel === 'very_high' ? 'High Crowd Surge Active' : 'Normal OPD Flow'}
              </span>
            </div>
            <p className="text-xs text-[#6C5E52] mt-0.5">
              {facility.crowdLevel === 'very_high'
                ? 'High patient surge mode enabled: Patient Kiosks are set to 3-question rapid intake to clear waiting room queue.'
                : 'Standard flow enabled: Patient Kiosks are conducting comprehensive clinical symptom intakes.'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        {!isPatient && staffUser ? (
          <div className="flex items-center gap-2 self-end sm:self-auto flex-shrink-0">
            <button
              type="button"
              onClick={() => handleSetCrowdStatus('normal')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                facility.crowdLevel !== 'very_high'
                  ? 'bg-[#244C30] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#55473B] border border-[#DDD5C7] hover:bg-[#EFE9DF]'
              }`}
            >
              Normal OPD Flow
            </button>
            <button
              type="button"
              onClick={() => handleSetCrowdStatus('very_high')}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                facility.crowdLevel === 'very_high'
                  ? 'bg-[#BA3C2A] text-white shadow-xs'
                  : 'bg-[#FAF8F5] text-[#BA3C2A] border border-[#F8B4AC] hover:bg-[#FDE8E5]'
              }`}
            >
              High Crowd Surge
            </button>
          </div>
        ) : (
          <div className="text-xs font-semibold text-[#8C7B6C] bg-[#FAF8F5] px-3 py-1.5 rounded-xl border border-[#DDD3C4]">
            Restricted: Hospital Staff Only
          </div>
        )}
      </div>

      {/* Tabs Bar with Enhanced CSS Classes */}
      <div className="flex bg-[#EFECE6] p-1.5 rounded-2xl border border-[#DED6CA] gap-2 shadow-xs overflow-x-auto">
        <button
          onClick={() => setActiveTab('beds')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'beds'
              ? 'tab-card-active font-bold'
              : 'tab-card-inactive font-semibold'
          }`}
        >
          <BedDouble className="w-4 h-4 text-[#3E5B47]" />
          <span>{isPatient ? 'Bed Availability & Status' : `${t.tabBeds} (${totalAvailableBeds})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('hospital')}
          className={`flex-1 min-w-[150px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'hospital'
              ? 'tab-card-active font-bold'
              : 'tab-card-inactive font-semibold'
          }`}
        >
          <Building2 className="w-4 h-4 text-[#8C5D39]" />
          <span>{isPatient ? 'Hospital Information' : t.tabHospital}</span>
        </button>

        <button
          onClick={() => setActiveTab('doctors')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'doctors'
              ? 'tab-card-active font-bold'
              : 'tab-card-inactive font-semibold'
          }`}
        >
          <Stethoscope className="w-4 h-4 text-[#3E5B47]" />
          <span>{isPatient ? `On-Duty Doctors (${doctors.length})` : `${t.tabDoctors} (${doctors.length})`}</span>
        </button>

        <button
          onClick={() => setActiveTab('treatments')}
          className={`flex-1 min-w-[140px] py-2.5 px-3.5 rounded-xl text-xs sm:text-sm transition-all duration-250 flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'treatments'
              ? 'tab-card-active font-bold'
              : 'tab-card-inactive font-semibold'
          }`}
        >
          <Activity className="w-4 h-4 text-[#9E4F36]" />
          <span>{isPatient ? `Treatments & Services (${treatments.length})` : `${t.tabTreatments} (${treatments.length})`}</span>
        </button>
      </div>

      {/* Tab 1: Available Beds Management / Patient Bed Status */}
      {activeTab === 'beds' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#EAE3D6] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                <BedDouble className="w-5 h-5 text-[#3E5B47]" />
                <span>{isPatient ? 'Hospital Bed Vacancy & Patient Status' : t.bedInventoryTitle}</span>
              </h3>
              <p className="text-xs text-[#736456] mt-0.5">
                {isPatient
                  ? 'Check live vacancy across hospital wards and view your personal admission status.'
                  : t.bedInventorySubtitle}
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="text-[11px] font-semibold text-[#3E5B47] bg-[#EBF1EC] px-3 py-1 rounded-full border border-[#D3E2D6]">
                {totalAvailableBeds} {t.bedsVacantRightNow}
              </span>
              {!isPatient && (
                <button
                  type="button"
                  onClick={() => {
                    setIsAllotModalOpen(true);
                    if (queue.length > 0 && !selectedQueuePatientId) {
                      handleSelectPatient(queue[0].id);
                    }
                  }}
                  className="px-3.5 py-1.5 bg-[#8C5D39] hover:bg-[#724827] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:shadow-md"
                >
                  <BedDouble className="w-3.5 h-3.5" />
                  <span>Allot Bed to Patient</span>
                </button>
              )}
            </div>
          </div>

          {/* If Patient: Show their Personal Inpatient Bed Allotment Section */}
          {isPatient && (
            <div id="patient-personal-bed-section" className="space-y-3 pb-2">
              {isPatientBedAllotted && patientQueueItem?.allottedBed ? (
                <div className="bg-[#EBF5EE] border-2 border-[#3E5B47] rounded-2xl p-5 text-[#2D2621] shadow-md space-y-3 animate-fadeIn">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#BCDBC3] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#3E5B47] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                        <BedDouble className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-[#2B7A3D] bg-[#DCF0E2] px-2.5 py-0.5 rounded-md border border-[#B5DEC0]">
                            Bed Allotment Confirmed
                          </span>
                          <span className="text-[11px] text-[#4F6854] font-semibold">
                            Inpatient Record
                          </span>
                        </div>
                        <h4 className="text-base sm:text-lg font-bold text-[#1C4525] mt-0.5">
                          Hospital Bed Allocated to You
                        </h4>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      <div className="text-left sm:text-right bg-white/90 p-2 rounded-xl border border-[#BCDBC3]">
                        <span className="text-[10px] font-bold text-[#55775C] uppercase block">Your Bed Number</span>
                        <span className="text-2xl font-black font-mono text-[#1E562A]">
                          {patientQueueItem.allottedBed.bedNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleViewAllotmentSlip(patientQueueItem)}
                        className="px-3.5 py-2.5 bg-[#3E5B47] hover:bg-[#2C4233] text-white text-xs font-bold rounded-xl shadow-xs transition-all flex items-center gap-1.5 hover:shadow-md"
                        title="Open official confirmation slip"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View Allotment Slip</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-white/80 p-3 rounded-xl border border-[#CDE5D3]">
                      <span className="text-[10px] font-bold text-[#55775C] block uppercase tracking-wider">Ward & Unit</span>
                      <strong className="text-[#1C4525] font-bold text-sm block mt-0.5">
                        {patientQueueItem.allottedBed.categoryName}
                      </strong>
                      <span className="text-[11px] text-[#55775C] block mt-0.5">
                        {patientQueueItem.allottedBed.unit}
                      </span>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-[#CDE5D3]">
                      <span className="text-[10px] font-bold text-[#55775C] block uppercase tracking-wider">Cause / Booked For</span>
                      <p className="text-[#1C4525] font-semibold text-xs mt-0.5">
                        {patientQueueItem.allottedBed.notes ||
                          patientQueueItem.summary?.chiefComplaintSummary ||
                          'Inpatient admission & clinical observation'}
                      </p>
                    </div>

                    <div className="bg-white/80 p-3 rounded-xl border border-[#CDE5D3]">
                      <span className="text-[10px] font-bold text-[#55775C] block uppercase tracking-wider">Allotted By & Time</span>
                      <strong className="text-[#1C4525] font-semibold text-xs block mt-0.5">
                        {patientQueueItem.allottedBed.allottedBy}
                      </strong>
                      <span className="text-[10px] text-[#55775C] block mt-0.5">
                        {patientQueueItem.allottedBed.allottedAt}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-1 text-[11px] text-[#3D6B48]">
                    <span className="flex items-center gap-1.5 font-medium">
                      <CheckCircle2 className="w-4 h-4 text-[#2B7A3D] flex-shrink-0" />
                      <span>Show this digital record or SMS confirmation at the inpatient nursing desk.</span>
                    </span>
                    {emergencyHelpline && (
                      <span className="font-bold text-[#1C4525] flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" />
                        <span>Helpline: {emergencyHelpline}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-2xl p-4.5 text-[#2D2621] space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#EFE9DF] border border-[#DDD3C4] flex items-center justify-center text-[#55473B] flex-shrink-0">
                      <BedDouble className="w-5 h-5 text-[#3E5B47]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider bg-[#EFEBE4] text-[#55473B] px-2.5 py-0.5 rounded-md border border-[#DDD5C7]">
                          Outpatient Care Active
                        </span>
                        <span className="text-xs text-[#8C7B6C] font-semibold">
                          Token: {loggedInPatient?.tokenNumber || 'MED-OPD'}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-[#2D2621] mt-0.5">
                        No Inpatient Bed Allotted for this OPD Visit
                      </h4>
                    </div>
                  </div>
                  <p className="text-xs text-[#6C5E52] leading-relaxed">
                    Your appointment is registered for outpatient physician consultation. Hospital beds are reserved for patients requiring inpatient admission or urgent clinical observation, which is arranged directly by the attending physician upon clinical evaluation.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {beds.map((category) => {
              const occupancyPct = Math.round((category.occupied / (category.total || 1)) * 100);
              const isLowAvailability = category.available <= 5;

              return (
                <div
                  key={category.id}
                  className="bg-[#FAF8F5] border border-[#E0D8CB] rounded-2xl p-4.5 space-y-3.5 interactive-card hover:border-[#3E5B47] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-[#2D2621]">{category.name}</h4>
                      <span className="text-[11px] text-[#7A6C5F] uppercase font-semibold tracking-wider">
                        {category.type.toUpperCase()} UNIT
                      </span>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                          isLowAvailability
                            ? 'bg-[#FAEEEA] text-[#BA3C2A] border-[#ECCDC5]'
                            : 'bg-[#EBF1EC] text-[#3E5B47] border-[#D3E2D6]'
                        }`}
                      >
                        {category.available} {t.availableBedsCard}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[11px] text-[#7A6C5F]">
                      <span>{t.occupancyLabel}: {occupancyPct}%</span>
                      <span>
                        {t.occupiedLabel}: <strong>{category.occupied}</strong> / {t.totalLabel}: {category.total}
                      </span>
                    </div>
                    <div className="w-full h-2.5 bg-[#EAE3D6] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          occupancyPct > 90
                            ? 'bg-[#C2410C]'
                            : occupancyPct > 75
                            ? 'bg-[#D97706]'
                            : 'bg-[#3E5B47]'
                        }`}
                        style={{ width: `${Math.min(100, occupancyPct)}%` }}
                      />
                    </div>
                  </div>

                  {/* Bed Controls for Staff OR Read-Only Info for Patient */}
                  {isPatient ? (
                    <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between text-xs">
                      <span className="text-[#7A6C5F] font-semibold">Ward Vacancy:</span>
                      <span
                        className={`font-bold px-2.5 py-0.5 rounded-lg border text-xs ${
                          category.available > 0
                            ? 'bg-[#EBF1EC] text-[#3E5B47] border-[#D3E2D6]'
                            : 'bg-[#FAEEEA] text-[#BA3C2A] border-[#ECCDC5]'
                        }`}
                      >
                        {category.available > 0 ? `${category.available} Beds Available Now` : 'Ward Fully Occupied'}
                      </span>
                    </div>
                  ) : (
                    <div className="pt-2 border-t border-[#EAE3D6] grid grid-cols-2 gap-3">
                      {/* Available Beds Stepper */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#4D3F34] block">
                          {t.adjustVacantBeds}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBedChange(category.id, 'available', -1)}
                            className="w-8 h-8 rounded-lg bg-[#EFEBE4] border border-[#DDD5C7] text-[#3E342B] font-bold flex items-center justify-center hover:bg-[#E5DDD0] hover:shadow-xs transition-all"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            min={0}
                            max={category.total}
                            value={category.available}
                            onChange={(e) => handleBedDirectInput(category.id, 'available', parseInt(e.target.value, 10))}
                            className="w-16 text-center font-mono font-bold text-sm bg-white border border-[#DDD5C7] rounded-lg py-1 text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                          />
                          <button
                            type="button"
                            onClick={() => handleBedChange(category.id, 'available', 1)}
                            className="w-8 h-8 rounded-lg bg-[#EFEBE4] border border-[#DDD5C7] text-[#3E342B] font-bold flex items-center justify-center hover:bg-[#E5DDD0] hover:shadow-xs transition-all"
                          >
                            +1
                          </button>
                        </div>
                      </div>

                      {/* Total Beds Stepper */}
                      <div className="space-y-1">
                        <label className="text-[11px] font-bold text-[#4D3F34] block">
                          {t.totalBedCapacity}
                        </label>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleBedChange(category.id, 'total', -1)}
                            className="w-8 h-8 rounded-lg bg-[#EFEBE4] border border-[#DDD5C7] text-[#3E342B] font-bold flex items-center justify-center hover:bg-[#E5DDD0] hover:shadow-xs transition-all"
                          >
                            -1
                          </button>
                          <input
                            type="number"
                            min={0}
                            value={category.total}
                            onChange={(e) => handleBedDirectInput(category.id, 'total', parseInt(e.target.value, 10))}
                            className="w-16 text-center font-mono font-bold text-sm bg-white border border-[#DDD5C7] rounded-lg py-1 text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                          />
                          <button
                            type="button"
                            onClick={() => handleBedChange(category.id, 'total', 1)}
                            className="w-8 h-8 rounded-lg bg-[#EFEBE4] border border-[#DDD5C7] text-[#3E342B] font-bold flex items-center justify-center hover:bg-[#E5DDD0] hover:shadow-xs transition-all"
                          >
                            +1
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Active Intake Queue & Bed Allotment Control Table - HOSPITAL STAFF ONLY */}
          {!isPatient && (
            <>
              <div className="mt-8 pt-6 border-t border-[#EAE3D6] space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div>
                <h4 className="text-sm font-bold text-[#2D2621] flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-[#8C5D39]" />
                  <span>OPD Consultation & Bed Admission Queue ({queue.length} Patients)</span>
                </h4>
                <p className="text-xs text-[#7A6C5F]">
                  Review waiting patients, accept consultation requests, or allocate in-patient ward/ICU beds directly.
                </p>
              </div>
              {onRefreshQueue && (
                <button
                  type="button"
                  onClick={onRefreshQueue}
                  className="px-2.5 py-1 text-[11px] font-semibold text-[#544336] bg-[#FAF8F5] border border-[#DDD5C7] rounded-lg hover:bg-[#EAE2D5] flex items-center gap-1 transition-all"
                >
                  <RefreshCw className="w-3 h-3 text-[#3E5B47]" />
                  <span>Refresh Queue</span>
                </button>
              )}
            </div>

            {queue.length === 0 ? (
              <div className="p-6 rounded-xl bg-[#FAF8F5] border border-dashed border-[#DDD5C7] text-center text-xs text-[#8C7B6C]">
                No patients currently in OPD Queue. New kiosk intakes will appear here in real-time.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-[#E5DFD5]">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F3EFE9] text-[#4F4135] font-bold border-b border-[#DDD5C7]">
                      <th className="py-2.5 px-3">Token</th>
                      <th className="py-2.5 px-3">Patient Details</th>
                      <th className="py-2.5 px-3">Dept & Triage</th>
                      <th className="py-2.5 px-3">Consultation Status</th>
                      <th className="py-2.5 px-3">Allotted Bed</th>
                      <th className="py-2.5 px-3 text-right">Staff Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#EBE5DB] bg-white">
                    {queue.map((item) => {
                      const isEmergency = item.triage?.severity === 'RED';
                      const isAllotted = Boolean(item.allottedBed);

                      return (
                        <tr key={item.id} className="hover:bg-[#FAF8F5] transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-[#3E5B47]">
                            {item.patient.tokenNumber}
                          </td>
                          <td className="py-3 px-3">
                            <div className="font-bold text-[#2D2621]">{item.patient.fullName}</div>
                            <div className="text-[11px] text-[#7A6C5F]">
                              {item.patient.age}y • {item.patient.gender} • {item.patient.phone || 'No phone'}
                            </div>
                          </td>
                          <td className="py-3 px-3">
                            <div className="text-[#2D2621] font-medium">{item.patient.selectedDepartment}</div>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                                isEmergency
                                  ? 'bg-[#FAEEEA] text-[#BA3C2A] border border-[#ECCDC5]'
                                  : 'bg-[#EBF1EC] text-[#3E5B47] border border-[#D3E2D6]'
                              }`}
                            >
                              {item.triage?.severity || 'ROUTINE'}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <span
                              className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                                item.status === 'IN_CONSULTATION'
                                  ? 'bg-[#E8F0EA] text-[#2F6B3D] border border-[#C5DEC8]'
                                  : item.status === 'COMPLETED'
                                  ? 'bg-[#EDF2F7] text-[#3D5A80] border border-[#D0DFEB]'
                                  : isEmergency
                                  ? 'bg-[#FCE8E6] text-[#C53030] border border-[#F5B7B1]'
                                  : 'bg-[#FFF8E7] text-[#B7791F] border border-[#FEEBC8]'
                              }`}
                            >
                              {item.status === 'IN_CONSULTATION' ? (
                                <>
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Accepted</span>
                                </>
                              ) : item.status === 'COMPLETED' ? (
                                'Completed'
                              ) : isEmergency ? (
                                'Emergency Casualty'
                              ) : (
                                'Waiting in Queue'
                              )}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            {isAllotted ? (
                              <div className="bg-[#EBF1EC] border border-[#D0E2D4] text-[#285A34] px-2.5 py-1 rounded-lg text-[11px]">
                                <strong className="block font-mono text-xs text-[#1C4525]">
                                  Bed: {item.allottedBed?.bedNumber}
                                </strong>
                                <span className="text-[10px] text-[#40684C]">
                                  {item.allottedBed?.categoryName} ({item.allottedBed?.unit})
                                </span>
                              </div>
                            ) : (
                              <span className="text-[#9E8E81] italic text-[11px]">Not allotted yet</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {item.status === 'WAITING' && (
                                <button
                                  type="button"
                                  onClick={() => handleAcceptConsultation(item.id)}
                                  className="px-2.5 py-1 bg-[#E8F3EB] hover:bg-[#D5EADB] text-[#2F6B3D] border border-[#C5DEC8] rounded-lg text-[11px] font-bold transition-all flex items-center gap-1"
                                  title="Accept consultation request"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Accept</span>
                                </button>
                              )}
                              {isAllotted && (
                                <button
                                  type="button"
                                  onClick={() => handleViewAllotmentSlip(item)}
                                  className="px-2.5 py-1 bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#4F4135] border border-[#DDD5C7] rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-2xs"
                                  title="View bed confirmation slip"
                                >
                                  <FileText className="w-3 h-3 text-[#3E5B47]" />
                                  <span>Slip</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  handleSelectPatient(item.id);
                                  setIsAllotModalOpen(true);
                                }}
                                className="px-2.5 py-1 bg-[#8C5D39] hover:bg-[#724827] text-white rounded-lg text-[11px] font-bold transition-all flex items-center gap-1 shadow-xs hover:shadow-sm"
                                title="Allot or reassign hospital bed"
                              >
                                <BedDouble className="w-3 h-3" />
                                <span>{isAllotted ? 'Change Bed' : 'Allot Bed'}</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={handleSaveAll}
                  className="px-5 py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{t.applySaveBedsBtn}</span>
                </button>
              </div>
            </>
          )}

          {/* If Patient: Show Bed Allocation Restriction Guidance Notice */}
          {isPatient && (
            <div className="mt-4 p-4.5 bg-[#FAF8F5] border border-[#E2DAD0] rounded-2xl space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#3E5B47]" />
                <h5 className="text-xs font-bold text-[#2D2621]">Inpatient Admission & Ward Management Policy</h5>
              </div>
              <p className="text-xs text-[#6C5E52] leading-relaxed">
                Bed allotment and bed change operations are strictly restricted to authorized hospital personnel and attending doctors. Patients can monitor live ward vacancy, but cannot allot beds to themselves or make alterations. For admission inquiries, please consult the attending doctor during your OPD consultation turn.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hospital & Facility Info */}
      {activeTab === 'hospital' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#EAE3D6] pb-3">
            <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#8C5D39]" />
              <span>{t.facilitySettingsTitle}</span>
            </h3>
            <p className="text-xs text-[#736456] mt-0.5">
              {t.facilitySettingsSub}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-bold text-[#3E342B] block">
                {t.facilityNameLabel}
              </label>
              <input
                type="text"
                value={hospitalName}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setHospitalName(e.target.value)}
                placeholder="e.g. Govt. Medical College & Apex AYUSH Institute"
                className={`w-full border rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
              <p className="text-[11px] text-[#8C7B6C]">
                {t.facilityNameSubText}
              </p>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E342B] block">
                {t.hfrIdLabel}
              </label>
              <input
                type="text"
                value={hfrId}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setHfrId(e.target.value)}
                placeholder="e.g. HFR-IN-DL-98217"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs font-mono text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E342B] block">
                {t.facilityTypeLabel}
              </label>
              <input
                type="text"
                value={facilityType}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setFacilityType(e.target.value)}
                placeholder="e.g. Apex Multi-Speciality Teaching Hospital"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E342B] block">{t.stateLabel}</label>
              <input
                type="text"
                value={stateName}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setStateName(e.target.value)}
                placeholder="e.g. Delhi (NCT)"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E342B] block">{t.districtLabel}</label>
              <input
                type="text"
                value={districtName}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setDistrictName(e.target.value)}
                placeholder="e.g. Central Delhi"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E342B] block">
                {t.emergencyHelplineLabel}
              </label>
              <input
                type="text"
                value={emergencyHelpline}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setEmergencyHelpline(e.target.value)}
                placeholder="e.g. 102 / 011-26598800"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[#3E342B] block">
                {t.ambulanceContactLabel}
              </label>
              <input
                type="text"
                value={ambulanceContact}
                readOnly={isPatient}
                onChange={(e) => !isPatient && setAmbulanceContact(e.target.value)}
                placeholder="e.g. 108"
                className={`w-full border rounded-xl px-3.5 py-2 text-xs text-[#2D2621] focus:outline-none ${
                  isPatient ? 'bg-[#F7F4EE] border-[#DDD5C7] cursor-default' : 'bg-[#FAF8F5] border-[#DDD5C7] focus:border-[#3E5B47]'
                }`}
              />
            </div>
          </div>

          {!isPatient && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveHospitalDetailsBtn}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: On-Duty Doctors & Consultation Rooms */}
      {activeTab === 'doctors' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-[#EAE3D6] pb-3">
            <div>
              <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
                <Stethoscope className="w-5 h-5 text-[#3E5B47]" />
                <span>{t.doctorsRosterTitle}</span>
              </h3>
              <p className="text-xs text-[#736456] mt-0.5">
                {t.doctorsRosterSub}
              </p>
            </div>

            {!isPatient && (
              <button
                type="button"
                onClick={() => setIsAddingDoc(!isAddingDoc)}
                className="px-3.5 py-2 bg-[#FAF8F5] border border-[#DDD5C7] hover:bg-[#EAE2D5] hover:shadow-md hover:font-bold hover:text-[#18130F] text-[#3E342B] text-xs font-semibold rounded-xl transition-all flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4 text-[#3E5B47]" />
                <span>{isAddingDoc ? t.cancelBtn : t.addDoctorBtn}</span>
              </button>
            )}
          </div>

          {/* Add Doctor Form - STAFF ONLY */}
          {!isPatient && isAddingDoc && (
            <form onSubmit={handleAddDoctor} className="bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl p-4 space-y-3 animate-fadeIn">
              <h4 className="text-xs font-bold text-[#2D2621] uppercase tracking-wider">
                {t.addDoctorBtn}
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3E342B]">{t.docNameLabel}</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Vikram Mehta, MD"
                    value={newDocName}
                    onChange={(e) => setNewDocName(e.target.value)}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3E342B]">{t.docDeptLabel}</label>
                  <select
                    value={newDocDept}
                    onChange={(e) => setNewDocDept(e.target.value)}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                  >
                    <option value="General Medicine / आंतरिक चिकित्सा">General Medicine / आंतरिक चिकित्सा</option>
                    <option value="Cardiology / हृदय रोग">Cardiology / हृदय रोग</option>
                    <option value="Orthopaedics & Joint Care / अस्थि रोग">Orthopaedics & Joint Care / अस्थि रोग</option>
                    <option value="Pulmonary Medicine & TB / श्वसन रोग">Pulmonary Medicine & TB / श्वसन रोग</option>
                    <option value="Kayachikitsa (Internal Medicine) / कायचिकित्सा (आयुर्वेद)">Kayachikitsa (Ayurveda)</option>
                    <option value="Panchakarma Therapy / पंचकर्म चिकित्सा">Panchakarma Therapy / पंचकर्म</option>
                    <option value="Emergency & Trauma Casualty / आपातकालीन">Emergency & Trauma</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3E342B]">{t.docSpecialityLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. Diabetology & Critical Care"
                    value={newDocSpeciality}
                    onChange={(e) => setNewDocSpeciality(e.target.value)}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-[#3E342B]">{t.docRoomLabel}</label>
                  <input
                    type="text"
                    placeholder="e.g. OPD Room 204"
                    value={newDocRoom}
                    onChange={(e) => setNewDocRoom(e.target.value)}
                    className="w-full bg-white border border-[#DDD5C7] rounded-lg px-2.5 py-1.5 text-xs text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsAddingDoc(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-[#6C5E52] hover:bg-[#EAE2D5] rounded-lg"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#3E5B47] hover:bg-[#304737] text-white text-xs font-bold rounded-lg shadow-xs"
                >
                  {t.addDoctorBtn}
                </button>
              </div>
            </form>
          )}

          {/* Doctor Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {doctors.map((doctor) => {
              const isOnDuty = doctor.status === 'On Duty' || doctor.status === 'In OPD';

              return (
                <div
                  key={doctor.id}
                  className="bg-[#FAF8F5] border border-[#E0D8CB] rounded-xl p-3.5 space-y-2.5 hover:border-[#3E5B47] transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-xs sm:text-sm font-bold text-[#2D2621]">{doctor.name}</h4>
                      <p className="text-[11px] text-[#7A6C5F]">{doctor.department}</p>
                    </div>

                    {!isPatient && (
                      <button
                        type="button"
                        onClick={() => handleDeleteDoctor(doctor.id)}
                        className="text-[#9A8B7E] hover:text-[#BA3C2A] p-1 rounded hover:bg-[#FAEEEA] transition-all"
                        title={t.removeFromRoster}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  <div className="text-[11px] text-[#55473B] space-y-0.5">
                    <div>
                      {t.docSpecialityLabel}: <strong>{doctor.speciality}</strong>
                    </div>
                    <div>
                      {t.timingsLabel} <span>{doctor.opdTimings}</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#EAE3D6] flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <label className="text-[10px] font-bold text-[#7A6C5F]">{t.assignedRoomLabel}</label>
                      {isPatient ? (
                        <span className="font-semibold text-xs text-[#2D2621] bg-white px-2 py-0.5 rounded border border-[#DDD5C7]">
                          {doctor.roomNumber}
                        </span>
                      ) : (
                        <input
                          type="text"
                          value={doctor.roomNumber}
                          onChange={(e) => handleDocRoomChange(doctor.id, e.target.value)}
                          className="w-24 bg-white border border-[#DDD5C7] rounded px-1.5 py-0.5 text-[11px] font-medium text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                        />
                      )}
                    </div>

                    {isPatient ? (
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                          isOnDuty
                            ? 'bg-[#EBF1EC] text-[#3E5B47] border-[#D3E2D6]'
                            : doctor.status === 'In Surgery'
                            ? 'bg-[#FAF4E8] text-[#9E7324] border-[#E8D4AE]'
                            : 'bg-[#EFEBE4] text-[#6E6053] border-[#DDD5C7]'
                        }`}
                      >
                        {doctor.status}
                      </span>
                    ) : (
                      <select
                        value={doctor.status}
                        onChange={(e) => handleToggleDocStatus(doctor.id, e.target.value as any)}
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg border focus:outline-none ${
                          isOnDuty
                            ? 'bg-[#EBF1EC] text-[#3E5B47] border-[#D3E2D6]'
                            : doctor.status === 'In Surgery'
                            ? 'bg-[#FAF4E8] text-[#9E7324] border-[#E8D4AE]'
                            : 'bg-[#EFEBE4] text-[#6E6053] border-[#DDD5C7]'
                        }`}
                      >
                        <option value="On Duty">{t.statusOnDuty}</option>
                        <option value="In OPD">{t.statusInOpd}</option>
                        <option value="In Surgery">In Surgery</option>
                        <option value="On Round">On Round</option>
                        <option value="Off Duty">{t.statusOffDuty}</option>
                      </select>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {!isPatient && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveDoctorRosterBtn}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Treatments & Specialized Clinical Services Available */}
      {activeTab === 'treatments' && (
        <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-6 shadow-xs space-y-6">
          <div className="border-b border-[#EAE3D6] pb-3">
            <h3 className="text-base font-bold text-[#2D2621] flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#9E4F36]" />
              <span>{t.treatmentsConfigTitle}</span>
            </h3>
            <p className="text-xs text-[#736456] mt-0.5">
              {t.treatmentsConfigSub}
            </p>
          </div>

          {/* Add Treatment Input - STAFF ONLY */}
          {!isPatient && (
            <form onSubmit={handleAddTreatment} className="flex gap-2">
              <input
                type="text"
                placeholder="e.g. Advanced Robotic Surgery / Stroke Thrombolysis Unit / Pediatric Nephrology"
                value={newTreatment}
                onChange={(e) => setNewTreatment(e.target.value)}
                className="flex-1 bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2 text-xs sm:text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white text-xs sm:text-sm font-bold rounded-xl transition-all flex items-center gap-1.5 flex-shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>{t.addTreatmentBtn}</span>
              </button>
            </form>
          )}

          {/* Quick Common Indian Hospital Services - STAFF ONLY */}
          {!isPatient && (
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-[#7A6C5F] uppercase tracking-wider block">
                {t.quickAddSpecialized}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Stroke Thrombolysis & Neuro ICU',
                  'Advanced Burn Care & Skin Grafting Unit',
                  'Palliative Care & Pain Clinic',
                  'AYUSH Ksharasutra Ano-Rectal Therapy',
                  'Extracorporeal Shock Wave Lithotripsy (ESWL)',
                  'Nuclear Medicine & PET-CT Scan',
                ].map((suggested) => (
                  <button
                    key={suggested}
                    type="button"
                    onClick={() => handleAddSuggestedTreatment(suggested)}
                    disabled={treatments.includes(suggested)}
                    className={`text-[11px] px-2.5 py-1 rounded-lg border transition-all ${
                      treatments.includes(suggested)
                        ? 'bg-[#EBF1EC] text-[#3E5B47] border-[#D3E2D6] opacity-60 cursor-default'
                        : 'bg-[#FAF8F5] border-[#DDD5C7] text-[#55473B] hover:bg-[#EAE2D5] hover:shadow-xs hover:text-[#18130F]'
                    }`}
                  >
                    + {suggested}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Active Treatments List */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-bold text-[#2D2621] block">
              {t.currentAvailableTreatments} ({treatments.length})
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {treatments.map((treatment, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-[#FAF8F5] border border-[#E0D8CB] rounded-xl flex items-center justify-between gap-2 hover:border-[#3E5B47] transition-all"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#3E5B47] flex-shrink-0" />
                    <span className="text-xs font-semibold text-[#2D2621]">{treatment}</span>
                  </div>
                  {!isPatient && (
                    <button
                      type="button"
                      onClick={() => handleDeleteTreatment(idx)}
                      className="text-[#9A8B7E] hover:text-[#BA3C2A] p-1 rounded hover:bg-[#FAEEEA] transition-all"
                      title={t.removeTreatment}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {!isPatient && (
            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSaveAll}
                className="px-5 py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{t.saveTreatmentsBtn}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Floating Status Notification Toast */}
      {allotStatusMsg && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-md p-4 rounded-xl shadow-lg border text-xs font-semibold flex items-center gap-2.5 transition-all ${
            allotStatusMsg.success
              ? 'bg-[#EBF5EE] text-[#1E562A] border-[#BCDBC3]'
              : 'bg-[#FDF2F0] text-[#9E2A1E] border-[#F2C2BB]'
          }`}
        >
          {allotStatusMsg.success ? (
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-[#2B7A3D]" />
          ) : (
            <AlertTriangle className="w-4 h-4 flex-shrink-0 text-[#C53030]" />
          )}
          <span className="flex-1">{allotStatusMsg.text}</span>
          <button
            type="button"
            onClick={() => setAllotStatusMsg(null)}
            className="text-[#6B5A4D] hover:text-[#2D2621] font-bold ml-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Allot Bed Modal (Hospital Staff Only) */}
      {!isPatient && isAllotModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsAllotModalOpen(false);
          }}
          className="fixed inset-0 z-50 bg-[#1A1613]/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-lg w-full border border-[#DED6CA] shadow-2xl overflow-hidden flex flex-col my-8">
            {/* Modal Header */}
            <div className="p-5 bg-[#FAF8F5] border-b border-[#EAE3D6] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#F0E6DA] border border-[#DECFBE] flex items-center justify-center text-[#8C5D39]">
                  <BedDouble className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#2D2621]">Allot Hospital Bed</h3>
                  <p className="text-xs text-[#7A6C5F]">Assign in-patient ward/ICU bed to an OPD patient</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAllotModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-[#EFEBE4] text-[#6B5A4D] hover:bg-[#E2DAD0] flex items-center justify-center font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 text-xs">
              {/* In-Modal Alert Message */}
              {allotStatusMsg && !allotStatusMsg.success && (
                <div className="p-3 bg-[#FAF2EF] border border-[#F0D5CD] rounded-xl text-xs text-[#BA3C2A] flex items-center gap-2 animate-fadeIn">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-[#BA3C2A]" />
                  <span className="font-semibold flex-1">{allotStatusMsg.text}</span>
                  <button
                    type="button"
                    onClick={() => setAllotStatusMsg(null)}
                    className="text-[#BA3C2A] hover:text-[#8C2313] font-bold"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* 1. Select Patient */}
              <div>
                <label className="block font-bold text-[#3E342B] mb-1.5">
                  Select Patient from Queue <span className="text-[#BA3C2A]">*</span>
                </label>
                {queue.length === 0 ? (
                  <p className="text-[#A3523A] bg-[#FAF2EF] p-2.5 rounded-lg border border-[#F0D5CD]">
                    No active patients in queue. Please create an intake at the Kiosk first.
                  </p>
                ) : (
                  <>
                    <select
                      value={selectedQueuePatientId}
                      onChange={(e) => handleSelectPatient(e.target.value)}
                      className="w-full px-3 py-2.5 bg-white border border-[#DDD5C7] rounded-xl font-medium text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                    >
                      <option value="">-- Select a Patient --</option>
                      {queue.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.patient.tokenNumber} - {item.patient.fullName} ({item.patient.age}y, {item.patient.selectedDepartment}) {item.allottedBed ? `[Bed: ${item.allottedBed.bedNumber}]` : ''}
                        </option>
                      ))}
                    </select>

                    {(() => {
                      const selPatient = queue.find((q) => q.id === selectedQueuePatientId);
                      if (!selPatient) return null;
                      return (
                        <div className="mt-2 p-2.5 bg-[#FAF8F5] rounded-xl border border-[#EAE3D6] text-[11px] text-[#55473B] space-y-1">
                          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                            <span><strong className="text-[#2D2621]">Patient:</strong> {selPatient.patient.fullName}</span>
                            <span><strong className="text-[#2D2621]">Age/Sex:</strong> {selPatient.patient.age}y / {selPatient.patient.gender}</span>
                            <span><strong className="text-[#2D2621]">Dept:</strong> {selPatient.patient.selectedDepartment}</span>
                            {selPatient.patient.phone && <span><strong className="text-[#2D2621]">Mobile:</strong> {selPatient.patient.phone}</span>}
                          </div>
                          {selPatient.history?.chiefComplaints && selPatient.history.chiefComplaints.length > 0 && (
                            <div className="text-[10px] text-[#7A6C5F]">
                              <strong>Presenting Symptoms:</strong> {selPatient.history.chiefComplaints.join(', ')}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* 2. Choose Bed Category */}
              <div>
                <label className="block font-bold text-[#3E342B] mb-1.5">
                  Choose Ward / Unit Category <span className="text-[#BA3C2A]">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {beds.map((cat) => {
                    const isSelected = targetBedCategory === cat.id;
                    const isVacant = cat.available > 0;

                    return (
                      <button
                        type="button"
                        key={cat.id}
                        disabled={!isVacant}
                        onClick={() => setTargetBedCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#EBF1EC] border-[#3E5B47] ring-1 ring-[#3E5B47]'
                            : isVacant
                            ? 'bg-[#FAF8F5] border-[#E0D8CB] hover:border-[#8C5D39]'
                            : 'bg-[#F5F2EC] border-[#E5E0D5] opacity-50 cursor-not-allowed'
                        }`}
                      >
                        <div className="flex items-center justify-between w-full">
                          <span className="font-bold text-[#2D2621]">{cat.name}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isVacant ? 'bg-[#EBF1EC] text-[#3E5B47]' : 'bg-[#FAEEEA] text-[#BA3C2A]'
                            }`}
                          >
                            {cat.available} free
                          </span>
                        </div>
                        <span className="text-[10px] text-[#7A6C5F] mt-1">
                          {cat.unit} • Total: {cat.total}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 3. Bed Number */}
              <div>
                <label className="block font-bold text-[#3E342B] mb-1.5">
                  Bed / Bay Identifier (Optional, auto-generated if left empty)
                </label>
                <input
                  type="text"
                  placeholder="e.g. ICU-04, GW-B12, TRAUMA-02"
                  value={customBedNumber}
                  onChange={(e) => setCustomBedNumber(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-xl text-[#2D2621] font-mono focus:outline-none focus:border-[#3E5B47]"
                />
              </div>

              {/* 4. Clinical or Admission Notes / Cause Booked For */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block font-bold text-[#3E342B]">
                    Cause / Clinical Reason for Bed Booking <span className="text-[#BA3C2A]">*</span>
                  </label>
                  {(() => {
                    const selPatient = queue.find((q) => q.id === selectedQueuePatientId);
                    if (selPatient?.history?.chiefComplaints && selPatient.history.chiefComplaints.length > 0) {
                      return (
                        <button
                          type="button"
                          onClick={() => setAllotmentNotes(selPatient.history.chiefComplaints.join(', '))}
                          className="text-[10px] text-[#3E5B47] hover:underline font-semibold"
                        >
                          Use Symptoms
                        </button>
                      );
                    }
                    return null;
                  })()}
                </div>
                <textarea
                  rows={2}
                  placeholder="State the reason bed is booked for (e.g. Acute asthma exacerbation with hypoxia, continuous IV hydration, observation...)"
                  value={allotmentNotes}
                  onChange={(e) => setAllotmentNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-xl text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                />
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {[
                    'Acute Observation & IV Hydration',
                    'Severe Respiratory Distress / Oxygen Therapy',
                    'High-Grade Febrile Monitoring',
                    'Emergency Trauma & Wound Care',
                    'Post-Operative Inpatient Recovery',
                    'Cardiac & Vitals Telemetry',
                  ].map((chip) => (
                    <button
                      key={chip}
                      type="button"
                      onClick={() => setAllotmentNotes(chip)}
                      className="text-[10px] bg-[#F5F1EB] hover:bg-[#EAE2D5] text-[#5A493D] px-2 py-0.5 rounded-md border border-[#DFD7CC] transition-colors"
                    >
                      + {chip}
                    </button>
                  ))}
                </div>
              </div>

              {/* 5. SMS Notification Checkbox & Phone */}
              <div className="p-3 bg-[#FAF8F5] border border-[#EAE3D6] rounded-xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-bold text-[#3E342B] block">SMS Dispatch to Patient Mobile</span>
                    <span className="text-[11px] text-[#7A6C5F]">
                      Sends real-time confirmation SMS with allotted bed details to patient
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={sendSmsOnAllot}
                    onChange={(e) => setSendSmsOnAllot(e.target.checked)}
                    className="w-4 h-4 text-[#3E5B47] rounded-sm focus:ring-[#3E5B47]"
                  />
                </div>

                {sendSmsOnAllot && (
                  <div className="pt-2 border-t border-[#EAE3D6] space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <label className="text-[11px] font-bold text-[#3E342B]">
                        Recipient Mobile Number
                      </label>
                      <span className="text-[10px] text-[#7A6C5F]">
                        {patientPhoneInput ? 'Auto-detected from queue' : 'Enter 10-digit number'}
                      </span>
                    </div>
                    <input
                      type="tel"
                      value={patientPhoneInput}
                      onChange={(e) => setPatientPhoneInput(e.target.value)}
                      placeholder="e.g. 9811234509 or +91 98112 34509"
                      className="w-full px-3 py-2 bg-white border border-[#DDD5C7] rounded-lg text-xs font-mono text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                    />
                    <p className="text-[10px] text-[#7A6C5F]">
                      Active carriers (Twilio / Fast2SMS) deliver directly to mobile handset. Sandbox sessions render the SMS immediately on screen.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#FAF8F5] border-t border-[#EAE3D6] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setIsAllotModalOpen(false)}
                className="px-4 py-2 bg-[#EFEBE4] text-[#4F4135] font-bold rounded-xl text-xs hover:bg-[#E5DDD0] transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isAllotting || !selectedQueuePatientId}
                onClick={handleConfirmAllotBed}
                className="px-5 py-2 bg-[#8C5D39] hover:bg-[#724827] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed shadow-xs hover:shadow-md"
              >
                {isAllotting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Allotting Bed...</span>
                  </>
                ) : (
                  <>
                    <BedDouble className="w-3.5 h-3.5" />
                    <span>Confirm Bed Allotment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bed Allotment Confirmation Pop-Up Modal */}
      {confirmedAllotmentData && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setConfirmedAllotmentData(null);
          }}
          className="fixed inset-0 z-50 bg-[#1A1613]/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-fade-in"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full border border-[#DED6CA] shadow-2xl overflow-hidden flex flex-col my-6 animate-scale-in">
            {/* Confirmation Modal Header */}
            <div className="p-5 bg-gradient-to-r from-[#2A4C34] to-[#3E5B47] text-white flex items-center justify-between border-b border-[#243F2B]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/25 flex items-center justify-center text-white shadow-inner">
                  <CheckCircle2 className="w-6 h-6 text-[#A5D6A7]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-wide">Bed Allotment Confirmed</h3>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#A5D6A7] text-[#1B3822]">
                      Confirmed
                    </span>
                  </div>
                  <p className="text-xs text-[#D8E6DB] mt-0.5">
                    Official Inpatient Bed Booking Slip • {facility.hospitalName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setConfirmedAllotmentData(null)}
                className="w-8 h-8 rounded-lg bg-white/15 hover:bg-white/25 text-white flex items-center justify-center font-bold transition-colors"
                title="Close confirmation"
              >
                ✕
              </button>
            </div>

            {/* Confirmation Modal Body */}
            <div className="p-6 space-y-5 text-xs text-[#3E342B] bg-[#FAF8F5]">
              {/* Top Banner Notice */}
              <div className="p-3 bg-[#EBF3ED] border border-[#C5DEC8] rounded-xl flex items-center justify-between gap-3 text-[#23532F]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-[#2E7D32]" />
                  <span className="font-semibold text-xs">
                    Hospital bed has been successfully allotted & reserved for inpatient care.
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold bg-white/80 px-2 py-0.5 rounded-md border border-[#C5DEC8]">
                  {confirmedAllotmentData.allottedAt}
                </span>
              </div>

              {/* 1. Bed Confirmation Card */}
              <div className="bg-white p-4 rounded-xl border border-[#E0D8CB] shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
                  <div className="flex items-center gap-2 text-[#3E5B47] font-bold">
                    <BedDouble className="w-4 h-4" />
                    <span className="uppercase text-[11px] tracking-wider">Allotted Bed Information</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#3E5B47] bg-[#E8F2EA] px-2.5 py-0.5 rounded-md border border-[#D0E2D4]">
                    Status: Allotted & Active
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D6] text-center sm:text-left">
                    <span className="text-[10px] text-[#7A6C5F] uppercase font-bold block">Bed Number / Identifier</span>
                    <span className="text-xl font-extrabold text-[#2F523A] font-mono tracking-tight block mt-0.5">
                      {confirmedAllotmentData.bedNumber}
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D6]">
                    <span className="text-[10px] text-[#7A6C5F] uppercase font-bold block">Ward / Category</span>
                    <span className="text-xs font-bold text-[#2D2621] block mt-0.5">
                      {confirmedAllotmentData.categoryName}
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] p-3 rounded-lg border border-[#EAE3D6]">
                    <span className="text-[10px] text-[#7A6C5F] uppercase font-bold block">Location / Unit</span>
                    <span className="text-xs font-bold text-[#2D2621] block mt-0.5">
                      {confirmedAllotmentData.unit}
                    </span>
                  </div>
                </div>

                <div className="text-[11px] text-[#7A6C5F] flex flex-wrap items-center justify-between pt-1">
                  <span><strong>Allotted By:</strong> {confirmedAllotmentData.allottedBy}</span>
                  <span><strong>Facility:</strong> {facility.hospitalName}</span>
                </div>
              </div>

              {/* 2. Patient Details Card */}
              <div className="bg-white p-4 rounded-xl border border-[#E0D8CB] shadow-2xs space-y-3">
                <div className="flex items-center justify-between border-b border-[#F0EBE1] pb-2">
                  <div className="flex items-center gap-2 text-[#8C5D39] font-bold">
                    <User className="w-4 h-4" />
                    <span className="uppercase text-[11px] tracking-wider">Patient Identification</span>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-[#8C5D39] bg-[#FAF2EB] px-2.5 py-0.5 rounded-md border border-[#EED9C7]">
                    Token: {confirmedAllotmentData.tokenNumber}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="col-span-2 bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EAE3D6]">
                    <span className="text-[10px] text-[#7A6C5F] uppercase font-bold block">Name of Patient</span>
                    <span className="text-sm font-bold text-[#2D2621] block mt-0.5">
                      {confirmedAllotmentData.patientName}
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EAE3D6]">
                    <span className="text-[10px] text-[#7A6C5F] uppercase font-bold block">Age / Gender</span>
                    <span className="text-xs font-bold text-[#2D2621] block mt-0.5">
                      {confirmedAllotmentData.age}y / {confirmedAllotmentData.gender}
                    </span>
                  </div>

                  <div className="bg-[#FAF8F5] p-2.5 rounded-lg border border-[#EAE3D6]">
                    <span className="text-[10px] text-[#7A6C5F] uppercase font-bold block">Department</span>
                    <span className="text-xs font-bold text-[#2D2621] block mt-0.5 truncate">
                      {confirmedAllotmentData.department}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-[11px] text-[#7A6C5F] pt-0.5">
                  {confirmedAllotmentData.phone && (
                    <span><strong>Contact Mobile:</strong> {confirmedAllotmentData.phone}</span>
                  )}
                  {confirmedAllotmentData.abhaId && (
                    <span><strong>ABHA ID:</strong> <span className="font-mono">{confirmedAllotmentData.abhaId}</span></span>
                  )}
                </div>
              </div>

              {/* 3. Cause It Is Booked For Card */}
              <div className="bg-[#FFFDF9] p-4 rounded-xl border-2 border-[#E3D3BE] shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between border-b border-[#EFE5D6] pb-2">
                  <div className="flex items-center gap-2 text-[#9E4F36] font-bold">
                    <FileText className="w-4 h-4" />
                    <span className="uppercase text-[11px] tracking-wider">
                      Cause / Clinical Reason Booked For
                    </span>
                  </div>
                  {confirmedAllotmentData.triageSeverity && (
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                        confirmedAllotmentData.triageSeverity === 'RED'
                          ? 'bg-[#FAEEEA] text-[#BA3C2A] border border-[#F5C7BC]'
                          : confirmedAllotmentData.triageSeverity === 'YELLOW'
                          ? 'bg-[#FEF6E6] text-[#A6720D] border border-[#F7E1B5]'
                          : 'bg-[#EBF3ED] text-[#2F6B3D] border border-[#C5DEC8]'
                      }`}
                    >
                      Triage: {confirmedAllotmentData.triageSeverity}
                    </span>
                  )}
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E8DFC9]">
                  <span className="text-[10px] text-[#8C5D39] uppercase font-bold block mb-1">
                    Booking Cause & Indication:
                  </span>
                  <p className="text-xs font-semibold text-[#2D2621] leading-relaxed">
                    {confirmedAllotmentData.cause}
                  </p>
                </div>

                {confirmedAllotmentData.chiefComplaints && confirmedAllotmentData.chiefComplaints.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-[#7A6C5F] font-semibold">Chief Symptoms:</span>
                    {confirmedAllotmentData.chiefComplaints.map((c, i) => (
                      <span
                        key={i}
                        className="text-[10px] bg-[#FAF5EE] text-[#55473B] px-2 py-0.5 rounded-md border border-[#E5DACD]"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                )}

                {confirmedAllotmentData.triageReason && (
                  <p className="text-[10px] text-[#7A6C5F] italic">
                    Clinical Note: {confirmedAllotmentData.triageReason}
                  </p>
                )}
              </div>

              {/* 4. Desktop SMS Notification Card & Mobile Dispatch */}
              {(confirmedAllotmentData.smsDeliveredNotification || bedSmsAlert || confirmedAllotmentData.smsSent) && (
                <div
                  id="sms-notification-banner"
                  className="bg-[#2D2621] text-white p-4 rounded-xl border border-[#443831] shadow-md space-y-3 animate-fadeIn"
                >
                  {/* Top line with carrier & status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#433830] pb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-7 h-7 rounded-lg ${
                          (confirmedAllotmentData.carrierDispatch?.deliveredViaRealCarrier || carrierDispatch?.deliveredViaRealCarrier)
                            ? 'bg-[#2E7D32]'
                            : 'bg-[#3E5B47]'
                        } text-white flex items-center justify-center flex-shrink-0`}
                      >
                        {(confirmedAllotmentData.carrierDispatch?.deliveredViaRealCarrier || carrierDispatch?.deliveredViaRealCarrier) ? (
                          <Signal className="w-4 h-4" />
                        ) : (
                          <MessageSquare className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <span className="text-xs font-bold text-[#A8D3B2] uppercase tracking-wider block">
                          {(confirmedAllotmentData.carrierDispatch?.deliveredViaRealCarrier || carrierDispatch?.deliveredViaRealCarrier)
                            ? `📡 Real SMS Sent to Mobile (${confirmedAllotmentData.phone || resendPhoneInput})`
                            : `📲 Bed Confirmation SMS Dispatched (${confirmedAllotmentData.phone || resendPhoneInput})`}
                        </span>
                        <div className="flex items-center gap-2 text-[10px] text-[#A89F95] mt-0.5">
                          <span className="bg-[#433830] text-[#D8CFC5] px-1.5 py-0.5 rounded font-mono">
                            Gateway:{' '}
                            {(
                              confirmedAllotmentData.carrierDispatch?.provider ||
                              carrierDispatch?.provider ||
                              confirmedAllotmentData.smsDeliveredNotification?.sender ||
                              'HOSP-ADMIT'
                            ).toUpperCase()}
                          </span>
                          <span>
                            {confirmedAllotmentData.smsDeliveredNotification?.deliveredAt ||
                              bedSmsAlert?.deliveredAt ||
                              new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        handleCopySms(
                          confirmedAllotmentData.smsDeliveredNotification?.text ||
                            bedSmsAlert?.text ||
                            `Namaste ${confirmedAllotmentData.patientName}, your hospital bed allotment is confirmed at ${facility.hospitalName}. Bed: ${confirmedAllotmentData.bedNumber} (${confirmedAllotmentData.categoryName}, ${confirmedAllotmentData.unit}). Token: ${confirmedAllotmentData.tokenNumber}. Status: Admitted. Emergency Helpline: ${facility.emergencyContact}.`
                        )
                      }
                      className="px-3 py-1.5 bg-[#3E5B47] hover:bg-[#4E7259] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all self-start sm:self-auto"
                      title="Copy SMS text"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedSms ? 'Copied!' : 'Copy SMS'}</span>
                    </button>
                  </div>

                  {/* Quoted SMS Body */}
                  <div className="p-2.5 bg-[#1E1916] rounded-lg border border-[#3D322B]">
                    <p className="text-xs text-[#F4EFE6] font-mono leading-relaxed">
                      "
                      {confirmedAllotmentData.smsDeliveredNotification?.text ||
                        bedSmsAlert?.text ||
                        `Namaste ${confirmedAllotmentData.patientName}, your hospital bed allotment is confirmed at ${facility.hospitalName}. Bed: ${confirmedAllotmentData.bedNumber} (${confirmedAllotmentData.categoryName}, ${confirmedAllotmentData.unit}). Token: ${confirmedAllotmentData.tokenNumber}. Status: Admitted. Emergency Helpline: ${facility.emergencyContact}.`}
                      "
                    </p>
                  </div>

                  {/* Carrier notice */}
                  {(confirmedAllotmentData.carrierDispatch?.deliveredViaRealCarrier || carrierDispatch?.deliveredViaRealCarrier) ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-[#A8D3B2]">
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Telecom carrier confirmed handset dispatch. Please verify your phone SMS inbox.</span>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#D8CFC5]">
                      {confirmedAllotmentData.carrierDispatch?.error || carrierDispatch?.error
                        ? (confirmedAllotmentData.carrierDispatch?.error || carrierDispatch?.error)
                        : 'Real telecom dispatch is active with Twilio / Fast2SMS. In this sandbox session, your SMS confirmation is displayed on desktop.'}
                    </div>
                  )}

                  {/* Resend / Send SMS to any mobile */}
                  <div className="pt-2 border-t border-[#433830] space-y-1.5">
                    <span className="text-[10px] uppercase font-bold text-[#A89F95] block">
                      Dispatch / Resend SMS to Mobile
                    </span>
                    <div className="flex items-center gap-2">
                      <input
                        type="tel"
                        value={resendPhoneInput}
                        onChange={(e) => setResendPhoneInput(e.target.value)}
                        placeholder="Enter 10-digit mobile number"
                        className="flex-1 px-3 py-1.5 bg-[#1E1916] border border-[#433830] rounded-lg text-xs font-mono text-white placeholder:text-[#7A6C5F] focus:outline-none focus:border-[#A8D3B2]"
                      />
                      <button
                        type="button"
                        disabled={isResendingSms || !resendPhoneInput.trim()}
                        onClick={() => handleResendBedSms()}
                        className="px-3 py-1.5 bg-[#3E5B47] hover:bg-[#4E7259] disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {isResendingSms ? (
                          <>
                            <RefreshCw className="w-3 h-3 animate-spin" />
                            <span>Sending...</span>
                          </>
                        ) : (
                          <>
                            <Send className="w-3 h-3" />
                            <span>Send SMS to Mobile</span>
                          </>
                        )}
                      </button>
                    </div>
                    {resendStatusMsg && (
                      <div
                        className={`text-[11px] font-medium p-1.5 rounded-md ${
                          resendStatusMsg.success
                            ? 'text-[#A8D3B2] bg-[#2E7D32]/20'
                            : 'text-[#F5A9A9] bg-[#BA3C2A]/20'
                        }`}
                      >
                        {resendStatusMsg.text}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Confirmation Modal Footer */}
            <div className="p-4 bg-white border-t border-[#EAE3D6] flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => window.print()}
                className="px-4 py-2 bg-[#FAF8F5] hover:bg-[#F0EBE1] text-[#4F4135] border border-[#DDD5C7] rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-2xs"
                title="Print bed allotment confirmation slip"
              >
                <Printer className="w-3.5 h-3.5 text-[#3E5B47]" />
                <span>Print Allotment Slip</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmedAllotmentData(null)}
                  className="px-5 py-2 bg-[#3E5B47] hover:bg-[#2F523A] text-white font-bold rounded-xl text-xs transition-all flex items-center gap-1.5 shadow-xs hover:shadow-md"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Done / Close</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
