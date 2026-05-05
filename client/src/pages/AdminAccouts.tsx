import { useEffect, useState } from "react";
import API from "../api/User";

const AdminAccounts = () => {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    bankName: "",
    accountNumber: "",
    accountName: "",
  });
  const [editingId, setEditingId] = useState<string | null>(null);

  // =============================
  // FETCH ACCOUNTS
  // =============================
  const fetchAccounts = async () => {
    try {
      const res = await API.get("/accounts");
      setAccounts(res.data.accounts || []);
    } catch (err) {
      console.error("Failed to fetch accounts", err);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  // =============================
  // HANDLE INPUT
  // =============================
  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // =============================
  // CREATE OR UPDATE
  // =============================
  const handleSubmit = async () => {
    try {
      if (!form.bankName || !form.accountNumber || !form.accountName) {
        return alert("All fields required");
      }

      if (editingId) {
        // ✏️ UPDATE
        await API.put(`/accounts/${editingId}`, form);
      } else {
        // ➕ CREATE
        await API.post("/accounts", form);
      }

      setForm({ bankName: "", accountNumber: "", accountName: "" });
      setEditingId(null);
      fetchAccounts();

    } catch (err) {
      alert("Failed to save account");
    }
  };

  // =============================
  // EDIT
  // =============================
  const handleEdit = (acc: any) => {
    setForm({
      bankName: acc.bankName,
      accountNumber: acc.accountNumber,
      accountName: acc.accountName,
    });
    setEditingId(acc._id);
  };

  // =============================
  // DELETE (SOFT)
  // =============================
  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this account?")) return;

    try {
      await API.delete(`/accounts/${id}`);
      fetchAccounts();
    } catch (err) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">

      <h1 className="text-2xl font-black mb-6">
        Payment Accounts
      </h1>

      {/* ================= FORM ================= */}
      <div className="bg-white p-6 rounded-xl shadow mb-6">
        <h2 className="font-bold mb-4">
          {editingId ? "Edit Account" : "Add New Account"}
        </h2>

        <input
          name="bankName"
          placeholder="Bank Name"
          value={form.bankName}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        <input
          name="accountNumber"
          placeholder="Account Number"
          value={form.accountNumber}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        <input
          name="accountName"
          placeholder="Account Name"
          value={form.accountName}
          onChange={handleChange}
          className="w-full mb-3 p-3 border rounded"
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white px-6 py-3 rounded w-full"
        >
          {editingId ? "Update Account" : "Add Account"}
        </button>
      </div>

      {/* ================= LIST ================= */}
      <div className="space-y-4">
        {accounts.length === 0 && (
          <p className="text-slate-400 text-sm">No accounts yet</p>
        )}

        {accounts.map((acc) => (
          <div
            key={acc._id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <p className="font-bold">{acc.bankName}</p>
              <p>{acc.accountNumber}</p>
              <p className="text-xs text-slate-500">
                {acc.accountName}
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(acc)}
                className="text-blue-600 text-sm"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(acc._id)}
                className="text-red-600 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminAccounts;