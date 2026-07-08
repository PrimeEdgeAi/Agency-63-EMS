var SHEET_ID = "1AO-06SYVS_uVnBWkM5smUFeSoTWUeq0GbFvX7tJr3oE";
var JOB_ID_HEADERS = ["Job_ID", "Job ID", "JobID", "Job Id"];
var RECCE_DONE_HEADERS = ["Recce_Done", "Recce Done", "Reccee_Done", "Reccee Done"];
var ROLE_HEADERS = ["ID", "Emp ID", "Role", "Name", "Email", "National ID", "Join Date", "Department", "Employment Type", "Full-time", "Manager ID", "Manager Name"];

/**
 * Handles POST requests for roles payloads.
 * @param {Object} e Apps Script event object.
 * @return {ContentService.TextOutput}
 */
function doPost(e) {
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : null;

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

    if (body.type !== "roles") {
      return errorResponse("Unsupported payload type: " + body.type);
    }

    writeRoles(ss, Array.isArray(body.payload) ? body.payload : []);
    return successResponse({ status: "ok", type: "roles" });
  } catch (err) {
    return errorResponse(err && err.toString ? err.toString() : String(err));
  }
}

/**
 * Handles GET requests and returns events and recce data.
 * @param {Object} e Apps Script event object.
 * @return {ContentService.TextOutput}
 */
function doGet(e) {
  try {
    var callback = e && e.parameter && e.parameter.callback ? e.parameter.callback : null;
    var ss = SpreadsheetApp.openById(SHEET_ID);

    syncRecceStatusToEvents(ss);

    var events = readSheetAsObjects(ss, "Events");
    var requisitions = readSheetAsObjects(ss, "Reccee");
    var json = JSON.stringify({
      status: "ok",
      events: events,
      requisitions: requisitions
    });

    return wrapResponse(json, callback);
  } catch (err) {
    var errJson = JSON.stringify({ status: "error", message: err && err.toString ? err.toString() : String(err) });
    return wrapResponse(errJson, e && e.parameter && e.parameter.callback ? e.parameter.callback : null);
  }
}

/**
 * Trigger entry point for edit-based synchronization.
 * @param {Object} e Apps Script trigger event.
 */
function onChange(e) {
  syncRecceStatusToEvents();
}

/**
 * Trigger entry point for edit-based synchronization.
 * @param {Object} e Apps Script trigger event.
 */
function onEdit(e) {
  syncRecceStatusToEvents();
}

/**
 * Synchronizes the Events sheet Recce_Done column from the Reccee sheet Job_ID values.
 * @param {Spreadsheet} ss Optional spreadsheet instance.
 */
function syncRecceStatusToEvents(ss) {
  ss = ss || SpreadsheetApp.openById(SHEET_ID);
  var recceSheet = ss.getSheetByName("Reccee");
  var eventsSheet = ss.getSheetByName("Events");
  if (!recceSheet || !eventsSheet) {
    return;
  }

  var recceHeader = getHeaderRow(recceSheet);
  var eventsHeader = getHeaderRow(eventsSheet);
  if (!recceHeader || !eventsHeader) {
    return;
  }

  var recceRows = getDataRows(recceSheet, recceHeader.length);
  var seen = new Set();
  var recceJobIdCol = findHeaderIndex(recceHeader, JOB_ID_HEADERS);
  if (recceJobIdCol !== -1) {
    recceRows.forEach(function(row) {
      var jobId = normalizeJobId(row[recceJobIdCol]);
      if (jobId) {
        seen.add(jobId);
      }
    });
  }

  var eventsJobIdCol = findHeaderIndex(eventsHeader, JOB_ID_HEADERS);
  var eventsRecceDoneCol = findHeaderIndex(eventsHeader, RECCE_DONE_HEADERS);
  if (eventsJobIdCol === -1 || eventsRecceDoneCol === -1) {
    return;
  }

  var eventsRows = getDataRows(eventsSheet, eventsHeader.length);
  if (!eventsRows.length) {
    return;
  }

  var valuesToWrite = eventsRows.map(function(row) {
    var eventJobId = normalizeJobId(row[eventsJobIdCol]);
    return [eventJobId && seen.has(eventJobId) ? "Yes" : "No"];
  });

  eventsSheet.getRange(2, eventsRecceDoneCol + 1, valuesToWrite.length, 1).setValues(valuesToWrite);
}

