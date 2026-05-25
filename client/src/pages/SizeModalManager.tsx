import { useState, useEffect } from "react";
function SizeModalManager({ savedData, onClose, onSave }: any) {
  const [input, setInput] = useState<string>(savedData?.join(", ") || "");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/50 backdrop-blur-md p-4">
      <div className="bg-white dark:bg-zinc-900 w-full max-w-md p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-xl">
        <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-50 mb-2">Configure Sizes</h3>
        <input 
          type="text" 
          value={input} 
          onChange={(e) => setInput(e.target.value)} 
          placeholder="S, M, L, XL (comma separated)" 
          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 h-9 px-3 rounded-lg text-xs dark:text-zinc-100 focus:outline-none mb-4"
        />
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:bg-zinc-100 rounded-lg">Cancel</button>
          <button 
            onClick={() => onSave(input.split(",").map((s: string) => s.trim()).filter(Boolean))} 
            className="px-3 py-1.5 text-xs font-semibold bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded-lg"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

export default SizeModalManager