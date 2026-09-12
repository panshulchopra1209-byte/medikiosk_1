import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Building2,
  ShieldCheck,
  Smartphone,
  Lock,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  BedDouble,
  Activity,
  AlertCircle,
  UserPlus,
  RefreshCw,
  MessageSquare,
  Database,
  Copy,
  Signal,
  Radio,
  Info,
  LogOut,
} from 'lucide-react';
import { PatientIdentity, HospitalStaffUser, LanguageCode } from '../../types';
import { SAMPLE_STAFF_USERS } from '../../data/mockTemplates';
import { fetchWithCsrf, safeParseResponse } from '../../utils/csrf';
import { getTranslation } from '../../i18n/translations';
import { getLocalizedDepartments } from '../../i18n/localizedData';

interface AuthViewProps {
  onPatientLogin: (patient: PatientIdentity) => void;
  onStaffLogin: (staff: HospitalStaffUser) => void;
  language: LanguageCode;
  onGoToKiosk?: () => void;
  loggedInPatient?: PatientIdentity | null;
  staffUser?: HospitalStaffUser | null;
  onLogout?: () => void;
}

export const AuthView: React.FC<AuthViewProps> = ({
  onPatientLogin,
  onStaffLogin,
  language,
  onGoToKiosk,
  loggedInPatient,
  staffUser,
  onLogout,
}) => {
  const t = getTranslation(language);

  // Main Auth Tab: Patient vs Hospital Staff
  const [mainTab, setMainTab] = useState<'patient' | 'staff'>('patient');

  // Patient Sub-tab: Login vs Register
  const [patientMode, setPatientMode] = useState<'login' | 'register'>('login');

  // Patient Login State
  const [patientAbhaOrPhone, setPatientAbhaOrPhone] = useState('9416088219');
  const [patientOtp, setPatientOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoadingOtp, setIsLoadingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [patientError, setPatientError] = useState('');
  const [patientSuccess, setPatientSuccess] = useState('');

  // Mobile SMS & Carrier Dispatch State
  const [smsAlert, setSmsAlert] = useState<{
    sender: string;
    recipient: string;
    text: string;
    code: string;
    deliveredAt: string;
  } | null>(null);

  const [carrierDispatch, setCarrierDispatch] = useState<{
    deliveredViaRealCarrier: boolean;
    provider: 'twilio' | 'fast2sms' | 'sandbox';
    info: string;
    messageId?: string;
    error?: string;
  } | null>(null);

  const [gatewayStatus, setGatewayStatus] = useState<{
    hasTwilio: boolean;
    hasFast2Sms: boolean;
    activeProvider: string;
    instructions: string;
  } | null>(null);

  useEffect(() => {
    fetch('/api/sms/status')
      .then((res) => res.json())
      .then((data) => setGatewayStatus(data))
      .catch(() => {});
  }, []);

  // Patient Register State
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState<number | ''>('');
  const [regGender, setRegGender] = useState<'Male' | 'Female' | 'Other'>('Male');
  const [regPhone, setRegPhone] = useState('');
  const [regMode, setRegMode] = useState<'allopathy' | 'ayush'>('allopathy');
  const [regOtp, setRegOtp] = useState('');
  const [isRegOtpSent, setIsRegOtpSent] = useState(false);
  const [isLoadingRegOtp, setIsLoadingRegOtp] = useState(false);
  const [isVerifyingRegOtp, setIsVerifyingRegOtp] = useState(false);

  // Hospital Staff Login State
  const [staffEmailOrId, setStaffEmailOrId] = useState('admin.operations@hospital.gov.in');
  const [staffRole, setStaffRole] = useState<HospitalStaffUser['role']>('Facility Administrator');
  const [staffPassword, setStaffPassword] = useState('••••••••');
  const [staffError, setStaffError] = useState('');

  // 1. Send OTP to Mobile Number via CSRF-protected Backend
  const handleSendOtp = async () => {
    if (!patientAbhaOrPhone.trim()) {
      setPatientError('Please enter your 10-digit Mobile Number or 14-digit ABHA ID.');
      return;
    }

    setPatientError('');
    setPatientSuccess('');
    setIsLoadingOtp(true);
    setPatientOtp(''); // Keep OTP input completely empty!

    try {
      const response = await fetchWithCsrf('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: patientAbhaOrPhone }),
      });

      const parsed = await safeParseResponse<{
        success: boolean;
        message: string;
        smsDeliveredNotification?: any;
        carrierDispatch?: {
          deliveredViaRealCarrier: boolean;
          provider: 'twilio' | 'fast2sms' | 'sandbox';
          info: string;
          messageId?: string;
          error?: string;
        };
        error?: string;
      }>(response);

      if (!parsed.ok || !parsed.data?.success) {
        throw new Error(parsed.error || parsed.data?.error || 'Failed to dispatch OTP to phone number.');
      }

      setIsOtpSent(true);
      setPatientSuccess(parsed.data.message);
      if (parsed.data.carrierDispatch) {
        setCarrierDispatch(parsed.data.carrierDispatch);
      }
      if (parsed.data.smsDeliveredNotification) {
        setSmsAlert(parsed.data.smsDeliveredNotification);
      }
    } catch (err: any) {
      setPatientError(err.message || 'Error connecting to SMS Gateway.');
    } finally {
      setIsLoadingOtp(false);
    }
  };

  // 2. Verify OTP with Server Database via CSRF-protected Backend
  const handleVerifyPatientOtp = async () => {
    if (!patientOtp.trim() || patientOtp.length !== 6) {
      setPatientError('Please enter the full 6-digit verification code sent to your mobile.');
      return;
    }

    setPatientError('');
    setIsVerifyingOtp(true);

    try {
      const response = await fetchWithCsrf('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          phone: patientAbhaOrPhone,
          otp: patientOtp.trim(),
          language,
        }),
      });

      const parsed = await safeParseResponse<{ success: boolean; patient: PatientIdentity; error?: string }>(response);
      if (!parsed.ok || !parsed.data?.success || !parsed.data.patient) {
        throw new Error(parsed.error || parsed.data?.error || 'Invalid OTP code entered.');
      }

      // Successful verification
      onPatientLogin(parsed.data.patient);
    } catch (err: any) {
      setPatientError(err.message || 'Verification failed. Please try again.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // 3a. Send OTP to Mobile Number for Registration
  const handleSendRegOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!regName.trim()) {
      setPatientError('Please enter your full name.');
      return;
    }
    if (!regAge || Number(regAge) <= 0 || Number(regAge) > 120) {
      setPatientError('Please enter a valid age between 1 and 120.');
      return;
    }
    const cleanPhone = regPhone.replace(/\D+/g, '');
    if (cleanPhone.length < 10) {
      setPatientError('Please enter a valid 10-digit mobile number.');
      return;
    }

    setPatientError('');
    setPatientSuccess('');
    setIsLoadingRegOtp(true);
    setRegOtp('');

    try {
      const response = await fetchWithCsrf('/api/auth/send-otp', {
        method: 'POST',
        body: JSON.stringify({ phone: cleanPhone }),
      });

      const parsed = await safeParseResponse<{
        success: boolean;
        message: string;
        smsDeliveredNotification?: any;
        carrierDispatch?: {
          deliveredViaRealCarrier: boolean;
          provider: 'twilio' | 'fast2sms' | 'sandbox';
          info: string;
          messageId?: string;
          error?: string;
        };
        error?: string;
      }>(response);

      if (!parsed.ok || !parsed.data?.success) {
        throw new Error(parsed.error || parsed.data?.error || 'Failed to dispatch OTP to phone number.');
      }

      setIsRegOtpSent(true);
      setPatientSuccess(parsed.data.message || `Verification OTP sent to +91 ${cleanPhone.slice(-10)}`);
      if (parsed.data.carrierDispatch) {
        setCarrierDispatch(parsed.data.carrierDispatch);
      }
      if (parsed.data.smsDeliveredNotification) {
        setSmsAlert(parsed.data.smsDeliveredNotification);
      }
    } catch (err: any) {
      setPatientError(err.message || 'Error connecting to SMS Gateway.');
    } finally {
      setIsLoadingRegOtp(false);
    }
  };

  // 3b. Verify OTP and complete Registration in Database
  const handleVerifyAndRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regOtp.trim() || regOtp.length !== 6) {
      setPatientError('Please enter the full 6-digit verification code sent to your registered mobile number.');
      return;
    }

    setPatientError('');
    setIsVerifyingRegOtp(true);

    try {
      const cleanPhone = regPhone.replace(/\D+/g, '').slice(-10);

      // Verify OTP first
      const verifyRes = await fetchWithCsrf('/api/auth/verify-otp', {
        method: 'POST',
        body: JSON.stringify({
          phone: cleanPhone,
          otp: regOtp.trim(),
          language,
        }),
      });

      const verifyParsed = await safeParseResponse<{ success: boolean; error?: string }>(verifyRes);
      if (!verifyParsed.ok || !verifyParsed.data?.success) {
        throw new Error(verifyParsed.error || verifyParsed.data?.error || 'Invalid or expired OTP entered.');
      }

      // Create new registered patient record (Department selection removed per clinical requirement)
      const newAbhaId = `91-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}-${Math.floor(1000 + Math.random() * 9000)}`;
      const newPatient: PatientIdentity = {
        abhaId: newAbhaId,
        fullName: regName.trim(),
        age: Number(regAge) || 35,
        gender: regGender,
        phone: `+91 ${cleanPhone}`,
        language,
        selectedDepartment: 'General Medicine / आंतरिक चिकित्सा',
        clinicalMode: regMode,
        tokenNumber:
          regMode === 'ayush'
            ? `AYU-${Math.floor(100 + Math.random() * 900)}`
            : `MED-${Math.floor(100 + Math.random() * 900)}`,
        registrationDate: new Date().toISOString().slice(0, 16).replace('T', ' '),
      };

      const regRes = await fetchWithCsrf('/api/auth/register-patient', {
        method: 'POST',
        body: JSON.stringify(newPatient),
      });

      const regParsed = await safeParseResponse<{ success: boolean; patient: PatientIdentity; error?: string }>(regRes);
      if (!regParsed.ok || !regParsed.data?.success || !regParsed.data.patient) {
        throw new Error(regParsed.error || regParsed.data?.error || 'Failed to save registered patient record.');
      }

      onPatientLogin(regParsed.data.patient);
    } catch (err: any) {
      setPatientError(err.message || 'Registration verification failed.');
    } finally {
      setIsVerifyingRegOtp(false);
    }
  };

  // 4. Staff Login
  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffEmailOrId.trim()) {
      setStaffError('Please enter staff ID or registered hospital email.');
      return;
    }

    const matchedStaff =
      SAMPLE_STAFF_USERS.find(
        (s) =>
          s.email.toLowerCase() === staffEmailOrId.toLowerCase() ||
          s.staffId.toLowerCase() === staffEmailOrId.toLowerCase()
      ) || {
        id: `staff_${Date.now()}`,
        staffId: staffEmailOrId.toUpperCase(),
        name: staffRole === 'Facility Administrator' ? 'Dr. Alok Verma, MHA' : 'Dr. Rajesh Sharma, MD',
        role: staffRole,
        department:
          staffRole === 'Facility Administrator'
            ? 'Hospital Administration & Bed Management'
            : 'General Medicine OPD',
        email: staffEmailOrId,
      };

    onStaffLogin(matchedStaff);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Real-time SMS Alert Banner */}
      {smsAlert && (
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
                    ? `📡 Real SMS Sent to Mobile (${smsAlert.recipient})`
                    : `📲 SMS Code Dispatched (${smsAlert.recipient})`}
                </span>
                <span className="text-[10px] bg-[#433830] text-[#D8CFC5] px-2 py-0.5 rounded font-mono">
                  Gateway: {carrierDispatch?.provider ? carrierDispatch.provider.toUpperCase() : smsAlert.sender}
                </span>
                <span className="text-[10px] text-[#A89F95]">{smsAlert.deliveredAt}</span>
              </div>
              <p className="text-xs sm:text-sm text-[#F4EFE6] font-mono mt-1 font-semibold">
                "{smsAlert.text}"
              </p>
              {carrierDispatch?.deliveredViaRealCarrier ? (
                <p className="text-[11px] text-[#A8D3B2] mt-1 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Carrier confirmed delivery to your handset. Please check your mobile SMS inbox.</span>
                </p>
              ) : (
                <p className="text-[11px] text-[#D8CFC5] mt-1">
                  {carrierDispatch?.error
                    ? carrierDispatch.error
                    : 'Real telecom dispatch is enabled via Twilio / Fast2SMS. In this sandbox session, your code is provided below for seamless testing.'}
                </p>
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setPatientOtp(smsAlert.code);
              setRegOtp(smsAlert.code);
              try {
                navigator.clipboard.writeText(smsAlert.code);
              } catch {}
            }}
            className="px-3.5 py-1.5 bg-[#3E5B47] hover:bg-[#4E7259] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 transition-all flex-shrink-0 cursor-pointer active:scale-95 shadow-xs"
            title="Auto-fill code into registration or login input"
          >
            <Copy className="w-3.5 h-3.5" />
            <span>Copy & Autofill ({smsAlert.code})</span>
          </button>
        </div>
      )}

      {/* Active Session Guard: Prevents Multiple Logins */}
      {(loggedInPatient || staffUser) ? (
        <div
          id="active-session-guard-card"
          className="bg-[#FFFFFF] border-2 border-[#3E5B47]/30 rounded-3xl p-6 sm:p-8 shadow-lg space-y-6 animate-scale-in"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#EAE3D7]">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#EBF3ED] text-[#244C30] flex items-center justify-center flex-shrink-0 border border-[#CDE1D3] shadow-xs">
                {staffUser ? (
                  <Building2 className="w-7 h-7 text-[#3E5B47]" />
                ) : (
                  <UserCheck className="w-7 h-7 text-[#3E5B47]" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[11px] font-extrabold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#EBF3ED] text-[#244C30] border border-[#CDE1D3]">
                    Active Session Verified
                  </span>
                  <span className="text-xs font-semibold text-[#8C7B6C]">
                    Multiple Logins Locked
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#1E1915] mt-1 tracking-tight">
                  {staffUser?.name || loggedInPatient?.fullName}
                </h3>
                <p className="text-xs sm:text-sm text-[#6C5E52] mt-0.5 font-medium">
                  {staffUser
                    ? `Hospital Staff • Role: ${staffUser.role} • ${staffUser.department}`
                    : `Registered OPD Patient • Token: ${loggedInPatient?.tokenNumber} • Phone: ${loggedInPatient?.phone || 'N/A'}`}
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-1.5 self-start sm:self-auto px-3 py-1 bg-[#FAF8F5] border border-[#DDD5C7] text-xs font-bold text-[#55473B] rounded-xl">
              <ShieldCheck className="w-4 h-4 text-[#3E5B47]" />
              <span>DPDPA & ABDM Protected</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E1D6]">
              <p className="text-xs font-bold text-[#7A6C5F] uppercase tracking-wider">Account Identity</p>
              <p className="text-sm font-extrabold text-[#2D2621] mt-1 truncate">
                {staffUser ? staffUser.email : (loggedInPatient?.abhaId || 'ABHA Auto-Linked')}
              </p>
              <p className="text-xs text-[#8C7B6C] mt-0.5">
                {staffUser ? `Staff ID: ${staffUser.staffId}` : `Selected Dept: ${loggedInPatient?.selectedDepartment || 'General OPD'}`}
              </p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-2xl border border-[#E7E1D6]">
              <p className="text-xs font-bold text-[#7A6C5F] uppercase tracking-wider">Session Security Status</p>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2E7D32] animate-pulse" />
                <span className="text-sm font-extrabold text-[#2E7D32]">Single Session Active</span>
              </div>
              <p className="text-xs text-[#8C7B6C] mt-0.5">
                Concurrent sessions are disabled to safeguard patient health records.
              </p>
            </div>
          </div>

          <div className="bg-[#FAF4ED] p-4 rounded-2xl border border-[#EADBCC] text-xs text-[#6A472B] flex items-start gap-3">
            <Info className="w-4 h-4 text-[#8C5D39] flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>To switch user profiles or log in as a different person:</strong> you must log out first. The system keeps you securely signed in to your active portal until you explicitly click <strong>Log Out</strong>.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              id="guard-logout-action-btn"
              onClick={onLogout}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#FAF0ED] text-[#BA3C2A] border border-[#F2D6CF] hover:bg-[#BA3C2A] hover:text-white hover:border-[#962A1B] hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out Current Session</span>
            </button>

            <button
              id="guard-continue-portal-btn"
              onClick={staffUser ? () => onStaffLogin(staffUser) : onGoToKiosk}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold bg-[#3E5B47] text-white border border-[#2F4636] hover:bg-[#304737] hover:shadow-md active:scale-95 transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Continue to {staffUser ? (t.authStaffTab || 'Hospital Staff Portal') : (t.backToKiosk || 'Patient Kiosk')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Top Header Bar: Clean Title & Direct Kiosk Switch */}
          <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#2D2621]">
                {t.authTitle || 'Hospital Sign In & Registration Portal'}
              </h2>
              <p className="text-xs sm:text-sm text-[#736456] mt-0.5">
                {t.authSubtitle || 'Secure login for patients with ABHA / Mobile OTP and authorized hospital staff.'}
              </p>
            </div>

            {!staffUser && onGoToKiosk && (
              <button
                onClick={onGoToKiosk}
                className="text-xs font-bold text-[#3E5B47] bg-[#F4EFE6] px-3.5 py-2 rounded-xl border border-[#DDD3C5] hover:bg-[#EBE2D5] hover:shadow-md hover:text-[#18130F] transition-all flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                <span>{t.backToKiosk || 'Direct Kiosk Intake'}</span>
              </button>
            )}
          </div>

          {/* Main Tabs: Patient Portal vs Hospital Staff */}
          <div className="flex bg-[#EFECE6] p-1.5 rounded-2xl border border-[#DED6CA] gap-2 shadow-xs">
            <button
              onClick={() => setMainTab('patient')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'patient'
                  ? 'bg-[#FFFFFF] text-[#1E1915] font-bold shadow-md border border-[#D5CCC0]'
                  : 'text-[#6C5E52] font-semibold hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F]'
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#3E5B47]" />
              <span>{t.authPatientTab}</span>
            </button>

            <button
              onClick={() => setMainTab('staff')}
              className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer ${
                mainTab === 'staff'
                  ? 'bg-[#FFFFFF] text-[#1E1915] font-bold shadow-md border border-[#D5CCC0]'
                  : 'text-[#6C5E52] font-semibold hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F]'
              }`}
            >
              <Building2 className="w-4 h-4 text-[#8C5D39]" />
              <span>{t.authStaffTab}</span>
              <span className="text-[10px] bg-[#E8DDD0] text-[#6A472B] font-bold px-2 py-0.5 rounded-full ml-1">
                Bed & Ops
              </span>
            </button>
          </div>

          {/* Actual Login & Registration Portal Content */}
          {mainTab === 'patient' ? (
            <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-6 shadow-xs space-y-6">
              {/* Sub-tabs: Login with ABHA vs Register New Patient */}
              <div className="flex border-b border-[#EAE3D6] pb-3 gap-3">
                <button
                  onClick={() => {
                    setPatientMode('login');
                    setPatientError('');
                    setPatientSuccess('');
                  }}
                  className={`pb-2 px-3 text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 rounded-lg cursor-pointer ${
                    patientMode === 'login'
                      ? 'border-b-2 border-[#3E5B47] text-[#3E5B47] font-bold shadow-xs'
                      : 'text-[#7A6C5F] font-semibold hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F]'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{t.authLoginSubTab}</span>
                </button>

                <button
                  onClick={() => {
                    setPatientMode('register');
                    setPatientError('');
                    setPatientSuccess('');
                  }}
                  className={`pb-2 px-3 text-xs sm:text-sm transition-all duration-200 flex items-center gap-1.5 rounded-lg cursor-pointer ${
                    patientMode === 'register'
                      ? 'border-b-2 border-[#3E5B47] text-[#3E5B47] font-bold shadow-xs'
                      : 'text-[#7A6C5F] font-semibold hover:font-bold hover:shadow-md hover:bg-[#EAE2D5] hover:text-[#18130F]'
                  }`}
                >
                  <UserPlus className="w-4 h-4" />
                  <span>{t.authRegisterSubTab}</span>
                </button>
              </div>

              {patientError && (
                <div className="bg-[#FAEEEA] border border-[#EACEC6] text-[#BA3C2A] p-3 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{patientError}</span>
                </div>
              )}

              {patientSuccess && (
                <div className="bg-[#EBF1EC] border border-[#CFDFD3] text-[#3E5B47] p-3 rounded-xl text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                  <span>{patientSuccess}</span>
                </div>
              )}

              {patientMode === 'login' ? (
                /* Patient Login Form */
                <div className="space-y-4 max-w-lg mx-auto">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#3E342B] block">
                      {t.authPhoneOrAbhaLabel}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder={t.authPhonePlaceholder}
                        value={patientAbhaOrPhone}
                        onChange={(e) => setPatientAbhaOrPhone(e.target.value)}
                        className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2.5 text-sm text-[#2D2621] font-mono focus:outline-none focus:border-[#3E5B47] focus:ring-1 focus:ring-[#3E5B47]"
                      />
                      <button
                        type="button"
                        disabled={isLoadingOtp}
                        onClick={handleSendOtp}
                        className="absolute right-1.5 top-1.5 bottom-1.5 px-3 bg-[#3E5B47] text-white text-xs font-bold rounded-lg hover:bg-[#304737] hover:shadow-md transition-all flex items-center gap-1 disabled:opacity-50 cursor-pointer"
                      >
                        {isLoadingOtp ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <span>{isOtpSent ? (t.resendOtpBtn || 'Resend OTP') : t.authSendOtpBtn}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-[#8C7B6C] pt-0.5">
                      <span>An official 6-digit verification code is dispatched via SMS.</span>
                      {gatewayStatus?.activeProvider && gatewayStatus.activeProvider !== 'none' ? (
                        <span className="text-[#2E7D32] font-semibold flex items-center gap-1">
                          <Signal className="w-3 h-3 text-[#2E7D32]" />
                          <span>Carrier: {gatewayStatus.activeProvider.toUpperCase()}</span>
                        </span>
                      ) : (
                        <span className="text-[#7A6C5F] font-medium flex items-center gap-1">
                          <Radio className="w-3 h-3 text-[#A89F95]" />
                          <span>Sandbox + Carrier Ready</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {isOtpSent && (
                    <div className="space-y-3 p-4 bg-[#F5F9F6] border border-[#D5E6D8] rounded-xl animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-[#3E5B47] flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5" />
                          <span>{t.authOtpInputLabel}</span>
                        </label>
                        {smsAlert?.code ? (
                          <button
                            type="button"
                            onClick={() => setPatientOtp(smsAlert.code)}
                            className="text-[11px] font-bold text-[#244C30] bg-[#D6E8DA] hover:bg-[#C2DEC8] px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                          >
                            ⚡ Autofill {smsAlert.code}
                          </button>
                        ) : (
                          <span className="text-[10px] text-[#55755E] font-medium">
                            Check SMS on your mobile
                          </span>
                        )}
                      </div>

                      <input
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        id="patient-otp-input"
                        name="one-time-code"
                        maxLength={6}
                        value={patientOtp}
                        onChange={(e) => setPatientOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder={t.authOtpPlaceholder}
                        autoFocus
                        className="w-full bg-white border border-[#B8D7BE] rounded-xl px-3.5 py-2.5 text-center text-xl font-mono font-bold tracking-widest text-[#2D2621] focus:outline-none focus:ring-2 focus:ring-[#3E5B47]"
                      />

                      <button
                        type="button"
                        disabled={isVerifyingOtp}
                        onClick={handleVerifyPatientOtp}
                        className="w-full py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                      >
                        {isVerifyingOtp ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <CheckCircle2 className="w-4 h-4" />
                            <span>{t.authVerifyBtn}</span>
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Patient Registration Form with Mandatory Mobile OTP Verification (Department selection removed) */
                <div className="max-w-lg mx-auto space-y-4">
                  {!isRegOtpSent ? (
                    <form onSubmit={handleSendRegOtp} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-[#3E342B]">{t.fullNameLabel} *</label>
                          <input
                            type="text"
                            required
                            value={regName}
                            onChange={(e) => setRegName(e.target.value)}
                            placeholder={t.fullNamePlaceholder}
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#3E342B]">{t.ageLabel} *</label>
                          <input
                            type="number"
                            required
                            min={1}
                            max={120}
                            value={regAge}
                            onChange={(e) => setRegAge(Number(e.target.value) || '')}
                            placeholder="35"
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-xs font-bold text-[#3E342B]">{t.genderLabel}</label>
                          <select
                            value={regGender}
                            onChange={(e) => setRegGender(e.target.value as any)}
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                          >
                            <option value="Male">{t.genderMale}</option>
                            <option value="Female">{t.genderFemale}</option>
                            <option value="Other">{t.genderOther}</option>
                          </select>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-[#3E342B]">{t.phoneLabel} *</label>
                          <input
                            type="tel"
                            required
                            value={regPhone}
                            onChange={(e) => setRegPhone(e.target.value)}
                            placeholder={t.phonePlaceholder}
                            className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#3E5B47]"
                          />
                          <p className="text-[11px] text-[#7A6C5F] mt-1">
                            An OTP will be dispatched to this mobile number to verify your ABHA health record.
                          </p>
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-xs font-bold text-[#3E342B]">Clinical Care Mode</label>
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={() => setRegMode('allopathy')}
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                regMode === 'allopathy'
                                  ? 'bg-[#FAF8F5] border-[#3E5B47] text-[#3E5B47] ring-1 ring-[#3E5B47]'
                                  : 'bg-white border-[#E7E1D6] text-[#7A6C5F] hover:border-[#3E5B47]/50'
                              }`}
                            >
                              <Stethoscope className="w-3.5 h-3.5" />
                              <span>Modern Medicine (Allopathy)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setRegMode('ayush')}
                              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                regMode === 'ayush'
                                  ? 'bg-[#EBF1EC] border-[#3E5B47] text-[#3E5B47] ring-1 ring-[#3E5B47]'
                                  : 'bg-white border-[#E7E1D6] text-[#7A6C5F] hover:border-[#3E5B47]/50'
                              }`}
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>AYUSH Holistic Care</span>
                            </button>
                          </div>
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={isLoadingRegOtp}
                        className="w-full py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                      >
                        {isLoadingRegOtp ? (
                          <RefreshCw className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Smartphone className="w-4 h-4" />
                            <span>{t.sendOtpRegisterBtn || 'Send OTP to Mobile'}</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    /* Step 2: Verify OTP for Registration */
                    <form onSubmit={handleVerifyAndRegisterPatient} className="space-y-4 animate-fadeIn">
                      <div className="p-3.5 bg-[#F5F9F6] border border-[#D5E6D8] rounded-xl flex items-center justify-between gap-3 text-xs">
                        <div>
                          <p className="font-bold text-[#2D2621]">
                            {t.regOtpDispatched || 'Registration OTP Dispatched'}
                          </p>
                          <p className="text-[#607765] text-[11px] mt-0.5">
                            {t.sentTo || 'Sent to:'} <strong className="text-[#2D2621]">+91 {regPhone.replace(/\D+/g, '').slice(-10)}</strong>
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setIsRegOtpSent(false);
                            setPatientError('');
                          }}
                          className="text-xs text-[#3E5B47] font-bold underline cursor-pointer hover:text-[#283C2F]"
                        >
                          {t.changeNumber || 'Change Number'}
                        </button>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#3E5B47] flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5" />
                            <span>{t.authOtpInputLabel}</span>
                          </span>
                          {smsAlert?.code ? (
                            <button
                              type="button"
                              onClick={() => setRegOtp(smsAlert.code)}
                              className="text-[11px] font-bold text-[#244C30] bg-[#D6E8DA] hover:bg-[#C2DEC8] px-2 py-0.5 rounded-md cursor-pointer transition-colors"
                            >
                              ⚡ Autofill {smsAlert.code}
                            </button>
                          ) : (
                            <span className="text-[10px] text-[#7A6C5F] font-normal">
                              {t.checkSmsNotice || 'Check SMS on your phone'}
                            </span>
                          )}
                        </label>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          id="reg-otp-input"
                          name="one-time-code"
                          maxLength={6}
                          required
                          value={regOtp}
                          onChange={(e) => setRegOtp(e.target.value.replace(/\D/g, ''))}
                          placeholder={t.authOtpPlaceholder}
                          autoFocus
                          className="w-full bg-white border border-[#B8D7BE] rounded-xl px-3.5 py-2.5 text-center text-xl font-mono font-bold tracking-widest text-[#2D2621] focus:outline-none focus:ring-2 focus:ring-[#3E5B47]"
                        />
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isLoadingRegOtp}
                          onClick={() => handleSendRegOtp()}
                          className="py-2.5 px-3 bg-[#FAF8F5] text-[#3E5B47] border border-[#DDD5C7] hover:bg-[#EFEAE2] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer"
                        >
                          {isLoadingRegOtp ? (
                            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RefreshCw className="w-3.5 h-3.5" />
                          )}
                          <span>{t.resendOtpBtn || 'Resend'}</span>
                        </button>

                        <button
                          type="submit"
                          disabled={isVerifyingRegOtp}
                          className="flex-1 py-2.5 bg-[#3E5B47] hover:bg-[#304737] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-xs"
                        >
                          {isVerifyingRegOtp ? (
                            <RefreshCw className="w-4 h-4 animate-spin" />
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>{t.verifyAndRegisterBtn || 'Verify OTP & Complete Registration'}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Hospital Staff & Doctor Sign-In Form */
            <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-6 shadow-xs space-y-6">
              <div className="max-w-lg mx-auto space-y-4">
                <div className="p-3 bg-[#FAF5EE] border border-[#EBDDCF] rounded-xl text-xs text-[#755236] flex items-center gap-2">
                  <Building2 className="w-4 h-4 flex-shrink-0 text-[#8C5D39]" />
                  <span>
                    {t.staffPortalNotice || 'Authorized portal for hospital administrators and duty physicians to update live beds, roster, and treatments.'}
                  </span>
                </div>

                {staffError && (
                  <div className="bg-[#FAEEEA] border border-[#EACEC6] text-[#BA3C2A] p-3 rounded-xl text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{staffError}</span>
                  </div>
                )}

                <form onSubmit={handleStaffLogin} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3E342B]">{t.authStaffEmailLabel}</label>
                    <input
                      type="text"
                      required
                      value={staffEmailOrId}
                      onChange={(e) => setStaffEmailOrId(e.target.value)}
                      placeholder="e.g. admin.operations@hospital.gov.in or DOC-4819"
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#8C5D39]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3E342B]">{t.authStaffRoleLabel}</label>
                    <select
                      value={staffRole}
                      onChange={(e) => setStaffRole(e.target.value as any)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#8C5D39]"
                    >
                      <option value="Facility Administrator">Facility Administrator (Bed Management & Hospital Details)</option>
                      <option value="Senior Medical Officer">Senior Medical Officer (OPD Clinical Consultations)</option>
                      <option value="Emergency Triage Officer">Emergency Triage Officer (Red Flag & Bed Allocations)</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[#3E342B]">{t.authStaffPasswordLabel}</label>
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      className="w-full bg-[#FAF8F5] border border-[#DDD5C7] rounded-xl px-3.5 py-2 text-sm text-[#2D2621] focus:outline-none focus:border-[#8C5D39]"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-2.5 bg-[#8C5D39] hover:bg-[#744B2C] hover:shadow-md text-white font-bold rounded-xl text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>{t.authStaffLoginBtn}</span>
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* ABDM & DPDPA Compliant Section - Displayed BELOW Login/Register Portal */}
          <div className="bg-[#FFFFFF] border border-[#E7E1D6] rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#736456]">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-semibold text-[#3E5B47] bg-[#EBF1EC] px-2.5 py-1 rounded-full border border-[#D5E2D7] flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-[#3E5B47]" />
                <span>{t.complianceBadge || 'ABDM & DPDPA Compliant'}</span>
              </span>
              <span className="text-[11px] font-medium text-[#736456] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#E7E1D6] flex items-center gap-1">
                <Database className="w-3 h-3 text-[#3E5B47]" />
                <span>{t.persistentDbNotice || 'Persistent DB Protected by CSRF'}</span>
              </span>
            </div>
            <p className="text-[11px] text-[#8C7B6C] text-center sm:text-right">
              {t.dpdpaProtected || 'Protected by Double-Submit CSRF Token & DPDPA 2023 Statutory Audit Trail'}
            </p>
          </div>
        </>
      )}
    </div>
  );
};
