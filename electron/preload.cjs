const { contextBridge } = require("electron");

// Expose safe, localized desktop APIs to the React app window context
contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true
});
