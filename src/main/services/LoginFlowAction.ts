import { ddDriver, DD_CODE, VK_CODE } from './DDDriverService'
import { wegameCoordinator } from './WegameCoordinator'
import { configManager } from './ConfigManager'

export class LoginFlowAction {
  // 默认节点配置
  public readonly DEFAULT_CONFIG = {
    SWITCH_TO_PWD_LOGIN_X: 0.47,
    SWITCH_TO_PWD_LOGIN_Y: 0.51,
    ACCOUNT_INPUT_X: 0.5,
    ACCOUNT_INPUT_Y: 0.61,
    SWITCH_DELAY_MS: 3000,
    TYPE_DELAY_MS: 100
  }

  // 动态读取被覆盖层
  public get CONFIG() {
    const userConf = configManager.get('flowConfig') || {}
    return { ...this.DEFAULT_CONFIG, ...userConf }
  }

  /**
   * 执行完整的 WeGame 登录打流
   * @param account 账号明文
   * @param password 密码明文
   * @param onProgress 给外层（前端）广播进度的回调
   */
  public async executeLogin(account: string, pass: string, onProgress?: (msg: string) => void) {
    const notify = (msg: string) => {
      console.log(`[LoginFlow] ${msg}`)
      if (onProgress) onProgress(msg)
    }

    notify('开始验证外部环境...')
    const currentConfig = this.CONFIG

    // 1. 获取边界及计算绝对坐标
    const bounds = wegameCoordinator.getWeGameBounds()
    const switchBtnCoord = wegameCoordinator.toAbsCoord(
      bounds,
      currentConfig.SWITCH_TO_PWD_LOGIN_X,
      currentConfig.SWITCH_TO_PWD_LOGIN_Y
    )
    const accountBoxCoord = wegameCoordinator.toAbsCoord(
      bounds,
      currentConfig.ACCOUNT_INPUT_X,
      currentConfig.ACCOUNT_INPUT_Y
    )

    // 2. 点击「账号密码登录」切换按钮
    notify('正在切换账号密码登录模式...')
    await ddDriver.click(switchBtnCoord.x, switchBtnCoord.y)

    // 等待翻开动画
    notify('等待页面翻转...')
    await ddDriver.sleep(currentConfig.SWITCH_DELAY_MS)

    // 3. 点击账号输入框激活焦点
    notify('激活账号输入框焦点...')
    await ddDriver.click(accountBoxCoord.x, accountBoxCoord.y)

    // 4. 清除遗留文字并输入账号
    notify('正在注入账号（物理按键模拟）...')
    await ddDriver.selectAllAndClear()
    await ddDriver.typeString(account)
    await ddDriver.sleep(200)

    // 5. Tab 切换密码框
    notify('正在切换至密码层...')
    await ddDriver.pressKnownKey(DD_CODE.TAB)
    await ddDriver.sleep(200)

    // 6. 清除遗留星号并输入密码
    notify('正在注入通行密钥...')
    await ddDriver.selectAllAndClear()
    await ddDriver.typeString(pass)
    await ddDriver.sleep(200)

    // 7. 回车提交
    notify('提交登录请求...')
    await ddDriver.pressVkKey(VK_CODE.RETURN)

    notify('自动注入流程完毕！')
  }
}

export const loginFlowAction = new LoginFlowAction()
