import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

// Custom APIs for renderer
import { ipcRenderer } from 'electron'

const api = {
  getAccounts: () => ipcRenderer.invoke('get-accounts'),
  addAccount: (name: string, acc: string, pass: string) =>
    ipcRenderer.invoke('add-account', name, acc, pass),
  deleteAccount: (id: string) => ipcRenderer.invoke('delete-account', id),
  updateAccountName: (id: string, newName: string) => ipcRenderer.invoke('update-account-name', id, newName),
  setBanTime: (id: string, timestamp: number | null) =>
    ipcRenderer.invoke('update-ban-time', id, timestamp),
  getDriverStatus: () => ipcRenderer.invoke('get-driver-status'),
  selectAndLoadDriver: () => ipcRenderer.invoke('select-and-load-driver'),
  getWegamePath: () => ipcRenderer.invoke('get-wegame-path'),
  selectWegameExe: () => ipcRenderer.invoke('select-wegame-exe'),
  checkWegameRunning: () => ipcRenderer.invoke('check-wegame-running'),
  killAndStartWegame: () => ipcRenderer.invoke('kill-and-start-wegame'),
  cancelStartWegame: () => ipcRenderer.invoke('cancel-start-wegame'),
  getFlowConfig: () => ipcRenderer.invoke('get-flow-config'),
  saveFlowConfig: (conf: any) => ipcRenderer.invoke('save-flow-config', conf),
  startLogin: (id: string) => ipcRenderer.invoke('start-login', id),
  onLoginProgress: (callback: (msg: string) => void) => {
    ipcRenderer.on('login-progress', (_event, msg) => callback(msg))
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
