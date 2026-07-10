import { useState, useEffect } from "react";
import {
  FiDatabase,
  FiAlertTriangle,
  FiSave,
  FiRefreshCw,
  FiCheckCircle,
  FiXCircle,
  FiLoader,
  FiEye,
  FiEyeOff,
  FiInfo,
} from "react-icons/fi";
import { SiGooglesheets, SiSupabase } from "react-icons/si";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DBConfig {
  supabaseUrl: string;
  supabaseKey: string;
  sheetsWebAppUrl: string;
}

export type SyncStatus = "idle" | "syncing" | "success" | "error";

interface DBConnectionsProps {
  onConfigSave?: (config: DBConfig) => void;
}

// ─── Storage key ──────────────────────────────────────────────────────────────

const STORAGE_KEY = "db_connections_config";

export const loadDBConfig = (): DBConfig => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { supabaseUrl: "", supabaseKey: "", sheetsWebAppUrl: "" };
};

export const saveDBConfig = (config: DBConfig) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
};

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  border: "0.5px solid #d0d7e2",
  borderRadius: 8,
  padding: "9px 12px",
  fontSize: 13,
  width: "100%",
  outline: "none",
  background: "#fff",
  color: "#111",
  fontFamily: "inherit",
  boxSizing: "border-box",
};

const labelStyle: React.CSSProperties = {
  fontSize: 12,
  color: "#4a5568",
  fontWeight: 600,
  display: "block",
  marginBottom: 5,
  letterSpacing: "0.02em",
};

const sectionCard: React.CSSProperties = {
  background: "#fff",
  border: "0.5px solid #dde8f5",
  borderRadius: 12,
  padding: "20px 22px",
  marginBottom: 16,
};

// ─── Component ────────────────────────────────────────────────────────────────

