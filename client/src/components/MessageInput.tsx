import { useState } from "react";
import { Send } from "lucide-react";

export default function MessageInput({ onSend }: any) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  return (
    <div className="p-4 border-t flex gap-2">
      <input
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="flex-1 border px-3 py-2"
        placeholder="Type message..."
      />
      <button onClick={handleSend} className="bg-orange-500 text-white px-4">
        <Send size={16} />
      </button>
    </div>
  );
}