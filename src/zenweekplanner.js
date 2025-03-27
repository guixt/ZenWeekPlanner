import React, { useState, useEffect } from "react";
import toast, { toastConfig } from 'react-simple-toasts';
import 'react-simple-toasts/dist/style.css';
import 'react-simple-toasts/dist/theme/dark.css';


import AppointmentList from "./appointmentlist";
import { Input, Button, Title, Panel, FlexBox, FlexBoxJustifyContent, DateTimePicker, TextArea } from "@ui5/webcomponents-react";

const ZenWeekPlanner = ({ userId }) => {
  const [appointments, setAppointments] = useState([]);
  const [newAppointment, setNewAppointment] = useState({
    title: "",
    description: "",
    location: "",
    start_time: "",
    end_time: "",
    is_fixed: true,
    is_blocked: false,
  });

  const fetchAppointments = () => {
    fetch(`https://api.possiblyfour.com:5002/api/appointments/${userId}`)
      .then((res) => res.json())
      .then((data) => setAppointments(data))
      .catch((err) => console.error("Fehler beim Abrufen der Termine:", err));
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleChange = (field, value) => {
    setNewAppointment({ ...newAppointment, [field]: value });
  };


  const formatDateTimeForMySQL = (dateString) => {
    const [datePart, timePart] = dateString.split(" ");
    const [day, month, year] = datePart.split(".");
    const [hours, minutes] = timePart.split(":");

    const pad = (n) => String(n).padStart(2, "0");

    return `${year}-${pad(month)}-${pad(day)} ${pad(hours)}:${pad(minutes)}:00`;
  };


  const addAppointment = () => {
    if (!newAppointment.title || !newAppointment.start_time) return;

    fetch("https://api.possiblyfour.com:5002/api/appointments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newAppointment,
        user_id: userId,
        start_time: newAppointment.start_time ? formatDateTimeForMySQL(newAppointment.start_time) : null,
        end_time: newAppointment.end_time ? formatDateTimeForMySQL(newAppointment.end_time) : null
      }),
    })
      .then((res) => res.json())
      .then(() => {
        fetchAppointments();
        setNewAppointment({
          title: "",
          description: "",
          location: "",
          start_time: "",
          end_time: "",
          is_fixed: true,
          is_blocked: false,
        });
        toast('✅ Termine wurde hinzugefügt 🗓️', { position: 'top-center' });
      })
      .catch((err) => console.error("Fehler beim Hinzufügen des Termins:", err));
  };

  const optimizeAppointments = () => {
    if (!appointments || appointments.length === 0) {

      return;
    }

    const updatedAppointments = appointments.map((appt) => {
      const start = new Date(appt.start_time);
      const end = appt.end_time ? new Date(appt.end_time) : null;

      // Dummy: 1 Stunde verschieben
      start.setHours(start.getHours() + 1);
      if (end) end.setHours(end.getHours() + 1);

      const format = (d) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:00`;

      return {
        ...appt,
        start_time: format(start),
        end_time: end ? format(end) : null,
      };
    });

    // Jetzt nacheinander speichern
    Promise.all(
      updatedAppointments.map((appt) =>
        fetch(`https://api.possiblyfour.com:5002/api/appointments/${appt.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(appt),
        })
      )
    )
      .then(() => {
        toast('🧘 Termine wurden optimiert 🗓️', { position: 'top-center' })
        fetchAppointments(); // Neu laden
      })
      .catch((err) => {
        console.error("Optimierung fehlgeschlagen:", err);
        alert("Fehler bei der Termin-Optimierung");
      });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <Title level="H1">ZenWeekPlanner – Deine Termine</Title>

      <p>
        <Button onClick={optimizeAppointments}>
          Termine optimieren
        </Button>
      </p>
      <Panel collapsed headerText="Neuen Termin hinzufügen">
        <FlexBox direction="Column" style={{ gap: "0.5rem" }}>
          <Input
            placeholder="Titel"
            value={newAppointment.title}
            onInput={(e) => handleChange("title", e.target.value)}
          />
          <TextArea
            placeholder="Beschreibung"
            value={newAppointment.description}
            onInput={(e) => handleChange("description", e.target.value)}
          />
          <Input
            placeholder="Ort"
            value={newAppointment.location}
            onInput={(e) => handleChange("location", e.target.value)}
          />
          <DateTimePicker
            placeholder="Startzeit"
            formatPattern="dd.MM.yyyy HH:mm"
            value={newAppointment.start_time}
            onChange={(e) => handleChange("start_time", e.target.value)}

          />
          <DateTimePicker
            placeholder="Endzeit"
            formatPattern="dd.MM.yyyy HH:mm"
            value={newAppointment.end_time}
            onChange={(e) => handleChange("end_time", e.target.value)}
          />
          <Button design="Emphasized" onClick={addAppointment}>Termin hinzufügen</Button>
        </FlexBox>
      </Panel>

      <AppointmentList appointments={appointments} fetchAppointments={fetchAppointments} />
    </div>
  );
};

export default ZenWeekPlanner;
