import React, { useState } from "react";
import "./Calendar.css";

const CalendarView = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDueInfo, setSelectedDueInfo] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 🇵🇭 BIR Due Dates — VAT & Non-VAT
  const BIR_DUE_DATES = {
    VAT: [
      { month: 0, day: 20, label: "BIR Form 2550M - VAT Monthly Return (12%)" },
      { month: 3, day: 25, label: "BIR Form 2550Q - VAT Quarterly Return (12%)" },
      { month: 6, day: 25, label: "BIR Form 2550Q - VAT Quarterly Return (12%)" },
      { month: 9, day: 25, label: "BIR Form 2550Q - VAT Quarterly Return (12%)" },
    ],
    NonVAT: [
      { month: 3, day: 25, label: "BIR Form 2551Q - Percentage Tax (3%) Q1" },
      { month: 6, day: 25, label: "BIR Form 2551Q - Percentage Tax (3%) Q2" },
      { month: 9, day: 25, label: "BIR Form 2551Q - Percentage Tax (3%) Q3" },
      { month: 0, day: 25, label: "BIR Form 2551Q - Percentage Tax (3%) Q4" },
    ],
  };

  const getDueInfo = (month, day) => {
    const vat = BIR_DUE_DATES.VAT.find((d) => d.month === month && d.day === day);
    const nonVat = BIR_DUE_DATES.NonVAT.find((d) => d.month === month && d.day === day);
    return vat || nonVat || null;
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
    setSelectedDueInfo(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
    setSelectedDueInfo(null);
  };

  const blanks = Array.from({ length: startDay }, (_, i) => (
    <div key={`blank-${i}`} className="calendar-blank"></div>
  ));

  const days = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const dueInfo = getDueInfo(month, day);

    const isToday =
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear();

    const handleClick = () => {
      setSelectedDate(day);
      setSelectedDueInfo(dueInfo);
    };

    return (
      <button
        key={day}
        onClick={handleClick}
        className={`calendar-day
          ${selectedDate === day ? "selected" : ""}
          ${isToday ? "today" : ""}
          ${dueInfo ? (dueInfo.label.includes("VAT") ? "vat-due" : "nonvat-due") : ""}
        `}
        title={dueInfo?.label || ""}
      >
        {day}
      </button>
    );
  });

  const dueToday = getDueInfo(today.getMonth(), today.getDate());

  return (
    <div className="calendar">
      {/* Header */}
      <div className="calendar-header">
        <button onClick={prevMonth} className="nav-btn">←</button>
        <h2>{monthNames[month]} {year}</h2>
        <button onClick={nextMonth} className="nav-btn">→</button>
      </div>

      {/* Weekdays */}
      <div className="calendar-weekdays">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>

      {/* Days */}
      <div className="calendar-grid">
        {blanks}
        {days}
      </div>

      {/* Legend */}
      <div className="calendar-legend">
        <span className="legend-box vat"></span> VAT (12%)
        <span className="legend-box nonvat"></span> Non-VAT (3%)
      </div>

      {/* Selected Info */}
      {selectedDate && (
        <div className="calendar-message">
          <p>
            Selected: <strong>{monthNames[month]} {selectedDate}, {year}</strong>
          </p>
          {selectedDueInfo ? (
            <p className="due-info">
              📄 <strong>{selectedDueInfo.label}</strong>
            </p>
          ) : (
            <p className="no-due">No BIR filing due on this date.</p>
          )}
        </div>
      )}

      {/* Due Today Alert */}
      {dueToday && (
        <div className="due-today-alert">
          📢 <strong>Due Today:</strong> {dueToday.label}
        </div>
      )}
    </div>
  );
};

export default CalendarView;
