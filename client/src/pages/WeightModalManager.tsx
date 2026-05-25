import { useState, useEffect } from "react";


function WeightModalManager({ savedData, onClose, onSave }: any) {
  const [gross, setGross] = useState(savedData?.grossWeight || "");
  const [net, setNet] = useState(savedData?.netWeight || "");
  const [unit, setUnit] = useState(savedData?.unit || "kg");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50">Configure Weight</h3>
        <div className="grid grid-cols-3 gap-2">
          <input type="number" placeholder="Gross" value={gross} onChange={e => setGross(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" />
          <input type="number" placeholder="Net" value={net} onChange={e => setNet(e.target.value)} className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none" />
          <select value={unit} onChange={e => setUnit(e.target.value)} className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-2 rounded-lg text-xs dark:text-zinc-100 focus:outline-none">
            <option value="kg">KG</option>
            <option value="g">G</option>
            <option value="lb">LB</option>
          </select>
        </div>
        <div className="flex gap-2 justify-end pt-2">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded-lg">Cancel</button>
          <button onClick={() => onSave({ grossWeight: gross, netWeight: net, unit })} className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-lg">Save</button>
        </div>
      </div>
    </div>
  );
}

export default WeightModalManager