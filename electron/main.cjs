const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
  const isDev = !app.isPackaged;

  const win = new BrowserWindow({
    width: 1366,
    height: 768,
    minWidth: 1024,
    minHeight: 600,
    title: "MediCare EMR",
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  // Remove native window menu bar for premium aesthetic
  win.setMenuBarVisibility(false);

  if (isDev) {
    // Port 3000 matches our package.json dev script
    win.loadURL("http://localhost:3000").catch(() => {
      // Fallback if local dev server is offline
      win.loadFile(path.join(__dirname, "../dist/index.html"));
    });
    // Open DevTools in dev mode
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
