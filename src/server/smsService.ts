/**
 * SMS Dispatch Service for MediKiosk
 * 
 * Supports:
 * 1. Twilio SMS (Global E.164 SMS dispatch via official twilio SDK)
 * 2. Fast2SMS (Indian DLT/OTP carrier gateway for instant mobile SMS)
 * 3. Graceful Sandbox Simulation fallback (so app testing is never blocked)
 */

export interface SmsDispatchResult {
  success: boolean;
  deliveredViaRealCarrier: boolean;
  provider: 'twilio' | 'fast2sms' | 'sandbox';
  recipientMasked: string;
  formattedPhone: string;
  messageId?: string;
  error?: string;
  info: string;
}

let twilioClientInstance: any = null;

/**
 * Lazy initialize Twilio client only when actually requested and keys are present.
 * Prevents startup crashes if credentials are not configured yet.
 */
async function getTwilioClient(accountSid: string, authToken: string) {
  if (!twilioClientInstance) {
    try {
      const twilioModule: any = await import('twilio');
      const twilioFactory = twilioModule.default || twilioModule;
      twilioClientInstance = twilioFactory(accountSid, authToken);
    } catch (err: any) {
      console.error('[SMS Service] Failed to dynamically import twilio:', err);
      throw new Error(`Failed to initialize Twilio: ${err.message}`);
    }
  }
  return twilioClientInstance;
}

/**
 * Normalize phone number to E.164 format and 10-digit clean string
 */
export function normalizePhoneNumber(rawPhone: string): {
  clean10: string;
  e164: string;
  masked: string;
} {
  const digits = rawPhone.replace(/\D+/g, '');
  const clean10 = digits.slice(-10);

  // If already prefixed with international code (e.g., 91, 1, 44), respect it if digits > 10
  let e164 = `+91${clean10}`;
  if (rawPhone.trim().startsWith('+')) {
    e164 = `+${digits}`;
  } else if (digits.length > 10 && (digits.startsWith('91') || digits.startsWith('1'))) {
    e164 = `+${digits}`;
  }

  const masked = e164.length > 6
    ? `${e164.slice(0, 3)} ******${clean10.slice(-4)}`
    : `******${clean10.slice(-4)}`;

  return { clean10, e164, masked };
}

/**
 * Check which SMS gateway is active in the environment
 */
export function getActiveSmsProvider(): {
  hasTwilio: boolean;
  hasFast2Sms: boolean;
  activeProvider: 'twilio' | 'fast2sms' | 'none';
} {
  const hasTwilio = Boolean(
    process.env.TWILIO_ACCOUNT_SID?.trim() &&
    process.env.TWILIO_AUTH_TOKEN?.trim() &&
    process.env.TWILIO_PHONE_NUMBER?.trim()
  );

  const hasFast2Sms = Boolean(process.env.FAST2SMS_API_KEY?.trim());

  let activeProvider: 'twilio' | 'fast2sms' | 'none' = 'none';
  if (hasTwilio) {
    activeProvider = 'twilio';
  } else if (hasFast2Sms) {
    activeProvider = 'fast2sms';
  }

  return { hasTwilio, hasFast2Sms, activeProvider };
}

/**
 * Dispatch SMS OTP to mobile number
 */
export async function dispatchOtpSms(
  rawPhone: string,
  otpCode: string,
  facilityName = 'MediKiosk'
): Promise<SmsDispatchResult> {
  const { clean10, e164, masked } = normalizePhoneNumber(rawPhone);
  const smsBody = `Your ${facilityName} ABDM verification OTP is ${otpCode}. Valid for 5 minutes. Please do not share this code with anyone.`;

  const { hasTwilio, hasFast2Sms } = getActiveSmsProvider();

  // 1. Try Twilio if configured
  if (hasTwilio) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER!.trim();

    try {
      console.log(`[SMS Service: Twilio] Attempting real SMS dispatch to ${e164} from ${fromNumber}...`);
      const client = await getTwilioClient(accountSid, authToken);
      const msg = await client.messages.create({
        body: smsBody,
        from: fromNumber,
        to: e164,
      });

      console.log(`[SMS Service: Twilio] Dispatched successfully! SID: ${msg.sid}, Status: ${msg.status}`);
      return {
        success: true,
        deliveredViaRealCarrier: true,
        provider: 'twilio',
        recipientMasked: masked,
        formattedPhone: e164,
        messageId: msg.sid,
        info: `Live SMS sent to ${e164} via Twilio Carrier Gateway (Message ID: ${msg.sid}). Check your mobile inbox.`,
      };
    } catch (err: any) {
      console.error('[SMS Service: Twilio Error]:', err?.message || err);
      // If Twilio failed (e.g. unverified trial number or bad credentials), continue to fallback
      return {
        success: true, // Still return success so patient can proceed with simulated OTP
        deliveredViaRealCarrier: false,
        provider: 'sandbox',
        recipientMasked: masked,
        formattedPhone: e164,
        error: `Twilio delivery attempt failed: ${err?.message || 'Carrier error'}. Provided in sandbox mode below.`,
        info: `Carrier delivery error. Using sandbox verification code so you are not blocked.`,
      };
    }
  }

  // 2. Try Fast2SMS (Indian carrier route) if configured
  if (hasFast2Sms) {
    const apiKey = process.env.FAST2SMS_API_KEY!.trim();
    try {
      console.log(`[SMS Service: Fast2SMS] Attempting real OTP SMS dispatch to ${clean10}...`);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpCode,
          numbers: clean10,
        }),
      });

      const data = await response.json();
      console.log('[SMS Service: Fast2SMS Response]:', data);

      if (data.return) {
        const reqId = Array.isArray(data.request_id) ? data.request_id[0] : (data.request_id || 'OK');
        return {
          success: true,
          deliveredViaRealCarrier: true,
          provider: 'fast2sms',
          recipientMasked: masked,
          formattedPhone: `+91 ${clean10}`,
          messageId: reqId,
          info: `Live SMS dispatched to your mobile (+91 ${clean10}) via Fast2SMS DLT Gateway.`,
        };
      } else {
        const errorMsg = data.message || 'Fast2SMS returned error';
        console.warn('[SMS Service: Fast2SMS Warning]:', errorMsg);
        return {
          success: true,
          deliveredViaRealCarrier: false,
          provider: 'sandbox',
          recipientMasked: masked,
          formattedPhone: `+91 ${clean10}`,
          error: `Fast2SMS response: ${errorMsg}`,
          info: `Fast2SMS gateway returned: ${errorMsg}. Available in sandbox mode below.`,
        };
      }
    } catch (err: any) {
      console.error('[SMS Service: Fast2SMS Network Error]:', err?.message || err);
      return {
        success: true,
        deliveredViaRealCarrier: false,
        provider: 'sandbox',
        recipientMasked: masked,
        formattedPhone: `+91 ${clean10}`,
        error: `Fast2SMS connection error: ${err?.message}`,
        info: 'Fast2SMS network timeout. Sandbox verification code available below.',
      };
    }
  }

  // 3. Neither carrier configured: Log instructions and return sandbox notification
  console.log(
    `[SMS Service: Sandbox Mode] Real SMS gateway not configured (Set TWILIO_ACCOUNT_SID/TWILIO_AUTH_TOKEN/TWILIO_PHONE_NUMBER or FAST2SMS_API_KEY in Settings). Simulated OTP ${otpCode} generated for ${masked}.`
  );

  return {
    success: true,
    deliveredViaRealCarrier: false,
    provider: 'sandbox',
    recipientMasked: masked,
    formattedPhone: e164,
    info: 'SMS gateway not configured in Settings. Test OTP is displayed on screen.',
  };
}

