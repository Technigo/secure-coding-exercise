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
      const body = mode === "register"
        ? { email, password }
        : { email, password };

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
    <div onClick={onClose}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        className="modal"
      >
        <h2>{mode === "register" ? "Register" : "Login"}</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          name="email"
          autoComplete="email"
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          name="password"
        />

        {error && <p className="error">{error}</p>}

        <button
          type="submit"
          className="auth-button"
        >
          {mode === "register" ? "Register" : "Login"}
        </button>
      </form>
    </div>
  )
}

export default AuthModal