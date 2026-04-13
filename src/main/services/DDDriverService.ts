import fs from 'fs'
import koffi from 'koffi'
import { configManager } from './ConfigManager'

// DD 已知键码与 Windows 虚拟键码
export const DD_CODE = {
  TAB: 300
}

export const VK_CODE = {
  RETURN: 0x0d,
  CONTROL: 0x11,
  A: 0x41,
  BACKSPACE: 0x08
}

export class DDDriverService {
  private static instance: DDDriverService | null = null
  private dd: any = null
  private isInitialized = false

  private constructor() {}

  public static getInstance(): DDDriverService {
    if (!DDDriverService.instance) {
      DDDriverService.instance = new DDDriverService()
    }
    return DDDriverService.instance
  }

  /**
   * 按需加载并初始化 DD 驱动（确保全局只调一次）
   */
  public tryLoadDriver(customDllPath?: string): boolean {
    if (this.isInitialized) return true

    // 先从参数拿，再从配置拿
    let dllPathToTry = customDllPath || configManager.get('ddDriverDllPath')

    if (!dllPathToTry) {
      console.warn('[DDDriver] 尚未配置驱动 DLL 路径，请引导用户绑定。')
      return false
    }

    if (!fs.existsSync(dllPathToTry)) {
      throw new Error(`找不到 DD 驱动 DLL: ${dllPathToTry}。`)
    }

    try {
      const rawDd = koffi.load(dllPathToTry)
      this.dd = {
        DD_btn: rawDd.func('DD_btn', 'int', ['int']),
        DD_mov: rawDd.func('DD_mov', 'int', ['int', 'int']),
        DD_str: rawDd.func('DD_str', 'int', ['str']),
        DD_todc: rawDd.func('DD_todc', 'int', ['int']),
        DD_key: rawDd.func('DD_key', 'int', ['int', 'int'])
      }
    } catch (err: any) {
      throw new Error(`加载 DLL 失败: ${err.message}`)
    }

    // 初始化驱动
    const initResult = this.dd.DD_btn(0)
    if (initResult !== 1) {
      throw new Error(
        `DD 驱动初始化失败，返回值: ${initResult}（预期 1）。\n` +
          `请先完成以下步骤：\n` +
          `  1. 以【管理员身份】运行 ddapp.exe\n` +
          `  2. 确认 ddapp.exe 界面显示驱动已激活\n` +
          `  3. 然后再以管理员身份运行本应用`
      )
    }

    this.isInitialized = true
    console.log('[DDDriver] Driver initialized successfully.')
    return true
  }

  public get isLoaded() {
    return this.isInitialized
  }

  public sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  public async click(x: number, y: number, settleMs: number = 300) {
    if (!this.isInitialized) throw new Error('DD 驱动未初始化')
    this.dd.DD_mov(x, y)
    await this.sleep(50)
    this.dd.DD_btn(1) // 左键按下
    await this.sleep(50)
    this.dd.DD_btn(2) // 左键抬起
    await this.sleep(settleMs)
  }

  public async typeString(text: string, typeDelayMs: number = 100) {
    if (!this.isInitialized) throw new Error('DD 驱动未初始化')
    this.dd.DD_str(text)
    await this.sleep(typeDelayMs * text.length)
  }

  public async pressKnownKey(ddCode: number, settleMs: number = 300) {
    if (!this.isInitialized) throw new Error('DD 驱动未初始化')
    this.dd.DD_key(ddCode, 1) // key down
    await this.sleep(50)
    this.dd.DD_key(ddCode, 2) // key up
    await this.sleep(settleMs)
  }

  public async pressVkKey(vkCode: number, settleMs: number = 300) {
    if (!this.isInitialized) throw new Error('DD 驱动未初始化')
    const dc = this.dd.DD_todc(vkCode)
    if (dc === 0) {
      throw new Error(`DD_todc 转换失败，VK=0x${vkCode.toString(16)}，请确认驱动服务已激活`)
    }
    this.dd.DD_key(dc, 1)
    await this.sleep(50)
    this.dd.DD_key(dc, 2)
    await this.sleep(settleMs)
  }

  public async selectAllAndClear(settleMs: number = 200) {
    if (!this.isInitialized) throw new Error('DD 驱动未初始化')

    const dcCtrl = this.dd.DD_todc(VK_CODE.CONTROL)
    const dcA = this.dd.DD_todc(VK_CODE.A)
    const dcBack = this.dd.DD_todc(VK_CODE.BACKSPACE)

    if (dcCtrl === 0 || dcA === 0 || dcBack === 0) {
      console.warn('[DDDriver] 无法转译常用控制键进行清空操作，跳过清空环节。')
      return
    }

    // Ctrl + A
    this.dd.DD_key(dcCtrl, 1) // Ctrl down
    await this.sleep(50)
    this.dd.DD_key(dcA, 1) // A down
    await this.sleep(50)
    this.dd.DD_key(dcA, 2) // A up
    await this.sleep(50)
    this.dd.DD_key(dcCtrl, 2) // Ctrl up
    await this.sleep(50)

    // Backspace
    this.dd.DD_key(dcBack, 1)
    await this.sleep(50)
    this.dd.DD_key(dcBack, 2)

    await this.sleep(settleMs)
  }
}

export const ddDriver = DDDriverService.getInstance()
