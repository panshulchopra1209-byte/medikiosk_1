import { HospitalFacilityInfo } from '../types';

export interface HospitalLocationOption {
  id: string;
  facility: HospitalFacilityInfo;
  city: string;
  lat: number;
  lng: number;
  distanceKm?: number;
  shortAddress: string;
  isAiimsOrGovt: boolean;
  opdHours: string;
  isDetectedLive?: boolean;
}

export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Synthesizes a validated HospitalLocationOption from raw geocoded places or OpenStreetMap Nominatim/Google Places
 */
export function createDetectedHospital(params: {
  id?: string;
  name: string;
  city: string;
  state?: string;
  lat: number;
  lng: number;
  shortAddress?: string;
  isGovt?: boolean;
  userCoords?: { lat: number; lng: number };
}): HospitalLocationOption {
  const stateStr = params.state || 'Local State';
  const stateCode = stateStr.substring(0, 2).toUpperCase();
  const safeId = params.id || `hosp_detected_${Math.abs(Math.round(params.lat * 10000))}_${Math.abs(Math.round(params.lng * 10000))}`;
  const dist = params.userCoords ? calculateDistanceKm(params.userCoords.lat, params.userCoords.lng, params.lat, params.lng) : undefined;
  const isGovt = params.isGovt ?? /govt|government|civil|district|aiims|medical college|general hospital|esi|trust/i.test(params.name);

  return {
    id: safeId,
    city: params.city,
    lat: params.lat,
    lng: params.lng,
    distanceKm: dist,
    shortAddress: params.shortAddress || `${params.city}, ${stateStr}`,
    isAiimsOrGovt: isGovt,
    opdHours: '08:30 AM - 02:00 PM (Emergency 24x7)',
    isDetectedLive: true,
    facility: {
      name: params.name,
      hfrId: `HFR-IN-${stateCode}-${Math.floor(10000 + Math.random() * 89999)}`,
      facilityType: isGovt ? 'District Apex Government Hospital' : 'Multi-Speciality Healthcare Center',
      state: stateStr,
      district: params.city,
      emergencyHelpline: '108 / 102',
      ambulanceContact: '108',
      bedInventory: [
        { id: `bed_gen_${safeId}`, name: 'General Ward Beds', total: 350, available: 45, occupied: 305, unit: 'Beds', type: 'general' },
        { id: `bed_icu_${safeId}`, name: 'ICU & Critical Care Units', total: 40, available: 6, occupied: 34, unit: 'Beds', type: 'icu' },
        { id: `bed_o2_${safeId}`, name: 'High-Flow Oxygen Beds', total: 80, available: 16, occupied: 64, unit: 'Beds', type: 'oxygen' },
        { id: `bed_trauma_${safeId}`, name: 'Emergency Trauma / Red Bay', total: 25, available: 5, occupied: 20, unit: 'Beds', type: 'trauma' },
        { id: `bed_ped_${safeId}`, name: 'Pediatric & NICU / PICU', total: 35, available: 8, occupied: 27, unit: 'Beds', type: 'pediatric' },
      ],
      doctors: [
        {
          id: `doc_${safeId}_1`,
          name: 'Dr. Duty Physician, MD',
          department: 'General Medicine / आंतरिक चिकित्सा',
          speciality: 'Internal Medicine & OPD Triage',
          roomNumber: 'OPD Room 101',
          status: 'On Duty',
          opdTimings: '08:30 AM - 01:30 PM',
          phoneOrExt: 'Ext 101',
        },
        {
          id: `doc_${safeId}_2`,
          name: 'Dr. Emergency Specialist, MS',
          department: 'Emergency & Trauma / आपातकालीन',
          speciality: 'Trauma & Resuscitation',
          roomNumber: 'Casualty Bay 01',
          status: 'On Duty',
          opdTimings: '24x7 On Duty',
          phoneOrExt: 'Ext 102',
        },
      ],
      treatmentsAvailable: [
        'Acute OPD Triage & Emergency Trauma Bay',
        '24x7 NABL Accredited Automated Pathology & Biochemistry',
        'ABDM Verified FHIR Electronic Health Record Linkage',
        'Ayurvedic & AYUSH Holistic Wellness Integration',
        'Free Jan Aushadhi Generic Pharmacy Dispensation',
      ],
    },
  };
}

