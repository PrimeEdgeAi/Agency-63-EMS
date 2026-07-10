import { useEffect, useState } from "react";
import {
  FiCalendar,
  FiMapPin,
  FiUsers,
//   FiTrendingUp,
  FiFileText,
  FiCheckCircle,
  FiClock,
//   FiAlertCircle,
  FiDollarSign,
//   FiBarChart2,
  FiExternalLink,
} from "react-icons/fi";
import { MdPeopleAlt } from "react-icons/md";
import { TbMoneybag } from "react-icons/tb";

// ─── Types ────────────────────────────────────────────────────────────────────

interface SheetEvent {
  Job_ID: string;
  Description: string;
  Client: string;
  Status: string;
  Client_Lead: string;
  Project_Lead: string;
  Email: string;
  Where: string;
  Start_Date: string;
  End_Date: string;
}

interface SheetClaim {
  Job_ID: string;
  Description: string;
  Project_Lead: string;
  Email: string;
  Days_Worked: number;
  Total_Pay: number;
}

interface SheetRequisition {
  Job_ID: string;
  Supplier: string;
  Category: string;
  Description: string;
  Qty: number;
  Unit_Cost: number;
  Days: number;
  Total: number;
}

interface SheetRole {
  ID: number;
  Emp_ID: string;
  Role: string;
  Name: string;
  Email: string;
  Department: string;
}

interface DashboardData {
  events: SheetEvent[];
  claims: SheetClaim[];
  requisitions: SheetRequisition[];
  roles: SheetRole[];
}

interface AdminDashboardProps {
  sheetsWebAppUrl?: string; // optional: pass to pull live data
}

// ─── Excel serial date → JS Date ─────────────────────────────────────────────
const fromSerial = (serial: number | string): Date | null => {
  const n = Number(serial);
  if (isNaN(n) || n < 1) return null;
  return new Date(Math.round((n - 25569) * 86400 * 1000));
};

const fmtDate = (v: string | number): string => {
  if (!v) return "—";
  const d = typeof v === "number" ? fromSerial(v) : new Date(v as string);
  if (!d || isNaN(d.getTime())) return String(v);
  return d.toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
};

// ─── Static seed data (mirrors the Google Sheet exactly) ─────────────────────
// Replace with a live fetch from your Apps Script doGet URL if desired.

