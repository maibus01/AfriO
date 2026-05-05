import { useState, useEffect } from "react";
import { Plus, User, Save, X, Trash2, ChevronRight } from "lucide-react";
import API from "../api/User"; // Your Axios instance

interface MeasurementData {
  _id?: string;
  label: string;
  upperBody: Record<string, number>;
  lowerBody: Record<string, number>;
  extras: Record<string, number>;
}

const MeasurementManager = () => {
  const [profiles, setProfiles] = useState<MeasurementData[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeProfile, setActiveProfile] = useState<MeasurementData | null>(null);

  const emptyProfile: MeasurementData = {
    label: "",
    upperBody: {},
    lowerBody: {},
    extras: {},
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const res = await API.get("/measurements");
      setProfiles(res.data.data || []);
    } catch (err) {
      console.error("Fetch error", err);
    }
  };

  const handleOpenModal = (profile: MeasurementData | null = null) => {
    setActiveProfile(profile || { ...emptyProfile });
    setIsModalOpen(true);
  };

 const handleInputChange = (section: string, field: string, value: string) => {
  if (!activeProfile || section === "label") return;

  // Ensure we are only touching the nested object sections
  const targetSection = section as "upperBody" | "lowerBody" | "extras";

  setActiveProfile({
    ...activeProfile,
    [targetSection]: {
      ...(activeProfile[targetSection] || {}),
      [field]: value === "" ? undefined : Number(value),
    },
  });
};

  const handleSave = async () => {
    if (!activeProfile?.label) return alert("Please add a label");
    setLoading(true);
    try {
      if (activeProfile._id) {
        // UPDATE
        const res = await API.patch(`/measurements/${activeProfile._id}`, activeProfile);
        setProfiles((prev) => prev.map((p) => (p._id === activeProfile._id ? res.data.data : p)));
      } else {
        // CREATE
        const res = await API.post("/measurements", activeProfile);
        setProfiles((prev) => [res.data.data, ...prev]);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this profile?")) return;
    try {
      await API.delete(`/measurements/${id}`);
      setProfiles((prev) => prev.filter((p) => p._id !== id));
      setIsModalOpen(false);
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <section className="bg-slate-50 min-h-screen py-12 px-6">
      <div className="max-w-4xl mx-auto">
        {/* HEADER */}
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-serif font-bold text-slate-900">Measurement Locker</h2>
            <p className="text-slate-500 text-sm">Manage personal sizing profiles</p>
          </div>
          <button
            onClick={() => handleOpenModal()}
            className="bg-slate-900 text-white p-3 rounded-full hover:bg-orange-600 transition-all shadow-lg"
          >
            <Plus size={20} />
          </button>
        </div>

        {/* PROFILE LIST */}
        <div className="grid gap-3">
          {profiles.map((p) => (
            <div
              key={p._id}
              onClick={() => handleOpenModal(p)}
              className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between cursor-pointer hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-orange-50 group-hover:text-orange-600">
                  <User size={20} />
                </div>
                <span className="font-semibold text-slate-700">{p.label}</span>
              </div>
              <ChevronRight size={18} className="text-slate-300 group-hover:text-orange-500" />
            </div>
          ))}
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && activeProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="flex-1">
                <input
                  className="text-xl font-bold border-none outline-none focus:ring-0 w-full placeholder:text-slate-300"
                  placeholder="Profile Name (e.g. John's Suit)"
                  value={activeProfile.label}
                  onChange={(e) => setActiveProfile({ ...activeProfile, label: e.target.value })}
                />
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 ml-4">
                <X size={24} />
              </button>
            </div>

            {/* Modal Body (Scrollable) */}
            <div className="p-6 overflow-y-auto space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <FormSection
                  title="Upper Body"
                  fields={["neck", "chest", "waist", "shoulder", "sleeveLength", "shirtLength"]}
                  data={activeProfile.upperBody}
                  onUpdate={(f, v) => handleInputChange("upperBody", f, v)}
                />
                <FormSection
                  title="Lower Body"
                  fields={["waist", "hip", "inseam", "outseam", "thigh", "knee"]}
                  data={activeProfile.lowerBody}
                  onUpdate={(f, v) => handleInputChange("lowerBody", f, v)}
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 border-t bg-slate-50 flex justify-between items-center">
              {activeProfile._id ? (
                <button
                  onClick={() => handleDelete(activeProfile._id!)}
                  className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                >
                  <Trash2 size={20} />
                </button>
              ) : <div />}
              
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-2 bg-orange-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-900 transition-all disabled:opacity-50"
              >
                <Save size={18} />
                {loading ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

const FormSection = ({ title, fields, data, onUpdate }: any) => (
  <div className="space-y-4">
    <h4 className="text-[11px] font-bold uppercase tracking-widest text-slate-400 border-b pb-2">{title}</h4>
    <div className="grid grid-cols-2 gap-4">
      {fields.map((field: string) => (
        <div key={field} className="flex flex-col gap-1">
          <label className="text-[10px] font-medium text-slate-500 uppercase">{field}</label>
          <input
            type="number"
            className="border border-slate-200 rounded-lg p-2 text-sm focus:border-orange-500 outline-none transition-colors bg-slate-50/50"
            value={data[field] || ""}
            onChange={(e) => onUpdate(field, e.target.value)}
          />
        </div>
      ))}
    </div>
  </div>
);

export default MeasurementManager;