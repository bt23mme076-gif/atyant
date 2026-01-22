
import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Helper to get Google credentials from env or file
function getGoogleAuth() {
  // Prefer env vars (for live/Render), fallback to key file (for local dev)
  if (
    process.env.GOOGLE_CLIENT_EMAIL &&
    process.env.GOOGLE_PRIVATE_KEY &&
    process.env.GOOGLE_PROJECT_ID
  ) {
    return new google.auth.JWT({
      email: process.env.GOOGLE_CLIENT_EMAIL,
      key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
      subject: process.env.GOOGLE_CLIENT_EMAIL,
    });
  } else {
    // Local: use google-key.json
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const KEY_PATH = path.join(__dirname, '..', 'google-key.json');
    if (!fs.existsSync(KEY_PATH)) {
      throw new Error('google-key.json not found. Set env vars or add the file.');
    }
    return new google.auth.JWT({
      keyFile: KEY_PATH,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
  }
}

const auth = getGoogleAuth();
const sheets = google.sheets({ version: 'v4', auth });

// campusName: sheet/tab name, sheetIdKey: which env var to use (GOOGLE_SHEET_ID1 or 2)
export const getSheetData = async (campusName, sheetIdKey = 'GOOGLE_SHEET_ID1') => {
  try {
    const spreadsheetId = process.env[sheetIdKey];
    if (!spreadsheetId) {
      throw new Error(`Missing required env var: ${sheetIdKey}`);
    }
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${campusName}`,
    });
    return response.data.values;
  } catch (err) {
    console.error('❌ API Error:', err.message);
    return null;
  }
};