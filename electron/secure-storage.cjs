const { ipcMain } = require("electron");

const store = new Map();

ipcMain.handle("secure-storage:set", async (_event, key, value) => {
  store.set(key, value);
  return { success: true };
});

ipcMain.handle("secure-storage:get", async (_event, key) => {
  const value = store.get(key);
  return { success: true, data: value };
});

ipcMain.handle("secure-storage:delete", async (_event, key) => {
  store.delete(key);
  return { success: true };
});