const SEED: DashboardData = {
  events: [
    { Job_ID: "Jumia -Jumia VS KCB 2026-02-20 to 2026-02-22", Description: "Jumia VS KCB", Client: "Jumia", Status: "Event Creation", Client_Lead: "Kevin", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "Kasarani", Start_Date: "2026-02-20", End_Date: "2026-02-22" },
    { Job_ID: "KCB -KCB VS Stanbic 2026-02-21 to 2026-02-21", Description: "KCB VS Stanbic", Client: "KCB", Status: "Event Creation", Client_Lead: "Martin", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "Nyayo Stadium", Start_Date: "2026-02-21", End_Date: "2026-02-21" },
    { Job_ID: "NCBA -NCBA VS KCB 2026-02-21 to 2026-02-22", Description: "NCBA VS KCB", Client: "NCBA", Status: "Event Creation", Client_Lead: "Kevin", Project_Lead: "Eric", Email: "kmongare4@gmail.com", Where: "KICC", Start_Date: "2026-02-21", End_Date: "2026-02-22" },
    { Job_ID: "KTNKTN VS NTV 2026-02-27 to 2026-02-28", Description: "KTN VS NTV", Client: "KTN", Status: "Event Creation", Client_Lead: "Eric", Project_Lead: "Kevin", Email: "ericmunene1410@gmail.com", Where: "KICC", Start_Date: "2026-02-27", End_Date: "2026-02-28" },
    { Job_ID: "Agency63-KCB Safari Rally 2026-03-28to 2026-03-29", Description: "KCB Safari Rally", Client: "Agency63", Status: "Event Creation", Client_Lead: "Faith", Project_Lead: "Eric", Email: "kmongare4@gmail.com", Where: "Naivasha", Start_Date: "2026-03-28", End_Date: "2026-03-29" },
    { Job_ID: "PrimeEdge-Safari Rally 2026-03-28to 2026-03-29", Description: "Safari Rally", Client: "PrimeEdge", Status: "Event Update", Client_Lead: "Kevin", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "KICC", Start_Date: "2026-03-28", End_Date: "2026-03-29" },
    { Job_ID: "Safaricom-Safaricom 25 years 2026-03-26to 2026-03-27", Description: "Safaricom 25 years", Client: "Safaricom", Status: "Event Creation", Client_Lead: "Faith", Project_Lead: "John", Email: "kevin.n.mongare@gmail.com", Where: "Kasarani", Start_Date: "2026-03-26", End_Date: "2026-03-27" },
    { Job_ID: "Cocacola-Coke vs Pepsi 2026-03-28to 2026-03-29", Description: "Coke vs Pepsi", Client: "Cocacola", Status: "Event Creation", Client_Lead: "Kevin", Project_Lead: "Eric", Email: "munene144eric@gmail.com", Where: "Talanta Stadium", Start_Date: "2026-03-28", End_Date: "2026-03-29" },
    { Job_ID: "KCB-KCB BIZ 2026-03-28to 2026-03-30", Description: "KCB BIZ", Client: "KCB", Status: "Event Creation", Client_Lead: "Tonny", Project_Lead: "Kevin", Email: "kmongare4@gmail.com", Where: "Mombasa", Start_Date: "2026-03-28", End_Date: "2026-03-30" },
    { Job_ID: "Colgate-Colgate Back to School 2026-05-08to 2026-05-12", Description: "Colgate Back to School", Client: "Colgate", Status: "Event Creation", Client_Lead: "Marvin", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "Westgate Mall", Start_Date: "2026-05-08", End_Date: "2026-05-12" },
    { Job_ID: "SAF VS Airtel-Saf vs airtel 2026-04-17to 2026-04-18", Description: "Saf vs airtel", Client: "SAF VS Airtel", Status: "Event Creation", Client_Lead: "Tonny", Project_Lead: "Kevin", Email: "kmongare4@gmail.com", Where: "KICC", Start_Date: "2026-04-17", End_Date: "2026-04-18" },
    { Job_ID: "Jumia-Jumia Sale Launch 2026-04-10to 2026-04-12", Description: "Jumia Sale Launch", Client: "Jumia", Status: "Event Update", Client_Lead: "Kevin", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "Kasarani", Start_Date: "2026-04-10", End_Date: "2026-04-12" },
    { Job_ID: "Jumia-Jumia Back To School Campaign 2026-04-24to 2026-04-26", Description: "Jumia Back To School Campaign", Client: "Jumia", Status: "Event Creation", Client_Lead: "John", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "Westgate Mall", Start_Date: "2026-04-24", End_Date: "2026-04-26" },
    { Job_ID: "Agency 63-Agency 63 2026-04-18to 2026-04-19", Description: "Agency 63", Client: "Agency 63", Status: "Event Creation", Client_Lead: "Marvin", Project_Lead: "Eric", Email: "kmongare4@gmail.com", Where: "Westgate Mall", Start_Date: "2026-04-18", End_Date: "2026-04-19" },
    { Job_ID: "KCB Back To School-Back To school 2026-04-24to 2026-04-26", Description: "Back To School", Client: "KCB Back To School", Status: "Event Creation", Client_Lead: "John", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Where: "Mercy", Start_Date: "2026-04-24", End_Date: "2026-04-26" },
    { Job_ID: "NYS-NYS VS Gor 2026-03-28to 2026-03-28", Description: "NYS VS Gor", Client: "NYS", Status: "Event Creation", Client_Lead: "Kevin", Project_Lead: "John", Email: "kevin.n.mongare@gmail.com", Where: "Kasarani", Start_Date: "2026-03-28", End_Date: "2026-03-28" },
  ],
  claims: [
    { Job_ID: "JOB-2024-001", Description: "Jumia Flash Sale Event", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Days_Worked: 3, Total_Pay: 6000 },
    { Job_ID: "JOB-2024-001", Description: "Jumia Flash Sale Event", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Days_Worked: 3, Total_Pay: 6000 },
    { Job_ID: "NCBA -NCBA VS KCB 2026-02-21 to 2026-02-22", Description: "NCBA VS KCB", Project_Lead: "Eric", Email: "kmongare4@gmail.com", Days_Worked: 2, Total_Pay: 4000 },
    { Job_ID: "NCBA -NCBA VS KCB 2026-02-21 to 2026-02-22", Description: "NCBA VS KCB", Project_Lead: "Eric", Email: "kmongare4@gmail.com", Days_Worked: 2, Total_Pay: 4000 },
    { Job_ID: "Agency 63-Agency 63 2026-04-18to 2026-04-19", Description: "Agency 63", Project_Lead: "Eric", Email: "kmongare4@gmail.com", Days_Worked: 2, Total_Pay: 4000 },
    { Job_ID: "Jumia-Jumia Back To School Campaign 2026-04-24to 2026-04-26", Description: "Jumia Back To School Campaign", Project_Lead: "Eric", Email: "ericmunene1410@gmail.com", Days_Worked: 3, Total_Pay: 6000 },
  ],
  requisitions: [
    { Job_ID: "JOB-001", Supplier: "ABC Supplies Ltd", Category: "Office Equipment", Description: "Laptop Purchase", Qty: 5, Unit_Cost: 75000, Days: 7, Total: 375000 },
    { Job_ID: "JOB-123", Supplier: "Acme Corp", Category: "Venue", Description: "Tents", Qty: 50, Unit_Cost: 500, Days: 1, Total: 25000 },
    { Job_ID: "JOB-123", Supplier: "Acme Corp", Category: "Venue", Description: "Tents", Qty: 50, Unit_Cost: 500, Days: 1, Total: 25000 },
    { Job_ID: "Colgate-Colgate Back to School 2026-05-08to 2026-05-12", Supplier: "", Category: "Staffing", Description: "Casuals", Qty: 6, Unit_Cost: 500, Days: 5, Total: 15000 },
    { Job_ID: "Colgate-Colgate Back to School 2026-05-08to 2026-05-12", Supplier: "", Category: "Staffing", Description: "Casuals", Qty: 6, Unit_Cost: 500, Days: 5, Total: 15000 },
    { Job_ID: "Colgate-Colgate Back to School 2026-05-08to 2026-05-12", Supplier: "", Category: "Staffing", Description: "Casuals", Qty: 6, Unit_Cost: 500, Days: 5, Total: 15000 },
    { Job_ID: "Colgate-Colgate Back to School 2026-05-08to 2026-05-12", Supplier: "", Category: "Staffing", Description: "Casuals", Qty: 6, Unit_Cost: 500, Days: 5, Total: 15000 },
    { Job_ID: "JOB-001", Supplier: "ABC Supplies Ltd", Category: "Logistics", Description: "Transport", Qty: 2, Unit_Cost: 15000, Days: 3, Total: 0 },
  ],
  roles: [
    { ID: 1, Emp_ID: "EMP-0001", Role: "agent", Name: "Kevin Mongare", Email: "kmongare4@gmail.com", Department: "Operations" },
    { ID: 2, Emp_ID: "EMP-0002", Role: "agent", Name: "John", Email: "Test@gmail.com", Department: "Sales" },
    { ID: 3, Emp_ID: "EMP-0003", Role: "finance", Name: "Tonny", Email: "kevin.n.mongare@gmail.com", Department: "Sales" },
  ],
};

