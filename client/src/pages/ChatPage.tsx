import { useNavigate, useLocation } from "react-router-dom";
import { MessageSquare, ArrowLeft, Send, ShieldCheck, Copy, Check } from "lucide-react";
import { useState } from "react";

const ChatRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [copied, setCopied] = useState(false);

  // Get IDs from navigation state (passed from RequestManager)
  const requestId = location.state?.requestId || "N/A";
  const styleId = location.state?.styleId || "N/A";

  const WHATSAPP_NUMBER = "2348000000000"; // 👈 Replace with your real company number
  const COMPANY_NAME = "AFRIO";

  const message = `Hello ${COMPANY_NAME}, I'd like to discuss my order.\n\nOrder ID: ${requestId}\nStyle ID: ${styleId}\n\nI have a question about...`;
  
  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(requestId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-white min-h-screen flex flex-col items-center justify-center p-6">
      {/* BACK BUTTON */}
      <button 
        onClick={() => navigate(-1)}
        className="absolute top-8 left-8 p-3 hover:bg-slate-50 rounded-full transition-colors"
      >
        <ArrowLeft size={24} className="text-slate-900" />
      </button>

      <div className="max-w-md w-full text-center">
        {/* ICON */}
        <div className="w-20 h-20 bg-green-50 rounded-[2rem] flex items-center justify-center mx-auto mb-8">
          <MessageSquare size={40} className="text-green-600" />
        </div>

        {/* TEXT */}
        <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-3">
          Direct Support
        </h2>
        <p className="text-slate-500 font-medium mb-10 leading-relaxed">
          To ensure the fastest response, we handle all custom tailoring chats via our 
          <span className="text-green-600 font-bold"> Verified WhatsApp</span> line.
        </p>

        {/* INFO CARD */}
        <div className="bg-slate-50 rounded-[2.5rem] p-6 mb-10 border border-slate-100 text-left">
          <div className="flex justify-between items-center mb-4">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tracking Details</p>
            <ShieldCheck size={16} className="text-blue-500" />
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center bg-white p-3 rounded-2xl border border-slate-100">
              <div>
                <p className="text-[9px] text-slate-400 font-bold uppercase">Order Reference</p>
                <p className="text-sm font-black text-slate-900">{requestId}</p>
              </div>
              <button onClick={handleCopy} className="text-slate-400 hover:text-slate-900 transition-colors">
                {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
              </button>
            </div>
          </div>
        </div>

        {/* WHATSAPP BUTTON */}
        <a 
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white py-5 rounded-[2rem] font-black uppercase text-sm tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-green-100 transition-all active:scale-[0.98]"
        >
          <Send size={18} /> Continue to WhatsApp
        </a>

        <p className="mt-8 text-[10px] text-slate-300 font-bold uppercase tracking-widest">
          Average response time: 15-30 minutes
        </p>
      </div>
    </div>
  );
};

export default ChatRedirect;