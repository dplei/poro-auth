import koffi from 'koffi';

export interface RectBounds {
  left: number;
  top: number;
  width: number;
  height: number;
}

export class WegameCoordinator {
  private WEGAME_WINDOW_TITLE = 'WeGame';
  private win32: any = null;

  constructor() {
    this.initWin32();
  }

  private initWin32() {
    try {
      const user32 = koffi.load('user32.dll');

      // RECT 结构
      const RECT = koffi.struct('RECT', {
        left: 'int32',
        top: 'int32',
        right: 'int32',
        bottom: 'int32'
      });

      this.win32 = {
        FindWindowW: user32.func('FindWindowW', 'void *', ['str16', 'str16']),
        GetWindowRect: user32.func('GetWindowRect', 'bool', [
          'void *',
          koffi.out(koffi.pointer(RECT))
        ]),
        SetForegroundWindow: user32.func('SetForegroundWindow', 'bool', ['void *']),
        RECT
      };
    } catch (e: any) {
      console.error('Win32 API 初始化失败', e.message);
    }
  }

  public isWindowReady(): boolean {
    if (!this.win32) return false
    const hwnd = this.win32.FindWindowW(null, this.WEGAME_WINDOW_TITLE)
    return !!hwnd
  }

  public getWeGameBounds(): RectBounds {
    if (!this.win32) {
      throw new Error('Win32 API 未初始化');
    }

    const { FindWindowW, GetWindowRect, SetForegroundWindow } = this.win32;

    const hwnd = FindWindowW(null, this.WEGAME_WINDOW_TITLE);
    if (!hwnd) {
      throw new Error(`未找到 WeGame 窗口（标题="${this.WEGAME_WINDOW_TITLE}"），请确保 WeGame 已打开。`);
    }

    // 激活窗口置顶
    SetForegroundWindow(hwnd);

    const rect = [{}];
    const ok = GetWindowRect(hwnd, rect);
    if (!ok) {
      throw new Error('GetWindowRect 失败，无法获取窗口边界。');
    }

    const r = rect[0] as any;
    return {
      left: r.left,
      top: r.top,
      width: r.right - r.left,
      height: r.bottom - r.top
    };
  }

  /**
   * 将百分比坐标转换为屏幕绝对坐标
   */
  public toAbsCoord(bounds: RectBounds, relX: number, relY: number): { x: number; y: number } {
    return {
      x: Math.round(bounds.left + bounds.width * relX),
      y: Math.round(bounds.top + bounds.height * relY)
    };
  }
}

export const wegameCoordinator = new WegameCoordinator();
