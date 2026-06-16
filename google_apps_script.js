/**
 * Google Apps Script for "data for essay" Survey
 * Attach this script to your Google Sheet to receive submissions and fetch data.
 */

// Handle POST request (Form Submissions)
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  
  // Set up headers if the sheet is empty
  if (sheet.getLastRow() === 0) {
    sheet.appendRow([
      "Timestamp",
      "Submission ID",
      "How often do you use AI tools?",
      "What is your primary use of AI tools?",
      "Do AI tools improve your grades?",
      "Do you rely on AI tools for assignments?",
      "Do AI tools reduce your critical thinking ability?"
    ]);
  }
  
  var data = {};
  
  // Safely extract parameters from event object 'e'
  if (e) {
    if (e.postData && e.postData.contents) {
      try {
        data = JSON.parse(e.postData.contents);
      } catch (err) {
        if (e.parameter) {
          data = e.parameter;
        }
      }
    } else if (e.parameter) {
      data = e.parameter;
    }
  }
  
  var timestamp = new Date();
  var submissionId = "SUB-" + Math.random().toString(36).substring(2, 11).toUpperCase();
  
  // Extract responses (handling JSON key naming)
  var q1 = data.q1 || data["How often do you use AI tools?"] || "";
  var q2 = data.q2 || data["What is your primary use of AI tools?"] || "";
  var q3 = data.q3 || data["Do AI tools improve your grades?"] || "";
  var q4 = data.q4 || data["Do you rely on AI tools for assignments?"] || "";
  var q5 = data.q5 || data["Do AI tools reduce your critical thinking ability?"] || "";
  
  // If run manually from the Google Script editor (e is undefined), generate mock data to prove it works
  if (!e) {
    q1 = "Daily (Apps Script Test)";
    q2 = "Studying / Learning (Apps Script Test)";
    q3 = "Agree (Apps Script Test)";
    q4 = "Sometimes (Apps Script Test)";
    q5 = "Disagree (Apps Script Test)";
  }
  
  sheet.appendRow([
    timestamp,
    submissionId,
    q1,
    q2,
    q3,
    q4,
    q5
  ]);
  
  // Return JSON response with CORS headers
  return ContentService.createTextOutput(JSON.stringify({
    "status": "success",
    "submissionId": submissionId,
    "message": "Response recorded successfully!"
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle GET request (Fetch data for the analytics dashboard)
function doGet(e) {
  var action = (e && e.parameter) ? e.parameter.action : "";
  
  if (action === "read") {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var rows = sheet.getDataRange().getValues();
    
    if (rows.length <= 1) {
      return ContentService.createTextOutput(JSON.stringify([]))
        .setMimeType(ContentService.MimeType.JSON);
    }
    
    var headers = rows[0];
    var list = [];
    for (var i = 1; i < rows.length; i++) {
      var row = {};
      for (var j = 0; j < headers.length; j++) {
        var val = rows[i][j];
        if (val instanceof Date) {
          val = val.toISOString();
        }
        row[headers[j]] = val;
      }
      list.push(row);
    }
    
    return ContentService.createTextOutput(JSON.stringify(list))
      .setMimeType(ContentService.MimeType.JSON);
  }
  
  return ContentService.createTextOutput(JSON.stringify({
    "status": "error",
    "message": "Invalid action. Use ?action=read to fetch data."
  })).setMimeType(ContentService.MimeType.JSON);
}
