import { useState, useEffect } from "react";
import {
  FiPlus, FiRefreshCw, FiDownload, FiSearch, FiEdit2, FiTrash2,
  FiArrowLeft, FiSave, FiCheck, FiX, FiUsers, FiChevronRight,
  FiAlertCircle, FiCheckCircle, FiLoader, FiShield, FiUser, FiBriefcase,
} from "react-icons/fi";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { loadDBConfig } from "./DBConnections";
import type { DBConfig } from "./DBConnections";
import {
  syncRolesToGoogleSheets,
  pullEmployeesFromSheets,
  loadGoogleSheetsConfig,
  saveGoogleSheetsConfig,
  type GoogleSheetsConfig,
} from "./GoogleSheetsConnection";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EmployeeRole = "finance" | "manager" | "Project Manager";

export interface Employee {
  id: number;
  emp_id: string;
  role: EmployeeRole;
  name: string;
  email: string;
  national_id: string;
  join_date: string;
  department: string;
  full_time: boolean;
  manager_id: number | null;
}

type SyncStatus = "idle" | "syncing" | "success" | "error";
type Page = "list" | "form" | "settings";

// ─── Constants ────────────────────────────────────────────────────────────────

const DEPARTMENTS = ["Finance", "Market", "Development", "HR", "Operations", "Sales", "Legal", "IT"];
const SUPABASE_TABLE = "employees";

const ROLE_META: Record<EmployeeRole, { label: string; color: string; bg: string; border: string; icon: React.ReactNode }> = {
  finance: { label: "Finance", color: "#0C447C", bg: "#E6F1FB", border: "#B5D4F4", icon: <FiBriefcase size={12} /> },
  manager: { label: "Manager", color: "#3B6D11", bg: "#EAF3DE", border: "#C0DD97", icon: <FiShield size={12} /> },
  "Project Manager": { label: "Project Manager", color: "#7B2CBF", bg: "#F3E8FF", border: "#D8B4FE", icon: <FiUsers size={12} /> },
};

// ─── Utilities ────────────────────────────────────────────────────────────────

const genEmpId  = (id: number) => `EMP-${String(id).padStart(4, "0")}`;
const nextId    = (list: Employee[]) => (list.length ? Math.max(...list.map((e) => e.id)) + 1 : 1);
const formatDate = (iso: string) => { const d = new Date(iso); return isNaN(d.getTime()) ? iso : d.toLocaleDateString("en-US"); };
const toIsoDate  = (s: string)   => { const d = new Date(s);   return isNaN(d.getTime()) ? s   : d.toISOString().split("T")[0]; };

// ─── Supabase singleton ───────────────────────────────────────────────────────

let _sb: SupabaseClient | null = null;
const getSB  = (cfg: DBConfig) => { if (!_sb && cfg.supabaseUrl && cfg.supabaseKey) _sb = createClient(cfg.supabaseUrl, cfg.supabaseKey); return _sb; };
const resetSB = () => { _sb = null; };

// ─── Shared styles ────────────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = { border: "0.5px solid #d0d7e2", borderRadius: 8, padding: "9px 12px", fontSize: 13, width: "100%", outline: "none", background: "#fff", color: "#111", fontFamily: "inherit", boxSizing: "border-box" };
const labelStyle: React.CSSProperties = { fontSize: 12, color: "#4a5568", fontWeight: 600, display: "block", marginBottom: 5 };
const primaryBtn: React.CSSProperties = { background: "#185FA5", color: "#fff", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 500, cursor: "pointer", display: "flex", alignItems: "center", gap: 7 };
const outlineBtn: React.CSSProperties = { background: "transparent", border: "0.5px solid #d0d7e2", borderRadius: 8, padding: "9px 14px", fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 7, color: "#333" };
const iconBtn:    React.CSSProperties = { background: "transparent", border: "0.5px solid #d0d7e2", borderRadius: 8, padding: 8, cursor: "pointer", color: "#555", display: "flex", alignItems: "center", justifyContent: "center" };

// ─── Sub-components ───────────────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: EmployeeRole }) => {
  const m = ROLE_META[role];
  return <span style={{ display: "inline-flex", alignItems: "center", gap: 5, background: m.bg, color: m.color, border: `0.5px solid ${m.border}`, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100 }}>{m.icon} {m.label}</span>;
};

