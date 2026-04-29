import { useState } from "react";

const BASE_URL = "http://localhost:3000";

function AuthModal({ mode, onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    try {
      const url = mode === "register" ? `${BASE_URL}/register` : `${BASE_URL}/login`;
      const body = { email, password }

      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");

      localStorage.setItem("user", JSON.stringify(data));
      onSuccess(data);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="w-full max-w-xs border border-gray-200 bg-gray-100 p-5 shadow-[6px_6px_0_#000] space-y-3"
      >
        <h2 className="text-lg font-bold">{mode === "register" ? "Register" : "Login"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-red-400"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-gray-300 p-2 text-sm outline-none focus:border-red-400"
        />

        {error && <p className="text-xs text-red-500">{error}</p>}

        <button
          type="submit"
          className="w-full rounded-full bg-gradient-to-b from-red-300 to-red-500 py-2 text-sm font-semibold text-white shadow-md hover:brightness-110"
        >
          {mode === "register" ? "Register" : "Login"}
        </button>
      </form>
    </div>
  )
}

export default AuthModal