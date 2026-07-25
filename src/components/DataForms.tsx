import React, { useState } from 'react';
import { 
  MapPin, 
  Locate, 
  Loader2, 
  CheckCircle2, 
  RefreshCw, 
  AlertCircle 
} from 'lucide-react';

interface DataFormsProps {
  type: string;
  onSave: (data: any) => void;
  onClose: () => void;
  initialData?: any;
}

export default function DataForms({ type, onSave, onClose, initialData }: DataFormsProps) {
  // Form States initialized with initialData if editing
  const [companyForm, setCompanyForm] = useState({
    name: initialData?.name || '',
    contact: initialData?.contact || '',
    phone: initialData?.phone || '',
    address: initialData?.address || '',
    boss_name: initialData?.boss_name || '',
    boss_phone: initialData?.boss_phone || '',
    notes: initialData?.notes || '',
  });

  const [campForm, setCampForm] = useState({
    name: initialData?.name || '',
    location: initialData?.location || '',
    company: initialData?.company || '',
    boss_name: initialData?.boss_name || '',
    boss_phone: initialData?.boss_phone || '',
    workers: initialData?.workers !== undefined ? String(initialData.workers) : '',
    notes: initialData?.notes || '',
    category: initialData?.category || 'Construction',
    salaryDate: initialData?.salaryDate !== undefined ? String(initialData.salaryDate) : '27',
    region: initialData?.region || 'Muscat',
    landmark: initialData?.landmark || '',
    mapsLink: initialData?.mapsLink || '',
    latitude: initialData?.latitude as number | undefined,
    longitude: initialData?.longitude as number | undefined,
  });

  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleGenerateMapLinkFromAddress = () => {
    const queryParts = [campForm.location, campForm.landmark, campForm.region].filter(Boolean).map(s => s.trim()).filter(Boolean);
    if (queryParts.length === 0) {
      setLocationError("Please enter a location or landmark first to generate a Google Maps link.");
      return;
    }
    const query = queryParts.join(", ");
    const generatedLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    setCampForm((prev) => ({
      ...prev,
      mapsLink: generatedLink,
    }));
    setLocationError(null);
  };

  const handleShareCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    const onLocationSuccess = (position: GeolocationPosition) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const generatedLink = `https://www.google.com/maps?q=${lat},${lng}`;

      setCampForm((prev) => ({
        ...prev,
        latitude: lat,
        longitude: lng,
        mapsLink: generatedLink,
        location: prev.location.trim() ? prev.location : `GPS (${lat.toFixed(4)}, ${lng.toFixed(4)})`,
      }));
      setIsGettingLocation(false);
    };

    const onLocationError = (error: GeolocationPositionError) => {
      console.warn("High accuracy geolocation failed, trying standard accuracy...", error);
      // Fallback: retry with standard accuracy & longer timeout
      navigator.geolocation.getCurrentPosition(
        onLocationSuccess,
        (fallbackError) => {
          console.error("Geolocation error:", fallbackError);
          setIsGettingLocation(false);
          let userMsg = "Could not retrieve GPS location.";
          if (fallbackError.code === fallbackError.PERMISSION_DENIED) {
            userMsg = "Location access was denied by browser settings. You can type the location address below and click 'Generate Map Link'.";
          } else if (fallbackError.code === fallbackError.TIMEOUT) {
            userMsg = "GPS location timed out. Please enter address manually or click 'Generate Map Link'.";
          } else if (fallbackError.code === fallbackError.POSITION_UNAVAILABLE) {
            userMsg = "GPS position unavailable. Enter the location text and click 'Generate Map Link'.";
          }
          setLocationError(userMsg);
        },
        { enableHighAccuracy: false, timeout: 15000, maximumAge: 60000 }
      );
    };

    navigator.geolocation.getCurrentPosition(
      onLocationSuccess,
      onLocationError,
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
    );
  };

  const [customerForm, setCustomerForm] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || '',
    location: initialData?.location || '',
    type: initialData?.type || 'Individual',
    notes: initialData?.notes || '',
  });

  const [visitForm, setVisitForm] = useState({
    place: initialData?.place || '',
    type: initialData?.type || 'shop',
    people: initialData?.people !== undefined ? String(initialData.people) : '0',
    notes: initialData?.notes || '',
  });

  const [feedbackForm, setFeedbackForm] = useState({
    customer: initialData?.customer || '',
    type: initialData?.type || 'Positive',
    rating: initialData?.rating !== undefined ? String(initialData.rating) : '5',
    feedback: initialData?.feedback || '',
  });

  const [complaintForm, setComplaintForm] = useState({
    customer: initialData?.customer || '',
    category: initialData?.category || 'Service',
    status: initialData?.status || 'Open',
    description: initialData?.description || '',
  });

  const [competitorForm, setCompetitorForm] = useState({
    name: initialData?.name || '',
    strategy: initialData?.strategy || '',
    impact: initialData?.impact || 'Medium',
    notes: initialData?.notes || '',
  });

  const [socialForm, setSocialForm] = useState({
    platform: initialData?.platform || 'facebook',
    title: initialData?.title || '',
    budget: initialData?.budget !== undefined ? String(initialData.budget) : '',
    status: initialData?.status || 'Active',
    notes: initialData?.notes || '',
  });

  const [planForm, setPlanForm] = useState({
    title: initialData?.title || '',
    details: initialData?.details || '',
    budget: initialData?.budget !== undefined ? String(initialData.budget) : '',
    status: initialData?.status || 'Active',
  });

  const handleCompanySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyForm.name.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...companyForm,
    });
  };

  const handleCampSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!campForm.name.trim() || !campForm.location.trim() || !campForm.boss_name.trim() || !campForm.boss_phone.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...campForm,
      workers: parseInt(campForm.workers) || 0,
      salaryDate: campForm.salaryDate ? parseInt(campForm.salaryDate, 10) : undefined,
      category: campForm.category || undefined,
      region: campForm.region || undefined,
      landmark: campForm.landmark.trim() || undefined,
      mapsLink: campForm.mapsLink.trim() || undefined,
      latitude: campForm.latitude,
      longitude: campForm.longitude,
    });
  };

  const handleCustomerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerForm.name.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...customerForm,
    });
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!visitForm.place.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date, time: initialData.time } : {}),
      ...visitForm,
      people: parseInt(visitForm.people) || 0,
    });
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackForm.feedback.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...feedbackForm,
      rating: parseInt(feedbackForm.rating) || 5,
    });
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.customer.trim() || !complaintForm.description.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...complaintForm,
    });
  };

  const handleCompetitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!competitorForm.name.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...competitorForm,
    });
  };

  const handleSocialSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!socialForm.title.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...socialForm,
    });
  };

  const handlePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planForm.title.trim()) return;
    onSave({
      ...(initialData?.id ? { id: initialData.id, date: initialData.date } : {}),
      ...planForm,
    });
  };

  switch (type) {
    case 'company':
      return (
        <form onSubmit={handleCompanySubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Company Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Muscat Trading LLC"
              value={companyForm.name}
              onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Contact Person
              </label>
              <input
                type="text"
                placeholder="Manager / HR"
                value={companyForm.contact}
                onChange={(e) => setCompanyForm({ ...companyForm, contact: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 968xxxx"
                value={companyForm.phone}
                onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Address / Location
            </label>
            <input
              type="text"
              placeholder="e.g. Ruwi, Muscat"
              value={companyForm.address}
              onChange={(e) => setCompanyForm({ ...companyForm, address: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3 p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
            <div>
              <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                Camp Boss Name
              </label>
              <input
                type="text"
                placeholder="Name"
                value={companyForm.boss_name}
                onChange={(e) => setCompanyForm({ ...companyForm, boss_name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-indigo-700 uppercase tracking-wider mb-1">
                Camp Boss Phone
              </label>
              <input
                type="text"
                placeholder="Phone"
                value={companyForm.boss_phone}
                onChange={(e) => setCompanyForm({ ...companyForm, boss_phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Additional Notes
            </label>
            <textarea
              placeholder="Record promotions, employee count, or negotiation points..."
              value={companyForm.notes}
              onChange={(e) => setCompanyForm({ ...companyForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Save Company
            </button>
          </div>
        </form>
      );

    case 'camp':
      return (
        <form onSubmit={handleCampSubmit} className="space-y-4">
          {/* Camp Name & Associated Company */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Camp Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Ghala Camp A"
                value={campForm.name}
                onChange={(e) => setCampForm({ ...campForm, name: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Associated Company
              </label>
              <input
                type="text"
                placeholder="e.g. Al Hashar LLC"
                value={campForm.company}
                onChange={(e) => setCampForm({ ...campForm, company: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Category & Salary Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={campForm.category}
                onChange={(e) => setCampForm({ ...campForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Construction">Construction</option>
                <option value="Oil & Gas">Oil &amp; Gas</option>
                <option value="Facilities Management">Facilities Management</option>
                <option value="Cleaning Services">Cleaning Services</option>
                <option value="Manpower Supply">Manpower Supply</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Salary Date (Day of Month)
              </label>
              <select
                value={campForm.salaryDate}
                onChange={(e) => setCampForm({ ...campForm, salaryDate: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="">Not Specified</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                  let suffix = 'th';
                  if (day === 1 || day === 21 || day === 31) suffix = 'st';
                  else if (day === 2 || day === 22) suffix = 'nd';
                  else if (day === 3 || day === 23) suffix = 'rd';
                  return (
                    <option key={day} value={day}>
                      {day}{suffix} of month
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Location Details: Region, Address/Location, Landmark */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Region / Zone <span className="text-rose-500">*</span>
              </label>
              <select
                value={campForm.region}
                onChange={(e) => setCampForm({ ...campForm, region: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Barka">Barka</option>
                <option value="Muscat">Muscat</option>
                <option value="Sohar">Sohar</option>
                <option value="Buraimi">Buraimi</option>
                <option value="Nizwa">Nizwa</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Workers Count
              </label>
              <input
                type="number"
                placeholder="e.g. 250"
                value={campForm.workers}
                onChange={(e) => setCampForm({ ...campForm, workers: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location / Address <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="e.g. Ghala Industrial Area"
                value={campForm.location}
                onChange={(e) => setCampForm({ ...campForm, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Landmark
              </label>
              <input
                type="text"
                placeholder="e.g. Behind Lulu Hypermarket"
                value={campForm.landmark}
                onChange={(e) => setCampForm({ ...campForm, landmark: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* GPS Location Share & Maps Link */}
          <div className="space-y-2.5 p-3.5 bg-slate-50/90 rounded-2xl border border-slate-200/90">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[var(--gold,#C89B3C)]" strokeWidth={2.2} />
                <span>GPS Location &amp; Map Link</span>
              </label>
            </div>

            {/* Location Share Action Button or Status Confirmation */}
            {isGettingLocation ? (
              <div className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 text-xs font-bold animate-pulse">
                <Loader2 className="w-4 h-4 animate-spin text-[var(--gold,#C89B3C)]" />
                <span>Getting your location...</span>
              </div>
            ) : campForm.latitude !== undefined && campForm.longitude !== undefined ? (
              <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-xl space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600 shrink-0" strokeWidth={2.2} />
                    <div className="min-w-0">
                      <span className="text-xs font-extrabold text-emerald-950 block">GPS Coordinates Captured</span>
                      <span className="text-[11px] font-mono text-emerald-800 font-bold tracking-tight block truncate">
                        {campForm.latitude.toFixed(6)}, {campForm.longitude.toFixed(6)}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleShareCurrentLocation}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 bg-white hover:bg-emerald-100/50 px-2.5 py-1.5 rounded-lg border border-emerald-300/80 transition-colors cursor-pointer shrink-0 shadow-xs"
                  >
                    <RefreshCw className="w-3 h-3 text-emerald-700" strokeWidth={2} />
                    <span>Change Location</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleShareCurrentLocation}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-[var(--ink,#16213E)] hover:bg-[#1f2d52] text-white font-extrabold text-xs shadow-xs transition-all duration-200 active:scale-[0.99] cursor-pointer"
              >
                <Locate className="w-4 h-4 text-[var(--gold,#C89B3C)]" strokeWidth={2.2} />
                <span>Share Current Location</span>
              </button>
            )}

            {locationError && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" strokeWidth={2} />
                <span>{locationError}</span>
              </div>
            )}

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] font-semibold text-slate-500">
                  Google Maps Link {campForm.latitude !== undefined ? '(Auto-generated)' : '(Manual / Auto-link)'}
                </label>
                {campForm.location && !campForm.mapsLink && (
                  <button
                    type="button"
                    onClick={handleGenerateMapLinkFromAddress}
                    className="text-[10px] font-bold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    Auto-generate from Address
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="e.g. https://www.google.com/maps?q=23.588,58.382 or https://maps.app.goo.gl/..."
                  value={campForm.mapsLink}
                  onChange={(e) => setCampForm({ ...campForm, mapsLink: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-xs focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white"
                />
                {!campForm.mapsLink && (
                  <button
                    type="button"
                    onClick={handleGenerateMapLinkFromAddress}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shrink-0 cursor-pointer transition-colors"
                    title="Generate Google Maps link from entered location text"
                  >
                    Gen Link
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/50 rounded-xl border border-amber-100">
            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Camp Boss Name <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="Camp Boss"
                value={campForm.boss_name}
                onChange={(e) => setCampForm({ ...campForm, boss_name: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-amber-800 uppercase tracking-wider mb-1">
                Boss Phone <span className="text-rose-500">*</span>
              </label>
              <input
                required
                type="text"
                placeholder="968xxxx"
                value={campForm.boss_phone}
                onChange={(e) => setCampForm({ ...campForm, boss_phone: e.target.value })}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Camp Notes / Highlights
            </label>
            <textarea
              placeholder="e.g. Majority Bangladeshi/Indian workers. Best remittance timing: Friday afternoon."
              value={campForm.notes}
              onChange={(e) => setCampForm({ ...campForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Save Labor Camp
            </button>
          </div>
        </form>
      );

    case 'customer':
      return (
        <form onSubmit={handleCustomerSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Customer Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Full Name"
              value={customerForm.name}
              onChange={(e) => setCustomerForm({ ...customerForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. 968xxxx"
                value={customerForm.phone}
                onChange={(e) => setCustomerForm({ ...customerForm, phone: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="e.g. Seeb, Muscat"
                value={customerForm.location}
                onChange={(e) => setCustomerForm({ ...customerForm, location: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Segment Type
            </label>
            <select
              value={customerForm.type}
              onChange={(e) => setCustomerForm({ ...customerForm, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Individual">Individual Client</option>
              <option value="Business">Business Owner</option>
              <option value="Wholesale">Wholesale Remitter</option>
              <option value="Retail">Retail Walk-in</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Remarks
            </label>
            <textarea
              placeholder="e.g. Regularly remits 300 OMR monthly to India"
              value={customerForm.notes}
              onChange={(e) => setCustomerForm({ ...customerForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Save Customer
            </button>
          </div>
        </form>
      );

    case 'visit':
      return (
        <form onSubmit={handleVisitSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Location / Place Visited <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Galfar Labor Camp Seeb"
              value={visitForm.place}
              onChange={(e) => setVisitForm({ ...visitForm, place: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Type of Spot
              </label>
              <select
                value={visitForm.type}
                onChange={(e) => setVisitForm({ ...visitForm, type: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="shop">🛒 Retail / Shop</option>
                <option value="camp">🏕️ Labor Camp</option>
                <option value="crowd">👥 Public / Crowd Spot</option>
                <option value="company">🏢 Corporate Office</option>
                <option value="other">📍 Other Location</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Est. Crowd Size
              </label>
              <input
                type="number"
                placeholder="e.g. 50"
                value={visitForm.people}
                onChange={(e) => setVisitForm({ ...visitForm, people: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Field Observations
            </label>
            <textarea
              placeholder="e.g. Distributed 100 flyers. Great interest in BDT high exchange rate promotions."
              value={visitForm.notes}
              onChange={(e) => setVisitForm({ ...visitForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Log Visit
            </button>
          </div>
        </form>
      );

    case 'feedback':
      return (
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Customer Name / Account
              </label>
              <input
                type="text"
                placeholder="Anonymous / Named"
                value={feedbackForm.customer}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, customer: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Rating (1 to 5 Stars)
              </label>
              <select
                value={feedbackForm.rating}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, rating: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="5">⭐⭐⭐⭐⭐ Excellent (5)</option>
                <option value="4">⭐⭐⭐⭐ Good (4)</option>
                <option value="3">⭐⭐⭐ Neutral (3)</option>
                <option value="2">⭐⭐ Fair (2)</option>
                <option value="1">⭐ Poor (1)</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              General Vibe
            </label>
            <select
              value={feedbackForm.type}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, type: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="Positive">👍 Highly Satisfied / Positive</option>
              <option value="Neutral">😐 Indifferent / Neutral</option>
              <option value="Negative">👎 Unsatisfied / Negative</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Detailed Comments <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              placeholder="e.g. Customer extremely pleased with app speed but suggested lowering bank transfer transaction fee."
              value={feedbackForm.feedback}
              onChange={(e) => setFeedbackForm({ ...feedbackForm, feedback: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Save Feedback
            </button>
          </div>
        </form>
      );

    case 'complaint':
      return (
        <form onSubmit={handleComplaintSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Customer / Account Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="Customer Name"
              value={complaintForm.customer}
              onChange={(e) => setComplaintForm({ ...complaintForm, customer: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Category
              </label>
              <select
                value={complaintForm.category}
                onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Service">App / Digital Service</option>
                <option value="Product">Remittance Transit Error</option>
                <option value="Pricing">Exchange Rate Difference</option>
                <option value="Staff">Branch Staff Conduct</option>
                <option value="Other">Other Issues</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Resolution Status
              </label>
              <select
                value={complaintForm.status}
                onChange={(e) => setComplaintForm({ ...complaintForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Open">🔴 Open / Urgent</option>
                <option value="In Progress">🟡 Processing</option>
                <option value="Resolved">🟢 Settled / Resolved</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Description of Complaint <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              placeholder="Provide a highly explicit explanation of the incident..."
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-24 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              File Complaint
            </button>
          </div>
        </form>
      );

    case 'competitor':
      return (
        <form onSubmit={handleCompetitorSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Competitor Name <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Western Union / LuLu Exchange"
              value={competitorForm.name}
              onChange={(e) => setCompetitorForm({ ...competitorForm, name: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Observed Strategy / Promotion <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Zero-fee remittance weekend promotion for PKR corridor"
              value={competitorForm.strategy}
              onChange={(e) => setCompetitorForm({ ...competitorForm, strategy: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Our Threat Level / Impact
            </label>
            <select
              value={competitorForm.impact}
              onChange={(e) => setCompetitorForm({ ...competitorForm, impact: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="High">🔥 Extremely High Threat</option>
              <option value="Medium">⚠️ Moderate Impact</option>
              <option value="Low">💡 Low / Informational</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              placeholder="Detail actions we should take to counter..."
              value={competitorForm.notes}
              onChange={(e) => setCompetitorForm({ ...competitorForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Save Intel
            </button>
          </div>
        </form>
      );

    case 'social':
      return (
        <form onSubmit={handleSocialSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Platform <span className="text-rose-500">*</span>
              </label>
              <select
                value={socialForm.platform}
                onChange={(e) => setSocialForm({ ...socialForm, platform: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="facebook">📘 Facebook</option>
                <option value="instagram">📸 Instagram</option>
                <option value="tiktok">🎵 TikTok</option>
                <option value="youtube">▶️ YouTube</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Campaign Status
              </label>
              <select
                value={socialForm.status}
                onChange={(e) => setSocialForm({ ...socialForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">🟢 Active</option>
                <option value="Pending">🟡 Scheduled</option>
                <option value="Completed">⚪ Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Campaign Ad Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Eid Al Fitr Remittance Mega Prize Campaign"
              value={socialForm.title}
              onChange={(e) => setSocialForm({ ...socialForm, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Ad Budget (OMR)
            </label>
            <input
              type="text"
              placeholder="e.g. 350 OMR"
              value={socialForm.budget}
              onChange={(e) => setSocialForm({ ...socialForm, budget: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Audience / Target Corridor Details
            </label>
            <textarea
              placeholder="Targeting South Asian labor expats in Ghala / Seeb area, age group 25-50."
              value={socialForm.notes}
              onChange={(e) => setSocialForm({ ...socialForm, notes: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-20 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-900 hover:from-blue-900 hover:to-indigo-800 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Create Campaign
            </button>
          </div>
        </form>
      );

    case 'plan':
      return (
        <form onSubmit={handlePlanSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Plan Title <span className="text-rose-500">*</span>
            </label>
            <input
              required
              type="text"
              placeholder="e.g. Q3 Labor Camps Outreach Initiative"
              value={planForm.title}
              onChange={(e) => setPlanForm({ ...planForm, title: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Estimated Budget
              </label>
              <input
                type="text"
                placeholder="e.g. 1,500 OMR"
                value={planForm.budget}
                onChange={(e) => setPlanForm({ ...planForm, budget: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
                Initial Status
              </label>
              <select
                value={planForm.status}
                onChange={(e) => setPlanForm({ ...planForm, status: e.target.value })}
                className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm bg-white focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="Active">🟢 Active / Implementing</option>
                <option value="Pending">🟡 Under Consideration</option>
                <option value="On Hold">⏸️ Suspended / On Hold</option>
                <option value="Completed">⚪ Archived / Completed</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              Detailed Deliverables &amp; Objectives <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              placeholder="Describe tasks, locations, agents involved, and expected remittance volume goals..."
              value={planForm.details}
              onChange={(e) => setPlanForm({ ...planForm, details: e.target.value })}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 h-32"
            />
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm cursor-pointer hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-bold text-sm shadow-md cursor-pointer transition-colors"
            >
              Formulate Plan
            </button>
          </div>
        </form>
      );

    default:
      return null;
  }
}