const Toast = ({ message, type, visible }: { message: string; type: "success" | "error" | "info"; visible: boolean }) => {
  const bg: Record<string, string> = { success: "#185FA5", error: "#A32D2D", info: "#0C447C" };
  return <div style={{ position: "fixed", bottom: 24, right: 24, background: bg[type], color: "#fff", padding: "10px 18px", borderRadius: 8, fontSize: 13, fontWeight: 500, display: "flex", alignItems: "center", gap: 8, zIndex: 9999, opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(12px)", transition: "opacity 0.25s, transform 0.25s", pointerEvents: "none" }}>{type === "success" ? <FiCheckCircle size={14} /> : type === "error" ? <FiAlertCircle size={14} /> : null}{message}</div>;
};

const SectionHeader = ({ label, count, icon }: { label: string; count: number; icon: React.ReactNode }) => (
  <tr><td colSpan={11} style={{ background: "#F0F5FC", padding: "8px 14px", borderBottom: "0.5px solid #dde8f5", borderTop: "0.5px solid #dde8f5" }}><span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 600, color: "#185FA5", letterSpacing: "0.04em", textTransform: "uppercase" }}>{icon} {label} <span style={{ fontWeight: 400, color: "#888", fontSize: 11 }}>({count})</span></span></td></tr>
);

// ─── Google Sheets Settings Panel ────────────────────────────────────────────

