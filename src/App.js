import React, { useState, useEffect } from "react";
import './App.css';
import './zenweekplanner'
import ZenWeekPlanner from './zenweekplanner';
import Login from "./Login";
import { Button } from "@ui5/webcomponents-react";

function App() {


  const [userId, setUserId] = useState(null);


  // Beim Start prüfen, ob userId im Local Storage gespeichert ist
  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    if (storedUserId) {
      setUserId(storedUserId);
    }
  }, []);




  useEffect(() => {
    console.log("Aktuelle userId:", userId);
  }, [userId]);

  const handleLogin = (id) => {
    console.log("Benutzer eingeloggt mit ID:", id);
    localStorage.setItem("userId", id);
    setUserId(id);
  };


  const handleLogout = () => {
    setUserId(null);
    localStorage.removeItem("userId"); // Benutzer ausloggen
  };
  return (
    <div style={{ padding: "3px" }}>
      {userId ? (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
            <Button
              design="Negative"
              icon="log-out"
              onClick={handleLogout}
            >
              Logout
            </Button>
          </div>
          <ZenWeekPlanner userId={userId} />
        </>
      ) : (
        <Login onLogin={handleLogin} />
      )}
    </div>
  );

}

export default App;


