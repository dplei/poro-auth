import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'
import log from 'electron-log/main'
import { autoUpdater } from 'electron-updater'

export class UpdateService {
  constructor() {
    // Basic config
    autoUpdater.logger = log
    autoUpdater.autoDownload = false // Do not download automatically

    // In dev mode, fake we are in prod to test updates if dev-app-update.yml exists
    if (is.dev) {
      autoUpdater.forceDevUpdateConfig = true
    }

    this.setupEvents()
  }

  private setupEvents() {
    autoUpdater.on('update-available', (info) => {
      this.notifyAll('update-available', info)
    })

    autoUpdater.on('download-progress', (progressObj) => {
      this.notifyAll('update-progress', progressObj)
    })

    autoUpdater.on('update-downloaded', (_info) => {
      this.notifyAll('update-downloaded')
    })

    autoUpdater.on('error', (err) => {
      this.notifyAll('update-error', err == null ? 'unknown' : (err.message || err).toString())
    })
  }

  private notifyAll(channel: string, ...args: any[]) {
    BrowserWindow.getAllWindows().forEach((win) => {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, ...args)
      }
    })
  }

  public checkUpdate() {
    // Only fetch metadata
    return autoUpdater.checkForUpdates()
  }

  public downloadUpdate() {
    return autoUpdater.downloadUpdate()
  }

  public quitAndInstall() {
    autoUpdater.quitAndInstall()
  }
}

export const updateService = new UpdateService()