const DBConnections = ({ onConfigSave }: DBConnectionsProps) => {
  const [config, setConfig] = useState<DBConfig>(loadDBConfig());
  const [draft, setDraft] = useState<DBConfig>(loadDBConfig());
  const [showKey, setShowKey] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SyncStatus>("idle");
  const [sheetsStatus, setSheetsStatus] = useState<SyncStatus>("idle");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const dirty =
      draft.supabaseUrl !== config.supabaseUrl ||
      draft.supabaseKey !== config.supabaseKey ||
      draft.sheetsWebAppUrl !== config.sheetsWebAppUrl;
    setIsDirty(dirty);
  }, [draft, config]);

  const testSupabase = async () => {
    if (!draft.supabaseUrl || !draft.supabaseKey) {
      setSupabaseStatus("error");
      return;
    }
    setSupabaseStatus("syncing");
    try {
      const res = await fetch(`${draft.supabaseUrl}/rest/v1/`, {
        headers: {
          apikey: draft.supabaseKey,
          Authorization: `Bearer ${draft.supabaseKey}`,
        },
      });
      setSupabaseStatus(res.ok || res.status === 200 || res.status === 404 ? "success" : "error");
    } catch {
      setSupabaseStatus("error");
    }
  };

  const testSheets = async () => {
    if (!draft.sheetsWebAppUrl) { setSheetsStatus("error"); return; }
    setSheetsStatus("syncing");
    try {
      // Ping with a GET — Apps Script responds even to GET if deployed
      await fetch(draft.sheetsWebAppUrl, { method: "GET", mode: "no-cors" });
      setSheetsStatus("success");
    } catch {
      setSheetsStatus("error");
    }
  };

  const handleSave = () => {
    if (isDirty) {
      setConfirmOpen(true);
    } else {
      persistSave();
    }
  };

  const persistSave = () => {
    saveDBConfig(draft);
    setConfig(draft);
    setIsDirty(false);
    setConfirmOpen(false);
    setSaved(true);
    onConfigSave?.(draft);
    setTimeout(() => setSaved(false), 3000);
  };

  const StatusIcon = ({ status }: { status: SyncStatus }) => {
    if (status === "syncing") return <FiLoader size={14} style={{ animation: "spin 1s linear infinite", color: "#BA7517" }} />;
    if (status === "success") return <FiCheckCircle size={14} style={{ color: "#3B6D11" }} />;
    if (status === "error") return <FiXCircle size={14} style={{ color: "#A32D2D" }} />;
    return null;
  };

  const statusLabel: Record<SyncStatus, string> = {
    idle: "",
    syncing: "Testing...",
    success: "Connection successful",
    error: "Connection failed",
  };

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#F7FAFF", minHeight: "100vh", padding: "28px 32px", color: "#111" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        input:focus { outline: none; border-color: #185FA5 !important; box-shadow: 0 0 0 3px #E6F1FB; }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
        <div style={{ background: "#185FA5", borderRadius: 10, padding: 8, display: "flex" }}>
          <FiDatabase size={20} color="#fff" />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>Database Connections</h1>
          <p style={{ fontSize: 13, color: "#667", margin: 0 }}>Configure external data integrations for the Employee module</p>
        </div>
      </div>

      {/* ─── WARNING BANNER ────────────────────────────────────────────── */}
      <div style={{
        background: "#FFF8E1",
        border: "1px solid #F9A825",
        borderRadius: 10,
        padding: "14px 18px",
        margin: "20px 0",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}>
        <FiAlertTriangle size={20} style={{ color: "#E65100", flexShrink: 0, marginTop: 1 }} />
        <div>
          <p style={{ margin: "0 0 4px", fontWeight: 600, fontSize: 14, color: "#BF360C" }}>
            Proceed with caution — changes affect live data
          </p>
          <p style={{ margin: 0, fontSize: 13, color: "#5D4037", lineHeight: 1.6 }}>
            Modifying connection credentials will immediately affect all data reads and writes across the Employee module.
            Incorrect values may cause data loss, failed syncs, or broken integrations. Do not change these settings
            unless you are absolutely certain of the new values and have tested them in a safe environment first.
            Always back up your data before switching database targets.
          </p>
        </div>
      </div>

      {/* Dirty state notice */}
      {isDirty && (
        <div style={{ background: "#E6F1FB", border: "0.5px solid #B5D4F4", borderRadius: 8, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#0C447C" }}>
          <FiInfo size={14} />
          You have unsaved changes. Click <strong>Save Changes</strong> to apply them.
        </div>
      )}

      {/* ─── SUPABASE ──────────────────────────────────────────────────── */}
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <SiSupabase size={20} style={{ color: "#3ECF8E" }} />
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Supabase</h2>
          <span style={{ fontSize: 12, background: "#E6FAF0", color: "#3B6D11", padding: "2px 9px", borderRadius: 100, fontWeight: 500 }}>
            Primary database
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <StatusIcon status={supabaseStatus} />
            {supabaseStatus !== "idle" && (
              <span style={{ fontSize: 12, color: supabaseStatus === "success" ? "#3B6D11" : supabaseStatus === "error" ? "#A32D2D" : "#BA7517" }}>
                {statusLabel[supabaseStatus]}
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div>
            <label style={labelStyle}>Project URL</label>
            <input
              style={inputStyle}
              placeholder="https://xxxxxxxxxxxx.supabase.co"
              value={draft.supabaseUrl}
              onChange={(e) => setDraft({ ...draft, supabaseUrl: e.target.value })}
            />
          </div>
          <div>
            <label style={labelStyle}>Anon / Service Key</label>
            <div style={{ position: "relative" }}>
              <input
                style={{ ...inputStyle, paddingRight: 38, fontFamily: showKey ? "monospace" : "inherit" }}
                type={showKey ? "text" : "password"}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={draft.supabaseKey}
                onChange={(e) => setDraft({ ...draft, supabaseKey: e.target.value })}
              />
              <button
                onClick={() => setShowKey((s) => !s)}
                style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#888", padding: 0 }}
              >
                {showKey ? <FiEyeOff size={15} /> : <FiEye size={15} />}
              </button>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>Required table schema (run in Supabase SQL Editor):</p>
          <pre style={{ background: "#F7FAFF", border: "0.5px solid #dde8f5", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#334", overflowX: "auto", margin: 0, fontFamily: "monospace", lineHeight: 1.7 }}>
{`CREATE TABLE employees (
  id          INTEGER PRIMARY KEY,
  emp_id      TEXT NOT NULL UNIQUE,
  role        TEXT NOT NULL CHECK (role IN ('finance','manager','agent')),
  name        TEXT NOT NULL,
  national_id TEXT NOT NULL,
  join_date   TEXT NOT NULL,
  department  TEXT NOT NULL,
  full_time   BOOLEAN NOT NULL DEFAULT true,
  manager_id  INTEGER REFERENCES employees(id),
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all" ON employees FOR ALL USING (true);`}
          </pre>
        </div>

        <button
          onClick={testSupabase}
          style={{ marginTop: 14, background: "transparent", border: "0.5px solid #3ECF8E", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#0F6E56", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
        >
          <FiRefreshCw size={13} /> Test Connection
        </button>
      </div>

      {/* ─── GOOGLE SHEETS ─────────────────────────────────────────────── */}
      <div style={sectionCard}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>
          <SiGooglesheets size={20} style={{ color: "#0F9D58" }} />
          <h2 style={{ fontSize: 16, fontWeight: 600, margin: 0 }}>Google Sheets</h2>
          <span style={{ fontSize: 12, background: "#E8F5E9", color: "#2E7D32", padding: "2px 9px", borderRadius: 100, fontWeight: 500 }}>
            Secondary sync
          </span>
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6 }}>
            <StatusIcon status={sheetsStatus} />
            {sheetsStatus !== "idle" && (
              <span style={{ fontSize: 12, color: sheetsStatus === "success" ? "#3B6D11" : sheetsStatus === "error" ? "#A32D2D" : "#BA7517" }}>
                {statusLabel[sheetsStatus]}
              </span>
            )}
          </div>
        </div>

        <div>
          <label style={labelStyle}>Apps Script Web App URL</label>
          <input
            style={inputStyle}
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            value={draft.sheetsWebAppUrl}
            onChange={(e) => setDraft({ ...draft, sheetsWebAppUrl: e.target.value })}
          />
        </div>

        <div style={{ marginTop: 14 }}>
          <p style={{ fontSize: 12, color: "#888", margin: "0 0 4px" }}>Apps Script to paste (Extensions → Apps Script):</p>
          <pre style={{ background: "#F7FAFF", border: "0.5px solid #dde8f5", borderRadius: 8, padding: "12px 14px", fontSize: 11, color: "#334", overflowX: "auto", margin: 0, fontFamily: "monospace", lineHeight: 1.7 }}>
{`function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById("1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE");
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;

    if (!body || typeof body !== "object") {
      return errorResponse("Empty or invalid payload");
    }

    if (Array.isArray(body)) {
      writeRoles(ss, body);
      return successResponse({ status: "ok", type: "roles" });
    }

    if (!body.type) {
      return errorResponse("Payload must include a type field.");
    }

    switch (body.type) {
      case "event_submission":
        writeEventSubmission(ss, body.payload || {});
        break;
      case "recce":
        writeRecce(ss, body.payload || {});
        break;
      case "requisition":
        writeRequisition(ss, body.payload || {});
        break;
      case "pay_request":
        writePayRequest(ss, body.request || {});
        break;
      case "roles":
        writeRoles(ss, body.payload || []);
        break;
      default:
        return errorResponse("Unsupported payload type: " + body.type);
    }

    return successResponse({ status: "ok", type: body.type });
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function writeRoles(ss, incoming) {
  var sheet = ss.getSheetByName("Roles");
  var HEADER = ["ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Full-time", "Manager"];
  ensureHeader(sheet, HEADER);
  if (sheet.getLastRow() > 1) {
    sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADER.length).clearContent();
  }
  incoming.forEach(function(emp) {
    sheet.appendRow([
      emp.id || "",
      emp.emp_id || "",
      emp.role || "",
      emp.name || "",
      emp.email || "",
      emp.national_id || "",
      emp.join_date || "",
      emp.department || "",
      emp.full_time || "",
      emp.manager_id || ""
    ]);
  });
}

function writeEventSubmission(ss, payload) {
  var sheet = ss.getSheetByName("Events");
  var HEADER = ["Company", "Client", "Status", "Description", "Client Lead", "Project Lead", "Email", "Assistants", "Location", "Start Date", "End Date", "Submitted At"];
  ensureHeader(sheet, HEADER);
  sheet.appendRow([
    payload.company || "",
    payload.client || "",
    payload.status || "",
    payload.description || "",
    payload.clientLead || "",
    payload.projectLead || "",
    payload.email || "",
    JSON.stringify(payload.assistants || []),
    payload.location || "",
    payload.startDate || "",
    payload.endDate || "",
    payload.submittedAt || ""
  ]);
}

function writeRecce(ss, payload) {
  var sheet = ss.getSheetByName("Reccee");
  var HEADER = ["Email", "Job_ID", "Client", "Description", "Reccee Date", "Location", "Attendees", "Distance From Town", "Transport", "Residential Nearby", "Perimeter Wall", "Police Nearby", "Extra Security", "Security Notes", "Medical Nearby", "Medical Notes", "Amenities", "Other Facilities", "Entry Exit", "Event Layout", "Permits", "Challenges", "Company", "Submitted At"];
  ensureHeader(sheet, HEADER);
  sheet.appendRow([
    payload.email || "",
    payload.job_id || "",
    payload.client || "",
    payload.description || "",
    payload.reccee_date || "",
    payload.location || "",
    payload.attendees || "",
    payload.distance_from_town || "",
    payload.public_transport || "",
    payload.residential_nearby || "",
    payload.perimeter_wall || "",
    payload.police_nearby || "",
    payload.extra_security || "",
    payload.security_notes || "",
    payload.medical_nearby || "",
    payload.medical_notes || "",
    (payload.amenities || []).join(", "),
    payload.other_facilities || "",
    payload.entry_exit || "",
    payload.event_layout || "",
    payload.permits || "",
    payload.challenges || "",
    payload.company || "",
    payload.submitted_at || ""
  ]);
}

function writeRequisition(ss, payload) {
  var sheet = ss.getSheetByName("Requisition");
  var HEADER = ["Company", "Job_ID", "Client", "Event Description", "Requestor Name", "Requestor Email", "Date Required", "Line Items", "Total Amount", "Justification", "Notes", "Urgency", "Submitted At"];
  ensureHeader(sheet, HEADER);
  sheet.appendRow([
    payload.company || "",
    payload.job_id || "",
    payload.client || "",
    payload.event_description || "",
    payload.requestor_name || "",
    payload.requestor_email || "",
    payload.date_required || "",
    JSON.stringify(payload.line_items || []),
    payload.total_amount || "",
    payload.justification || "",
    payload.notes || "",
    payload.urgency || "",
    payload.submitted_at || ""
  ]);
}

function writePayRequest(ss, request) {
  var sheet = ss.getSheetByName("Claims Sheet");
  var HEADER = ["ID", "Event", "Vendor", "Amount", "Status", "Date", "Category"];
  ensureHeader(sheet, HEADER);
  sheet.appendRow([
    request.id || "",
    request.event || "",
    request.vendor || "",
    request.amount || "",
    request.status || "",
    request.date || "",
    request.category || ""
  ]);
}

function ensureHeader(sheet, header) {
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
  }
}

function wrapResponse(body, callback) {
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + body + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(body)
    .setMimeType(ContentService.MimeType.JSON);
}

function successResponse(payload) {
  return wrapResponse(JSON.stringify(payload), null);
}

function errorResponse(message) {
  return wrapResponse(JSON.stringify({ status: "error", message: message }), null);
}

// Deploy → New deployment → Web App
// Execute as: Me | Who has access: Anyone`}
          </pre>
        </div>

        <button
          onClick={testSheets}
          style={{ marginTop: 14, background: "transparent", border: "0.5px solid #0F9D58", borderRadius: 8, padding: "7px 14px", fontSize: 13, color: "#0F6E56", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontWeight: 500 }}
        >
          <FiRefreshCw size={13} /> Test Connection
        </button>
      </div>

      {/* ─── SAVE ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={handleSave}
          style={{
            background: isDirty ? "#185FA5" : "#B5D4F4",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            fontSize: 14,
            fontWeight: 600,
            cursor: isDirty ? "pointer" : "not-allowed",
            display: "flex",
            alignItems: "center",
            gap: 8,
            transition: "background 0.15s",
          }}
        >
          <FiSave size={15} /> Save Changes
        </button>
        {saved && (
          <span style={{ fontSize: 13, color: "#3B6D11", display: "flex", alignItems: "center", gap: 5 }}>
            <FiCheckCircle size={14} /> Settings saved successfully
          </span>
        )}
      </div>

      {/* ─── CONFIRM DIALOG ────────────────────────────────────────────── */}
      {confirmOpen && (
        <div style={{
          position: "fixed", inset: 0, background: "rgba(0,0,0,0.45)",
          display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999,
        }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "28px 30px", maxWidth: 440, width: "90%", boxShadow: "0 20px 60px rgba(0,0,0,0.2)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ background: "#FFF3E0", borderRadius: 8, padding: 8 }}>
                <FiAlertTriangle size={20} style={{ color: "#E65100" }} />
              </div>
              <h2 style={{ fontSize: 17, fontWeight: 600, margin: 0, color: "#BF360C" }}>Confirm Configuration Change</h2>
            </div>
            <p style={{ fontSize: 14, color: "#444", lineHeight: 1.65, margin: "0 0 20px" }}>
              You are about to change live database connection credentials. This will immediately affect all data
              operations in the Employee module. Ensure you have tested these values and understand the impact before
              proceeding.
            </p>
            <p style={{ fontSize: 13, fontWeight: 600, color: "#BF360C", margin: "0 0 20px" }}>
              Are you absolutely sure you want to apply these changes?
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmOpen(false)}
                style={{ background: "transparent", border: "0.5px solid #ccc", borderRadius: 8, padding: "9px 16px", fontSize: 13, cursor: "pointer", color: "#333" }}
              >
                Cancel — Go back
              </button>
              <button
                onClick={persistSave}
                style={{ background: "#C62828", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, cursor: "pointer", color: "#fff", display: "flex", alignItems: "center", gap: 7 }}
              >
                <FiSave size={13} /> Yes, apply changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DBConnections;