// ─── Colour tokens ────────────────────────────────────────────────────────────
const C = {
  blue: "#248afd",
  blueDark: "#185FA5",
  bluePale: "#E8F3FF",
  blueMid: "#B8D9FF",
  green: "#3B6D11",
  greenPale: "#EAF3DE",
  greenBorder: "#C0DD97",
  amber: "#BA7517",
  amberPale: "#FFF8E1",
  amberBorder: "#F9A825",
  red: "#A32D2D",
  redPale: "#FDEAEA",
  redBorder: "#F7C1C1",
  slate: "#1C2B3A",
  slateLight: "#4a5568",
  border: "#DDE8F5",
  bg: "#F4F8FF",
  surface: "#FFFFFF",
  textMuted: "#6B7A90",
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

const StatCard = ({
  label, value, sub, icon, accent,
}: {
  label: string; value: string | number; sub?: string;
  icon: React.ReactNode; accent: string;
}) => (
  <div style={{
    background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
    padding: "20px 22px", display: "flex", alignItems: "flex-start", gap: 16,
    boxShadow: "0 1px 4px rgba(36,138,253,0.06)",
  }}>
    <div style={{
      width: 44, height: 44, borderRadius: 11, background: accent + "18",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: accent, flexShrink: 0,
    }}>
      {icon}
    </div>
    <div>
      <div style={{ fontSize: 26, fontWeight: 700, color: C.slate, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: C.slateLight, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: C.textMuted, marginTop: 3 }}>{sub}</div>}
    </div>
  </div>
);

