const express = require('express');
const cors = require('cors');
const ping = require('ping');
const fs = require('fs');
const path = require('path');

const app = express();
const port = 3000;

// CORS configuration
app.use(cors({
  origin: '*'
}));

// OLT configuration
const OLTS = [
  { ip: '192.168.8.123', name: 'DBC OLT 1' },
  { ip: '192.168.8.122', name: 'DBC OLT 2' },
  { ip: '192.168.8.121', name: 'DBC OLT 3' },
  { ip: '192.168.8.124', name: 'Syrotech OLT 1' },
  { ip: '192.168.8.125', name: 'Syrotech OLT 2' }
];

// Logging function
function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `${timestamp} - ${message}\n`;
  fs.appendFile(path.join(__dirname, 'olt_monitor.log'), logMessage, (err) => {
    if (err) console.error('Error writing to log file:', err);
  });
  console.log(logMessage);
}

// Check OLT status
async function checkOLTStatus(olt) {
  try {
    const res = await ping.promise.probe(olt.ip, {
      timeout: 10  // Set the timeout without additional options
    });

    // Log the detailed response output for debugging
    log(`Ping response for ${olt.name} (${olt.ip}): ${JSON.stringify(res)}`);
    return {
      ip: olt.ip,
      name: olt.name,
      status: res.alive,  // Check if the OLT is online
      last_checked: new Date().toISOString(),
      response_time: res.time
    };
  } catch (error) {
    log(`Error checking ${olt.name} (${olt.ip}): ${error.message}`);
    return {
      ip: olt.ip,
      name: olt.name,
      status: false,
      last_checked: new Date().toISOString(),
      response_time: 0
    };
  }
}

// API endpoint for OLT statuses
app.get('/api/olts', async (req, res) => {
  try {
    const results = await Promise.all(OLTS.map(checkOLTStatus));
    res.json(results);
  } catch (error) {
    log(`Error in /api/olts: ${error.message}`);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  log(`OLT Monitor backend listening at http://localhost:${port}`);
});
