import { useState, useEffect } from "react";
import { Plus, User, Save, X, Trash2, ChevronRight, AlertCircle } from "lucide-react";
import API from "../api/User"; 

interface MeasurementData {
  _id?: string;
  label: string;
  upperBody: Record<string, number | undefined>;
  lowerBody: Record<string, number | undefined>;
  extras: Record<string, number | undefined>;
}

const UPPER_FIELDS = ["neck", "chest", "waist", "shoulder", "sleeveLength", "shirtLength"];
const LOWER_FIELDS = ["waist", "hip", "inseam", "outseam", "thigh", "knee"];

const MeasurementManager = () => {
  const [profiles, setProfiles] = useState<MeasurementData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [attemptedSave, setAttemptedSave] = useState(false); // Track if user tried to save
  const [activeProfile, setActiveProfile] = useState<MeasurementData | null>(null);

  useEffect(() => { fetchProfiles(); }, []);

  const fetchProfiles = async () => {
    try {
      const res = await API.get("/measurements");
      setProfiles(res.data.data || []);
    } catch (err) { console.error("Fetch error", err); }
  };

  // Validation Logic: Checks if label and ALL fields in both sections are filled
  const isFormValid = () => {
    if (!activeProfile?.label.trim()) return false;
    const upperValid = UPPER_FIELDS.every(f => activeProfile.upperBody[f] !== undefined && activeProfile.upperBody[f] !== null);
    const lowerValid = LOWER_FIELDS.every(f => activeProfile.lowerBody[f] !== undefined && activeProfile.lowerBody[f] !== null);
    return upperValid && lowerValid;
  };

  const handleOpenModal = (profile: MeasurementData | null = null) => {
    setActiveProfile(profile || { label: "", upperBody: {}, lowerBody: {}, extras: {} });
    setAttemptedSave(false);
    setIsModalOpen(true);
  };

  const handleInputChange = (section: "upperBody" | "lowerBody", field: string, value: string) => {
    if (!activeProfile) return;
    setActiveProfile({
      ...activeProfile,
      [section]: { ...activeProfile[section], [field]: value === "" ? undefined : Number(value) },
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
      setIsModalOpen(false);
    } catch (err) { console.error("Save failed", err); } 
    finally { setLoading(false); }
  };

  return (
    <section className="bg-slate-50 min-h-screen pt-28 pb-20 px-4 md:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-serif font-black text-slate-900 tracking-tight">Measurement Locker</h2>
            <p className="text-slate-500 font-medium">Your digital tailoring profiles</p>
          </div>
          <button onClick={() => handleOpenModal()} className="bg-orange-600 hover:bg-slate-900 text-white p-4 rounded-2xl transition-all shadow-xl shadow-orange-200 active:scale-95">
            <Plus size={28} strokeWidth={3} />
          </button>
        </header>

        <div className="grid gap-4">
          {profiles.map((p) => (
            <div key={p._id} onClick={() => handleOpenModal(p)} className="bg-white border border-slate-100 p-6 rounded-3xl flex items-center justify-between cursor-pointer hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all group">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600 transition-colors">
                  <User size={28} />
                </div>
                <span className="text-lg font-bold text-slate-800">{p.label}</span>
              </div>
              <ChevronRight size={24} className="text-slate-200 group-hover:text-orange-500" />
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && activeProfile && (
        <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-slate-900/40 backdrop-blur-md md:p-6">
          <div className="bg-white w-full max-w-2xl md:rounded-[40px] shadow-2xl flex flex-col h-[92vh] md:h-auto md:max-h-[85vh] animate-in fade-in slide-in-from-bottom-10 duration-300">
            
            <div className="p-6 md:p-8 border-b border-slate-50 flex justify-between items-center">
              <div className="flex-1">
                <input
                  className={`text-2xl font-bold border-b-2 outline-none transition-all w-full bg-transparent ${
                    attemptedSave && !activeProfile.label ? "border-red-500 text-red-900" : "border-transparent focus:border-orange-500 text-slate-900"
                  }`}
                  placeholder="Profile Name..."
                  value={activeProfile.label}
                  onChange={(e) => setActiveProfile({ ...activeProfile, label: e.target.value })}
                />
              </div>
              <button onClick={() => setIsModalOpen(false)} className="bg-slate-50 text-slate-400 p-2 rounded-full hover:bg-red-50 hover:text-red-500 transition-colors ml-4">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 md:p-10 overflow-y-auto space-y-12">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
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
            </div>

            <div className="p-6 md:p-8 border-t border-slate-50 flex gap-4 items-center bg-slate-50/50">
              {activeProfile._id && (
                <button onClick={() => API.delete(`/measurements/${activeProfile._id}`)} className="text-slate-300 hover:text-red-500 p-4 transition-colors">
                  <Trash2 size={24} />
                </button>
              )}
              
              <button
                onClick={handleSave}
                disabled={loading}
                className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-3xl font-black text-lg transition-all shadow-xl shadow-orange-100 ${
                  isFormValid() ? "bg-slate-900 text-white hover:bg-orange-600" : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {loading ? "..." : <><Save size={22} /> Save Measurement</>}
              </button>
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
          <div key={field} className="group flex flex-col gap-2">
            <label className={`text-[10px] font-black uppercase ml-1 transition-colors ${isMissing ? "text-red-500" : "text-slate-400 group-focus-within:text-orange-500"}`}>
              {field}
            </label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                className={`w-full rounded-2xl p-4 text-sm font-bold outline-none transition-all border-2 ${
                  isMissing 
                    ? "border-red-100 bg-red-50 text-red-900 shadow-inner" 
                    : "border-slate-100 bg-slate-50/50 focus:bg-white focus:border-orange-500 focus:shadow-lg focus:shadow-orange-100"
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