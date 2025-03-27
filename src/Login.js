import React, { useState } from "react";
import "./Login.css"; // Externe CSS-Datei für Styling
import loginImage from "./login-image.png"; // Bild einfügen (achte auf den Pfad)

function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = isRegistering
      ? "https://api.possiblyfour.com:5002/api/register"
      : "https://api.possiblyfour.com:5002/api/login";

    const payload = isRegistering
      ? { name, email, password }
      : { email, password };

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        if (isRegistering) {
          setMessage("Registrierung erfolgreich! Bitte logge dich ein.");
          setIsRegistering(false);
        } else {
          setMessage("Login erfolgreich!");
          localStorage.setItem("token", data.token);
          localStorage.setItem("userId", data.userId);
          localStorage.setItem("isAdmin", data.isAdmin); // Speichert Admin-Status
          localStorage.setItem("username", data.name);

          onLogin(data.userId);
        }
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Fehler", error);
      setMessage("Ein Fehler ist aufgetreten.");
    }
  };

  return (
    <div className="login-container">
      <h1 className="login-title">ZenWeekPlanner</h1>
      <p className="login-description">Mehr Klarheit. Mehr Zeit. Für dich.</p>
      <img src={loginImage} alt="ZenWeekPlanner Login" className="login-image" />


      <h2>{isRegistering ? "Registrieren" : "Login"}</h2>
      <form onSubmit={handleSubmit} className="login-form">
        {isRegistering && (
          <>
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </>
        )}
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Passwort:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isRegistering ? "Registrieren" : "Login"}</button>
      </form>
      {message && <p className="message">{message}</p>}
      <button className="toggle-btn" onClick={() => setIsRegistering(!isRegistering)}>
        {isRegistering ? "Zum Login wechseln" : "Jetzt registrieren"}
      </button>
    </div>
  );
}

export default Login;
