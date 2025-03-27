import React, { useState } from "react";
import { Card, CardHeader, Input, TextArea, DateTimePicker, Button, FlexBox, FlexBoxJustifyContent } from "@ui5/webcomponents-react";
import { Toast } from "@ui5/webcomponents-react";


const AppointmentList = ({ appointments, fetchAppointments }) => {
    const [editingAppointmentId, setEditingAppointmentId] = useState(null);
    const [editData, setEditData] = useState({});



    const formatDateTime = (isoString) => {
        if (!isoString || typeof isoString !== "string") {
            return "–"; // oder leerer String "", je nach Design
        }

        const [datePart, timePart] = isoString.split("T");
        if (!datePart || !timePart) return "–";

        const [year, month, day] = datePart.split("-");
        const [hour, minute] = timePart.split(":");

        return `${day}.${month}.${year} ${hour}:${minute}`;
    };

    const convertGermanDateToMySQL = (germanDateString) => {
        if (!germanDateString || typeof germanDateString !== "string") return null;

        const [datePart, timePart] = germanDateString.trim().split(" ");
        if (!datePart || !timePart) return null;

        const [day, month, year] = datePart.split(".");
        const [hour, minute] = timePart.split(":");

        const pad = (n) => String(n).padStart(2, "0");

        return `${year}-${pad(month)}-${pad(day)} ${pad(hour)}:${pad(minute)}:00`;
    };


    const deleteAppointment = (id) => {
        if (!window.confirm("Möchtest du diesen Termin wirklich löschen?")) return;

        fetch(`https://api.possiblyfour.com:5002/api/appointments/${id}`, {
            method: "DELETE",
        })
            .then((res) => res.json())
            .then((data) => {
                console.log("Termin gelöscht:", data);
                fetchAppointments(); // Liste neu laden
            })
            .catch((err) => {
                console.error("Fehler beim Löschen des Termins:", err);
                alert("Der Termin konnte nicht gelöscht werden.");
            });
    };


    const startEditing = (appt) => {

        const formatForPicker = (isoString) => {
            if (!isoString || typeof isoString !== "string") return "";

            const [datePart, timePartWithMs] = isoString.split("T");
            if (!datePart || !timePartWithMs) return "";

            const [year, month, day] = datePart.split("-");
            const [hour, minute] = timePartWithMs.split(":");

            return `${day}.${month}.${year} ${hour}:${minute}`;
        };


        setEditingAppointmentId(appt.id);
        setEditData({
            ...appt,
            start_time: formatForPicker(appt.start_time),
            end_time: formatForPicker(appt.end_time),
        });
    };
    const handleEditChange = (field, value) => {
        setEditData({ ...editData, [field]: value });
    };

    const saveEdit = () => {
        const updatedAppt = {
            ...editData,
            start_time: editData.start_time ? convertGermanDateToMySQL(editData.start_time) : null,
            end_time: editData.end_time ? convertGermanDateToMySQL(editData.end_time) : null,
        };

        fetch(`https://api.possiblyfour.com:5002/api/appointments/${editData.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedAppt),
        })
            .then((res) => res.json())
            .then(() => {
                setEditingAppointmentId(null);
                fetchAppointments();
            })
            .catch((err) => console.error("Fehler beim Aktualisieren des Termins:", err));
    };

    const cancelEdit = () => {
        setEditingAppointmentId(null);
        setEditData({});
    };

    return (

        <div style={{ display: "grid", gap: "1rem", marginTop: "1rem", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))" }}>
           

            {appointments.map((appt) => (
                <Card key={appt.id}>
                    <CardHeader titleText={appt.title} subtitleText={appt.location || "Kein Ort"} />
                    <div style={{ padding: "1rem" }}>
                        {editingAppointmentId === appt.id ? (
                            <div>
                                <Input
                                    placeholder="Titel"
                                    value={editData.title}
                                    onInput={(e) => handleEditChange("title", e.target.value)}
                                    style={{ marginBottom: "0.5rem" }}
                                />
                                <TextArea
                                    placeholder="Beschreibung"
                                    value={editData.description}
                                    onInput={(e) => handleEditChange("description", e.target.value)}
                                    style={{ marginBottom: "0.5rem" }}
                                />
                                <Input
                                    placeholder="Ort"
                                    value={editData.location}
                                    onInput={(e) => handleEditChange("location", e.target.value)}
                                    style={{ marginBottom: "0.5rem" }}
                                />
                                <DateTimePicker
                                    placeholder="Startzeit"
                                    formatPattern="dd.MM.yyyy HH:mm"
                                    value={editData.start_time}
                                    onChange={(e) => handleEditChange("start_time", e.target.value)}
                                    style={{ marginBottom: "0.5rem" }}
                                />
                                <DateTimePicker
                                    placeholder="Endzeit"
                                    formatPattern="dd.MM.yyyy HH:mm"
                                    value={editData.end_time}
                                    onChange={(e) => handleEditChange("end_time", e.target.value)}
                                    style={{ marginBottom: "0.5rem" }}
                                />
                                <FlexBox justifyContent={FlexBoxJustifyContent.SpaceBetween}>
                                    <Button design="Emphasized" onClick={saveEdit}>Speichern</Button>
                                    <Button design="Negative" onClick={() => deleteAppointment(editingAppointmentId)}>Löschen</Button>
                                    <Button design="Transparent" onClick={cancelEdit}>Abbrechen</Button>
                                </FlexBox>
                            </div>
                        ) : (
                            <>
                                <p><strong>Start:</strong> {formatDateTime(appt.start_time)}</p>
                                <p><strong>Ende:</strong> {formatDateTime(appt.end_time)}</p>
                                {appt.description && <p><strong>Beschreibung:</strong> {appt.description}</p>}
                                <Button design="Transparent" onClick={() => startEditing(appt)}>Bearbeiten</Button>
                            </>
                        )}
                    </div>
                </Card>
            ))}
        </div>
    );
};

export default AppointmentList;
