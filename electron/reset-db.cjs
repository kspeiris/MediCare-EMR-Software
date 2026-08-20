const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const win = new BrowserWindow({
    width: 1024,
    height: 768,
    title: "MediCare EMR - Database Reset",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  win.loadFile(path.join(__dirname, "../dist/index.html"));
}

app.whenReady().then(() => {
  createWindow();

  const reset = async () => {
    const ses = win.webContents.session;
    const keysToReset = [
      "emr_authenticated",
      "emr_dark_mode",
      "emr_doctor",
      "emr_patients",
      "emr_consultations",
      "emr_prescriptions",
      "emr_appointments",
      "emr_certificates",
      "emr_documents",
      "emr_logs",
      "emr_export_logs",
      "emr_username",
      "emr_password"
    ];

    for (const key of keysToReset) {
      await ses.clearStorageData({ storages: ['localStorage'], origin: 'file://', keys: [key] });
    }

    await win.webContents.executeJavaScript(`
      ${keysToReset.map(k => `localStorage.removeItem('${k}');`).join('\n')}
      document.body.innerHTML = '<div style="display:flex;justify-content:center;align-items:center;height:100vh;font-family:sans-serif;"><div><h1>Database Cleared</h1><p>All EMR data has been removed.</p><p>You can close this window.</p></div></div>';
    `);

    setTimeout(() => app.quit(), 2000);
  };

  win.webContents.on('did-finish-load', reset);
});

app.on('window-all-closed', () => app.quit());
