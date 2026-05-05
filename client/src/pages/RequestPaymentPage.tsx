import { useLocation, useNavigate } from "react-router-dom";
import {
    ArrowLeft, Copy, Check, MessageCircle,
    CreditCard, Loader2, ShieldCheck, ShoppingBag
} from "lucide-react";
import { useEffect, useState } from "react";
import API from "../api/User";

const RequestPaymentPage = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    const request = state?.request;

    const [accounts, setAccounts] = useState<any[]>([]);
    const [selectedAccount, setSelectedAccount] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const res = await API.get("/accounts");
                const data = res.data.data || res.data.accounts || [];
                setAccounts(data);
                if (data.length > 0) setSelectedAccount(data[0]);
            } catch (err) {
                console.error("Failed to load payment accounts", err);
            } finally {
                setLoading(false);
            }
        };

        if (request) fetchAccounts();
    }, [request]);

    const copyToClipboard = () => {
        if (!selectedAccount) return;
        navigator.clipboard.writeText(selectedAccount.accountNumber);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const sendWhatsApp = () => {
        if (!selectedAccount || !request) return;

        const message = encodeURIComponent(
            `🧵 *TAILOR PAYMENT RECEIPT*\n\n` +
            `*Style:* ${request.styleId?.title || "Custom Order"}\n` +
            `*Amount:* ₦${request.finalPrice?.toLocaleString()}\n\n` +
            `*Payment To:* ${selectedAccount.bankName}\n` +
            `*Note:* I have made the transfer. Please confirm my order.`
        );

        const phone = request.businessId?.phone || "2348000000000";
        window.open(`https://wa.me/${phone.replace(/\D/g, "")}?text=${message}`, "_blank");
    };

    if (!request) {
        return (
            <div className="h-screen flex flex-col items-center justify-center p-6 text-center">
                <ShoppingBag size={48} className="text-slate-200 mb-4" />
                <p className="font-black text-slate-400 uppercase text-xs">No active request</p>
                <button onClick={() => navigate(-1)} className="mt-4 text-orange-600 font-bold">Go Back</button>
            </div>
        );
    }

    return (
        <div className="bg-[#fafafa] min-h-screen pb-24">
            {/* HEADER */}
            <div className="p-6 flex items-center gap-4 bg-white border-b sticky top-0 z-10">
                <button onClick={() => navigate(-1)}><ArrowLeft size={22} /></button>
                <h1 className="font-black text-lg">Payment</h1>
            </div>

            <div className="max-w-xl mx-auto p-5 space-y-5">

                {/* PRICE SUMMARY */}
                <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Style</p>
                            <h3 className="font-bold text-slate-800">{request.styleId?.title || "Custom Design"}</h3>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                            <p className="text-xl font-black text-orange-600">₦{request.finalPrice?.toLocaleString()}</p>
                        </div>
                    </div>
                </div>

                {/* ACCOUNT LIST */}
                <div className="space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Select Payment Method</p>
                    {loading ? (
                        <div className="flex justify-center p-10"><Loader2 className="animate-spin text-slate-300" /></div>
                    ) : (
                        accounts.map((acc) => (
                            <div
                                key={acc._id}
                                onClick={() => setSelectedAccount(acc)}
                                className={`p-4 bg-white border-2 rounded-2xl transition-all cursor-pointer ${selectedAccount?._id === acc._id ? "border-orange-500 shadow-md" : "border-transparent opacity-60"
                                    }`}
                            >
                                <div className="flex justify-between items-center">
                                    <p className="font-bold text-slate-800">{acc.bankName}</p>
                                    {selectedAccount?._id === acc._id && <div className="w-4 h-4 bg-orange-500 rounded-full border-4 border-orange-100" />}
                                </div>
                                <p className="text-sm text-slate-600">{acc.accountNumber}</p>
                            </div>
                        ))
                    )}
                </div>

                {/* DARK CARD UI */}
                {selectedAccount && (
                    <div className="bg-slate-900 rounded-[32px] p-8 text-white relative overflow-hidden shadow-2xl">
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-8">
                                <CreditCard className="text-slate-700" size={32} />
                                <ShieldCheck className="text-green-400" size={24} />
                            </div>

                            <p className="text-xs opacity-50 uppercase tracking-tighter mb-1">Account Number</p>
                            <div className="flex items-center gap-4 mb-6">
                                <h2 className="text-3xl font-black tracking-tight">{selectedAccount.accountNumber}</h2>
                                <button onClick={copyToClipboard} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                                    {copied ? <Check size={18} className="text-green-400" /> : <Copy size={18} />}
                                </button>
                            </div>

                            <div className="flex justify-between border-t border-white/10 pt-4">
                                <div>
                                    <p className="text-[10px] opacity-50 uppercase">Bank</p>
                                    <p className="font-bold text-sm">{selectedAccount.bankName}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] opacity-50 uppercase">Account Name</p>
                                    <p className="font-bold text-sm truncate max-w-[150px]">{selectedAccount.accountName}</p>
                                </div>
                            </div>
                        </div>
                        {/* Design Element blur */}
                        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl" />
                    </div>
                )}

                {/* SECURE INFO BOX */}
                <div className="p-4 bg-orange-50 rounded-2xl flex gap-3 items-start">
                    <div className="p-2 bg-orange-100 rounded-lg text-orange-600"><ShieldCheck size={18} /></div>
                    <p className="text-xs text-orange-800 leading-relaxed">
                        <b>Secure Order:</b> Transfer the exact amount shown above, then click the button below to send your receipt on WhatsApp for confirmation.
                    </p>
                </div>
            </div>

            {/* FIXED FOOTER BUTTON */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-md border-t border-slate-100">
                <button
                    onClick={sendWhatsApp}
                    disabled={!selectedAccount}
                    className="max-w-xl mx-auto w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-3 transition-transform active:scale-[0.98] disabled:bg-slate-300 shadow-lg shadow-green-200"
                >
                    <MessageCircle size={20} fill="currentColor" />
                    SEND PAYMENT RECEIPT
                </button>
            </div>
        </div>
    );
};

export default RequestPaymentPage;