// ─── Section header ───────────────────────────────────────────────────────────

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    fontSize: 13, fontWeight: 700, color: C.blueDark, textTransform: "uppercase",
    letterSpacing: "0.07em", marginBottom: 14, display: "flex", alignItems: "center", gap: 8,
  }}>
    <span style={{ width: 3, height: 16, background: C.blue, borderRadius: 2, display: "inline-block" }} />
    {children}
  </div>
);

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const isUpdate = status === "Event Update";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5,
      background: isUpdate ? C.amberPale : C.bluePale,
      color: isUpdate ? C.amber : C.blueDark,
      border: `1px solid ${isUpdate ? C.amberBorder : C.blueMid}`,
      fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100,
    }}>
      {isUpdate ? <FiClock size={10} /> : <FiCheckCircle size={10} />}
      {status}
    </span>
  );
};

// ─── Role badge ───────────────────────────────────────────────────────────────

const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, { bg: string; color: string; border: string }> = {
    manager: { bg: C.greenPale, color: C.green, border: C.greenBorder },
    finance: { bg: C.bluePale, color: C.blueDark, border: C.blueMid },
    agent: { bg: "#F1EFE8", color: "#5F5E5A", border: "#D3D1C7" },
  };
  const m = map[role] ?? map.agent;
  return (
    <span style={{ background: m.bg, color: m.color, border: `1px solid ${m.border}`, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 100, textTransform: "capitalize" }}>
      {role}
    </span>
  );
};

// ─── Venue bar chart ──────────────────────────────────────────────────────────

