// ─── GoogleSheetsConnection.ts ────────────────────────────────────────────────
//
// Handles syncing employee data and form submissions to Google Sheets.
//
// KEY CHANGE: The Apps Script below routes payloads by type so each form writes
// to its own sheet tab, while employee Roles sync remains safe and does not
// overwrite unrelated tabs.
//
// SETUP GUIDE:
// ─────────────────────────────────────────────────────────────────────────────
// 1. Open your Google Sheet:
//    https://docs.google.com/spreadsheets/d/1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE/edit
//
// 2. Go to Extensions → Apps Script
//
// 3. Replace any existing code with the Apps Script below, then:
//    Deploy → New Deployment → Web App → Execute as: Me → Who has access: Anyone → Deploy
//
// 4. Copy the Web App URL and save it via saveGoogleSheetsConfig({ webAppUrl: "..." })
//    OR set it in your .env as VITE_GOOGLE_SHEETS_WEB_APP_URL
//
// ─── APPS SCRIPT TO PASTE ────────────────────────────────────────────────────
//
// function doPost(e) {
//   try {
//     var ss = SpreadsheetApp.openById("1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE");
//     var payload = JSON.parse(e.postData.contents);
//
//     if (!payload || typeof payload !== "object") {
//       return errorResponse("Empty or invalid payload");
//     }
//
//     if (Array.isArray(payload)) {
//       writeRoles(ss, payload);
//       return successResponse({ status: "ok", type: "roles" });
//     }
//
//     if (!payload.type) {
//       return errorResponse("Payload must include a type field.");
//     }
//
//     switch (payload.type) {
//       case "event_submission":
//         writeEventSubmission(ss, payload.payload || {});
//         return successResponse({ status: "ok", type: payload.type });
//       case "recce":
//         writeRecce(ss, payload.payload || {});
//         return successResponse({ status: "ok", type: payload.type });
//       case "requisition":
//         writeRequisition(ss, payload.payload || {});
//         return successResponse({ status: "ok", type: payload.type });
//       case "pay_request":
//         writePayRequest(ss, payload.request || {});
//         return successResponse({ status: "ok", type: payload.type });
//       case "roles":
//         writeRoles(ss, payload.payload || []);
//         return successResponse({ status: "ok", type: "roles" });
//       default:
//         return errorResponse("Unsupported payload type: " + payload.type);
//     }
//   } catch (err) {
//     return errorResponse(err.toString());
//   }
// }
//
// function doGet(e) {
//   try {
//     var callback = e.parameter.callback;
//     var ss = SpreadsheetApp.openById("1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE");
//
//     var events = readSheetAsObjects(ss, "Events", [
//       "Job_ID", "Description", "Client", "Status", "Client_Lead", "Project_Lead", "Email", "Where", "Start_Date", "End_Date"
//     ]);
//
//     var requisitions = readSheetAsObjects(ss, "Requisition", [
//       "Job_ID", "Supplier", "Category", "Description", "Qty", "Unit_Cost", "Days", "Total"
//     ]);
//
//     var claims = readSheetAsObjects(ss, "Claims Sheet", [
//       "ID", "Event", "Vendor", "Amount", "Status", "Date", "Category"
//     ]);
//
//     var roles = readSheetAsObjects(ss, "Roles", [
//       "ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Full-time", "Manager"
//     ]);
//
//     var json = JSON.stringify({ status: "ok", events: events, requisitions: requisitions, claims: claims, roles: roles });
//     return wrapResponse(json, callback);
//   } catch (err) {
//     var errJson = JSON.stringify({ status: "error", message: err.toString() });
//     return wrapResponse(errJson, e.parameter.callback);
//   }
// }
//
// function writeRoles(ss, incoming) {
//   var sheet = ss.getSheetByName("Roles");
//   var HEADER = ["ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Full-time", "Manager"];
//   ensureHeader(sheet, HEADER);
//
//   if (sheet.getLastRow() > 1) {
//     sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();
//   }
//
//   incoming.forEach(function(emp) {
//     sheet.appendRow([
//       emp.id || "",
//       emp.emp_id || "",
//       emp.role || "",
//       emp.name || "",
//       emp.email || "",
//       emp.national_id || "",
//       emp.join_date || "",
//       emp.department || "",
//       emp.full_time || "",
//       emp.manager_id || ""
//     ]);
//   });
// }
//
// function writeEventSubmission(ss, payload) {
//   var sheet = ss.getSheetByName("Events");
//   var HEADER = ["Company", "Client", "Status", "Description", "Client Lead", "Project Lead", "Email", "Assistants", "Location", "Start Date", "End Date", "Submitted At"];
//   ensureHeader(sheet, HEADER);
//   sheet.appendRow([
//     payload.company || "",
//     payload.client || "",
//     payload.status || "",
//     payload.description || "",
//     payload.clientLead || "",
//     payload.projectLead || "",
//     payload.email || "",
//     JSON.stringify(payload.assistants || []),
//     payload.location || "",
//     payload.startDate || "",
//     payload.endDate || "",
//     payload.submittedAt || ""
//   ]);
// }
//
// function writeRecce(ss, payload) {
//   var sheet = ss.getSheetByName("Reccee");
//   var HEADER = ["Email", "Job_ID", "Client", "Description", "Reccee Date", "Location", "Attendees", "Distance From Town", "Transport", "Residential Nearby", "Perimeter Wall", "Police Nearby", "Extra Security", "Security Notes", "Medical Nearby", "Medical Notes", "Amenities", "Other Facilities", "Entry Exit", "Event Layout", "Permits", "Challenges", "Company", "Submitted At"];
//   ensureHeader(sheet, HEADER);
//   sheet.appendRow([
//     payload.email || "",
//     payload.job_id || "",
//     payload.client || "",
//     payload.description || "",
//     payload.reccee_date || "",
//     payload.location || "",
//     payload.attendees || "",
//     payload.distance_from_town || "",
//     payload.public_transport || "",
//     payload.residential_nearby || "",
//     payload.perimeter_wall || "",
//     payload.police_nearby || "",
//     payload.extra_security || "",
//     payload.security_notes || "",
//     payload.medical_nearby || "",
//     payload.medical_notes || "",
//     (payload.amenities || []).join(", "),
//     payload.other_facilities || "",
//     payload.entry_exit || "",
//     payload.event_layout || "",
//     payload.permits || "",
//     payload.challenges || "",
//     payload.company || "",
//     payload.submitted_at || ""
//   ]);
// }
//
// function writeRequisition(ss, payload) {
//   var sheet = ss.getSheetByName("Requisition");
//   var HEADER = ["Company", "Job_ID", "Client", "Event Description", "Requestor Name", "Requestor Email", "Date Required", "Line Items", "Total Amount", "Justification", "Notes", "Urgency", "Submitted At"];
//   ensureHeader(sheet, HEADER);
//   sheet.appendRow([
//     payload.company || "",
//     payload.job_id || "",
//     payload.client || "",
//     payload.event_description || "",
//     payload.requestor_name || "",
//     payload.requestor_email || "",
//     payload.date_required || "",
//     JSON.stringify(payload.line_items || []),
//     payload.total_amount || "",
//     payload.justification || "",
//     payload.notes || "",
//     payload.urgency || "",
//     payload.submitted_at || ""
//   ]);
// }
//
// function writePayRequest(ss, request) {
//   var sheet = ss.getSheetByName("Claims Sheet");
//   var HEADER = ["ID", "Event", "Vendor", "Amount", "Status", "Date", "Category"];
//   ensureHeader(sheet, HEADER);
//   sheet.appendRow([
//     request.id || "",
//     request.event || "",
//     request.vendor || "",
//     request.amount || "",
//     request.status || "",
//     request.date || "",
//     request.category || ""
//   ]);
// }
//
// function ensureHeader(sheet, header) {
//   if (sheet.getLastRow() === 0) {
//     sheet.appendRow(header);
//   }
// }
//
// function readSheetAsObjects(ss, sheetName, header) {
//   var sheet = ss.getSheetByName(sheetName);
//   if (!sheet) return [];
//   var lastRow = sheet.getLastRow();
//   if (lastRow < 2) return [];
//   var values = sheet.getRange(2, 1, lastRow - 1, header.length).getValues();
//   return values
//     .filter(function(row) { return row.some(function(cell) { return cell !== ""; }); })
//     .map(function(row) {
//       var obj = {};
//       header.forEach(function(key, index) { obj[key] = row[index]; });
//       return obj;
//     });
// }
//
// function wrapResponse(body, callback) {
//   if (callback) {
//     return ContentService.createTextOutput(callback + "(" + body + ")")
//       .setMimeType(ContentService.MimeType.JAVASCRIPT);
//   }
//   return ContentService.createTextOutput(body)
//     .setMimeType(ContentService.MimeType.JSON);
// }
//
// function successResponse(payload) {
//   return wrapResponse(JSON.stringify(payload), null);
// }
//
// function errorResponse(message) {
//   return wrapResponse(JSON.stringify({ status: "error", message: message }), null);
// }
//
// ─────────────────────────────────────────────────────────────────────────────

