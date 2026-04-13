import { ElectronAPI } from '@electron-toolkit/preload'

declare global {
  interface Window {
    electron: ElectronAPI
    api: {
      getAccounts: () => Promise<Array<{ id: string, name: string, account: string, bannedUntil?: number | null }>>
      addAccount: (name: string, acc: string, pass: string) => Promise<{ success: boolean, id?: string, error?: string }>
      deleteAccount: (id: string) => Promise<{ success: boolean }>
      setBanTime: (id: string, timestamp: number | null) => Promise<{ success: boolean, error?: string }>
      getDriverStatus: () => Promise<boolean>
      selectAndLoadDriver: () => Promise<{ success: boolean, error?: string }>
      getWegamePath: () => Promise<string | null>
      selectWegameExe: () => Promise<{ success: boolean, error?: string, path?: string }>
      checkWegameRunning: () => Promise<boolean>
      killAndStartWegame: () => Promise<{ success: boolean, error?: string }>
      cancelStartWegame: () => Promise<void>
      getFlowConfig: () => Promise<Record<string, number>>
      saveFlowConfig: (conf: Record<string, number>) => Promise<{ success: boolean }>
      startLogin: (id: string) => Promise<{ success: boolean, error?: string }>
      onLoginProgress: (callback: (msg: string) => void) => void
    }
  }
}
