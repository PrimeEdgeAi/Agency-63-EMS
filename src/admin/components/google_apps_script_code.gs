// Google Apps Script (Code.gs) — team/roles only endpoint
// Deploy: Extensions → Apps Script → New project (or replace existing) →
// Deploy → New deployment → Web app → Execute as: Me → Who has access: Anyone
// This script now only supports team/roles updates. Event workflow data
// must be handled by a separate backend or workflow system.

function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById("1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE");
    var body = e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;

    if (!body || typeof body !== "object") return errorResponse("Empty or invalid payload");

    // Only accept team/roles payloads.
    if (Array.isArray(body)) {
      writeRoles(ss, body);
      return successResponse({ status: "ok", type: "roles" });
    }

    if (body.type !== 'roles') return errorResponse("This endpoint only accepts 'roles' payloads.");

    writeRoles(ss, body.payload || []);
    return successResponse({ status: "ok", type: 'roles' });
  } catch (err) {
    return errorResponse(err.toString());
  }
}

function doGet(e) {
  try {
    var callback = e.parameter.callback;
    var ss = SpreadsheetApp.openById("1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE");

    var roles = readSheetAsObjects(ss, "Roles", [
      "ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Employment Type", "Full-time", "Manager ID", "Manager Name"
    ]);

    var json = JSON.stringify({ status: "ok", roles: roles });
    return wrapResponse(json, callback);
  } catch (err) {
    var errJson = JSON.stringify({ status: "error", message: err.toString() });
    return wrapResponse(errJson, e.parameter.callback);
  }
}

function writeRoles(ss, incoming) {
  if (!Array.isArray(incoming)) return;
  var sheet = ss.getSheetByName("Roles");
  var HEADER = ["ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Employment Type", "Full-time", "Manager ID", "Manager Name"];
  ensureHeader(sheet, HEADER);

  if (sheet.getLastRow() > 1) sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn()).clearContent();

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
      emp.employmentType || "",
      emp.full_time || "",
      emp.manager_id || "",
      emp.manager_name || ""
    ]);
  });
}

// Legacy workflow endpoints were removed from this Apps Script.
// Use a dedicated event workflow backend for these operations instead.
// - event_submission
// - recce
// - requisition
// - pay_request

// This script now only updates the Roles sheet for team/roles maintenance.

function ensureHeader(sheet, header) {
  if (sheet.getLastRow() === 0) sheet.appendRow(header);
}

function readSheetAsObjects(ss, sheetName, header) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var lastRow = sheet.getLastRow();
  if (lastRow < 2) return [];
  var values = sheet.getRange(2, 1, lastRow - 1, header.length).getValues();
  return values
    .filter(function(row) { return row.some(function(cell) { return cell !== ""; }); })
    .map(function(row) {
      var obj = {};
      header.forEach(function(key, index) { obj[key] = row[index]; });
      return obj;
    });
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