import type { Employee } from "./Team";

const STORAGE_KEY = "btl_google_sheets_config";

export interface GoogleSheetsConfig {
  webAppUrl: string;
}

export const loadGoogleSheetsConfig = (): GoogleSheetsConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored) as GoogleSheetsConfig;
  } catch {}
  return {
    webAppUrl: (import.meta as any)?.env?.VITE_GOOGLE_SHEETS_WEB_APP_URL ?? "",
  };
};

export const saveGoogleSheetsConfig = (cfg: GoogleSheetsConfig): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cfg));
};

export const clearGoogleSheetsConfig = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};

export type SyncResult =
  | { ok: true; rowsSynced: number }
  | { ok: false; error: string };

export type PullResult =
  | { ok: true; employees: Employee[] }
  | { ok: false; error: string };

/** Push full employee list to the Roles tab (upsert, no-cors POST). */
export const syncRolesToGoogleSheets = async (
  employees: Employee[],
  config?: GoogleSheetsConfig
): Promise<SyncResult> => {
  const cfg = config ?? loadGoogleSheetsConfig();
  if (!cfg.webAppUrl) return { ok: false, error: "No Google Sheets Web App URL configured." };

  const payload = employees.map((e) => ({
    id: e.id,
    emp_id: e.emp_id,
    role: e.role,
    name: e.name,
    email: e.email,
    national_id: e.national_id,
    join_date: e.join_date,
    department: e.department,
    brand: e.brand,
    full_time: e.full_time ? "Yes" : "No",
    manager_id: e.manager_id ?? "",
  }));

  try {
    await fetch(cfg.webAppUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return { ok: true, rowsSynced: payload.length };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Network error" };
  }
};

/**
 * Pull employees from the Roles tab using JSONP.
 *
 * Apps Script GET requests redirect through Google's auth layer, which
 * strips CORS headers and makes fetch() fail with a CORS error — even
 * when the script is deployed as "Anyone" access.
 *
 * JSONP sidesteps this: we inject a <script> tag pointing at the Apps
 * Script URL with a `?callback=` param. The script wraps its JSON output
 * in a function call, which executes in our page context.
 *
 * Your Apps Script doGet must support this — see the updated script below.
 *
 * ─── UPDATED APPS SCRIPT (replace your current one) ─────────────────────
 *
 * function doGet(e) {
 *   try {
 *     var callback = e.parameter.callback;  // JSONP callback name
 *     var ss = SpreadsheetApp.openById("1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE");
 *     var sheet = ss.getSheetByName("Roles");
 *     var lastRow = sheet.getLastRow();
 *
 *     var employees = [];
 *     if (lastRow > 1) {
 *       var data = sheet.getRange(2, 1, lastRow - 1, 10).getValues();
 *       employees = data
 *         .filter(function(row) { return row[0] !== ""; })
 *         .map(function(row) {
 *           return {
 *             id:          Number(row[0]),
 *             emp_id:      String(row[1]),
 *             role:        String(row[2]),
 *             name:        String(row[3]),
 *             email:       String(row[4]),
 *             national_id: String(row[5]),
 *             join_date:   String(row[6]),
 *             department:  String(row[7]),
 *             full_time:   String(row[8]).toLowerCase() === "yes",
 *             manager_id:  row[9] !== "" ? Number(row[9]) : null
 *           };
 *         });
 *     }
 *
 *     var json = JSON.stringify({ status: "ok", employees: employees });
 *
 *     // If a JSONP callback was requested, wrap in it
 *     if (callback) {
 *       return ContentService.createTextOutput(callback + "(" + json + ")")
 *         .setMimeType(ContentService.MimeType.JAVASCRIPT);
 *     }
 *
 *     return ContentService.createTextOutput(json)
 *       .setMimeType(ContentService.MimeType.JSON);
 *
 *   } catch (err) {
 *     var errJson = JSON.stringify({ status: "error", message: err.toString() });
 *     var callback = e.parameter.callback;
 *     if (callback) {
 *       return ContentService.createTextOutput(callback + "(" + errJson + ")")
 *         .setMimeType(ContentService.MimeType.JAVASCRIPT);
 *     }
 *     return ContentService.createTextOutput(errJson)
 *       .setMimeType(ContentService.MimeType.JSON);
 *   }
 * }
 *
 * ─────────────────────────────────────────────────────────────────────────
 */
export const pullEmployeesFromSheets = (
  config?: GoogleSheetsConfig
): Promise<PullResult> => {
  const cfg = config ?? loadGoogleSheetsConfig();
  if (!cfg.webAppUrl) return Promise.resolve({ ok: false, error: "No Google Sheets Web App URL configured." });

  return new Promise((resolve) => {
    // Unique callback name to avoid collisions
    const cbName = `_gsCallback_${Date.now()}`;
    const timeout = setTimeout(() => {
      cleanup();
      resolve({ ok: false, error: "Request timed out. Check your Apps Script deployment." });
    }, 15000);

    const cleanup = () => {
      clearTimeout(timeout);
      delete (window as any)[cbName];
      const el = document.getElementById(cbName);
      if (el) el.remove();
    };

    // Register global callback that Apps Script will call
    (window as any)[cbName] = (data: any) => {
      cleanup();
      if (data?.status !== "ok") {
        resolve({ ok: false, error: data?.message ?? "Unknown error from Apps Script" });
        return;
      }
      resolve({ ok: true, employees: data.employees as Employee[] });
    };

    // Inject script tag — JSONP request
    const script = document.createElement("script");
    script.id = cbName;
    script.src = `${cfg.webAppUrl}?callback=${cbName}`;
    script.onerror = () => {
      cleanup();
      resolve({ ok: false, error: "Failed to load Apps Script. Check the URL and deployment." });
    };
    document.head.appendChild(script);
  });
};

export const syncSingleEmployee = async (
  allEmployees: Employee[],
  config?: GoogleSheetsConfig
): Promise<SyncResult> => syncRolesToGoogleSheets(allEmployees, config);