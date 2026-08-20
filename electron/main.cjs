const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const fs = require("fs");
const database = require("./database.cjs");


function broadcast(channel, ...args) {
  BrowserWindow.getAllWindows().forEach(win => {
    if (!win.isDestroyed()) {
      win.webContents.send(channel, ...args);
    }
  });
}

ipcMain.handle("db:table", async (event, action, table, payload) => {
  try {
    let result;
    switch (action) {
      case "list":
        result = database.list(table);
        break;
      case "get":
        result = database.get(table, payload.id);
        break;
      case "insert": {
        result = database.insert(table, payload.data);
        if (result.success) {
          broadcast("db:changed", table);
        }
        break;
      }
      case "update": {
        result = database.update(table, payload.id, payload.data);
        if (result.success) {
          broadcast("db:changed", table);
        }
        break;
      }
      case "delete": {
        result = database.delete(table, payload.id);
        if (result.success) {
          broadcast("db:changed", table);
        }
        break;
      }
      case "clear": {
        result = database.clear(table);
        if (result.success) {
          broadcast("db:changed", table);
        }
        break;
      }
      case "deleteByPatient": {
        result = database.deleteByPatient(table, payload.patientId);
        if (result.success) {
          broadcast("db:changed", table);
        }
        break;
      }
      case "count":
        result = database.count(table);
        break;
      case "searchPatients":
        result = database.searchPatients(payload.query);
        break;
      case "getConsultationsByPatient":
        result = database.getConsultationsByPatient(payload.patientId);
        break;
      case "getPrescriptionsByPatient":
        result = database.getPrescriptionsByPatient(payload.patientId);
        break;
      case "getDocumentsByPatient":
        result = database.getDocumentsByPatient(payload.patientId);
        break;
      case "getDocuments":
        result = database.getDocuments();
        break;
      case "getAppointments":
        result = database.getAppointments();
        break;
      case "getCertificates":
        result = database.getCertificates();
        break;
      case "getActivityLogs":
        result = database.getActivityLogs();
        break;
      case "getPatients":
        result = database.getPatients();
        break;
      case "getConsultations":
        result = database.getConsultations();
        break;
      case "getPrescriptions":
        result = database.getPrescriptions();
        break;
      case "getReferrals":
        result = database.getReferrals();
        break;
      case "getReferralsByPatient":
        result = database.getReferralsByPatient(payload.patientId);
        break;
      case "getReminders":
        result = database.getReminders();
        break;
      case "getRemindersByPatient":
        result = database.getRemindersByPatient(payload.patientId);
        break;
      case "getChangeLogs":
        result = database.getChangeLogs();
        break;
      case "getChangeHistory":
        result = database.getChangeHistory(payload.entityType, payload.entityId);
        break;
      case "getSettings":
        result = { success: true, data: database.getSettings(payload.key) };
        break;
      case "setSettings":
        result = database.setSettings(payload.key, payload.value);
        if (result.success) {
          broadcast("db:changed", "settings");
        }
        break;
      case "getDoctorProfile":
        result = { success: true, data: database.getDoctorProfile() };
        break;
      case "saveDoctorProfile":
        result = database.saveDoctorProfile(payload.data);
        if (result.success) {
          broadcast("db:changed", "doctor");
        }
        break;
      case "exportAll":
        result = database.exportAll();
        break;
      case "importBackup":
        result = database.importBackup(payload.data);
        if (result.success) {
          broadcast("db:changed", "*");
        }
        break;
      default:
        result = { success: false, error: `Unknown action: ${action}` };
    }
    return result;
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("backup:save", async (event, content) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: "Save EMR Backup",
      defaultPath: path.join(app.getPath("home"), `medicare_emr_backup_${new Date().toISOString().split("T")[0]}.json`),
      filters: [{ name: "JSON Backup", extensions: ["json"] }]
    });
    if (filePath) {
      fs.writeFileSync(filePath, content, "utf-8");
      return { success: true, path: filePath };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

ipcMain.handle("backup:read", async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: "Select EMR Backup File",
      filters: [{ name: "JSON Backup", extensions: ["json"] }],
      properties: ["openFile"]
    });
    if (filePaths && filePaths.length > 0) {
      const content = fs.readFileSync(filePaths[0], "utf-8");
      return { success: true, content, path: filePaths[0] };
    }
    return { success: false, cancelled: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
});

const { safeStorage } = require("electron");

const getSecureStoragePath = () => path.join(app.getPath("userData"), "secure_store.json");

function readSecureStore() {
  const storePath = getSecureStoragePath();
  if (!fs.existsSync(storePath)) return {};
  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeSecureStore(store) {
  const storePath = getSecureStoragePath();
  fs.writeFileSync(storePath, JSON.stringify(store), "utf-8");
}

ipcMain.handle("secure-storage:get", async (event, key) => {
  try {
    const store = readSecureStore();
    const hexData = store[key];
    if (!hexData) return { success: true, data: null };
    
    if (safeStorage.isEncryptionAvailable()) {
      const buffer = Buffer.from(hexData, "hex");
      return { success: true, data: safeStorage.decryptString(buffer) };
    } else {
      return { success: true, data: Buffer.from(hexData, "hex").toString("utf-8") };
    }
  } catch (err) {
    console.error("secure-storage:get error", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("secure-storage:set", async (event, key, value) => {
  try {
    const store = readSecureStore();
    let hexData;
    if (safeStorage.isEncryptionAvailable()) {
      const encryptedBuffer = safeStorage.encryptString(value);
      hexData = encryptedBuffer.toString("hex");
    } else {
      hexData = Buffer.from(value, "utf-8").toString("hex");
    }
    store[key] = hexData;
    writeSecureStore(store);
    return { success: true };
  } catch (err) {
    console.error("secure-storage:set error", err);
    return { success: false, error: err.message };
  }
});

ipcMain.handle("secure-storage:delete", async (event, key) => {
  try {
    const store = readSecureStore();
    delete store[key];
    writeSecureStore(store);
    return { success: true };
  } catch (err) {
    console.error("secure-storage:delete error", err);
    return { success: false, error: err.message };
  }
});

function createWindow() {
  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: "MediCare EMR",
    icon: path.join(__dirname, "Applogo.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });
  win.setMenuBarVisibility(false);
  const isDev = !app.isPackaged;
  if (isDev) {
    win.loadURL("http://localhost:3000").catch(() => {
      win.loadFile(path.join(__dirname, "../dist/index.html"));
    });
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