/**
 * Dispatch arbitrary notification SMS (e.g. OPD Token Slip & Clinic Room alert)
 */
export async function dispatchCustomSms(
  rawPhone: string,
  messageText: string
): Promise<SmsDispatchResult> {
  const { clean10, e164, masked } = normalizePhoneNumber(rawPhone);
  const { hasTwilio, hasFast2Sms } = getActiveSmsProvider();

  if (hasTwilio) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID!.trim();
    const authToken = process.env.TWILIO_AUTH_TOKEN!.trim();
    const fromNumber = process.env.TWILIO_PHONE_NUMBER!.trim();

    try {
      console.log(`[SMS Custom: Twilio] Attempting real SMS dispatch to ${e164}...`);
      const client = await getTwilioClient(accountSid, authToken);
      const msg = await client.messages.create({
        body: messageText,
        from: fromNumber,
        to: e164,
      });

      console.log(`[SMS Custom: Twilio] Dispatched successfully! SID: ${msg.sid}`);
      return {
        success: true,
        deliveredViaRealCarrier: true,
        provider: 'twilio',
        recipientMasked: masked,
        formattedPhone: e164,
        messageId: msg.sid,
        info: `Live SMS successfully dispatched to ${e164} via Twilio Carrier Gateway (SID: ${msg.sid}).`,
      };
    } catch (err: any) {
      console.warn('[SMS Custom: Twilio Error]:', err?.message || err);
      return {
        success: true,
        deliveredViaRealCarrier: false,
        provider: 'sandbox',
        recipientMasked: masked,
        formattedPhone: e164,
        error: `Twilio carrier response: ${err?.message || 'Carrier error'}. Displayed via desktop simulated SMS alert.`,
        info: 'Twilio SMS failed to dispatch to mobile. Showing desktop notification banner.',
      };
    }
  }

  if (hasFast2Sms) {
    const apiKey = process.env.FAST2SMS_API_KEY!.trim();
    try {
      console.log(`[SMS Custom: Fast2SMS] Attempting real SMS dispatch to ${clean10}...`);
      const response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          'authorization': apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'q',
          message: messageText,
          numbers: clean10,
        }),
      });
      const data = await response.json();
      console.log('[SMS Custom: Fast2SMS Response]:', data);
      const isSuccess = Boolean(data.return);
      return {
        success: true,
        deliveredViaRealCarrier: isSuccess,
        provider: isSuccess ? 'fast2sms' : 'sandbox',
        recipientMasked: masked,
        formattedPhone: `+91 ${clean10}`,
        error: isSuccess ? undefined : (data.message || 'Fast2SMS error'),
        info: isSuccess ? 'Dispatched via Fast2SMS Indian Carrier Gateway.' : (data.message || 'Fast2SMS gateway returned error. Showing desktop alert.'),
      };
    } catch (err: any) {
      console.warn('[SMS Custom: Fast2SMS Network Error]:', err?.message || err);
      return {
        success: true,
        deliveredViaRealCarrier: false,
        provider: 'sandbox',
        recipientMasked: masked,
        formattedPhone: `+91 ${clean10}`,
        error: err?.message,
        info: 'Fast2SMS network issue. Showing desktop notification banner.',
      };
    }
  }

  console.log(`[SMS Custom: Sandbox] Real carrier not configured. Generating desktop notification banner for ${masked}.`);
  return {
    success: true,
    deliveredViaRealCarrier: false,
    provider: 'sandbox',
    recipientMasked: masked,
    formattedPhone: e164,
    info: 'SMS gateway not configured in Settings. SMS notification is displayed on desktop.',
  };
}