/**
 * Trigger-friendly wrapper for manual synchronization.
 */
function syncRecceStatusOnDemand() {
  syncRecceStatusToEvents();
}

/**
 * Writes roles to the Roles sheet.
 * @param {Spreadsheet} ss Spreadsheet instance.
 * @param {Array} incoming Role rows to persist.
 */
function writeRoles(ss, incoming) {
  if (!Array.isArray(incoming)) {
    return;
  }

  var sheet = ss.getSheetByName("Roles");
  if (!sheet) {
    return;
  }

  ensureHeader(sheet, ROLE_HEADERS);

  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.getRange(2, 1, lastRow - 1, ROLE_HEADERS.length).clearContent();
  }

  if (!incoming.length) {
    return;
  }

  var rows = incoming.map(function(emp) {
    return [
      emp && emp.id ? emp.id : "",
      emp && emp.emp_id ? emp.emp_id : "",
      emp && emp.role ? emp.role : "",
      emp && emp.name ? emp.name : "",
      emp && emp.email ? emp.email : "",
      emp && emp.national_id ? emp.national_id : "",
      emp && emp.join_date ? emp.join_date : "",
      emp && emp.department ? emp.department : "",
      emp && emp.employmentType ? emp.employmentType : "",
      emp && emp.full_time ? emp.full_time : "",
      emp && emp.manager_id ? emp.manager_id : "",
      emp && emp.manager_name ? emp.manager_name : ""
    ];
  });

  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, ROLE_HEADERS.length).setValues(rows);
}

function ensureHeader(sheet, header) {
  if (!sheet) {
    return;
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(header);
    return;
  }

  var existingHeader = getHeaderRow(sheet);
  if (!existingHeader || existingHeader.length === 0) {
    sheet.getRange(1, 1, 1, header.length).setValues([header]);
  }
}

function getHeaderRow(sheet) {
  if (!sheet) {
    return null;
  }

  var lastColumn = sheet.getLastColumn();
  if (lastColumn === 0) {
    return null;
  }

  return sheet.getRange(1, 1, 1, lastColumn).getValues()[0];
}

function getDataRows(sheet, columnCount) {
  if (!sheet) {
    return [];
  }

  var lastRow = sheet.getLastRow();
  if (lastRow < 2) {
    return [];
  }

  var lastColumn = Math.max(columnCount || sheet.getLastColumn(), 1);
  return sheet.getRange(2, 1, lastRow - 1, lastColumn).getValues();
}

function readSheetAsObjects(ss, sheetName) {
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    return [];
  }

  var headerRow = getHeaderRow(sheet);
  if (!headerRow || headerRow.length === 0) {
    return [];
  }

  var values = getDataRows(sheet, headerRow.length);
  return values
    .filter(function(row) {
      return row.some(function(cell) {
        return cell !== "";
      });
    })
    .map(function(row) {
      var obj = {};
      headerRow.forEach(function(key, index) {
        obj[key] = row[index];
      });
      return obj;
    });
}

function findHeaderIndex(headerRow, candidates) {
  var normalized = headerRow.map(function(colName) {
    return String(colName || "").trim().toLowerCase();
  });

  for (var i = 0; i < normalized.length; i++) {
    for (var j = 0; j < candidates.length; j++) {
      if (normalized[i] === String(candidates[j] || "").trim().toLowerCase()) {
        return i;
      }
    }
  }

  return -1;
}

function normalizeJobId(value) {
  if (value === undefined || value === null) {
    return "";
  }
  var text = String(value).trim();
  return text === "" ? "" : text;
}

function wrapResponse(body, callback) {
  if (callback) {
    return ContentService.createTextOutput(callback + "(" + body + ")").setMimeType(ContentService.MimeType.JAVASCRIPT);
  }

  return ContentService.createTextOutput(body).setMimeType(ContentService.MimeType.JSON);
}

function successResponse(payload) {
  return wrapResponse(JSON.stringify(payload), null);
}

function errorResponse(message) {
  return wrapResponse(JSON.stringify({ status: "error", message: message }), null);
}
