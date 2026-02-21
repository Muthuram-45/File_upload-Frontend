import React, { useState, useEffect } from "react";
import "./DailyReport.css";

function DailyReport({ user }) {
  // Initialize with props if available
  const getInitialTime = () => {
    if (user?.report_hour !== undefined && user?.report_hour !== null) {
      const h = String(user.report_hour).padStart(2, "0");
      const m = String(user.report_minute || 0).padStart(2, "0");
      return `${h}:${m}`;
    }
    return "09:00";
  };

  const [time, setTime] = useState(getInitialTime());
  const [savedTime, setSavedTime] = useState(getInitialTime());
  const [timezone, setTimezone] = useState(user?.timezone || "Asia/Kolkata");
  const [savedTimezone, setSavedTimezone] = useState(user?.timezone || "Asia/Kolkata");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const TIMEZONES = [
    { label: "India (IST)", value: "Asia/Kolkata" },
    { label: "UTC", value: "UTC" },
    { label: "Eastern Time (EST)", value: "America/New_York" },
    { label: "Pacific Time (PST)", value: "America/Los_Angeles" },
    { label: "London (GMT)", value: "Europe/London" },
    { label: "Dubai (GST)", value: "Asia/Dubai" },
    { label: "Singapore (SGT)", value: "Asia/Singapore" },
  ];

  // Sync state if user prop changes (e.g. after parent fetch completes)
  useEffect(() => {
    const fetchedTime = getInitialTime();
    setTime(fetchedTime);
    setSavedTime(fetchedTime);
    if (user?.timezone) {
      setTimezone(user.timezone);
      setSavedTimezone(user.timezone);
    }
  }, [user?.report_hour, user?.report_minute, user?.timezone]);

  useEffect(() => {
    const fetchSavedTime = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`http://localhost:5000/api/report-time/${encodeURIComponent(user.email)}`);
        const data = await res.json();
        if (data.success) {
          if (data.hour !== null && data.hour !== undefined) {
            const h = String(data.hour).padStart(2, "0");
            const m = String(data.minute).padStart(2, "0");
            const fetched = `${h}:${m}`;
            setTime(fetched);
            setSavedTime(fetched);
          }
          if (data.timezone) {
            setTimezone(data.timezone);
            setSavedTimezone(data.timezone);
          }
        }
      } catch (err) {
        console.error("Failed to fetch report time:", err);
      }
    };

    // Only fetch if we don't have it from props yet or to be extra sure
    fetchSavedTime();
  }, [user?.email]);

  const handleSave = async () => {
    setMessage("");
    if (!user?.email) { setMessage("error"); return; }
    if (!time) { setMessage("error"); return; }

    const [hour, minute] = time.split(":");
    try {
      setLoading(true);
      const res = await fetch("http://localhost:5000/api/report-time", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user.email,
          hour: Number(hour),
          minute: Number(minute),
          timezone: timezone
        }),
      });
      const data = await res.json();
      if (data.success) {
        setSavedTime(time);
        setSavedTimezone(timezone);
        setMessage("success");
      } else {
        setMessage("error");
      }
    } catch (err) {
      console.error(err);
      setMessage("error");
    } finally {
      setLoading(false);
    }
  };

  const formatDisplayTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const displayHour = hour % 12 || 12;
    return `${String(displayHour).padStart(2, "0")}:${m} ${ampm}`;
  };

  return (
    <div className="report-content">
      {/* ── Header ── */}
      <div className="dr-header">
        <h2>📊 Daily Report Settings</h2>
        <p>
          Reschedule the time to receive your daily processed file and API activity summary.
          The report includes file uploads, API runs, row counts, and update status.
        </p>
      </div>

      {/* ── Current time badge ── */}
      <div className="dr-time-badge">
        <span className="dr-badge-icon">🕐</span>
        <div>
          <div className="dr-badge-label">Current Report Time</div>
          <div className="dr-badge-value">
            {formatDisplayTime(savedTime)} ({savedTimezone})
          </div>
        </div>
      </div>

      {/* ── Reschedule card ── */}
      <div className="dr-card">
        <p className="dr-card-title">Reschedule Report</p>

        <div className="dr-input-grid">
          <div className="dr-input-group">
            <label className="dr-label">Select New Time</label>
            <div className="dr-input-wrap">
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="dr-time-input"
              />
            </div>
          </div>

          <div className="dr-input-group">
            <label className="dr-label">Select Timezone</label>
            <div className="dr-input-wrap">
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="dr-time-input"
              >
                {TIMEZONES.map((tz) => (
                  <option key={tz.value} value={tz.value}>
                    {tz.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={loading}
          className="dr-save-btn"
        >
          {loading ? "Saving..." : "Update Settings"}
        </button>

        {/* Feedback */}
        {message === "success" && (
          <div className="dr-feedback success">
            ✅ Report time updated to <strong>{formatDisplayTime(savedTime)}</strong>
          </div>
        )}
        {message === "error" && (
          <div className="dr-feedback error">
            ❌ Failed to update. Please try again.
          </div>
        )}
      </div>

      {/* ── Footer note ── */}
      <p className="dr-footer-note">
        📬 Daily reports are sent to <strong>{user?.email}</strong>
      </p>
    </div>
  );
}

export default DailyReport;