export const AVAILABLE_HOSPITAL_LOCATIONS: HospitalLocationOption[] = [
  {
    "id": "hosp_central_delhi",
    "city": "Central Delhi",
    "lat": 28.6448,
    "lng": 77.2405,
    "shortAddress": "Ansari Road, Daryaganj, New Delhi 110002",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:30 PM (Mon-Sat)",
    "facility": {
      "name": "Govt. Medical College & Apex AYUSH Institute",
      "hfrId": "HFR-IN-DL-98217",
      "facilityType": "Apex Multi-Speciality Teaching & AYUSH Tertiary Hospital",
      "state": "Delhi (NCT)",
      "district": "Central Delhi",
      "emergencyHelpline": "102 / 011-26598800",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_central_delhi",
          "name": "General Ward Beds",
          "total": 420,
          "available": 68,
          "occupied": 352,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_central_delhi",
          "name": "ICU & Critical Care Units",
          "total": 64,
          "available": 8,
          "occupied": 56,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_central_delhi",
          "name": "High-Flow Oxygen Beds",
          "total": 120,
          "available": 24,
          "occupied": 96,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_central_delhi",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_central_delhi",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 12,
          "occupied": 38,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_central_delhi_1",
          "name": "Dr. Rajesh Sharma, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Internal Medicine & Diabetology",
          "roomNumber": "OPD Room 104",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        },
        {
          "id": "doc_hosp_central_delhi_2",
          "name": "Dr. Priya Venkatesh, DM",
          "department": "Cardiology / हृदय रोग",
          "speciality": "Interventional Cardiology",
          "roomNumber": "OPD Room 208",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 110"
        },
        {
          "id": "doc_hosp_central_delhi_3",
          "name": "Vaidya Ananya Vats, MD (Ayu)",
          "department": "Kayachikitsa / कायचिकित्सा (आयुर्वेद)",
          "speciality": "Panchakarma & Metabolic Disorders",
          "roomNumber": "AYUSH Wing Room 12",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:00 PM",
          "phoneOrExt": "Ext 120"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_delhi",
    "city": "South Delhi",
    "lat": 28.5672,
    "lng": 77.21,
    "shortAddress": "Sri Aurobindo Marg, Ansari Nagar East, New Delhi 110029",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS New Delhi)",
      "hfrId": "HFR-IN-DL-00101",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Delhi (NCT)",
      "district": "South Delhi",
      "emergencyHelpline": "1099 / 011-26588500",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_delhi",
          "name": "General Ward Beds",
          "total": 950,
          "available": 42,
          "occupied": 908,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_delhi",
          "name": "ICU & Critical Care Units",
          "total": 120,
          "available": 14,
          "occupied": 106,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_delhi",
          "name": "High-Flow Oxygen Beds",
          "total": 200,
          "available": 32,
          "occupied": 168,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_delhi",
          "name": "Emergency Trauma / Red Bay",
          "total": 60,
          "available": 9,
          "occupied": 51,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_delhi",
          "name": "Pediatric & NICU / PICU",
          "total": 80,
          "available": 16,
          "occupied": 64,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_delhi_1",
          "name": "Prof. Dr. Vikram Sen, MD, DM",
          "department": "Cardiology / हृदय रोग",
          "speciality": "Interventional Cardiology & Heart Failure",
          "roomNumber": "Cardio OPD Wing C-12",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        },
        {
          "id": "doc_hosp_aiims_delhi_2",
          "name": "Dr. Shalini Mukhopadhyay, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Multisystem Disorders & Rheumatology",
          "roomNumber": "Main OPD Block Room 22",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 110"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_safdarjung",
    "city": "South-West Delhi",
    "lat": 28.57,
    "lng": 77.2078,
    "shortAddress": "Ring Road, Opposite AIIMS, New Delhi 110029",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Safdarjung Hospital & Regional Trauma Centre",
      "hfrId": "HFR-IN-DL-44120",
      "facilityType": "Central Govt. Tertiary Multispeciality Hospital",
      "state": "Delhi (NCT)",
      "district": "South-West Delhi",
      "emergencyHelpline": "011-26165060",
      "ambulanceContact": "102",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_safdarjung",
          "name": "General Ward Beds",
          "total": 600,
          "available": 52,
          "occupied": 548,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_safdarjung",
          "name": "ICU & Critical Care Units",
          "total": 75,
          "available": 11,
          "occupied": 64,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_safdarjung",
          "name": "High-Flow Oxygen Beds",
          "total": 150,
          "available": 20,
          "occupied": 130,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_safdarjung",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 8,
          "occupied": 37,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_safdarjung",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 9,
          "occupied": 51,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_safdarjung_1",
          "name": "Dr. Alok Verma, MS, MCh",
          "department": "Orthopaedics / अस्थि रोग",
          "speciality": "Trauma & Joint Reconstruction",
          "roomNumber": "Super-Specialty Block 304",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_rml_delhi",
    "city": "Central Delhi",
    "lat": 28.6256,
    "lng": 77.2025,
    "shortAddress": "Baba Kharak Singh Marg, Connaught Place, New Delhi 110001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Dr. Ram Manohar Lohia (RML) Hospital & PGIMER",
      "hfrId": "HFR-IN-DL-11029",
      "facilityType": "Central Government Teaching Hospital",
      "state": "Delhi (NCT)",
      "district": "Central Delhi",
      "emergencyHelpline": "011-23365525",
      "ambulanceContact": "102",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_rml_delhi",
          "name": "General Ward Beds",
          "total": 720,
          "available": 48,
          "occupied": 672,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_rml_delhi",
          "name": "ICU & Critical Care Units",
          "total": 80,
          "available": 8,
          "occupied": 72,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_rml_delhi",
          "name": "High-Flow Oxygen Beds",
          "total": 160,
          "available": 22,
          "occupied": 138,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_rml_delhi",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 6,
          "occupied": 34,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_rml_delhi",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_rml_delhi_1",
          "name": "Dr. Nidhi Singhal, MD",
          "department": "Pulmonology & Chest / श्वसन रोग",
          "speciality": "Asthma, COPD & Respiratory Care",
          "roomNumber": "Chest Clinic Room 112",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiia_ayush",
    "city": "South East Delhi",
    "lat": 28.5283,
    "lng": 77.2917,
    "shortAddress": "Sarita Vihar, Institutional Area, Mathura Road, New Delhi 110076",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Ayurveda (AIIA) & Apex AYUSH Center",
      "hfrId": "HFR-IN-DL-99341",
      "facilityType": "National Apex AYUSH & Integrative Medical Institute",
      "state": "Delhi (NCT)",
      "district": "South East Delhi",
      "emergencyHelpline": "011-29551122",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiia_ayush",
          "name": "General Ward Beds",
          "total": 180,
          "available": 32,
          "occupied": 148,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiia_ayush",
          "name": "ICU & Critical Care Units",
          "total": 20,
          "available": 5,
          "occupied": 15,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiia_ayush",
          "name": "High-Flow Oxygen Beds",
          "total": 40,
          "available": 12,
          "occupied": 28,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiia_ayush",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 9,
          "occupied": 21,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiia_ayush",
          "name": "Pediatric & NICU / PICU",
          "total": 25,
          "available": 7,
          "occupied": 18,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiia_ayush_1",
          "name": "Vaidya Harish Chandra, MD, PhD (Ayu)",
          "department": "Kayachikitsa / कायचिकित्सा (आयुर्वेद)",
          "speciality": "Agni Chikitsa, Rasayana & Chronic Care",
          "roomNumber": "AIIA Kayachikitsa 101",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        },
        {
          "id": "doc_hosp_aiia_ayush_2",
          "name": "Vaidya Meera Nambiar, MD (Ayu)",
          "department": "Panchakarma / पंचकर्म विभाग",
          "speciality": "Classical Shodhana & Detoxification",
          "roomNumber": "Panchakarma Wing Room 05",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:00 PM",
          "phoneOrExt": "Ext 110"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_lhmc_delhi",
    "city": "Central Delhi",
    "lat": 28.6339,
    "lng": 77.2137,
    "shortAddress": "Connaught Place, Shaheed Bhagat Singh Marg, New Delhi 110001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Lady Hardinge Medical College & Associated Hospitals",
      "hfrId": "HFR-IN-DL-22019",
      "facilityType": "Central Govt. Medical College & Mother-Child Apex Hospital",
      "state": "Delhi (NCT)",
      "district": "Central Delhi",
      "emergencyHelpline": "011-23363728",
      "ambulanceContact": "102",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_lhmc_delhi",
          "name": "General Ward Beds",
          "total": 550,
          "available": 44,
          "occupied": 506,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_lhmc_delhi",
          "name": "ICU & Critical Care Units",
          "total": 60,
          "available": 9,
          "occupied": 51,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_lhmc_delhi",
          "name": "High-Flow Oxygen Beds",
          "total": 110,
          "available": 21,
          "occupied": 89,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_lhmc_delhi",
          "name": "Emergency Trauma / Red Bay",
          "total": 25,
          "available": 4,
          "occupied": 21,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_lhmc_delhi",
          "name": "Pediatric & NICU / PICU",
          "total": 90,
          "available": 18,
          "occupied": 72,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_lhmc_delhi_1",
          "name": "Dr. Sunita Aggarwal, MD, DGO",
          "department": "Obstetrics & Gynaecology / प्रसूति एवं स्त्री रोग",
          "speciality": "High-Risk Pregnancy & Maternal Care",
          "roomNumber": "LHMC Room 14",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_gtb_delhi",
    "city": "East Delhi",
    "lat": 28.6836,
    "lng": 77.3094,
    "shortAddress": "Taharpur Road, Dilshad Garden, Shahdara, Delhi 110095",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Guru Teg Bahadur (GTB) Hospital & UCMS",
      "hfrId": "HFR-IN-DL-55201",
      "facilityType": "Govt. Tertiary Care Teaching Hospital",
      "state": "Delhi (NCT)",
      "district": "East Delhi",
      "emergencyHelpline": "011-22586262",
      "ambulanceContact": "102",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_gtb_delhi",
          "name": "General Ward Beds",
          "total": 650,
          "available": 58,
          "occupied": 592,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_gtb_delhi",
          "name": "ICU & Critical Care Units",
          "total": 70,
          "available": 8,
          "occupied": 62,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_gtb_delhi",
          "name": "High-Flow Oxygen Beds",
          "total": 130,
          "available": 24,
          "occupied": 106,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_gtb_delhi",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 6,
          "occupied": 29,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_gtb_delhi",
          "name": "Pediatric & NICU / PICU",
          "total": 55,
          "available": 11,
          "occupied": 44,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_gtb_delhi_1",
          "name": "Dr. Manoj Saxena, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Infectious & Lifestyle Diseases",
          "roomNumber": "GTB OPD Block 102",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_medanta_gurugram",
    "city": "Gurugram",
    "lat": 28.4395,
    "lng": 77.0421,
    "shortAddress": "CH Bakhtawar Singh Road, Sector 38, Gurugram, Haryana 122001",
    "isAiimsOrGovt": false,
    "opdHours": "08:00 AM - 06:00 PM (Emergency 24x7)",
    "facility": {
      "name": "Medanta - The Medicity Super Specialty Hospital",
      "hfrId": "HFR-IN-HR-88210",
      "facilityType": "Multi-Super Specialty Tertiary Hospital & AYUSH Wing",
      "state": "Haryana",
      "district": "Gurugram",
      "emergencyHelpline": "0124-4141414",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_medanta_gurugram",
          "name": "General Ward Beds",
          "total": 700,
          "available": 82,
          "occupied": 618,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_medanta_gurugram",
          "name": "ICU & Critical Care Units",
          "total": 150,
          "available": 22,
          "occupied": 128,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_medanta_gurugram",
          "name": "High-Flow Oxygen Beds",
          "total": 180,
          "available": 36,
          "occupied": 144,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_medanta_gurugram",
          "name": "Emergency Trauma / Red Bay",
          "total": 50,
          "available": 12,
          "occupied": 38,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_medanta_gurugram",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 14,
          "occupied": 46,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_medanta_gurugram_1",
          "name": "Dr. Naresh Trehan, MCh",
          "department": "Cardiovascular & Thoracic Surgery",
          "speciality": "Advanced Cardiac Surgeries",
          "roomNumber": "Heart Institute Wing 1",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_district_noida",
    "city": "Noida",
    "lat": 28.5684,
    "lng": 77.3592,
    "shortAddress": "Sector 39, Near City Centre Metro, Noida, Gautam Buddha Nagar, UP 201301",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "District Combined Hospital & Govt Medical Center, Sector 39",
      "hfrId": "HFR-IN-UP-33921",
      "facilityType": "District Apex Govt. Hospital & Emergency Center",
      "state": "Uttar Pradesh",
      "district": "Noida",
      "emergencyHelpline": "0120-2500039",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_district_noida",
          "name": "General Ward Beds",
          "total": 380,
          "available": 48,
          "occupied": 332,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_district_noida",
          "name": "ICU & Critical Care Units",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_district_noida",
          "name": "High-Flow Oxygen Beds",
          "total": 90,
          "available": 18,
          "occupied": 72,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_district_noida",
          "name": "Emergency Trauma / Red Bay",
          "total": 25,
          "available": 5,
          "occupied": 20,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_district_noida",
          "name": "Pediatric & NICU / PICU",
          "total": 40,
          "available": 9,
          "occupied": 31,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_district_noida_1",
          "name": "Dr. Renu Chaudhary, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Adult Medicine & Fevers",
          "roomNumber": "Room 105",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_sms_jaipur",
    "city": "Jaipur",
    "lat": 26.8978,
    "lng": 75.8188,
    "shortAddress": "Jawahar Lal Nehru Marg, Ashok Nagar, Jaipur, Rajasthan 302004",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "Sawai Man Singh (SMS) Medical College & Hospital",
      "hfrId": "HFR-IN-RJ-10101",
      "facilityType": "State Apex Government Medical College & Hospital",
      "state": "Rajasthan",
      "district": "Jaipur",
      "emergencyHelpline": "0141-2518224 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_sms_jaipur",
          "name": "General Ward Beds",
          "total": 900,
          "available": 64,
          "occupied": 836,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_sms_jaipur",
          "name": "ICU & Critical Care Units",
          "total": 110,
          "available": 15,
          "occupied": 95,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_sms_jaipur",
          "name": "High-Flow Oxygen Beds",
          "total": 180,
          "available": 29,
          "occupied": 151,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_sms_jaipur",
          "name": "Emergency Trauma / Red Bay",
          "total": 55,
          "available": 9,
          "occupied": 46,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_sms_jaipur",
          "name": "Pediatric & NICU / PICU",
          "total": 70,
          "available": 14,
          "occupied": 56,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_sms_jaipur_1",
          "name": "Dr. Rajeev Bagarhatta, MD, DM",
          "department": "Cardiology / हृदय रोग",
          "speciality": "Cardiovascular Medicine",
          "roomNumber": "Cardio OPD 11",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        },
        {
          "id": "doc_hosp_sms_jaipur_2",
          "name": "Dr. Sudhir Sharma, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Clinical Medicine & Diabetes",
          "roomNumber": "Dhanvantari OPD 103",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 110"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_kanwatia_jaipur",
    "city": "Jaipur",
    "lat": 26.945,
    "lng": 75.798,
    "shortAddress": "Vidyadhar Nagar Road, Shastri Nagar, Jaipur, Rajasthan 302016",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Haribaksha Kanwatia Govt. Satellite Hospital",
      "hfrId": "HFR-IN-RJ-10245",
      "facilityType": "State Government Multi-Specialty Hospital",
      "state": "Rajasthan",
      "district": "Jaipur",
      "emergencyHelpline": "0141-2232050",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_kanwatia_jaipur",
          "name": "General Ward Beds",
          "total": 300,
          "available": 42,
          "occupied": 258,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_kanwatia_jaipur",
          "name": "ICU & Critical Care Units",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_kanwatia_jaipur",
          "name": "High-Flow Oxygen Beds",
          "total": 60,
          "available": 14,
          "occupied": 46,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_kanwatia_jaipur",
          "name": "Emergency Trauma / Red Bay",
          "total": 20,
          "available": 5,
          "occupied": 15,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_kanwatia_jaipur",
          "name": "Pediatric & NICU / PICU",
          "total": 35,
          "available": 8,
          "occupied": 27,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_kanwatia_jaipur_1",
          "name": "Dr. Mahesh Chand Gupta, MS",
          "department": "Orthopaedics / अस्थि रोग",
          "speciality": "Joint Pain & Trauma",
          "roomNumber": "OPD Room 12",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_jodhpur",
    "city": "Jodhpur",
    "lat": 26.2427,
    "lng": 73.0076,
    "shortAddress": "Basni Industrial Area Phase-2, Jodhpur, Rajasthan 342005",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Jodhpur)",
      "hfrId": "HFR-IN-RJ-00202",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Rajasthan",
      "district": "Jodhpur",
      "emergencyHelpline": "0291-2740741",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_jodhpur",
          "name": "General Ward Beds",
          "total": 750,
          "available": 56,
          "occupied": 694,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_jodhpur",
          "name": "ICU & Critical Care Units",
          "total": 95,
          "available": 12,
          "occupied": 83,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_jodhpur",
          "name": "High-Flow Oxygen Beds",
          "total": 150,
          "available": 25,
          "occupied": 125,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_jodhpur",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_jodhpur",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 12,
          "occupied": 48,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_jodhpur_1",
          "name": "Dr. Sanjeev Misra, MS, MCh",
          "department": "Surgical Oncology / कैंसर शल्य चिकित्सा",
          "speciality": "Oncologic Surgery",
          "roomNumber": "AIIMS Wing B-04",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_kgmu_lucknow",
    "city": "Lucknow",
    "lat": 26.8687,
    "lng": 80.9163,
    "shortAddress": "Shah Mina Road, Chowk, Lucknow, Uttar Pradesh 226003",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "King George's Medical University (KGMU) & Gandhi Memorial Hospital",
      "hfrId": "HFR-IN-UP-10012",
      "facilityType": "State Apex Medical University & Tertiary Referral Hospital",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "emergencyHelpline": "0522-2258880 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_kgmu_lucknow",
          "name": "General Ward Beds",
          "total": 920,
          "available": 58,
          "occupied": 862,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_kgmu_lucknow",
          "name": "ICU & Critical Care Units",
          "total": 115,
          "available": 14,
          "occupied": 101,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_kgmu_lucknow",
          "name": "High-Flow Oxygen Beds",
          "total": 170,
          "available": 26,
          "occupied": 144,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_kgmu_lucknow",
          "name": "Emergency Trauma / Red Bay",
          "total": 50,
          "available": 8,
          "occupied": 42,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_kgmu_lucknow",
          "name": "Pediatric & NICU / PICU",
          "total": 75,
          "available": 15,
          "occupied": 60,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_kgmu_lucknow_1",
          "name": "Prof. Dr. S. K. Dwivedi, MD, DM",
          "department": "Cardiology / हृदय रोग",
          "speciality": "Coronary Interventions",
          "roomNumber": "KGMU Cardio OPD 08",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        },
        {
          "id": "doc_hosp_kgmu_lucknow_2",
          "name": "Dr. Kauser Usman, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Tropical & Internal Medicine",
          "roomNumber": "Shatabdi OPD 101",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 110"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_sgpgi_lucknow",
    "city": "Lucknow",
    "lat": 26.746,
    "lng": 80.9416,
    "shortAddress": "Raebareli Road, Telibagh, Lucknow, Uttar Pradesh 226014",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Sanjay Gandhi Postgraduate Institute of Medical Sciences (SGPGIMS)",
      "hfrId": "HFR-IN-UP-10045",
      "facilityType": "Autonomous Apex Super-Specialty Medical Institute",
      "state": "Uttar Pradesh",
      "district": "Lucknow",
      "emergencyHelpline": "0522-2668004",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_sgpgi_lucknow",
          "name": "General Ward Beds",
          "total": 800,
          "available": 62,
          "occupied": 738,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_sgpgi_lucknow",
          "name": "ICU & Critical Care Units",
          "total": 110,
          "available": 16,
          "occupied": 94,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_sgpgi_lucknow",
          "name": "High-Flow Oxygen Beds",
          "total": 160,
          "available": 28,
          "occupied": 132,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_sgpgi_lucknow",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 6,
          "occupied": 34,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_sgpgi_lucknow",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 11,
          "occupied": 49,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_sgpgi_lucknow_1",
          "name": "Prof. Dr. R. K. Dhiman, MD, DM",
          "department": "Hepatology & Gastroenterology",
          "speciality": "Liver & Digestive Diseases",
          "roomNumber": "Apex Gastroenterology 01",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_bhu_varanasi",
    "city": "Varanasi",
    "lat": 25.2754,
    "lng": 82.9996,
    "shortAddress": "Banaras Hindu University Campus, Varanasi, Uttar Pradesh 221005",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Sir Sunderlal Hospital & IMS Banaras Hindu University (BHU)",
      "hfrId": "HFR-IN-UP-22014",
      "facilityType": "Central University Apex Teaching & AYUSH Hospital",
      "state": "Uttar Pradesh",
      "district": "Varanasi",
      "emergencyHelpline": "0542-2368551",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_bhu_varanasi",
          "name": "General Ward Beds",
          "total": 850,
          "available": 70,
          "occupied": 780,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_bhu_varanasi",
          "name": "ICU & Critical Care Units",
          "total": 90,
          "available": 12,
          "occupied": 78,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_bhu_varanasi",
          "name": "High-Flow Oxygen Beds",
          "total": 150,
          "available": 24,
          "occupied": 126,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_bhu_varanasi",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 7,
          "occupied": 38,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_bhu_varanasi",
          "name": "Pediatric & NICU / PICU",
          "total": 65,
          "available": 12,
          "occupied": 53,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_bhu_varanasi_1",
          "name": "Dr. B. R. Sharma, MD (Ayu), PhD",
          "department": "Kayachikitsa / कायचिकित्सा (आयुर्वेद)",
          "speciality": "Ayurvedic Rasayana & Panchakarma",
          "roomNumber": "BHU Ayurveda Wing 10",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_gorakhpur",
    "city": "Gorakhpur",
    "lat": 26.757,
    "lng": 83.4427,
    "shortAddress": "Kushinagar Road, Gorakhpur, Uttar Pradesh 273008",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Gorakhpur)",
      "hfrId": "HFR-IN-UP-00512",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Uttar Pradesh",
      "district": "Gorakhpur",
      "emergencyHelpline": "0551-2207700",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_gorakhpur",
          "name": "General Ward Beds",
          "total": 550,
          "available": 52,
          "occupied": 498,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_gorakhpur",
          "name": "ICU & Critical Care Units",
          "total": 65,
          "available": 9,
          "occupied": 56,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_gorakhpur",
          "name": "High-Flow Oxygen Beds",
          "total": 110,
          "available": 20,
          "occupied": 90,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_gorakhpur",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_gorakhpur",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_gorakhpur_1",
          "name": "Dr. Surendra Mohan, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Internal Medicine & Encephalitis Care",
          "roomNumber": "OPD Wing 204",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_pgimer_chandigarh",
    "city": "Chandigarh",
    "lat": 30.7645,
    "lng": 76.7766,
    "shortAddress": "Sector 12, Chandigarh 160012",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "Postgraduate Institute of Medical Education & Research (PGIMER)",
      "hfrId": "HFR-IN-CH-00010",
      "facilityType": "National Autonomous Apex Tertiary Care Institute",
      "state": "Chandigarh (UT)",
      "district": "Chandigarh",
      "emergencyHelpline": "0172-2746018 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_pgimer_chandigarh",
          "name": "General Ward Beds",
          "total": 980,
          "available": 55,
          "occupied": 925,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_pgimer_chandigarh",
          "name": "ICU & Critical Care Units",
          "total": 140,
          "available": 18,
          "occupied": 122,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_pgimer_chandigarh",
          "name": "High-Flow Oxygen Beds",
          "total": 220,
          "available": 35,
          "occupied": 185,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_pgimer_chandigarh",
          "name": "Emergency Trauma / Red Bay",
          "total": 65,
          "available": 11,
          "occupied": 54,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_pgimer_chandigarh",
          "name": "Pediatric & NICU / PICU",
          "total": 85,
          "available": 17,
          "occupied": 68,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_pgimer_chandigarh_1",
          "name": "Prof. Dr. Vivek Lal, MD, DM",
          "department": "Neurology & General Medicine",
          "speciality": "Stroke & Neurological Emergencies",
          "roomNumber": "Nehru Hospital Wing C",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_gmc_amritsar",
    "city": "Amritsar",
    "lat": 31.6543,
    "lng": 74.8872,
    "shortAddress": "Circular Road, Majitha Road, Amritsar, Punjab 143001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Government Medical College & Guru Nanak Dev Hospital",
      "hfrId": "HFR-IN-PB-11002",
      "facilityType": "State Apex Government Teaching Hospital",
      "state": "Punjab",
      "district": "Amritsar",
      "emergencyHelpline": "0183-2573211",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_gmc_amritsar",
          "name": "General Ward Beds",
          "total": 650,
          "available": 62,
          "occupied": 588,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_gmc_amritsar",
          "name": "ICU & Critical Care Units",
          "total": 70,
          "available": 9,
          "occupied": 61,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_gmc_amritsar",
          "name": "High-Flow Oxygen Beds",
          "total": 120,
          "available": 22,
          "occupied": 98,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_gmc_amritsar",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 6,
          "occupied": 29,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_gmc_amritsar",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_gmc_amritsar_1",
          "name": "Dr. Gurpreet Singh, MD",
          "department": "Pulmonology / छाती एवं फेफड़ा रोग",
          "speciality": "Chest Medicine & Tuberculosis",
          "roomNumber": "GNDH OPD 108",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_dmc_ludhiana",
    "city": "Ludhiana",
    "lat": 30.9038,
    "lng": 75.8306,
    "shortAddress": "Civil Lines, Tagore Nagar, Ludhiana, Punjab 141001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:30 PM",
    "facility": {
      "name": "Dayanand Medical College and Hospital (DMCH)",
      "hfrId": "HFR-IN-PB-22019",
      "facilityType": "Premier Medical College & Tertiary Referral Hospital",
      "state": "Punjab",
      "district": "Ludhiana",
      "emergencyHelpline": "0161-4687700",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_dmc_ludhiana",
          "name": "General Ward Beds",
          "total": 600,
          "available": 54,
          "occupied": 546,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_dmc_ludhiana",
          "name": "ICU & Critical Care Units",
          "total": 80,
          "available": 11,
          "occupied": 69,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_dmc_ludhiana",
          "name": "High-Flow Oxygen Beds",
          "total": 130,
          "available": 24,
          "occupied": 106,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_dmc_ludhiana",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 7,
          "occupied": 28,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_dmc_ludhiana",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 9,
          "occupied": 41,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_dmc_ludhiana_1",
          "name": "Dr. Bishav Mohan, MD, DM",
          "department": "Cardiology / हृदय रोग",
          "speciality": "Heart Care & Critical Resuscitation",
          "roomNumber": "Hero DMC Heart Wing",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_kem_mumbai",
    "city": "Mumbai",
    "lat": 19.0028,
    "lng": 72.8427,
    "shortAddress": "Acharya Donde Marg, Parel, Mumbai, Maharashtra 400012",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 01:30 PM",
    "facility": {
      "name": "King Edward Memorial (KEM) Hospital & Seth GS Medical",
      "hfrId": "HFR-IN-MH-88190",
      "facilityType": "Municipal Corporation Apex Tertiary Hospital",
      "state": "Maharashtra",
      "district": "Mumbai",
      "emergencyHelpline": "022-24107000",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_kem_mumbai",
          "name": "General Ward Beds",
          "total": 850,
          "available": 54,
          "occupied": 796,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_kem_mumbai",
          "name": "ICU & Critical Care Units",
          "total": 95,
          "available": 11,
          "occupied": 84,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_kem_mumbai",
          "name": "High-Flow Oxygen Beds",
          "total": 170,
          "available": 26,
          "occupied": 144,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_kem_mumbai",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_kem_mumbai",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 14,
          "occupied": 46,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_kem_mumbai_1",
          "name": "Dr. Sandeep Kulkarni, MD, DM",
          "department": "Cardiology / हृदय रोग",
          "speciality": "Preventive & Interventional Cardiology",
          "roomNumber": "KEM Cardiology OPD 18",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_jj_mumbai",
    "city": "Mumbai",
    "lat": 18.962,
    "lng": 72.8351,
    "shortAddress": "J.J. Marg, Nagpada, Byculla, Mumbai, Maharashtra 400008",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Sir JJ Group of Hospitals & Grant Govt Medical College",
      "hfrId": "HFR-IN-MH-11002",
      "facilityType": "State Apex Government Teaching Hospital",
      "state": "Maharashtra",
      "district": "Mumbai",
      "emergencyHelpline": "022-23735555",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_jj_mumbai",
          "name": "General Ward Beds",
          "total": 800,
          "available": 68,
          "occupied": 732,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_jj_mumbai",
          "name": "ICU & Critical Care Units",
          "total": 90,
          "available": 12,
          "occupied": 78,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_jj_mumbai",
          "name": "High-Flow Oxygen Beds",
          "total": 160,
          "available": 28,
          "occupied": 132,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_jj_mumbai",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 8,
          "occupied": 32,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_jj_mumbai",
          "name": "Pediatric & NICU / PICU",
          "total": 55,
          "available": 11,
          "occupied": 44,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_jj_mumbai_1",
          "name": "Dr. Pallavi Saple, MD",
          "department": "Pediatrics / बाल रोग",
          "speciality": "Pediatric Infectious Diseases",
          "roomNumber": "JJ Main OPD 09",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_sassoon_pune",
    "city": "Pune",
    "lat": 18.5284,
    "lng": 73.8741,
    "shortAddress": "Near Pune Railway Station, Sassoon Road, Pune, Maharashtra 411001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Sassoon General Hospital & B.J. Govt Medical College",
      "hfrId": "HFR-IN-MH-22019",
      "facilityType": "State Apex Government Hospital & Trauma Center",
      "state": "Maharashtra",
      "district": "Pune",
      "emergencyHelpline": "020-26128000",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_sassoon_pune",
          "name": "General Ward Beds",
          "total": 750,
          "available": 72,
          "occupied": 678,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_sassoon_pune",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 11,
          "occupied": 74,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_sassoon_pune",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 24,
          "occupied": 116,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_sassoon_pune",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_sassoon_pune",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 12,
          "occupied": 38,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_sassoon_pune_1",
          "name": "Dr. Vinayak Kale, MS",
          "department": "General Surgery / सामान्य शल्य चिकित्सा",
          "speciality": "Trauma & Laparoscopy",
          "roomNumber": "Sassoon Surgical Block 12",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_nagpur",
    "city": "Nagpur",
    "lat": 21.0637,
    "lng": 79.0381,
    "shortAddress": "Plot No. 2, Sector 20, MIHAN, Nagpur, Maharashtra 441108",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Nagpur)",
      "hfrId": "HFR-IN-MH-00301",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Maharashtra",
      "district": "Nagpur",
      "emergencyHelpline": "0712-2352001",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_nagpur",
          "name": "General Ward Beds",
          "total": 600,
          "available": 58,
          "occupied": 542,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_nagpur",
          "name": "ICU & Critical Care Units",
          "total": 70,
          "available": 9,
          "occupied": 61,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_nagpur",
          "name": "High-Flow Oxygen Beds",
          "total": 120,
          "available": 21,
          "occupied": 99,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_nagpur",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_nagpur",
          "name": "Pediatric & NICU / PICU",
          "total": 45,
          "available": 9,
          "occupied": 36,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_nagpur_1",
          "name": "Dr. Mrunal Phatak, MD, PhD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Endocrine & Metabolic Health",
          "roomNumber": "AIIMS Block C-101",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_victoria_blr",
    "city": "Bengaluru",
    "lat": 12.9634,
    "lng": 77.5756,
    "shortAddress": "Fort, Kalasipalya, Bengaluru, Karnataka 560002",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Victoria Hospital & Bangalore Medical College (BMCRI)",
      "hfrId": "HFR-IN-KA-55012",
      "facilityType": "State Apex Government Teaching Hospital",
      "state": "Karnataka",
      "district": "Bengaluru",
      "emergencyHelpline": "080-26701150",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_victoria_blr",
          "name": "General Ward Beds",
          "total": 600,
          "available": 72,
          "occupied": 528,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_victoria_blr",
          "name": "ICU & Critical Care Units",
          "total": 70,
          "available": 9,
          "occupied": 61,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_victoria_blr",
          "name": "High-Flow Oxygen Beds",
          "total": 110,
          "available": 18,
          "occupied": 92,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_victoria_blr",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 5,
          "occupied": 30,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_victoria_blr",
          "name": "Pediatric & NICU / PICU",
          "total": 45,
          "available": 11,
          "occupied": 34,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_victoria_blr_1",
          "name": "Dr. S. K. Manjunath, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Tropical Medicine & Internal Disorders",
          "roomNumber": "Victoria Main OPD 04",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_nimhans_blr",
    "city": "Bengaluru",
    "lat": 12.9392,
    "lng": 77.5936,
    "shortAddress": "Hosur Road, Lakkasandra, Bengaluru, Karnataka 560029",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM (Casualty 24x7)",
    "facility": {
      "name": "National Institute of Mental Health and Neurosciences (NIMHANS)",
      "hfrId": "HFR-IN-KA-00109",
      "facilityType": "Institute of National Importance (Apex Neuro & Psychiatry)",
      "state": "Karnataka",
      "district": "Bengaluru",
      "emergencyHelpline": "080-26995000",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_nimhans_blr",
          "name": "General Ward Beds",
          "total": 550,
          "available": 48,
          "occupied": 502,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_nimhans_blr",
          "name": "ICU & Critical Care Units",
          "total": 65,
          "available": 8,
          "occupied": 57,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_nimhans_blr",
          "name": "High-Flow Oxygen Beds",
          "total": 100,
          "available": 17,
          "occupied": 83,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_nimhans_blr",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_nimhans_blr",
          "name": "Pediatric & NICU / PICU",
          "total": 40,
          "available": 8,
          "occupied": 32,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_nimhans_blr_1",
          "name": "Dr. Pratima Murthy, MD",
          "department": "Psychiatry & Behavioral Sciences",
          "speciality": "De-addiction & Cognitive Health",
          "roomNumber": "NIMHANS OPD Room 12",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_bowring_blr",
    "city": "Bengaluru",
    "lat": 12.983,
    "lng": 77.6045,
    "shortAddress": "Lady Curzon Road, Shivaji Nagar, Bengaluru, Karnataka 560001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Bowring & Lady Curzon Hospital & Medical College",
      "hfrId": "HFR-IN-KA-11044",
      "facilityType": "Government Teaching & Multispecialty Hospital",
      "state": "Karnataka",
      "district": "Bengaluru",
      "emergencyHelpline": "080-25591325",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_bowring_blr",
          "name": "General Ward Beds",
          "total": 480,
          "available": 56,
          "occupied": 424,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_bowring_blr",
          "name": "ICU & Critical Care Units",
          "total": 50,
          "available": 8,
          "occupied": 42,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_bowring_blr",
          "name": "High-Flow Oxygen Beds",
          "total": 90,
          "available": 16,
          "occupied": 74,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_bowring_blr",
          "name": "Emergency Trauma / Red Bay",
          "total": 25,
          "available": 5,
          "occupied": 20,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_bowring_blr",
          "name": "Pediatric & NICU / PICU",
          "total": 40,
          "available": 9,
          "occupied": 31,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_bowring_blr_1",
          "name": "Dr. Ramesh Kumar, MS",
          "department": "Orthopaedics / अस्थि रोग",
          "speciality": "General Trauma & Orthopedics",
          "roomNumber": "Bowring Block 06",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_rgggh_chennai",
    "city": "Chennai",
    "lat": 13.0818,
    "lng": 80.2778,
    "shortAddress": "EVR Periyar Salai, Park Town, Chennai, Tamil Nadu 600003",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 01:30 PM (Emergency 24x7)",
    "facility": {
      "name": "Rajiv Gandhi Government General Hospital (RGGGH) & MMC",
      "hfrId": "HFR-IN-TN-00101",
      "facilityType": "State Apex Government Hospital & Medical College",
      "state": "Tamil Nadu",
      "district": "Chennai",
      "emergencyHelpline": "044-25305000 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_rgggh_chennai",
          "name": "General Ward Beds",
          "total": 950,
          "available": 68,
          "occupied": 882,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_rgggh_chennai",
          "name": "ICU & Critical Care Units",
          "total": 120,
          "available": 15,
          "occupied": 105,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_rgggh_chennai",
          "name": "High-Flow Oxygen Beds",
          "total": 190,
          "available": 31,
          "occupied": 159,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_rgggh_chennai",
          "name": "Emergency Trauma / Red Bay",
          "total": 55,
          "available": 9,
          "occupied": 46,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_rgggh_chennai",
          "name": "Pediatric & NICU / PICU",
          "total": 70,
          "available": 14,
          "occupied": 56,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_rgggh_chennai_1",
          "name": "Dr. E. Theranirajan, MD",
          "department": "Pediatrics & General Medicine",
          "speciality": "Child Health & Intensive Care",
          "roomNumber": "MMC Tower Block 02",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_stanley_chennai",
    "city": "Chennai",
    "lat": 13.1072,
    "lng": 80.2889,
    "shortAddress": "Old Jail Road, Royapuram, Chennai, Tamil Nadu 600001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Government Stanley Medical College & Hospital",
      "hfrId": "HFR-IN-TN-00105",
      "facilityType": "Government Teaching Hospital & Liver / Trauma Hub",
      "state": "Tamil Nadu",
      "district": "Chennai",
      "emergencyHelpline": "044-25281351",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_stanley_chennai",
          "name": "General Ward Beds",
          "total": 700,
          "available": 60,
          "occupied": 640,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_stanley_chennai",
          "name": "ICU & Critical Care Units",
          "total": 80,
          "available": 10,
          "occupied": 70,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_stanley_chennai",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 23,
          "occupied": 117,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_stanley_chennai",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_stanley_chennai",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_stanley_chennai_1",
          "name": "Dr. P. Balaji, MS, MCh",
          "department": "Gastroenterology & Surgical Hepatology",
          "speciality": "Liver Care & Gastro Surgeries",
          "roomNumber": "Stanley GI Wing",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_cmc_vellore",
    "city": "Vellore",
    "lat": 12.9248,
    "lng": 79.135,
    "shortAddress": "Ida Scudder Road, Vellore, Tamil Nadu 632004",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 04:30 PM",
    "facility": {
      "name": "Christian Medical College & Hospital (CMC Vellore)",
      "hfrId": "HFR-IN-TN-88019",
      "facilityType": "Premier Medical College & Advanced Tertiary Center",
      "state": "Tamil Nadu",
      "district": "Vellore",
      "emergencyHelpline": "0416-2281000",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_cmc_vellore",
          "name": "General Ward Beds",
          "total": 900,
          "available": 78,
          "occupied": 822,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_cmc_vellore",
          "name": "ICU & Critical Care Units",
          "total": 130,
          "available": 17,
          "occupied": 113,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_cmc_vellore",
          "name": "High-Flow Oxygen Beds",
          "total": 180,
          "available": 30,
          "occupied": 150,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_cmc_vellore",
          "name": "Emergency Trauma / Red Bay",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_cmc_vellore",
          "name": "Pediatric & NICU / PICU",
          "total": 75,
          "available": 16,
          "occupied": 59,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_cmc_vellore_1",
          "name": "Dr. Vikram Mathews, MD, DM",
          "department": "Hematology & Internal Medicine",
          "speciality": "Bone Marrow & Blood Disorders",
          "roomNumber": "CMC Main OPD 101",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_osmania_hyd",
    "city": "Hyderabad",
    "lat": 17.3713,
    "lng": 78.4746,
    "shortAddress": "Afzal Gunj, High Court Road, Hyderabad, Telangana 500012",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM (Emergency 24x7)",
    "facility": {
      "name": "Osmania General Hospital & Medical College",
      "hfrId": "HFR-IN-TG-10101",
      "facilityType": "State Apex Government Hospital",
      "state": "Telangana",
      "district": "Hyderabad",
      "emergencyHelpline": "040-24600121 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_osmania_hyd",
          "name": "General Ward Beds",
          "total": 800,
          "available": 64,
          "occupied": 736,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_osmania_hyd",
          "name": "ICU & Critical Care Units",
          "total": 90,
          "available": 12,
          "occupied": 78,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_osmania_hyd",
          "name": "High-Flow Oxygen Beds",
          "total": 150,
          "available": 24,
          "occupied": 126,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_osmania_hyd",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 8,
          "occupied": 37,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_osmania_hyd",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 12,
          "occupied": 48,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_osmania_hyd_1",
          "name": "Dr. B. Nagender, MS",
          "department": "General Surgery / सामान्य शल्य चिकित्सा",
          "speciality": "Trauma & Acute Surgery",
          "roomNumber": "Osmania Surgical 03",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_gandhi_secunderabad",
    "city": "Secunderabad / Hyderabad",
    "lat": 17.4243,
    "lng": 78.5032,
    "shortAddress": "Musheerabad, Padmarao Nagar, Secunderabad, Telangana 500003",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Gandhi Hospital & Medical College",
      "hfrId": "HFR-IN-TG-10105",
      "facilityType": "State Government Apex Hospital",
      "state": "Telangana",
      "district": "Secunderabad / Hyderabad",
      "emergencyHelpline": "040-27505566",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_gandhi_secunderabad",
          "name": "General Ward Beds",
          "total": 750,
          "available": 58,
          "occupied": 692,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_gandhi_secunderabad",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 11,
          "occupied": 74,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_gandhi_secunderabad",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 22,
          "occupied": 118,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_gandhi_secunderabad",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_gandhi_secunderabad",
          "name": "Pediatric & NICU / PICU",
          "total": 55,
          "available": 11,
          "occupied": 44,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_gandhi_secunderabad_1",
          "name": "Dr. M. Raja Rao, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Infectious Diseases & Pulmonology",
          "roomNumber": "Gandhi OPD Room 11",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 02:00 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_mangalagiri",
    "city": "Vijayawada / Guntur",
    "lat": 16.4388,
    "lng": 80.5756,
    "shortAddress": "Mangalagiri, Guntur District, Andhra Pradesh 522503",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Mangalagiri)",
      "hfrId": "HFR-IN-AP-00201",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Andhra Pradesh",
      "district": "Vijayawada / Guntur",
      "emergencyHelpline": "08645-293101",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_mangalagiri",
          "name": "General Ward Beds",
          "total": 650,
          "available": 62,
          "occupied": 588,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_mangalagiri",
          "name": "ICU & Critical Care Units",
          "total": 75,
          "available": 10,
          "occupied": 65,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_mangalagiri",
          "name": "High-Flow Oxygen Beds",
          "total": 130,
          "available": 23,
          "occupied": 107,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_mangalagiri",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 6,
          "occupied": 29,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_mangalagiri",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 11,
          "occupied": 39,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_mangalagiri_1",
          "name": "Dr. Mukesh Tripathi, MD",
          "department": "Anesthesiology & Critical Care",
          "speciality": "Critical Care Resuscitation",
          "roomNumber": "AIIMS OPD Wing 1",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_sskm_kolkata",
    "city": "Kolkata",
    "lat": 22.5376,
    "lng": 88.3444,
    "shortAddress": "244 AJC Bose Road, Bhowanipore, Kolkata, West Bengal 700020",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "IPGMER & SSKM Hospital (Seth Sukhlal Karnani Memorial)",
      "hfrId": "HFR-IN-WB-10101",
      "facilityType": "State Apex Government Postgraduate Medical Institute",
      "state": "West Bengal",
      "district": "Kolkata",
      "emergencyHelpline": "033-22231589 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_sskm_kolkata",
          "name": "General Ward Beds",
          "total": 900,
          "available": 62,
          "occupied": 838,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_sskm_kolkata",
          "name": "ICU & Critical Care Units",
          "total": 110,
          "available": 14,
          "occupied": 96,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_sskm_kolkata",
          "name": "High-Flow Oxygen Beds",
          "total": 180,
          "available": 29,
          "occupied": 151,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_sskm_kolkata",
          "name": "Emergency Trauma / Red Bay",
          "total": 50,
          "available": 8,
          "occupied": 42,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_sskm_kolkata",
          "name": "Pediatric & NICU / PICU",
          "total": 70,
          "available": 13,
          "occupied": 57,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_sskm_kolkata_1",
          "name": "Prof. Dr. Manimoy Bandyopadhyay, MS",
          "department": "General Surgery & Trauma",
          "speciality": "Trauma Care & GI Surgery",
          "roomNumber": "SSKM Main Block 01",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_medical_college_kolkata",
    "city": "Kolkata",
    "lat": 22.5739,
    "lng": 88.3619,
    "shortAddress": "88 College Street, Bowbazar, Kolkata, West Bengal 700073",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Medical College & Hospital Kolkata",
      "hfrId": "HFR-IN-WB-10105",
      "facilityType": "Historic State Government Medical College & Hospital",
      "state": "West Bengal",
      "district": "Kolkata",
      "emergencyHelpline": "033-22551600",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_medical_college_kolkata",
          "name": "General Ward Beds",
          "total": 750,
          "available": 56,
          "occupied": 694,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_medical_college_kolkata",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 11,
          "occupied": 74,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_medical_college_kolkata",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 22,
          "occupied": 118,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_medical_college_kolkata",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_medical_college_kolkata",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 12,
          "occupied": 48,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_medical_college_kolkata_1",
          "name": "Dr. Raghunath Misra, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Tropical & Infectious Medicine",
          "roomNumber": "MCH OPD Room 14",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_kalyani",
    "city": "Kalyani",
    "lat": 22.9774,
    "lng": 88.5218,
    "shortAddress": "NH-34 Connector, Basantapur, Kalyani, Nadia, West Bengal 741245",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Kalyani)",
      "hfrId": "HFR-IN-WB-00201",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "West Bengal",
      "district": "Kalyani",
      "emergencyHelpline": "033-29516004",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_kalyani",
          "name": "General Ward Beds",
          "total": 600,
          "available": 58,
          "occupied": 542,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_kalyani",
          "name": "ICU & Critical Care Units",
          "total": 70,
          "available": 9,
          "occupied": 61,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_kalyani",
          "name": "High-Flow Oxygen Beds",
          "total": 120,
          "available": 21,
          "occupied": 99,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_kalyani",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_kalyani",
          "name": "Pediatric & NICU / PICU",
          "total": 45,
          "available": 10,
          "occupied": 35,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_kalyani_1",
          "name": "Dr. Ramji Singh, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Internal Disorders & Hypertension",
          "roomNumber": "AIIMS Kalyani Wing B",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_civil_ahmedabad",
    "city": "Ahmedabad",
    "lat": 23.0531,
    "lng": 72.6025,
    "shortAddress": "Asarwa, Near Haripura, Ahmedabad, Gujarat 380016",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "Ahmedabad Civil Hospital & B.J. Medical College",
      "hfrId": "HFR-IN-GJ-10101",
      "facilityType": "Asia Apex Government Hospital Complex & Trauma Hub",
      "state": "Gujarat",
      "district": "Ahmedabad",
      "emergencyHelpline": "079-22683721 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_civil_ahmedabad",
          "name": "General Ward Beds",
          "total": 950,
          "available": 74,
          "occupied": 876,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_civil_ahmedabad",
          "name": "ICU & Critical Care Units",
          "total": 125,
          "available": 16,
          "occupied": 109,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_civil_ahmedabad",
          "name": "High-Flow Oxygen Beds",
          "total": 200,
          "available": 34,
          "occupied": 166,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_civil_ahmedabad",
          "name": "Emergency Trauma / Red Bay",
          "total": 60,
          "available": 10,
          "occupied": 50,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_civil_ahmedabad",
          "name": "Pediatric & NICU / PICU",
          "total": 80,
          "available": 15,
          "occupied": 65,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_civil_ahmedabad_1",
          "name": "Dr. Rakesh Joshi, MS, MCh",
          "department": "Pediatric Surgery & Trauma",
          "speciality": "Emergency Pediatric Resuscitation",
          "roomNumber": "1200 Bed Hospital Wing 04",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_rajkot",
    "city": "Rajkot",
    "lat": 22.3585,
    "lng": 70.7604,
    "shortAddress": "Khandheri, Para Pipaliya, Rajkot, Gujarat 360006",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Rajkot)",
      "hfrId": "HFR-IN-GJ-00201",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Gujarat",
      "district": "Rajkot",
      "emergencyHelpline": "0281-2993000",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_rajkot",
          "name": "General Ward Beds",
          "total": 550,
          "available": 52,
          "occupied": 498,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_rajkot",
          "name": "ICU & Critical Care Units",
          "total": 65,
          "available": 8,
          "occupied": 57,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_rajkot",
          "name": "High-Flow Oxygen Beds",
          "total": 110,
          "available": 20,
          "occupied": 90,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_rajkot",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 5,
          "occupied": 25,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_rajkot",
          "name": "Pediatric & NICU / PICU",
          "total": 45,
          "available": 9,
          "occupied": 36,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_rajkot_1",
          "name": "Dr. Sanjeev Kumar, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Adult Medicine & Metabolic Disorders",
          "roomNumber": "AIIMS Block 102",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_patna",
    "city": "Patna",
    "lat": 25.5606,
    "lng": 85.0456,
    "shortAddress": "Phulwari Sharif, Patna, Bihar 801507",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM (Emergency 24x7)",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Patna)",
      "hfrId": "HFR-IN-BR-00101",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Bihar",
      "district": "Patna",
      "emergencyHelpline": "0612-2451000 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_patna",
          "name": "General Ward Beds",
          "total": 750,
          "available": 58,
          "occupied": 692,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_patna",
          "name": "ICU & Critical Care Units",
          "total": 95,
          "available": 12,
          "occupied": 83,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_patna",
          "name": "High-Flow Oxygen Beds",
          "total": 160,
          "available": 27,
          "occupied": 133,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_patna",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 8,
          "occupied": 37,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_patna",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 13,
          "occupied": 47,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_patna_1",
          "name": "Prof. Dr. Gopal Krushna Pal, MD, PhD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Cardiorespiratory Physiology & Internal Health",
          "roomNumber": "AIIMS OPD Wing A",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_pmch_patna",
    "city": "Patna",
    "lat": 25.6206,
    "lng": 85.1633,
    "shortAddress": "Ashok Rajpath, Patna, Bihar 800004",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Patna Medical College and Hospital (PMCH)",
      "hfrId": "HFR-IN-BR-10102",
      "facilityType": "State Apex Government Teaching Hospital",
      "state": "Bihar",
      "district": "Patna",
      "emergencyHelpline": "0612-2300080",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_pmch_patna",
          "name": "General Ward Beds",
          "total": 800,
          "available": 60,
          "occupied": 740,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_pmch_patna",
          "name": "ICU & Critical Care Units",
          "total": 90,
          "available": 11,
          "occupied": 79,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_pmch_patna",
          "name": "High-Flow Oxygen Beds",
          "total": 150,
          "available": 24,
          "occupied": 126,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_pmch_patna",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_pmch_patna",
          "name": "Pediatric & NICU / PICU",
          "total": 65,
          "available": 12,
          "occupied": 53,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_pmch_patna_1",
          "name": "Dr. I. S. Thakur, MS",
          "department": "General Surgery / सामान्य शल्य चिकित्सा",
          "speciality": "Emergency Surgery",
          "roomNumber": "Hathwa Ward Room 10",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_rims_ranchi",
    "city": "Ranchi",
    "lat": 23.3837,
    "lng": 85.3582,
    "shortAddress": "Bariatu, Ranchi, Jharkhand 834009",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Rajendra Institute of Medical Sciences (RIMS Ranchi)",
      "hfrId": "HFR-IN-JH-10101",
      "facilityType": "State Apex Autonomous Teaching Hospital",
      "state": "Jharkhand",
      "district": "Ranchi",
      "emergencyHelpline": "0651-2541533",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_rims_ranchi",
          "name": "General Ward Beds",
          "total": 750,
          "available": 56,
          "occupied": 694,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_rims_ranchi",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 10,
          "occupied": 75,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_rims_ranchi",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 22,
          "occupied": 118,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_rims_ranchi",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_rims_ranchi",
          "name": "Pediatric & NICU / PICU",
          "total": 55,
          "available": 11,
          "occupied": 44,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_rims_ranchi_1",
          "name": "Dr. Kameshwar Prasad, MD, DM",
          "department": "Neurology & General Medicine",
          "speciality": "Stroke & Tropical Medicine",
          "roomNumber": "RIMS Super Specialty 05",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_bhopal",
    "city": "Bhopal",
    "lat": 23.2084,
    "lng": 77.4589,
    "shortAddress": "Saket Nagar, Habibganj, Bhopal, Madhya Pradesh 462020",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Bhopal)",
      "hfrId": "HFR-IN-MP-00101",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Madhya Pradesh",
      "district": "Bhopal",
      "emergencyHelpline": "0755-2672317 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_bhopal",
          "name": "General Ward Beds",
          "total": 750,
          "available": 60,
          "occupied": 690,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_bhopal",
          "name": "ICU & Critical Care Units",
          "total": 95,
          "available": 13,
          "occupied": 82,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_bhopal",
          "name": "High-Flow Oxygen Beds",
          "total": 160,
          "available": 28,
          "occupied": 132,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_bhopal",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 8,
          "occupied": 37,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_bhopal",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 12,
          "occupied": 48,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_bhopal_1",
          "name": "Prof. Dr. Ajai Singh, MS",
          "department": "Orthopaedics & Trauma",
          "speciality": "Pediatric Orthopaedics & Trauma Hub",
          "roomNumber": "AIIMS OPD Wing 104",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_my_indore",
    "city": "Indore",
    "lat": 22.7169,
    "lng": 75.8778,
    "shortAddress": "MYH Road, Sanyogitaganj, Indore, Madhya Pradesh 452001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Maharaja Yeshwantrao (MY) Hospital & MGM Medical College",
      "hfrId": "HFR-IN-MP-10105",
      "facilityType": "State Apex Government Teaching Hospital",
      "state": "Madhya Pradesh",
      "district": "Indore",
      "emergencyHelpline": "0731-2527383",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_my_indore",
          "name": "General Ward Beds",
          "total": 750,
          "available": 64,
          "occupied": 686,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_my_indore",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 11,
          "occupied": 74,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_my_indore",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 23,
          "occupied": 117,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_my_indore",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_my_indore",
          "name": "Pediatric & NICU / PICU",
          "total": 55,
          "available": 10,
          "occupied": 45,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_my_indore_1",
          "name": "Dr. V. P. Pandey, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Internal Disorders & Critical Illness",
          "roomNumber": "MYH OPD 07",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_raipur",
    "city": "Raipur",
    "lat": 21.257,
    "lng": 81.5794,
    "shortAddress": "GE Road, Tatibandh, Raipur, Chhattisgarh 492099",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Raipur)",
      "hfrId": "HFR-IN-CG-00101",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Chhattisgarh",
      "district": "Raipur",
      "emergencyHelpline": "0771-2577244",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_raipur",
          "name": "General Ward Beds",
          "total": 700,
          "available": 56,
          "occupied": 644,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_raipur",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 11,
          "occupied": 74,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_raipur",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 24,
          "occupied": 116,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_raipur",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_raipur",
          "name": "Pediatric & NICU / PICU",
          "total": 55,
          "available": 11,
          "occupied": 44,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_raipur_1",
          "name": "Dr. Nitin M. Nagarkar, MS, DNB",
          "department": "ENT & Head-Neck Surgery",
          "speciality": "ENT Emergencies & Oncology",
          "roomNumber": "AIIMS Block A-02",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_gmc_tvm",
    "city": "Thiruvananthapuram",
    "lat": 8.5241,
    "lng": 76.9281,
    "shortAddress": "Medical College PO, Chalakkuzhi, Thiruvananthapuram, Kerala 695011",
    "isAiimsOrGovt": true,
    "opdHours": "08:00 AM - 01:30 PM",
    "facility": {
      "name": "Government Medical College Hospital, Thiruvananthapuram",
      "hfrId": "HFR-IN-KL-10101",
      "facilityType": "State Apex Government Hospital & Super Specialty Block",
      "state": "Kerala",
      "district": "Thiruvananthapuram",
      "emergencyHelpline": "0471-2528386 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_gmc_tvm",
          "name": "General Ward Beds",
          "total": 850,
          "available": 72,
          "occupied": 778,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_gmc_tvm",
          "name": "ICU & Critical Care Units",
          "total": 105,
          "available": 14,
          "occupied": 91,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_gmc_tvm",
          "name": "High-Flow Oxygen Beds",
          "total": 170,
          "available": 29,
          "occupied": 141,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_gmc_tvm",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 8,
          "occupied": 37,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_gmc_tvm",
          "name": "Pediatric & NICU / PICU",
          "total": 65,
          "available": 14,
          "occupied": 51,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_gmc_tvm_1",
          "name": "Dr. Thomas Mathew, MD, DM",
          "department": "Community Medicine & Internal Care",
          "speciality": "Tropical Fevers & Internal Health",
          "roomNumber": "Main OPD Block 08",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_ggh_kochi",
    "city": "Kochi / Ernakulam",
    "lat": 9.9754,
    "lng": 76.2811,
    "shortAddress": "Hospital Road, Marine Drive, Kochi, Ernakulam, Kerala 682011",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Ernakulam Government General Hospital",
      "hfrId": "HFR-IN-KL-10214",
      "facilityType": "NABH Accredited Apex District Government Hospital",
      "state": "Kerala",
      "district": "Kochi / Ernakulam",
      "emergencyHelpline": "0484-2361251",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_ggh_kochi",
          "name": "General Ward Beds",
          "total": 550,
          "available": 52,
          "occupied": 498,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_ggh_kochi",
          "name": "ICU & Critical Care Units",
          "total": 60,
          "available": 9,
          "occupied": 51,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_ggh_kochi",
          "name": "High-Flow Oxygen Beds",
          "total": 110,
          "available": 20,
          "occupied": 90,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_ggh_kochi",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 6,
          "occupied": 24,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_ggh_kochi",
          "name": "Pediatric & NICU / PICU",
          "total": 45,
          "available": 9,
          "occupied": 36,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_ggh_kochi_1",
          "name": "Dr. A. Anitha, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Adult Medicine & Geriatric Care",
          "roomNumber": "Room 102",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_bbsr",
    "city": "Bhubaneswar",
    "lat": 20.2319,
    "lng": 85.7766,
    "shortAddress": "Sijua, Patrapada, Bhubaneswar, Odisha 751019",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Bhubaneswar)",
      "hfrId": "HFR-IN-OD-00101",
      "facilityType": "Autonomous National Apex Medical Institute",
      "state": "Odisha",
      "district": "Bhubaneswar",
      "emergencyHelpline": "0674-2476789 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_bbsr",
          "name": "General Ward Beds",
          "total": 750,
          "available": 62,
          "occupied": 688,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_bbsr",
          "name": "ICU & Critical Care Units",
          "total": 95,
          "available": 12,
          "occupied": 83,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_bbsr",
          "name": "High-Flow Oxygen Beds",
          "total": 160,
          "available": 27,
          "occupied": 133,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_bbsr",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 8,
          "occupied": 37,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_bbsr",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 12,
          "occupied": 48,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_bbsr_1",
          "name": "Prof. Dr. Ashutosh Biswas, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Tropical Infections & Rheumatology",
          "roomNumber": "AIIMS Block 1",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_gmch_guwahati",
    "city": "Guwahati",
    "lat": 26.1554,
    "lng": 91.7762,
    "shortAddress": "Narakasur Hilltop, Bhangagarh, Guwahati, Assam 781032",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Gauhati Medical College and Hospital (GMCH)",
      "hfrId": "HFR-IN-AS-10101",
      "facilityType": "North-East Regional Apex Government Teaching Hospital",
      "state": "Assam",
      "district": "Guwahati",
      "emergencyHelpline": "0361-2529457 / 102",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_gmch_guwahati",
          "name": "General Ward Beds",
          "total": 800,
          "available": 68,
          "occupied": 732,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_gmch_guwahati",
          "name": "ICU & Critical Care Units",
          "total": 90,
          "available": 12,
          "occupied": 78,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_gmch_guwahati",
          "name": "High-Flow Oxygen Beds",
          "total": 150,
          "available": 24,
          "occupied": 126,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_gmch_guwahati",
          "name": "Emergency Trauma / Red Bay",
          "total": 45,
          "available": 7,
          "occupied": 38,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_gmch_guwahati",
          "name": "Pediatric & NICU / PICU",
          "total": 60,
          "available": 12,
          "occupied": 48,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_gmch_guwahati_1",
          "name": "Prof. Dr. Achyut Ch. Baishya, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Tropical Vector Borne Diseases",
          "roomNumber": "GMCH Main OPD 05",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_aiims_rishikesh",
    "city": "Rishikesh",
    "lat": 30.0762,
    "lng": 78.2878,
    "shortAddress": "Virbhadra Road, Rishikesh, Dehradun District, Uttarakhand 249203",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "All India Institute of Medical Sciences (AIIMS Rishikesh)",
      "hfrId": "HFR-IN-UK-00101",
      "facilityType": "Autonomous National Apex Medical Institute & Helipad Trauma",
      "state": "Uttarakhand",
      "district": "Rishikesh",
      "emergencyHelpline": "0135-2462940",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_aiims_rishikesh",
          "name": "General Ward Beds",
          "total": 700,
          "available": 58,
          "occupied": 642,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_aiims_rishikesh",
          "name": "ICU & Critical Care Units",
          "total": 85,
          "available": 11,
          "occupied": 74,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_aiims_rishikesh",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 23,
          "occupied": 117,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_aiims_rishikesh",
          "name": "Emergency Trauma / Red Bay",
          "total": 40,
          "available": 7,
          "occupied": 33,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_aiims_rishikesh",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_aiims_rishikesh_1",
          "name": "Prof. Dr. Meenu Singh, MD",
          "department": "Pediatrics & Pulmonology",
          "speciality": "Pediatric Asthma & Critical Care",
          "roomNumber": "AIIMS OPD Wing C",
          "status": "On Duty",
          "opdTimings": "08:30 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_igmc_shimla",
    "city": "Shimla",
    "lat": 31.1077,
    "lng": 77.1852,
    "shortAddress": "Circular Road, Lakkar Bazar, Shimla, Himachal Pradesh 171001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Indira Gandhi Medical College & Hospital (IGMC Shimla)",
      "hfrId": "HFR-IN-HP-10101",
      "facilityType": "State Apex Government Teaching Hospital",
      "state": "Himachal Pradesh",
      "district": "Shimla",
      "emergencyHelpline": "0177-2804251",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_igmc_shimla",
          "name": "General Ward Beds",
          "total": 550,
          "available": 48,
          "occupied": 502,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_igmc_shimla",
          "name": "ICU & Critical Care Units",
          "total": 60,
          "available": 8,
          "occupied": 52,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_igmc_shimla",
          "name": "High-Flow Oxygen Beds",
          "total": 110,
          "available": 19,
          "occupied": 91,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_igmc_shimla",
          "name": "Emergency Trauma / Red Bay",
          "total": 30,
          "available": 5,
          "occupied": 25,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_igmc_shimla",
          "name": "Pediatric & NICU / PICU",
          "total": 45,
          "available": 9,
          "occupied": 36,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_igmc_shimla_1",
          "name": "Dr. Surinder Singh, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "High Altitude & Internal Disorders",
          "roomNumber": "IGMC Room 10",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_gmc_jammu",
    "city": "Jammu",
    "lat": 32.7357,
    "lng": 74.8617,
    "shortAddress": "Bakshi Nagar, Jammu, Jammu and Kashmir 180001",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 01:30 PM",
    "facility": {
      "name": "Government Medical College and Hospital (GMC Jammu)",
      "hfrId": "HFR-IN-JK-10101",
      "facilityType": "Apex State Teaching Hospital & Emergency Center",
      "state": "Jammu and Kashmir",
      "district": "Jammu",
      "emergencyHelpline": "0191-2584290",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_gmc_jammu",
          "name": "General Ward Beds",
          "total": 650,
          "available": 54,
          "occupied": 596,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_gmc_jammu",
          "name": "ICU & Critical Care Units",
          "total": 70,
          "available": 9,
          "occupied": 61,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_gmc_jammu",
          "name": "High-Flow Oxygen Beds",
          "total": 120,
          "available": 20,
          "occupied": 100,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_gmc_jammu",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 6,
          "occupied": 29,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_gmc_jammu",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 10,
          "occupied": 40,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_gmc_jammu_1",
          "name": "Dr. Shashi Sudhan Sharma, MD",
          "department": "General Medicine / आंतरिक चिकित्सा",
          "speciality": "Internal Medicine & Infectious Fevers",
          "roomNumber": "GMC OPD Room 04",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  },
  {
    "id": "hosp_skims_srinagar",
    "city": "Srinagar",
    "lat": 34.1352,
    "lng": 74.8028,
    "shortAddress": "Soura, Srinagar, Jammu and Kashmir 190011",
    "isAiimsOrGovt": true,
    "opdHours": "08:30 AM - 02:00 PM",
    "facility": {
      "name": "Sher-i-Kashmir Institute of Medical Sciences (SKIMS Soura)",
      "hfrId": "HFR-IN-JK-10105",
      "facilityType": "Deemed Medical University & Apex Tertiary Institute",
      "state": "Jammu and Kashmir",
      "district": "Srinagar",
      "emergencyHelpline": "0194-2401013",
      "ambulanceContact": "108",
      "bedInventory": [
        {
          "id": "bed_gen_hosp_skims_srinagar",
          "name": "General Ward Beds",
          "total": 700,
          "available": 58,
          "occupied": 642,
          "unit": "Beds",
          "type": "general"
        },
        {
          "id": "bed_icu_hosp_skims_srinagar",
          "name": "ICU & Critical Care Units",
          "total": 80,
          "available": 10,
          "occupied": 70,
          "unit": "Beds",
          "type": "icu"
        },
        {
          "id": "bed_o2_hosp_skims_srinagar",
          "name": "High-Flow Oxygen Beds",
          "total": 140,
          "available": 22,
          "occupied": 118,
          "unit": "Beds",
          "type": "oxygen"
        },
        {
          "id": "bed_trauma_hosp_skims_srinagar",
          "name": "Emergency Trauma / Red Bay",
          "total": 35,
          "available": 6,
          "occupied": 29,
          "unit": "Beds",
          "type": "trauma"
        },
        {
          "id": "bed_ped_hosp_skims_srinagar",
          "name": "Pediatric & NICU / PICU",
          "total": 50,
          "available": 9,
          "occupied": 41,
          "unit": "Beds",
          "type": "pediatric"
        }
      ],
      "doctors": [
        {
          "id": "doc_hosp_skims_srinagar_1",
          "name": "Dr. Parvaiz A. Koul, MD",
          "department": "Pulmonology & General Medicine",
          "speciality": "Respiratory Illnesses & High Altitude Medicine",
          "roomNumber": "SKIMS Block A",
          "status": "On Duty",
          "opdTimings": "09:00 AM - 01:30 PM",
          "phoneOrExt": "Ext 100"
        }
      ],
      "treatmentsAvailable": [
        "Acute OPD Triage & Emergency Trauma Bay",
        "24x7 NABL Accredited Automated Pathology & Biochemistry",
        "ABDM Verified FHIR Electronic Health Record Linkage",
        "Ayurvedic & AYUSH Holistic Wellness Integration",
        "Advanced Intensive Cardiac & Critical Care Unit",
        "Free Jan Aushadhi Generic Pharmacy Dispensation"
      ]
    }
  }
];

export const INITIAL_HOSPITAL_FACILITY: HospitalFacilityInfo =
  AVAILABLE_HOSPITAL_LOCATIONS[0].facility;