const GoogleSheetsSettings = ({ config, onSave, onBack, onTest, testing }: { config: GoogleSheetsConfig; onSave: (cfg: GoogleSheetsConfig) => void; onBack: () => void; onTest: () => void; testing: boolean }) => {
  const [url, setUrl] = useState(config.webAppUrl);
  return (
    <div>
      <div style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={onBack} style={{ background: "none", border: "none", color: "#185FA5", cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline" }}>Employees</button>
        <FiChevronRight size={13} /><span>Google Sheets Settings</span>
      </div>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 6 }}>Google Sheets — Data Sync</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 24, lineHeight: 1.6 }}>This script routes form submissions to the correct sheet tabs: <strong>Events</strong>, <strong>Reccee</strong>, <strong>Requisition</strong>, and <strong>Claims Sheet</strong>. The Roles tab is also preserved for employee sync.</p>
      <div style={{ background: "#F8FAFE", border: "0.5px solid #dde8f5", borderRadius: 10, padding: 16, marginBottom: 20, fontSize: 13, lineHeight: 1.7 }}>
        <div style={{ fontWeight: 600, color: "#185FA5", marginBottom: 8, fontSize: 12, textTransform: "uppercase", letterSpacing: "0.04em" }}>Setup Guide</div>
        <ol style={{ margin: 0, paddingLeft: 18, color: "#444" }}>
          <li>Open your Google Sheet → <strong>Extensions → Apps Script</strong></li>
          <li>Paste the updated script (with both <code style={{ background: "#e8f0fe", padding: "1px 5px", borderRadius: 4 }}>doPost</code> and <code style={{ background: "#e8f0fe", padding: "1px 5px", borderRadius: 4 }}>doGet</code>) from <code>GoogleSheetsConnection.ts</code></li>
          <li>Click <strong>Deploy → Manage Deployments → edit → New version → Deploy</strong></li>
          <li>Paste the Web App URL below</li>
        </ol>
      </div>
      <div style={{ maxWidth: 560 }}>
        <label style={labelStyle}>Apps Script Web App URL</label>
        <input style={inputStyle} placeholder="https://script.google.com/macros/s/..." value={url} onChange={(e) => setUrl(e.target.value)} />
        <p style={{ fontSize: 11, color: "#999", marginTop: 5 }}>Saved locally in your browser.</p>
      </div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <button style={outlineBtn} onClick={onBack}><FiArrowLeft size={14} /> Back</button>
        <button style={primaryBtn} onClick={() => onSave({ webAppUrl: url })}><FiSave size={14} /> Save URL</button>
        <button style={{ ...outlineBtn, opacity: testing ? 0.6 : 1 }} onClick={onTest} disabled={testing || !url}>
          {testing ? <FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} /> : <FiCheckCircle size={14} />}
          {testing ? "Testing…" : "Test Sync"}
        </button>
      </div>
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const Employees = () => {
  const [page, setPage] = useState<Page>("list");
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState({ message: "", type: "success" as "success" | "error" | "info", visible: false });
  const [sbStatus, setSbStatus] = useState<SyncStatus>("idle");
  const [sheetStatus, setSheetStatus] = useState<SyncStatus>("idle");
  const [pulling, setPulling] = useState(false);
  const [dbConfig, setDbConfig] = useState<DBConfig>(loadDBConfig());
  const [gsConfig, setGsConfig] = useState<GoogleSheetsConfig>(loadGoogleSheetsConfig());
  const [testingSheet, setTestingSheet] = useState(false);

  const [form, setForm] = useState({ role: "Project Manager" as EmployeeRole, name: "", email: "", national_id: "", join_date: new Date().toISOString().split("T")[0], department: "Market", full_time: true, manager_id: null as number | null });
  const [formId, setFormId] = useState(0);
  const [formEmpId, setFormEmpId] = useState("");

  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setToast({ message, type, visible: true });
    setTimeout(() => setToast((t) => ({ ...t, visible: false })), 3000);
  };

  useEffect(() => { setDbConfig(loadDBConfig()); setGsConfig(loadGoogleSheetsConfig()); resetSB(); }, []);

  // Load from Supabase on mount — no Sheets sync here
  useEffect(() => {
    const load = async () => {
      const sb = getSB(dbConfig);
      if (!sb) return;
      setSbStatus("syncing");
      try {
        const { data, error } = await sb.from(SUPABASE_TABLE).select("*").order("id", { ascending: true });
        if (!error && data?.length) { setEmployees(data as Employee[]); setSbStatus("success"); }
        else setSbStatus(error ? "error" : "idle");
      } catch { setSbStatus("error"); }
    };
    load();
  }, [dbConfig]);

  // ─── Sync helpers ─────────────────────────────────────────────────────────

  const syncToSheets = async (updated: Employee[]) => {
    const cfg = loadGoogleSheetsConfig();
    if (!cfg.webAppUrl) return;
    setSheetStatus("syncing");
    const result = await syncRolesToGoogleSheets(updated, cfg);
    setSheetStatus(result.ok ? "success" : "error");
    if (!result.ok) showToast(`Sheets sync failed: ${result.error}`, "error");
  };

  const syncAll = async (updated: Employee[]) => {
    const sb = getSB(dbConfig);
    if (sb) {
      setSbStatus("syncing");
      try { const { error } = await sb.from(SUPABASE_TABLE).upsert(updated, { onConflict: "id" }); setSbStatus(error ? "error" : "success"); }
      catch { setSbStatus("error"); }
    }
    await syncToSheets(updated);
  };

  // ─── Pull from Google Sheets ──────────────────────────────────────────────

  const handlePullFromSheets = async () => {
    const cfg = loadGoogleSheetsConfig();
    if (!cfg.webAppUrl) { showToast("Google Sheets not configured", "error"); return; }

    setPulling(true);
    const result = await pullEmployeesFromSheets(cfg);
    setPulling(false);

    if (!result.ok) {
      showToast(`Pull failed: ${result.error}`, "error");
      return;
    }

    if (result.employees.length === 0) {
      showToast("No employees found in sheet", "info");
      return;
    }

    // Upsert pulled employees into Supabase too
    setEmployees(result.employees);
    const sb = getSB(dbConfig);
    if (sb) {
      try { await sb.from(SUPABASE_TABLE).upsert(result.employees, { onConflict: "id" }); }
      catch {}
    }
    showToast(`Pulled ${result.employees.length} employees from Sheets`);
  };

  // ─── Settings ────────────────────────────────────────────────────────────

  const handleSaveGsConfig = (cfg: GoogleSheetsConfig) => { saveGoogleSheetsConfig(cfg); setGsConfig(cfg); showToast("Google Sheets URL saved"); };

  const handleTestSync = async () => {
    setTestingSheet(true);
    const result = await syncRolesToGoogleSheets(employees, gsConfig);
    setTestingSheet(false);
    showToast(result.ok ? `Test sync OK — ${result.rowsSynced} rows pushed` : `Test failed: ${result.error}`, result.ok ? "success" : "error");
  };

  // ─── Navigation ──────────────────────────────────────────────────────────

  const openCreate = () => {
    const id = nextId(employees);
    setFormId(id); setFormEmpId(genEmpId(id));
    setForm({ role: "Project Manager", name: "", email: "", national_id: "", join_date: new Date().toISOString().split("T")[0], department: "Market", full_time: true, manager_id: null });
    setEditingId(null); setPage("form");
  };

  const openEdit = (e: Employee) => {
    setFormId(e.id); setFormEmpId(e.emp_id);
    setForm({ role: e.role, name: e.name, email: e.email, national_id: e.national_id, join_date: toIsoDate(e.join_date), department: e.department, full_time: e.full_time, manager_id: e.manager_id });
    setEditingId(e.id); setPage("form");
  };

  // ─── CRUD ─────────────────────────────────────────────────────────────────

  const saveEmployee = async () => {
    if (!form.name.trim()) { showToast("Name is required", "error"); return; }
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) { showToast("Valid email is required", "error"); return; }
    if (!form.national_id.trim()) { showToast("National ID is required", "error"); return; }
    if (!form.join_date) { showToast("Join date is required", "error"); return; }
    if (form.role === "Project Manager" && form.manager_id === null) { showToast("Project Managers must be assigned a manager", "error"); return; }

    const jd = formatDate(form.join_date);
    const updated: Employee[] = editingId !== null
      ? employees.map((e) => e.id === editingId ? { ...e, ...form, join_date: jd } : e)
      : [...employees, { id: formId, emp_id: formEmpId, ...form, join_date: jd }];

    setEmployees(updated);
    await syncAll(updated);
    showToast(editingId ? "Employee updated" : "Employee created");
    setPage("list");
  };

  const deleteEmployee = async (id: number) => {
    if (!window.confirm("Delete this employee?")) return;
    const sb = getSB(dbConfig);
    if (sb) {
      setSbStatus("syncing");
      try { const { error } = await sb.from(SUPABASE_TABLE).delete().eq("id", id); setSbStatus(error ? "error" : "success"); }
      catch { setSbStatus("error"); }
    }
    const updated = employees.filter((e) => e.id !== id);
    setEmployees(updated);
    await syncToSheets(updated);
    showToast("Employee deleted");
  };

  const exportCSV = () => {
    const header = ["ID", "Emp ID", "Role", "Name", "National ID", "Join Date", "Department", "Full-time", "Manager ID"];
    const rows = employees.map((e) => [e.id, e.emp_id, e.role, `"${e.name}"`, e.national_id, e.join_date, e.department, e.full_time ? "Yes" : "No", e.manager_id ?? ""]);
    const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = "employees.csv"; a.click();
    showToast("CSV exported");
  };

  // ─── Derived ──────────────────────────────────────────────────────────────

  const q = search.toLowerCase();
  const filtered = employees.filter((e) => e.name.toLowerCase().includes(q) || e.department.toLowerCase().includes(q) || e.emp_id.toLowerCase().includes(q) || e.national_id.includes(q) || e.role.includes(q));
  const financeList = filtered.filter((e) => e.role === "finance");
  const managerList = filtered.filter((e) => e.role === "manager");
  const agentList   = filtered.filter((e) => e.role === "Project Manager");
  const projectManagerList = filtered.filter((e) => e.role === "Project Manager");
  const managerOptions = employees.filter((e) => e.role === "manager");
  const managerName = (id: number | null) => employees.find((e) => e.id === id)?.name ?? "-";

  const SyncPip = ({ status }: { status: SyncStatus }) => {
    if (status === "idle") return null;
    const c: Record<SyncStatus, string> = { idle: "", syncing: "#BA7517", success: "#3B6D11", error: "#A32D2D" };
    return <span style={{ width: 7, height: 7, borderRadius: "50%", background: c[status], display: "inline-block", marginLeft: 4 }} />;
  };

  const EmployeeRow = ({ e }: { e: Employee }) => (
    <tr style={{ borderBottom: "0.5px solid #eef3fb" }}>
      <td style={{ padding: "12px 14px" }}><span style={{ background: "#E6F1FB", color: "#0C447C", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100, fontFamily: "monospace" }}>{e.id}</span></td>
      <td style={{ padding: "12px 14px" }}><span style={{ background: "#E6F1FB", color: "#0C447C", fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100, fontFamily: "monospace" }}>{e.emp_id}</span></td>
      <td style={{ padding: "12px 14px" }}><RoleBadge role={e.role} /></td>
      <td style={{ padding: "12px 14px", fontWeight: 500 }}>{e.name}</td>
      <td style={{ padding: "12px 14px", fontSize: 12, color: "#555" }}>{e.email}</td>
      <td style={{ padding: "12px 14px", fontFamily: "monospace", fontSize: 12, color: "#555" }}>{e.national_id}</td>
      <td style={{ padding: "12px 14px", color: "#555" }}>{e.join_date}</td>
      <td style={{ padding: "12px 14px" }}><span style={{ background: "#fff", border: "0.5px solid #ccc", borderRadius: 100, fontSize: 12, padding: "3px 10px" }}>{e.department}</span></td>
      <td style={{ padding: "12px 14px" }}>{e.full_time ? <FiCheck size={16} style={{ color: "#185FA5" }} /> : <FiX size={16} style={{ color: "#bbb" }} />}</td>
      <td style={{ padding: "12px 14px", fontSize: 13, color: e.manager_id ? "#185FA5" : "#bbb" }}>{e.role === "Project Manager" ? managerName(e.manager_id) : <span style={{ color: "#ccc", fontSize: 12 }}>—</span>}</td>
      <td style={{ padding: "12px 14px" }}>
        <div style={{ display: "flex", gap: 5, justifyContent: "flex-end" }}>
          <button style={{ ...iconBtn, color: "#185FA5", border: "0.5px solid #B5D4F4" }} onClick={() => openEdit(e)} title="Edit"><FiEdit2 size={13} /></button>
          <button style={{ ...iconBtn, color: "#A32D2D", border: "0.5px solid #F7C1C1" }} onClick={() => deleteEmployee(e.id)} title="Delete"><FiTrash2 size={13} /></button>
        </div>
      </td>
    </tr>
  );

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: "#fff", minHeight: "100vh", padding: "24px 28px", color: "#111" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap');
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        input:focus, select:focus { outline:none; border-color:#185FA5 !important; box-shadow:0 0 0 3px #E6F1FB; }
        button:active { opacity:.85; }
        tbody tr:hover td { background:#F7FAFF; }
      `}</style>

      {/* ═══ SETTINGS ═══════════════════════════════════════════════════════ */}
      {page === "settings" && (
        <GoogleSheetsSettings config={gsConfig} onSave={handleSaveGsConfig} onBack={() => setPage("list")} onTest={handleTestSync} testing={testingSheet} />
      )}

      {/* ═══ LIST ════════════════════════════════════════════════════════════ */}
      {page === "list" && (
        <>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontSize: 24, fontWeight: 600, margin: 0 }}>Employees</h1>
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                {sbStatus !== "idle" && <span style={{ fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>SB<SyncPip status={sbStatus} /></span>}
                {sheetStatus !== "idle" && <span style={{ fontSize: 11, color: "#888", display: "flex", alignItems: "center", gap: 4 }}>GS<SyncPip status={sheetStatus} /></span>}
                {(sbStatus === "syncing" || sheetStatus === "syncing" || pulling) && <FiLoader size={12} style={{ color: "#BA7517", animation: "spin 1s linear infinite" }} />}
              </div>
            </div>

            <div style={{ display: "flex", gap: 8 }}>
              {/* Pull from Sheets button */}
              <button
                style={{ ...outlineBtn, borderColor: gsConfig.webAppUrl ? "#C0DD97" : "#d0d7e2", color: gsConfig.webAppUrl ? "#3B6D11" : "#999", opacity: pulling ? 0.6 : 1 }}
                onClick={handlePullFromSheets}
                disabled={pulling || !gsConfig.webAppUrl}
                title={gsConfig.webAppUrl ? "Pull employees from Google Sheets" : "Configure Google Sheets first"}
              >
                {pulling
                  ? <FiLoader size={14} style={{ animation: "spin 1s linear infinite" }} />
                  : <FiRefreshCw size={14} />}
                {pulling ? "Pulling…" : "Pull from Sheets"}
              </button>

              <button
                style={{ ...iconBtn, borderColor: gsConfig.webAppUrl ? "#C0DD97" : "#d0d7e2", color: gsConfig.webAppUrl ? "#3B6D11" : "#555", position: "relative" }}
                onClick={() => setPage("settings")}
                title={gsConfig.webAppUrl ? "Google Sheets connected — click to configure" : "Configure Google Sheets sync"}
              >
                <span style={{ fontSize: 13, fontWeight: 700 }}>⊞</span>
                {gsConfig.webAppUrl && <span style={{ position: "absolute", top: -3, right: -3, width: 8, height: 8, background: "#3B6D11", borderRadius: "50%", border: "1.5px solid #fff" }} />}
              </button>

              <button style={iconBtn} onClick={() => { setDbConfig(loadDBConfig()); setGsConfig(loadGoogleSheetsConfig()); resetSB(); showToast("Config reloaded"); }} title="Reload config">
                <FiRefreshCw size={15} />
              </button>
              <button style={iconBtn} onClick={exportCSV} title="Export CSV"><FiDownload size={15} /></button>
              <button style={primaryBtn} onClick={openCreate}><FiPlus size={15} /> Create</button>
            </div>
          </div>

          {!gsConfig.webAppUrl && (
            <div style={{ background: "#FFFBEB", border: "0.5px solid #F9A825", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#795548", marginBottom: 14, display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={() => setPage("settings")}>
              <FiAlertCircle size={14} style={{ flexShrink: 0 }} />
              Google Sheets sync not configured — employee data won't be pushed to the <strong>Roles</strong> tab.
              <span style={{ marginLeft: "auto", color: "#185FA5", textDecoration: "underline", fontWeight: 500 }}>Configure →</span>
            </div>
          )}

          <div style={{ position: "relative", maxWidth: 280, marginBottom: 16 }}>
            <FiSearch size={14} style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", color: "#888" }} />
            <input style={{ ...inputStyle, paddingLeft: 30, fontSize: 13 }} placeholder="Search employees..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <div style={{ background: "#F8FAFE", borderRadius: 12, border: "0.5px solid #dde8f5", overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr>{["ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Full-time", "Manager", ""].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "11px 14px", fontWeight: 600, fontSize: 11, color: "#888", borderBottom: "0.5px solid #dde8f5", background: "#F8FAFE", whiteSpace: "nowrap", letterSpacing: "0.04em", textTransform: "uppercase" }}>{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {financeList.length > 0 && <><SectionHeader label="Finance" count={financeList.length} icon={<FiBriefcase size={13} />} />{financeList.map((e) => <EmployeeRow key={e.id} e={e} />)}</>}
                {managerList.length > 0 && <><SectionHeader label="Managers" count={managerList.length} icon={<FiShield size={13} />} />{managerList.map((e) => <EmployeeRow key={e.id} e={e} />)}</>}
                {agentList.length > 0   && <><SectionHeader label="Agents"   count={agentList.length}   icon={<FiUsers size={13} />}    />{agentList.map((e) => <EmployeeRow key={e.id} e={e} />)}</>}
                {filtered.length === 0 && (
                  <tr><td colSpan={11} style={{ textAlign: "center", padding: "40px 0", color: "#aaa" }}>
                    <FiUsers size={28} style={{ display: "block", margin: "0 auto 8px" }} />
                    No employees found.
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 14 }}>
            {[{ count: financeList.length, ...ROLE_META.finance }, { count: managerList.length, ...ROLE_META.manager }, { count: agentList.length, ...ROLE_META["Project Manager"] }].map((s) => (
              <div key={s.label} style={{ background: s.bg, border: `0.5px solid ${s.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13 }}>
                <span style={{ color: s.color, fontWeight: 600 }}>{s.count}</span>
                <span style={{ color: s.color, marginLeft: 5, opacity: 0.75 }}>{s.label}</span>
              </div>
            ))}
            <div style={{ background: "#F8FAFE", border: "0.5px solid #dde8f5", borderRadius: 8, padding: "8px 14px", fontSize: 13, color: "#888", marginLeft: "auto" }}>{employees.length} total</div>
          </div>
        </>
      )}

      {/* ═══ FORM ════════════════════════════════════════════════════════════ */}
      {page === "form" && (
        <>
          <div style={{ fontSize: 13, color: "#888", marginBottom: 12, display: "flex", alignItems: "center", gap: 6 }}>
            <button onClick={() => setPage("list")} style={{ background: "none", border: "none", color: "#185FA5", cursor: "pointer", padding: 0, fontSize: 13, textDecoration: "underline" }}>Employees</button>
            <FiChevronRight size={13} /><span>{editingId ? "Edit" : "New"}</span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 24 }}>{editingId ? "Edit Employee" : "New Employee"}</h1>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, maxWidth: 720 }}>
            <div>
              <label style={labelStyle}>Record ID</label>
              <input style={{ ...inputStyle, background: "#F5F7FA", color: "#999", cursor: "not-allowed" }} value={formId} readOnly />
            </div>
            <div>
              <label style={labelStyle}>Employee ID <span style={{ color: "#185FA5", fontWeight: 400 }}>(auto-generated)</span></label>
              <input style={{ ...inputStyle, background: "#E6F1FB", color: "#0C447C", cursor: "not-allowed", fontFamily: "monospace", fontWeight: 600 }} value={formEmpId} readOnly />
            </div>

            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Role</label>
              <div style={{ display: "flex", gap: 10 }}>
                {(["finance", "manager", "Project Manager"] as EmployeeRole[]).map((r) => {
                  const m = ROLE_META[r]; const selected = form.role === r;
                  return <button key={r} onClick={() => setForm({ ...form, role: r, manager_id: r !== "Project Manager" ? null : form.manager_id })} style={{ flex: 1, padding: "10px 0", borderRadius: 8, cursor: "pointer", fontWeight: 600, fontSize: 13, border: selected ? `2px solid ${m.color}` : "0.5px solid #d0d7e2", background: selected ? m.bg : "#fff", color: selected ? m.color : "#888", display: "flex", alignItems: "center", justifyContent: "center", gap: 7, transition: "all 0.15s" }}>{m.icon} {m.label}</button>;
                })}
              </div>
            </div>

            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </div>
            <div style={{ gridColumn: "1/-1" }}>
              <label style={labelStyle}>Email <span style={{ color: "#185FA5", fontWeight: 400 }}>(used for login)</span></label>
              <input style={inputStyle} type="email" placeholder="employee@company.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>National ID</label>
              <input style={inputStyle} placeholder="National ID number" value={form.national_id} onChange={(e) => setForm({ ...form, national_id: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Join Date</label>
              <input style={inputStyle} type="date" value={form.join_date} onChange={(e) => setForm({ ...form, join_date: e.target.value })} />
            </div>
            <div>
              <label style={labelStyle}>Department</label>
              <select style={inputStyle} value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
                {DEPARTMENTS.map((d) => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {form.role === "Project Manager" && (
              <div style={{ gridColumn: "1/-1" }}>
                <label style={labelStyle}>Assigned Manager <span style={{ color: "#A32D2D", fontWeight: 400 }}>*required for agents</span></label>
                {managerOptions.length === 0
                  ? <div style={{ background: "#FFF8E1", border: "0.5px solid #F9A825", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#795548" }}><FiAlertCircle size={14} style={{ marginRight: 6, verticalAlign: -2 }} />No managers found. Create a Manager role employee first.</div>
                  : <select style={{ ...inputStyle, borderColor: form.manager_id === null ? "#E24B4A" : "#d0d7e2" }} value={form.manager_id ?? ""} onChange={(e) => setForm({ ...form, manager_id: e.target.value ? Number(e.target.value) : null })}>
                      <option value="">Select a manager...</option>
                      {managerOptions.map((m) => <option key={m.id} value={m.id}>{m.name} ({m.emp_id})</option>)}
                    </select>}
              </div>
            )}

            <div style={{ gridColumn: "1/-1", display: "flex", alignItems: "center", gap: 10 }}>
              <input type="checkbox" id="fulltime" checked={form.full_time} onChange={(e) => setForm({ ...form, full_time: e.target.checked })} style={{ width: 18, height: 18, accentColor: "#185FA5", cursor: "pointer" }} />
              <label htmlFor="fulltime" style={{ fontSize: 14, cursor: "pointer", userSelect: "none" }}>Full-time</label>
            </div>
          </div>

          <div style={{ display: "flex", gap: 10, marginTop: 24, alignItems: "center" }}>
            <button style={outlineBtn} onClick={() => setPage("list")}><FiArrowLeft size={14} /> Back</button>
            <button style={primaryBtn} onClick={saveEmployee}><FiSave size={14} /> Save Employee</button>
            {(sbStatus === "syncing" || sheetStatus === "syncing") && <span style={{ fontSize: 12, color: "#BA7517", display: "flex", alignItems: "center", gap: 5 }}><FiLoader size={12} style={{ animation: "spin 1s linear infinite" }} /> Syncing…</span>}
          </div>
        </>
      )}

      <Toast message={toast.message} type={toast.type} visible={toast.visible} />
    </div>
  );
};

export default Employees;