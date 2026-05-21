import { useState, useEffect } from "react";
import { Plus, User, Save, X, Trash2, ChevronRight, AlertCircle, ArrowRight } from "lucide-react";
import API from "../api/User"; 

interface MeasurementData {
  _id?: string;
  label: string;
  upperBody: Record<string, number | string | undefined>;
  lowerBody: Record<string, number | string | undefined>;
  extras: Record<string, number | string | undefined>;
}

const UPPER_FIELDS = ["neck", "chest", "waist", "shoulder", "sleeveLength", "shirtLength"];
const LOWER_FIELDS = ["waist", "hip", "inseam", "outseam", "thigh", "knee"];

const MeasurementManager = () => {
  const [profiles, setProfiles] = useState<MeasurementData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [step, setStep] = useState(1); // 1: Name, 2: Measurements
  const [loading, setLoading] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false);
  const [activeProfile, setActiveProfile] = useState<MeasurementData | null>(null);

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const res = await API.get("/measurements");
      setProfiles(res.data.data || []);
    } catch (err) { console.error("Fetch error", err); }
  };

  const isFormValid = () => {
    if (!activeProfile?.label.trim()) return false;
    const upperValid = UPPER_FIELDS.every(f => activeProfile.upperBody[f] !== undefined && activeProfile.upperBody[f] !== "");
    const lowerValid = LOWER_FIELDS.every(f => activeProfile.lowerBody[f] !== undefined && activeProfile.lowerBody[f] !== "");
    return upperValid && lowerValid;
  };

  const handleOpenModal = (profile: MeasurementData | null = null) => {
    setActiveProfile(profile || { label: "", upperBody: {}, lowerBody: {}, extras: {} });
    setStep(profile ? 2 : 1); // Go straight to measurements if editing
    setAttemptedSave(false);
    setIsModalOpen(true);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setStep(1);
    document.body.style.overflow = 'unset';
  };

  const handleInputChange = (section: "upperBody" | "lowerBody", field: string, value: string) => {
    if (!activeProfile) return;
    setActiveProfile({
      ...activeProfile,
      [section]: { ...activeProfile[section], [field]: value === "" ? "" : Number(value) },
    });
  };

  const handleSave = async () => {
    setAttemptedSave(true);
    if (!isFormValid()) return;
    
    setLoading(true);
    try {
      if (activeProfile?._id) {
        const res = await API.patch(`/measurements/${activeProfile._id}`, activeProfile);
        setProfiles(prev => prev.map(p => (p._id === activeProfile._id ? res.data.data : p)));
      } else {
        const res = await API.post("/measurements", activeProfile);
        setProfiles(prev => [res.data.data, ...prev]);
      }
      closeModal();
    } catch (err) { console.error("Save failed", err); } 
    finally { setLoading(false); }
  };

  return (
    <section className="bg-slate-50 min-h-screen pt-24 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Locker</h2>
            <p className="text-slate-500 font-medium">Measurement Profiles</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-orange-600 hover:bg-slate-900 text-white p-4 rounded-2xl transition-all shadow-xl active:scale-95">
            <Plus size={28} strokeWidth={3} />
          </button>
        </header>

        {/* List View */}
        <div className="grid gap-4">
          {profiles.map((p) => (
            <div key={p._id} onClick={() => handleOpenModal(p)} className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:shadow-lg transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-600">
                  <User size={24} />
                </div>
                <span className="text-lg font-bold text-slate-800">{p.label}</span>
              </div>
              <ChevronRight size={20} className="text-slate-200 group-hover:text-orange-500" />
            </div>
          ))}
        </div>
      </div>

      {/* MODAL FLOW */}
      {isModalOpen && activeProfile && (
        <div className="fixed inset-0 z-[100] flex flex-col bg-slate-900/60 backdrop-blur-md md:items-center md:justify-center md:p-6">
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-[40px] shadow-2xl flex flex-col animate-in slide-in-from-bottom-full duration-300">
            
            {/* Modal Header */}
            <div className="pt-16 pb-6 px-6 md:pt-10 md:px-10 flex justify-between items-center">
              <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">
                {step === 1 ? "New Profile" : activeProfile.label}
              </h3>
              <button onClick={closeModal} className="bg-slate-100 text-slate-500 p-2 rounded-full">
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 md:p-10">
              {/* STEP 1: NAME INPUT */}
              {step === 1 ? (
                <div className="py-10 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-orange-600 uppercase tracking-[0.2em] ml-1">Profile Name</label>
                    <input
                      autoFocus
                      className={`text-3xl font-bold border-b-4 outline-none transition-all w-full bg-transparent py-4 ${
                        attemptedSave && !activeProfile.label ? "border-red-500 text-red-900" : "border-slate-100 focus:border-orange-500 text-slate-900"
                      }`}
                      placeholder="e.g. John's Tuxedo"
                      value={activeProfile.label}
                      onChange={(e) => setActiveProfile({ ...activeProfile, label: e.target.value })}
                    />
                  </div>
                  <p className="text-slate-400 font-medium">Give this profile a name to keep track of these measurements.</p>
                </div>
              ) : (
                /* STEP 2: MEASUREMENTS */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 animate-in fade-in slide-in-from-right-10 duration-500">
                  <FormSection
                    title="Upper Body"
                    fields={UPPER_FIELDS}
                    data={activeProfile.upperBody}
                    attemptedSave={attemptedSave}
                    onUpdate={(f, v) => handleInputChange("upperBody", f, v)}
                  />
                  <FormSection
                    title="Lower Body"
                    fields={LOWER_FIELDS}
                    data={activeProfile.lowerBody}
                    attemptedSave={attemptedSave}
                    onUpdate={(f, v) => handleInputChange("lowerBody", f, v)}
                  />
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className="p-6 md:p-8 border-t border-slate-50 bg-white safe-bottom">
              {step === 1 ? (
                <button
                  onClick={() => activeProfile.label ? setStep(2) : setAttemptedSave(true)}
                  className="w-full flex items-center justify-center gap-3 py-6 rounded-3xl font-black text-xl bg-slate-900 text-white shadow-2xl active:scale-95 transition-all"
                >
                  Start Measuring <ArrowRight size={24} />
                </button>
              ) : (
                <div className="flex gap-4">
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-lg transition-all ${
                      isFormValid() ? "bg-slate-900 text-white shadow-xl" : "bg-red-50 text-red-400 border-2 border-red-100"
                    }`}
                  >
                    {loading ? "..." : <><Save size={22} /> {isFormValid() ? "Save Profile" : "Missing Fields"}</>}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const FormSection = ({ title, fields, data, onUpdate, attemptedSave }: any) => (
  <div className="space-y-6">
    <h4 className="text-xs font-black uppercase tracking-[0.2em] text-orange-600 flex items-center gap-2">
      <span className="w-8 h-[2px] bg-orange-600 rounded-full"></span> {title}
    </h4>
    <div className="grid grid-cols-2 gap-4">
      {fields.map((field: string) => {
        const isMissing = attemptedSave && (data[field] === undefined || data[field] === "");
        return (
          <div key={field} className="flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase ml-1 ${isMissing ? "text-red-500" : "text-slate-400"}`}>
              {field}
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                className={`w-full rounded-xl p-4 text-sm font-bold outline-none transition-all border-2 ${
                  isMissing 
                    ? "border-red-200 bg-red-50 text-red-900" 
                    : "border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500"
                }`}
                value={data[field] || ""}
                onChange={(e) => onUpdate(field, e.target.value)}
              />
              {isMissing && <AlertCircle size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-red-400" />}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

export default MeasurementManager;