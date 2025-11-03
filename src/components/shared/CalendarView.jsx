import { useEffect, useState } from "react";
import "./Calendar.css";

const CalendarView = ({ clientInfo }) => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDueInfo, setSelectedDueInfo] = useState(null);
  const [governmentDueDates, setGovernmentDueDates] = useState([]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startDay = new Date(year, month, 1).getDay();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const today = new Date();

  useEffect(() => {
    if (clientInfo?.id) {
      fetchGovernmentDueDates();
    }
  }, [clientInfo?.id]);

  const fetchGovernmentDueDates = async () => {
    try {
      const response = await fetch(`https://bookkeeping-backend-pewk.onrender.com/api/due-dates/${clientInfo.id}`);
      const data = await response.json();

      if (data.dueDates && data.dueDates.length > 0) {
        setGovernmentDueDates(data.dueDates);
      } else {
        setGovernmentDueDates([]);
      }
    } catch (error) {
      console.error("Error fetching government due dates:", error);
      setGovernmentDueDates([]);
    }
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  // 🇵🇭 BIR Due Dates — VAT & Non-VAT & Additional Forms
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
    IncomeTaxIndividuals: [
      { month: 4, day: 15, label: "BIR Form 1701Q - Quarterly Income Tax Return (Individuals)" },
      { month: 7, day: 15, label: "BIR Form 1701Q - Quarterly Income Tax Return (Individuals)" },
      { month: 10, day: 15, label: "BIR Form 1701Q - Quarterly Income Tax Return (Individuals)" },
      { month: 3, day: 15, label: "BIR Form 1701 - Annual Income Tax Return (Individuals / Self-Employed)" },
    ],
    IncomeTaxCorporations: [
      { month: 4, day: 1, label: "BIR Form 1702Q - Quarterly Income Tax Return (Corporations) Q1" },
      { month: 7, day: 1, label: "BIR Form 1702Q - Quarterly Income Tax Return (Corporations) Q2" },
      { month: 10, day: 1, label: "BIR Form 1702Q - Quarterly Income Tax Return (Corporations) Q3" },
      { month: 1, day: 1, label: "BIR Form 1702Q - Quarterly Income Tax Return (Corporations) Q4" },
      { month: 3, day: 15, label: "BIR Form 1702-RT / 1702-MX / 1702-EX - Annual Income Tax Return (Corporations)" },
    ],
    WithholdingTaxCompensation: [
      { month: 1, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Jan)" },
      { month: 2, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Feb)" },
      { month: 3, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Mar)" },
      { month: 4, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Apr)" },
      { month: 5, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (May)" },
      { month: 6, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Jun)" },
      { month: 7, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Jul)" },
      { month: 8, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Aug)" },
      { month: 9, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Sep)" },
      { month: 10, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Oct)" },
      { month: 11, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Nov)" },
      { month: 0, day: 10, label: "BIR Form 1601C - Monthly Withholding Tax on Compensation (Dec)" },
    ],
    ExpandedWithholdingTax: [
      { month: 1, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Jan)" },
      { month: 2, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Feb)" },
      { month: 3, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Mar)" },
      { month: 4, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Apr)" },
      { month: 5, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (May)" },
      { month: 6, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Jun)" },
      { month: 7, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Jul)" },
      { month: 8, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Aug)" },
      { month: 9, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Sep)" },
      { month: 10, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Oct)" },
      { month: 11, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Nov)" },
      { month: 0, day: 10, label: "BIR Form 0619E - Monthly Remittance Form (Dec)" },
      { month: 3, day: 30, label: "BIR Form 1601EQ - Quarterly Withholding Return Q1" },
      { month: 6, day: 31, label: "BIR Form 1601EQ - Quarterly Withholding Return Q2" },
      { month: 9, day: 31, label: "BIR Form 1601EQ - Quarterly Withholding Return Q3" },
      { month: 0, day: 31, label: "BIR Form 1601EQ - Quarterly Withholding Return Q4" },
    ],
    FinalWithholdingTax: [
      { month: 1, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Jan)" },
      { month: 2, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Feb)" },
      { month: 3, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Mar)" },
      { month: 4, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Apr)" },
      { month: 5, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (May)" },
      { month: 6, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Jun)" },
      { month: 7, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Jul)" },
      { month: 8, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Aug)" },
      { month: 9, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Sep)" },
      { month: 10, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Oct)" },
      { month: 11, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Nov)" },
      { month: 0, day: 10, label: "BIR Form 0619F - Monthly Remittance Form (Dec)" },
      { month: 3, day: 30, label: "BIR Form 1601FQ - Quarterly Withholding Return Q1" },
      { month: 6, day: 31, label: "BIR Form 1601FQ - Quarterly Withholding Return Q2" },
      { month: 9, day: 31, label: "BIR Form 1601FQ - Quarterly Withholding Return Q3" },
      { month: 0, day: 31, label: "BIR Form 1601FQ - Quarterly Withholding Return Q4" },
    ],
    AnnualWithholdingSummary: [
      { month: 0, day: 31, label: "BIR Form 1604C - Annual Information Return (Compensation)" },
      { month: 2, day: 1, label: "BIR Form 1604E / 1604F - Annual Information Return (Expanded / Final)" },
    ],
    OtherIncomeTax: [
      { month: 3, day: 15, label: "BIR Form 1701A - Annual Income Tax Return for purely self-employed under 8% / graduated rates" },
    ],
  };

  // 🇵🇭 Government Contribution Due Dates — PhilHealth, SSS, Pag-IBIG
  const GOVERNMENT_DUE_DATES = {
    PhilHealth: [
      { month: 0, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 0, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 1, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 1, day: 28, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 2, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 2, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 3, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 3, day: 30, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 4, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 4, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 5, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 5, day: 30, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 6, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 6, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 7, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 7, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 8, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 8, day: 30, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 9, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 9, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 10, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 10, day: 30, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
      { month: 11, day: 15, label: "PhilHealth - Form PMRF, ER2 (Employed)" },
      { month: 11, day: 31, label: "PhilHealth - Form PMRF, PPP5 (Self-employed)" },
    ],
    SSS: [
      { month: 0, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 1, day: 28, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 2, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 3, day: 30, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 4, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 5, day: 30, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 6, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 7, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 8, day: 30, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 9, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 10, day: 30, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
      { month: 11, day: 31, label: "SSS - Form R-1, R-1A, R-3 (Employed) / RS-1, RS-5 (Self-employed)" },
    ],
    PagIBIG: [
      { month: 0, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 1, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 2, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 3, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 4, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 5, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 6, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 7, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 8, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 9, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 10, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
      { month: 11, day: 10, label: "Pag-IBIG - Form ER1, MDF, MRS (Employed) / MDF, POF (Self-employed)" },
    ],
  };

  const getDueInfo = (month, day) => {
    const vat = BIR_DUE_DATES.VAT.find((d) => d.month === month && d.day === day);
    const nonVat = BIR_DUE_DATES.NonVAT.find((d) => d.month === month && d.day === day);
    const incomeTaxIndividuals = BIR_DUE_DATES.IncomeTaxIndividuals.find((d) => d.month === month && d.day === day);
    const incomeTaxCorporations = BIR_DUE_DATES.IncomeTaxCorporations.find((d) => d.month === month && d.day === day);
    const withholdingTaxCompensation = BIR_DUE_DATES.WithholdingTaxCompensation.find((d) => d.month === month && d.day === day);
    const expandedWithholdingTax = BIR_DUE_DATES.ExpandedWithholdingTax.find((d) => d.month === month && d.day === day);
    const finalWithholdingTax = BIR_DUE_DATES.FinalWithholdingTax.find((d) => d.month === month && d.day === day);
    const annualWithholdingSummary = BIR_DUE_DATES.AnnualWithholdingSummary.find((d) => d.month === month && d.day === day);
    const otherIncomeTax = BIR_DUE_DATES.OtherIncomeTax.find((d) => d.month === month && d.day === day);

    // Check for government due dates from API
    const govDue = governmentDueDates.find(due => {
      const dueDate = new Date(due.dueDate);
      return dueDate.getMonth() === month && dueDate.getDate() === day && dueDate.getFullYear() === year;
    });

    // Check for static government due dates
    const philHealth = GOVERNMENT_DUE_DATES.PhilHealth.find((d) => d.month === month && d.day === day);
    const sss = GOVERNMENT_DUE_DATES.SSS.find((d) => d.month === month && d.day === day);
    const pagIbig = GOVERNMENT_DUE_DATES.PagIBIG.find((d) => d.month === month && d.day === day);

    return vat || nonVat || incomeTaxIndividuals || incomeTaxCorporations || withholdingTaxCompensation || expandedWithholdingTax || finalWithholdingTax || annualWithholdingSummary || otherIncomeTax || govDue || philHealth || sss || pagIbig;
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
          ${dueInfo ? (
            dueInfo.agency === "PhilHealth" ? "philhealth-due" :
            dueInfo.agency === "SSS" ? "sss-due" :
            dueInfo.agency === "Pag-IBIG" ? "pagibig-due" :
            dueInfo.label?.includes("PhilHealth") ? "philhealth-due" :
            dueInfo.label?.includes("SSS") ? "sss-due" :
            dueInfo.label?.includes("Pag-IBIG") ? "pagibig-due" :
            dueInfo.label?.includes("VAT") ? "vat-due" :
            dueInfo.label?.includes("Percentage Tax") ? "nonvat-due" :
            dueInfo.label?.includes("1701Q") || dueInfo.label?.includes("1701 - Annual") ? "income-individual-due" :
            dueInfo.label?.includes("1702Q") || dueInfo.label?.includes("1702-") ? "income-corporation-due" :
            dueInfo.label?.includes("1601C") ? "withholding-compensation-due" :
            dueInfo.label?.includes("0619E") || dueInfo.label?.includes("1601EQ") ? "expanded-withholding-due" :
            dueInfo.label?.includes("0619F") || dueInfo.label?.includes("1601FQ") ? "final-withholding-due" :
            dueInfo.label?.includes("1604C") || dueInfo.label?.includes("1604E") || dueInfo.label?.includes("1604F") ? "annual-withholding-due" :
            dueInfo.label?.includes("1701A") ? "other-income-due" :
            "nonvat-due"
          ) : ""}
        `}
        title={dueInfo?.label || dueInfo?.description || ""}
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
        <span className="legend-box income-individual"></span> Income Tax (Individuals)
        <span className="legend-box income-corporation"></span> Income Tax (Corporations)
        <span className="legend-box withholding-compensation"></span> Withholding Tax (Compensation)
        <span className="legend-box expanded-withholding"></span> Expanded Withholding Tax
        <span className="legend-box final-withholding"></span> Final Withholding Tax
        <span className="legend-box annual-withholding"></span> Annual Withholding Summary
        <span className="legend-box other-income"></span> Other Income Tax
        <span className="legend-box philhealth"></span> PhilHealth
        <span className="legend-box sss"></span> SSS
        <span className="legend-box pagibig"></span> Pag-IBIG
      </div>

      {/* Selected Info */}
      {selectedDate && (
        <div className="calendar-message">
          <p>
            Selected: <strong>{monthNames[month]} {selectedDate}, {year}</strong>
          </p>
          {selectedDueInfo ? (
            <p className="due-info">
              📄 <strong>
                {selectedDueInfo.agency
                  ? `${selectedDueInfo.agency}: ${selectedDueInfo.description}`
                  : selectedDueInfo.label
                }
              </strong>
            </p>
          ) : (
            <p className="no-due">No filing due on this date.</p>
          )}
        </div>
      )}

      {/* Due Today Alert */}
      {dueToday && (
        <div className="due-today-alert">
          📢 <strong>Due Today:</strong> {
            dueToday.agency
              ? `${dueToday.agency}: ${dueToday.description}`
              : dueToday.label
          }
        </div>
      )}
    </div>
  );
};

export default CalendarView;