const VenueChart = ({ events }: { events: SheetEvent[] }) => {
  const counts: Record<string, number> = {};
  events.forEach((e) => { counts[e.Where] = (counts[e.Where] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 6);
  const max = sorted[0]?.[1] ?? 1;
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
      {sorted.map(([venue, count]) => (
        <div key={venue} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 110, fontSize: 12, color: C.slateLight, flexShrink: 0, textAlign: "right", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{venue}</div>
          <div style={{ flex: 1, background: C.bg, borderRadius: 4, height: 8, overflow: "hidden" }}>
            <div style={{ width: `${(count / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.blue}, ${C.blueDark})`, borderRadius: 4, transition: "width 0.6s ease" }} />
          </div>
          <div style={{ width: 20, fontSize: 12, fontWeight: 700, color: C.blueDark }}>{count}</div>
        </div>
      ))}
    </div>
  );
};

// ─── Client distribution ──────────────────────────────────────────────────────

const ClientChart = ({ events }: { events: SheetEvent[] }) => {
  const counts: Record<string, number> = {};
  events.forEach((e) => { counts[e.Client] = (counts[e.Client] || 0) + 1; });
  const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8);
  const total = sorted.reduce((s, [, n]) => s + n, 0);
  const palette = [C.blue, "#5BA8FF", "#185FA5", "#0C447C", C.amber, "#3B6D11", "#A32D2D", "#7B61FF"];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      {sorted.map(([client, count], i) => (
        <div key={client} style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: palette[i % palette.length], flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: 13, color: C.slateLight }}>{client}</span>
          <span style={{ fontSize: 12, fontWeight: 700, color: C.slate }}>{count}</span>
          <span style={{ fontSize: 11, color: C.textMuted, width: 34, textAlign: "right" }}>{Math.round((count / total) * 100)}%</span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────

export const OverviewPage = ({ sheetsWebAppUrl }: AdminDashboardProps) => {
  const [data, setData] = useState<DashboardData>(SEED);
  const [loading, setLoading] = useState(false);

  // Live fetch from Sheets if URL provided
  useEffect(() => {
    if (!sheetsWebAppUrl) return;
    setLoading(true);
    fetch(sheetsWebAppUrl)
      .then((r) => r.json())
      .then((d) => {
        if (d.events) setData(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [sheetsWebAppUrl]);

  // ── Derived stats ──────────────────────────────────────────────────────────
  const totalEvents = data.events.length;
  const creationEvents = data.events.filter((e) => e.Status === "Event Creation").length;
  const updateEvents = data.events.filter((e) => e.Status === "Event Update").length;
  const uniqueClients = new Set(data.events.map((e) => e.Client)).size;
  const totalClaims = data.claims.reduce((s, c) => s + (Number(c.Total_Pay) || 0), 0);
  const totalReqValue = data.requisitions.reduce((s, r) => s + (Number(r.Total) || 0), 0);
  const teamCount = data.roles.length;

  // Upcoming events (all events sorted by start date, top 5)
  const upcomingEvents = [...data.events]
    .sort((a, b) => new Date(a.Start_Date).getTime() - new Date(b.Start_Date).getTime())
    .slice(0, 6);

  // Claims by lead
  const claimsByLead: Record<string, number> = {};
  data.claims.forEach((c) => {
    if (c.Project_Lead) claimsByLead[c.Project_Lead] = (claimsByLead[c.Project_Lead] || 0) + (Number(c.Total_Pay) || 0);
  });

  // Requisitions by category
  const reqByCategory: Record<string, number> = {};
  data.requisitions.forEach((r) => {
    if (r.Category) reqByCategory[r.Category] = (reqByCategory[r.Category] || 0) + (Number(r.Total) || 0);
  });

  const formatKES = (n: number) =>
    "KES " + n.toLocaleString("en-KE");

  return (
    <div style={{
      fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
      background: C.bg,
      minHeight: "100vh",
      padding: "28px 32px",
      color: C.slate,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&display=swap');
        * { box-sizing: border-box; }
      `}</style>

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: C.blue, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>
            BTL Command Center
          </div>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, color: C.slate }}>Overview</h1>
          <p style={{ fontSize: 13, color: C.textMuted, margin: "4px 0 0" }}>
            Live summary across Events, Claims, Requisitions &amp; Team
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {loading && (
            <span style={{ fontSize: 12, color: C.amber, background: C.amberPale, border: `1px solid ${C.amberBorder}`, padding: "6px 12px", borderRadius: 8 }}>
              Syncing…
            </span>
          )}
          {sheetsWebAppUrl && !loading && (
            <a
              href="https://docs.google.com/spreadsheets/d/1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE/edit"
              target="_blank" rel="noreferrer"
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: C.blue, background: C.bluePale, border: `1px solid ${C.blueMid}`, padding: "7px 13px", borderRadius: 8, textDecoration: "none", fontWeight: 500 }}
            >
              <FiExternalLink size={13} /> Open Sheet
            </a>
          )}
        </div>
      </div>

      {/* ── Stat cards ───────────────────────────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 28 }}>
        <StatCard label="Total Events" value={totalEvents} sub={`${creationEvents} creation · ${updateEvents} update`} icon={<FiCalendar size={20} />} accent={C.blue} />
        <StatCard label="Unique Clients" value={uniqueClients} sub="across all events" icon={<FiFileText size={20} />} accent={C.blueDark} />
        <StatCard label="Claims Paid" value={formatKES(totalClaims)} sub={`${data.claims.length} claim entries`} icon={<TbMoneybag size={20} />} accent={C.amber} />
        <StatCard label="Team Members" value={teamCount} sub="in Roles sheet" icon={<MdPeopleAlt size={20} />} accent={C.green} />
      </div>

      {/* ── Row 2: Events table + Venue chart ────────────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 20, marginBottom: 20 }}>

        {/* Events table */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <div style={{ padding: "18px 20px 14px" }}>
            <SectionTitle>Recent Events</SectionTitle>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Description", "Client", "Lead", "Venue", "Dates", "Status"].map((h) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {upcomingEvents.map((e, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.bg}` }}
                    onMouseEnter={(el) => { el.currentTarget.style.background = C.bg; }}
                    onMouseLeave={(el) => { el.currentTarget.style.background = ""; }}
                  >
                    <td style={{ padding: "11px 14px", fontWeight: 500 }}>{e.Description}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: C.bluePale, color: C.blueDark, fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 100 }}>{e.Client}</span>
                    </td>
                    <td style={{ padding: "11px 14px", color: C.slateLight }}>{e.Project_Lead}</td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, color: C.textMuted, fontSize: 12 }}>
                        <FiMapPin size={11} />{e.Where}
                      </span>
                    </td>
                    <td style={{ padding: "11px 14px", fontSize: 12, color: C.textMuted, whiteSpace: "nowrap" }}>
                      {fmtDate(e.Start_Date)}{e.Start_Date !== e.End_Date ? ` → ${fmtDate(e.End_Date)}` : ""}
                    </td>
                    <td style={{ padding: "11px 14px" }}><StatusBadge status={e.Status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Venue frequency */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <SectionTitle>Events by Venue</SectionTitle>
          <VenueChart events={data.events} />
        </div>
      </div>

      {/* ── Row 3: Client breakdown + Claims + Team ───────────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 20, marginBottom: 20 }}>

        {/* Client breakdown */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <SectionTitle>Events per Client</SectionTitle>
          <ClientChart events={data.events} />
        </div>

        {/* Claims */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <SectionTitle>Claims by Lead</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 18 }}>
            {Object.entries(claimsByLead).sort((a, b) => b[1] - a[1]).map(([lead, total]) => {
              const max = Math.max(...Object.values(claimsByLead));
              return (
                <div key={lead}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 13, color: C.slateLight }}>{lead}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.slate }}>{formatKES(total)}</span>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 4, height: 6 }}>
                    <div style={{ width: `${(total / max) * 100}%`, height: "100%", background: C.amber, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 12, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 12, color: C.textMuted, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total</span>
            <span style={{ fontSize: 16, fontWeight: 700, color: C.amber }}>{formatKES(totalClaims)}</span>
          </div>
        </div>

        {/* Team */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <SectionTitle>Team</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {data.roles.map((r) => (
              <div key={r.ID} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: C.bg, borderRadius: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: "50%",
                  background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0,
                }}>
                  {r.Name.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.slate }}>{r.Name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{r.Email}</div>
                </div>
                <RoleBadge role={r.Role} />
              </div>
            ))}
            {data.roles.length === 0 && (
              <div style={{ textAlign: "center", padding: "20px 0", color: C.textMuted, fontSize: 13 }}>
                <FiUsers size={24} style={{ display: "block", margin: "0 auto 6px", opacity: 0.4 }} />
                No team members yet
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Row 4: Requisitions + Requisition categories ─────────────────── */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20 }}>

        {/* Requisition table */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, overflow: "hidden", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <div style={{ padding: "18px 20px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <SectionTitle>Requisitions</SectionTitle>
            <span style={{ fontSize: 13, fontWeight: 700, color: C.red }}>{formatKES(totalReqValue)}</span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: C.bg }}>
                  {["Job", "Category", "Description", "Qty", "Unit (KES)", "Total (KES)"].map((h) => (
                    <th key={h} style={{ padding: "9px 14px", textAlign: "left", fontWeight: 600, fontSize: 11, color: C.textMuted, textTransform: "uppercase", letterSpacing: "0.04em", borderBottom: `1px solid ${C.border}`, whiteSpace: "nowrap" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.requisitions.filter((r) => r.Total > 0).map((r, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.bg}` }}
                    onMouseEnter={(el) => { el.currentTarget.style.background = C.bg; }}
                    onMouseLeave={(el) => { el.currentTarget.style.background = ""; }}
                  >
                    <td style={{ padding: "11px 14px", fontSize: 11, color: C.textMuted, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {r.Job_ID.split("-")[0]}
                    </td>
                    <td style={{ padding: "11px 14px" }}>
                      <span style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 100, fontSize: 11, padding: "3px 8px" }}>{r.Category || "—"}</span>
                    </td>
                    <td style={{ padding: "11px 14px", fontWeight: 500 }}>{r.Description}</td>
                    <td style={{ padding: "11px 14px", textAlign: "center" }}>{r.Qty}</td>
                    <td style={{ padding: "11px 14px", fontFamily: "monospace", fontSize: 12 }}>{r.Unit_Cost.toLocaleString()}</td>
                    <td style={{ padding: "11px 14px", fontWeight: 700, color: C.red, fontFamily: "monospace", fontSize: 12 }}>{r.Total.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Requisitions by category */}
        <div style={{ background: C.surface, borderRadius: 14, border: `1px solid ${C.border}`, padding: "18px 20px", boxShadow: "0 1px 4px rgba(36,138,253,0.06)" }}>
          <SectionTitle>Spend by Category</SectionTitle>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {Object.entries(reqByCategory).sort((a, b) => b[1] - a[1]).map(([cat, total]) => {
              const max = Math.max(...Object.values(reqByCategory));
              return (
                <div key={cat}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
                    <span style={{ fontSize: 13, color: C.slateLight }}>{cat}</span>
                    <span style={{ fontSize: 12, fontWeight: 700, color: C.red }}>{formatKES(total)}</span>
                  </div>
                  <div style={{ background: C.bg, borderRadius: 4, height: 7 }}>
                    <div style={{ width: `${(total / max) * 100}%`, height: "100%", background: `linear-gradient(90deg, ${C.red}, #D94F4F)`, borderRadius: 4 }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{ marginTop: 20, padding: "12px 14px", background: C.redPale, border: `1px solid ${C.redBorder}`, borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}>
            <FiDollarSign size={18} color={C.red} />
            <div>
              <div style={{ fontSize: 11, color: C.red, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.04em" }}>Total Requisition</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.red }}>{formatKES(totalReqValue)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewPage;

/*
 * ─── USAGE ───────────────────────────────────────────────────────────────────
 *
 * Basic (uses static seed data from the sheet):
 *   <AdminDashboard />
 *
 * Live (fetches from your Apps Script doGet endpoint):
 *   <AdminDashboard sheetsWebAppUrl="https://script.google.com/macros/s/.../exec" />
 *
 * Wire into your router alongside the AdminSidebar:
 *
 *   const [active, setActive] = useState("dashboard");
 *
 *   {active === "dashboard" && <AdminDashboard sheetsWebAppUrl={SHEETS_URL} />}
 *   {active === "team"      && <Employees />}
 *   {active === "billing"   && <ClaimsPage />}
 *
 * The AdminSidebar component you provided expects setActive — add 'dashboard'
 * as the first menu item:
 *   { id: 'dashboard', label: 'Dashboard', icon: FiBarChart2 }
 */