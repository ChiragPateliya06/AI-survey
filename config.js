/**
 * Configuration file for the Google Form survey.
 * 
 * After deploying your Google Apps Script as a Web App:
 * 1. Replace the GOOGLE_SCRIPT_URL below with your deployed Web App URL.
 * 2. Replace the SPREADSHEET_ID in GOOGLE_SHEET_EXPORT_URL with your Google Sheet ID.
 */

const CONFIG = {
  // Your Google Apps Script Web App URL (replace with yours after deployment)
  // e.g. "https://script.google.com/macros/s/AKfycbz.../exec"
  GOOGLE_SCRIPT_URL: "https://script.google.com/macros/s/AKfycbyCen0ZJhxTlXXrPRgC4zW9QKYszTGAXim1kH7CTMNbL20l7-rL2bvC_BQqrxkM01dAjw/exec", 
  
  // URL to download the Google Sheet directly as Excel (.xlsx)
  // Replace YOUR_SHEET_ID with your actual Google Sheet ID
  GOOGLE_SHEET_EXPORT_URL: "https://docs.google.com/spreadsheets/d/1XpJ0ueAVhsFvnyMkMh4LOBDCcPdKf46Lja487m_cgm4/export?format=xlsx"
};
