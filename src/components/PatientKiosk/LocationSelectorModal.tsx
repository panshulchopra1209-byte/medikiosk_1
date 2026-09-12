import React, { useState, useMemo } from 'react';
import {
  MapPin,
  Building2,
  X,
  Search,
  CheckCircle2,
  Navigation,
  PhoneCall,
  Clock,
  BedDouble,
  ShieldCheck,
  ChevronRight,
  Stethoscope,
  Leaf,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { HospitalFacilityInfo, LanguageCode } from '../../types';
import {
  AVAILABLE_HOSPITAL_LOCATIONS,
  HospitalLocationOption,
  calculateDistanceKm,
  createDetectedHospital,
} from '../../data/hospitalLocations';
import { getLocalizedDepartments } from '../../i18n/localizedData';
import { getTranslation } from '../../i18n/translations';
import { fetchWithCsrf } from '../../utils/csrf';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentFacility: HospitalFacilityInfo;
  onSelectFacility: (facility: HospitalFacilityInfo) => void;
  selectedDepartment: string;
  onSelectDepartment: (deptName: string, isAyush: boolean) => void;
  language: LanguageCode;
}

export const LocationSelectorModal: React.FC<LocationSelectorModalProps> = ({
  isOpen,
  onClose,
  currentFacility,
  onSelectFacility,
  selectedDepartment,
  onSelectDepartment,
  language,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'hospitals' | 'departments'>('hospitals');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [isSearchingNearby, setIsSearchingNearby] = useState(false);
  const [detectedCity, setDetectedCity] = useState<string | null>(null);
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [customDetectedHospitals, setCustomDetectedHospitals] = useState<HospitalLocationOption[]>([]);
  const [filterMode, setFilterMode] = useState<'all' | 'nearest' | 'govt' | 'ayush'>('all');

  const dict = getTranslation(language);
  const localizedDepartments = getLocalizedDepartments(language);

  // Combine static repository with any dynamically detected local facilities
  const allLocations = useMemo(() => {
    const combined: HospitalLocationOption[] = [...customDetectedHospitals];
    const seenNames = new Set(customDetectedHospitals.map((h) => h.facility.name.toLowerCase().trim()));

    for (const loc of AVAILABLE_HOSPITAL_LOCATIONS) {
      if (!seenNames.has(loc.facility.name.toLowerCase().trim())) {
        seenNames.add(loc.facility.name.toLowerCase().trim());
        combined.push(loc);
      }
    }
    return combined;
  }, [customDetectedHospitals]);

  // Calculate dynamic distances and sort by proximity if userCoords is active
  const processedLocations = useMemo(() => {
    const mapped = allLocations.map((loc) => {
      if (userCoords) {
        const distance = calculateDistanceKm(userCoords.lat, userCoords.lng, loc.lat, loc.lng);
        return { ...loc, dynamicDistance: distance };
      }
      return { ...loc, dynamicDistance: loc.distanceKm };
    });

    if (userCoords) {
      mapped.sort((a, b) => (a.dynamicDistance ?? 9999) - (b.dynamicDistance ?? 9999));
    }
    return mapped;
  }, [allLocations, userCoords]);

  // Apply search query and category filters
  const filteredLocations = useMemo(() => {
    let result = processedLocations;

    // Filter mode filter
    if (filterMode === 'nearest' && userCoords) {
      result = result.filter((loc) => (loc.dynamicDistance ?? 9999) <= 50);
    } else if (filterMode === 'govt') {
      result = result.filter((loc) => loc.isAiimsOrGovt);
    } else if (filterMode === 'ayush') {
      result = result.filter((loc) =>
        /ayush|ayurveda|unani|siddha|homeopathy|kaya/i.test(loc.facility.name + ' ' + loc.facility.facilityType)
      );
    }

    if (!searchQuery.trim()) {
      return result;
    }

    const q = searchQuery.toLowerCase().trim();
    return result.filter((loc) => {
      return (
        loc.facility.name.toLowerCase().includes(q) ||
        loc.city.toLowerCase().includes(q) ||
        loc.facility.state.toLowerCase().includes(q) ||
        loc.shortAddress.toLowerCase().includes(q) ||
        loc.facility.facilityType.toLowerCase().includes(q)
      );
    });
  }, [processedLocations, searchQuery, filterMode, userCoords]);

  // Fetch nearby live hospitals via API
  const fetchNearbyHospitals = async (lat: number, lng: number, cityName?: string) => {
    setIsSearchingNearby(true);
    try {
      const res = await fetchWithCsrf('/api/geo/nearby-hospitals', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng, cityName, radiusKm: 35 }),
      });
      const data = await res.json();
      if (data && data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
        const synthesized: HospitalLocationOption[] = data.hospitals.map((h: any) =>
          createDetectedHospital({
            name: h.name,
            city: h.city || cityName || 'Local District',
            state: h.state,
            lat: h.lat,
            lng: h.lng,
            shortAddress: h.shortAddress,
            isGovt: h.isGovt,
            userCoords: { lat, lng },
          })
        );

        setCustomDetectedHospitals((prev) => {
          const seen = new Set(prev.map((p) => p.facility.name.toLowerCase().trim()));
          const novel = synthesized.filter((s) => !seen.has(s.facility.name.toLowerCase().trim()));
          return [...novel, ...prev];
        });
      }
    } catch (err) {
      console.warn('Failed to fetch nearby hospitals:', err);
    } finally {
      setIsSearchingNearby(false);
    }
  };

  const handleAutoDetectGps = () => {
    if (!navigator.geolocation) {
      setGpsError(dict.gpsLocatingError || 'Geolocation is not supported by your browser.');
      return;
    }

    setGpsDetecting(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        setUserCoords({ lat, lng });

        let resolvedCity = '';
        try {
          const res = await fetchWithCsrf('/api/geo/reverse-geocode', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ lat, lng }),
          });
          const data = await res.json();
          if (data && data.success) {
            resolvedCity = data.city || data.formattedAddress;
            setDetectedCity(resolvedCity);
          } else {
            resolvedCity = `GPS Location (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
            setDetectedCity(resolvedCity);
          }
        } catch (e) {
          console.warn('Reverse geocode error:', e);
          resolvedCity = `GPS Location (${lat.toFixed(3)}°, ${lng.toFixed(3)}°)`;
          setDetectedCity(resolvedCity);
        }

        // Fetch live hospitals in the user's immediate vicinity
        await fetchNearbyHospitals(lat, lng, resolvedCity);
        setGpsDetecting(false);

        // Find and select closest facility
        let minDistance = 999999;
        let closest: HospitalLocationOption | null = null;
        for (const hosp of allLocations) {
          const d = calculateDistanceKm(lat, lng, hosp.lat, hosp.lng);
          if (d < minDistance) {
            minDistance = d;
            closest = hosp;
          }
        }
        if (closest) {
          onSelectFacility(closest.facility);
        }
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setGpsDetecting(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError(
            dict.gpsPermissionDenied ||
              'Location permission was denied. Please select your hospital campus manually from the list below.'
          );
        } else {
          setGpsError(
            dict.gpsLocatingError ||
              'GPS location could not be determined. Please select your hospital campus manually.'
          );
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  const handleSearchLiveCity = () => {
    if (!searchQuery.trim()) return;
    setIsSearchingNearby(true);
    fetchWithCsrf('/api/geo/nearby-hospitals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ searchQuery: searchQuery.trim(), radiusKm: 40 }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.hospitals) && data.hospitals.length > 0) {
          const synthesized: HospitalLocationOption[] = data.hospitals.map((h: any) =>
            createDetectedHospital({
              name: h.name,
              city: h.city || searchQuery.trim(),
              state: h.state,
              lat: h.lat,
              lng: h.lng,
              shortAddress: h.shortAddress,
              isGovt: h.isGovt,
              userCoords: userCoords || undefined,
            })
          );
          setCustomDetectedHospitals((prev) => {
            const seen = new Set(prev.map((p) => p.facility.name.toLowerCase().trim()));
            const novel = synthesized.filter((s) => !seen.has(s.facility.name.toLowerCase().trim()));
            return [...novel, ...prev];
          });
        }
      })
      .catch((err) => console.warn('Search live error:', err))
      .finally(() => setIsSearchingNearby(false));
  };

  const calculateVacantBeds = (facility: HospitalFacilityInfo) => {
    return facility.bedInventory.reduce((acc, b) => acc + b.available, 0);
  };

  const calculateTotalBeds = (facility: HospitalFacilityInfo) => {
    return facility.bedInventory.reduce((acc, b) => acc + b.total, 0);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-2xl border border-[#E7E1D6] shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-[#FAF8F5] border-b border-[#E7E1D6] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-[#3E5B47] text-white rounded-xl shadow-xs">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#2D2621]">
                {dict.selectFacilityModalTitle || 'Select Hospital Location & OPD Wing'}
              </h2>
              <p className="text-xs text-[#7A6C5F]">
                {dict.selectFacilitySubtitle ||
                  'Choose your nearest medical center, hospital campus, or specialized AYUSH institute.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7A6C5F] hover:text-[#2D2621] hover:bg-[#EFE9DF] transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Active Facility Banner */}
        <div className="px-4 sm:px-5 py-2.5 bg-[#EBF1EC] border-b border-[#D5E2D7] flex items-center justify-between flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3E5B47] animate-pulse" />
            <span className="font-semibold text-[#2D2621]">
              {dict.currentLocationSelected || 'Active Location'}:
            </span>
            <span className="font-bold text-[#3E5B47]">{currentFacility.name}</span>
            <span className="text-[#647668]">({currentFacility.district}, {currentFacility.state})</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#3E5B47] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
              {calculateVacantBeds(currentFacility)} {dict.bedsVacantChip || 'Beds Vacant'}
            </span>
            <span className="text-[11px] font-semibold text-[#3E5B47] bg-white px-2 py-0.5 rounded border border-[#D5E2D7]">
              OPD: {currentFacility.doctors.filter((d) => d.status === 'On Duty').length} Doctors
            </span>
          </div>
        </div>

        {/* Tabs: Hospitals vs Departments */}
        <div className="flex border-b border-[#E7E1D6] bg-[#FAF8F5] px-4 pt-2 gap-2">
          <button
            onClick={() => setActiveTab('hospitals')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'hospitals'
                ? 'border-[#3E5B47] text-[#3E5B47]'
                : 'border-transparent text-[#7A6C5F] hover:text-[#2D2621]'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>
              {dict.hospitalCampusesTab || 'Hospital Campuses & Locations'} ({allLocations.length})
            </span>
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`pb-2.5 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'departments'
                ? 'border-[#3E5B47] text-[#3E5B47]'
                : 'border-transparent text-[#7A6C5F] hover:text-[#2D2621]'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>{dict.opdWingsTab || 'OPD Wings & Specialities'} ({localizedDepartments.length})</span>
          </button>
        </div>

        {/* Search & GPS Tool Bar */}
        <div className="p-3 sm:p-4 border-b border-[#E7E1D6] bg-white flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#8C7B6C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={dict.filterLocationPlaceholder || 'Filter by hospital name, city (e.g. Delhi, Jaipur, Mumbai, Bengaluru)...'}
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl border border-[#DDD3C4] bg-[#FAF8F5] focus:bg-white focus:outline-none focus:border-[#3E5B47]"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                title={dict.clearSearch || 'Clear'}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <button
            onClick={handleAutoDetectGps}
            disabled={gpsDetecting || isSearchingNearby}
            className="px-4 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-60"
          >
            <Navigation className={`w-3.5 h-3.5 ${gpsDetecting ? 'animate-spin' : ''}`} />
            <span>
              {gpsDetecting
                ? (dict.locating || 'Locating...')
                : isSearchingNearby
                ? 'Finding Nearby...'
                : (dict.nearMeGps || 'Near Me (GPS)')}
            </span>
          </button>
        </div>

        {/* Filter Pills Bar */}
        {activeTab === 'hospitals' && (
          <div className="px-4 py-2 bg-[#FAF8F5] border-b border-[#E7E1D6] flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filterMode === 'all'
                  ? 'bg-[#3E5B47] text-white'
                  : 'bg-white text-[#7A6C5F] border border-[#DDD3C4] hover:border-[#3E5B47]'
              }`}
            >
              All Centers ({allLocations.length})
            </button>
            {userCoords && (
              <button
                onClick={() => setFilterMode('nearest')}
                className={`px-3 py-1 rounded-full font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  filterMode === 'nearest'
                    ? 'bg-[#3E5B47] text-white'
                    : 'bg-white text-[#3E5B47] border border-[#3E5B47]/40 hover:bg-[#EBF1EC]'
                }`}
              >
                <Navigation className="w-3 h-3" />
                <span>Nearest to Me (&lt;50 km)</span>
              </button>
            )}
            <button
              onClick={() => setFilterMode('govt')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filterMode === 'govt'
                  ? 'bg-[#3E5B47] text-white'
                  : 'bg-white text-[#7A6C5F] border border-[#DDD3C4] hover:border-[#3E5B47]'
              }`}
            >
              Govt. &amp; AIIMS
            </button>
            <button
              onClick={() => setFilterMode('ayush')}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                filterMode === 'ayush'
                  ? 'bg-[#3E5B47] text-white'
                  : 'bg-white text-[#7A6C5F] border border-[#DDD3C4] hover:border-[#3E5B47]'
              }`}
            >
              AYUSH Institutes
            </button>

            {isSearchingNearby && (
              <span className="text-[11px] text-[#3E5B47] font-semibold flex items-center gap-1.5 ml-auto animate-pulse">
                <RefreshCw className="w-3 h-3 animate-spin" /> Scanning local map...
              </span>
            )}
          </div>
        )}

        {/* GPS Result or Error Banner */}
        {detectedCity && (
          <div className="px-4 py-2 bg-[#F2F7F3] border-b border-[#D5E2D7] text-xs text-[#3E5B47] font-medium flex items-center justify-between flex-wrap gap-2">
            <span className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#3E5B47] flex-shrink-0" />
              <span>
                {dict.autoDetectedCenter || 'Auto-detected GPS Location:'} <strong>{detectedCity}</strong>
              </span>
            </span>
            {userCoords && filteredLocations[0]?.dynamicDistance !== undefined && (
              <span className="text-[10px] bg-[#3E5B47] text-white px-2.5 py-0.5 rounded-full font-bold shadow-xs">
                {dict.closestDistance || 'Closest'}: ~{filteredLocations[0].dynamicDistance} km ({filteredLocations[0].facility.name})
              </span>
            )}
          </div>
        )}

        {gpsError && (
          <div className="px-4 py-2 bg-[#FDF2F0] border-b border-[#F5C7BE] text-xs text-[#9E4F36] flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}

        {/* Modal Body / Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 bg-[#FAF8F5]">
          {activeTab === 'hospitals' ? (
            <div className="space-y-3">
              {filteredLocations.length === 0 ? (
                <div className="text-center py-8 text-[#7A6C5F] space-y-2">
                  <p className="text-sm font-semibold">{dict.noHospitalsFound || 'No medical facilities found matching your search.'}</p>
                  <p className="text-xs text-[#8C7B6C]">
                    Try searching for another city, or click below to search live maps for clinics and hospitals in this location.
                  </p>
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {searchQuery && (
                      <button
                        onClick={handleSearchLiveCity}
                        disabled={isSearchingNearby}
                        className="px-3 py-1.5 rounded-xl bg-[#3E5B47] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer hover:bg-[#324B3A]"
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Search live map for &ldquo;{searchQuery}&rdquo;</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setFilterMode('all');
                      }}
                      className="text-xs text-[#3E5B47] font-bold underline cursor-pointer"
                    >
                      {dict.clearSearch || 'Reset Filters'}
                    </button>
                  </div>
                </div>
              ) : (
                filteredLocations.map((loc) => {
                  const isSelected = loc.facility.name === currentFacility.name;
                  const vacantBeds = calculateVacantBeds(loc.facility);
                  const totalBeds = calculateTotalBeds(loc.facility);

                  return (
                    <div
                      key={loc.id}
                      onClick={() => {
                        onSelectFacility(loc.facility);
                        onClose();
                      }}
                      className={`p-4 rounded-2xl border transition-all duration-150 cursor-pointer ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-2 border-[#3E5B47] shadow-md ring-2 ring-[#3E5B47]/15'
                          : 'bg-[#FFFFFF] border-[#E7E1D6] hover:border-[#3E5B47]/60 hover:shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-sm sm:text-base font-bold text-[#2D2621]">
                              {loc.facility.name}
                            </h3>
                            {loc.isDetectedLive && (
                              <span className="text-[10px] font-bold bg-[#EBF1EC] text-[#2F5A3E] px-2 py-0.5 rounded-full border border-[#BBD5C4] flex items-center gap-1">
                                <Sparkles className="w-2.5 h-2.5" /> Live Nearby
                              </span>
                            )}
                            {loc.isAiimsOrGovt && (
                              <span className="text-[10px] font-bold bg-[#EBF1EC] text-[#3E5B47] px-2 py-0.5 rounded-full border border-[#D5E2D7]">
                                {dict.govtApexCenter || 'Govt. Apex Center'}
                              </span>
                            )}
                            {isSelected && (
                              <span className="text-[10px] font-bold bg-[#3E5B47] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> {dict.activeSelected || 'Active Selected'}
                              </span>
                            )}
                          </div>

                          <p className="text-xs text-[#7A6C5F] flex items-center gap-1.5 flex-wrap">
                            <MapPin className="w-3.5 h-3.5 text-[#9E4F36] flex-shrink-0" />
                            <span>{loc.shortAddress}</span>
                            {loc.dynamicDistance !== undefined && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-[#EBF1EC] text-[#3E5B47] font-bold text-[11px]">
                                ~{loc.dynamicDistance} km away
                              </span>
                            )}
                          </p>
                        </div>

                        <button
                          type="button"
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                            isSelected
                              ? 'bg-[#3E5B47] text-white shadow-xs'
                              : 'bg-[#FAF8F5] text-[#3E5B47] border border-[#DDD3C4] hover:bg-[#3E5B47] hover:text-white'
                          }`}
                        >
                          {isSelected ? (dict.activeSelected || 'Selected') : (dict.selectBtn || 'Select')}
                        </button>
                      </div>

                      {/* Facility details pills */}
                      <div className="mt-3 pt-2.5 border-t border-[#F2ECE4] flex flex-wrap items-center justify-between gap-2 text-xs">
                        <div className="flex items-center gap-3 flex-wrap">
                          <span className="flex items-center gap-1 text-[#3E5B47] font-bold">
                            <BedDouble className="w-3.5 h-3.5" />
                            <span>{vacantBeds} {dict.bedsVacantChip || 'Beds Vacant'}</span>
                            <span className="text-[#8C7B6C] font-normal">/ {totalBeds} {dict.totalLabel || 'Total'}</span>
                          </span>
                          <span className="text-[#DDD3C4]">•</span>
                          <span className="flex items-center gap-1 text-[#5E5146]">
                            <Clock className="w-3.5 h-3.5 text-[#8C7B6C]" />
                            <span>{loc.opdHours}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-[#7A6C5F]">
                          <PhoneCall className="w-3 h-3 text-[#9E4F36]" />
                          <span>{dict.emergencyHelplineLabel || 'Emergency'}: <strong>{loc.facility.emergencyHelpline}</strong></span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-[#7A6C5F] mb-1">
                {dict.selectTargetWing || 'Select target OPD clinic or clinical wing for this consultation:'}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {localizedDepartments.map((dept) => {
                  const isSelected = selectedDepartment === dept.name;
                  const isAyush = dept.id.includes('kaya') || dept.id.includes('pancha');

                  return (
                    <div
                      key={dept.id}
                      onClick={() => {
                        onSelectDepartment(dept.name, isAyush);
                        onClose();
                      }}
                      className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-2.5 ${
                        isSelected
                          ? 'bg-[#FFFFFF] border-2 border-[#3E5B47] shadow-sm'
                          : 'bg-[#FFFFFF] border-[#E7E1D6] hover:border-[#3E5B47]/60'
                      }`}
                    >
                      <div
                        className={`p-2 rounded-lg flex-shrink-0 ${
                          isAyush
                            ? 'bg-[#EBF1EC] text-[#3E5B47]'
                            : 'bg-[#FAF8F5] text-[#8C7B6C]'
                        }`}
                      >
                        {isAyush ? <Leaf className="w-4 h-4" /> : <Stethoscope className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs sm:text-sm font-bold text-[#2D2621] truncate">
                            {dept.name}
                          </h4>
                          {isSelected && (
                            <CheckCircle2 className="w-4 h-4 text-[#3E5B47] flex-shrink-0" />
                          )}
                        </div>
                        <p className="text-[11px] text-[#7A6C5F] mt-0.5 line-clamp-2">
                          {dept.subtitle}
                        </p>
                        <span
                          className={`inline-block text-[10px] mt-1 font-semibold px-2 py-0.5 rounded ${
                            isAyush
                              ? 'bg-[#EBF1EC] text-[#3E5B47]'
                              : 'bg-[#FAF8F5] text-[#6C5D50] border border-[#E7E1D6]'
                          }`}
                        >
                          {isAyush ? (dict.ayushProtocol || 'AYUSH Holistic Protocol') : (dict.modernAllopathy || 'Modern Allopathy OPD')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 sm:p-4 bg-[#FAF8F5] border-t border-[#E7E1D6] flex items-center justify-between">
          <span className="text-xs text-[#7A6C5F]">
            {dict.abdmHfrNotice || 'All locations registered under ABDM Health Facility Registry (HFR)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#3E5B47] hover:bg-[#324B3A] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
          >
            {dict.closeBtn || 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};

