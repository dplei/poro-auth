import { is } from '@electron-toolkit/utils'
import { BrowserWindow } from 'electron'
import * as fs from 'fs'
import log from 'electron-log/main'
import * as os from 'os'
import * as path from 'path'
import { autoUpdater } from 'electron-updater'

// The cache dir name must match `updaterCacheDirName` in dev-app-update.yml
const UPDATER_CACHE_DIR = 'poro-auth-updater'

export class UpdateService {
  constructor() {
    // Clean up leftover installer files from the previous update on every startup
    this.cleanupOldUpdateCache()

    // Basic config
    autoUpdater.logger = log
    autoUpdater.autoDownload = false // Do not download automatically

    // In dev mode, fake we are in prod to test updates if dev-app-update.yml exists
    if (is.dev) {
      autoUpdater.forceDevUpdateConfig = true
    }

    this.setupEvents()
  }

  /**
   * electron-updater downloads the installer into the system temp directory
   * (e.g. C:\Users\xxx\AppData\Local\Temp\poro-auth-updater\) and does NOT
   * clean it up after a successful install. We do it ourselves on the next
   * application startup so users don't accumulate stale files on their C drive.
   */
  private cleanupOldUpdateCache() {
    try {
      const cacheDir = path.join(os.tmpdir(), UPDATER_CACHE_DIR)
      if (!fs.existsSync(cacheDir)) return

      const files = fs.readdirSync(cacheDir)
      let cleaned = 0

      for (const file of files) {
        // Only remove installer artifacts — leave any other files untouched
        if (file.endsWith('.exe') || file.endsWith('.blockmap') || file.endsWith('.yml')) {
          try {
            fs.unlinkSync(path.join(cacheDir, file))
            cleaned++
          } catch {
            // File might be locked by another process; skip silently
          }
        }
      }

      if (cleaned > 0) {
        log.info(`[UpdateService] Cleaned up ${cleaned} old installer artifact(s) from cache.`)
      }
    } catch (err) {
      log.warn('[UpdateService] Could not clean update cache:', err)
    }
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
