const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  isDesktop: true,
  platform: process.platform,
  db: {
    invoke: (action, table, payload) => ipcRenderer.invoke("db:table", action, table, payload || {}),
    onChanged: (callback) => {
      const listener = (_event, table) => callback(table);
      ipcRenderer.on("db:changed", listener);
      return () => ipcRenderer.removeListener("db:changed", listener);
    }
  },
  backup: {
    save: (content) => ipcRenderer.invoke("backup:save", content),
    read: () => ipcRenderer.invoke("backup:read")
  },
  secureStorage: {
    get: (key) => ipcRenderer.invoke("secure-storage:get", key),
    set: (key, value) => ipcRenderer.invoke("secure-storage:set", key, value),
    delete: (key) => ipcRenderer.invoke("secure-storage:delete", key)
  }
});
