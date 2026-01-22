import { google } from 'googleapis';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// ES Modules mein sahi path nikalne ka tarika
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ye code 'utils' se ek level bahar ja kar 'backend' root mein file dhundega
const KEY_PATH = path.join(__dirname, '..', 'google-key.json');

// 🔍 Debugging: Check karein ki path kya ban raha hai
console.log("📂 Searching for key at:", KEY_PATH);

if (!fs.existsSync(KEY_PATH)) {
  console.error("❌ ERROR: File abhi bhi nahi mili! Please check naming.");
}

const auth = new google.auth.JWT({
  keyFile: KEY_PATH,
  scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
});

const sheets = google.sheets({ version: 'v4', auth });

export const getSheetData = async (campusName) => {
  try {
    const response = await sheets.spreadsheets.values.get({
        spreadsheetId: '1pR125k42O8nitBgYna26zwWp1CDxWmXHgXAxb5wc5e4',
        range: `${campusName}`, // fetch all columns for the campus
    });
    return response.data.values;
  } catch (err) {
    console.error('❌ API Error:', err.message);
    return null;
  }
};