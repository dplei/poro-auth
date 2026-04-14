<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NConfigProvider, zhCN, dateZhCN, darkTheme } from 'naive-ui'
import AccountGrid from './components/AccountGrid.vue'
import AddAccountModal from './components/AddAccountModal.vue'
import BanAccountModal from './components/BanAccountModal.vue'
import FlowConfigModal from './components/FlowConfigModal.vue'

const accounts = ref<
  Array<{ id: string; name: string; account: string; bannedUntil?: number | null }>
>([])
const showAddModal = ref(false)
const showBanModal = ref(false)
const showConfigModal = ref(false)
const targetAccountForBan = ref<any | null>(null)

// State for Login flow
const isLoggingIn = ref(false)
const loginProgress = ref('')
const loginError = ref('')

const loadAccounts = async () => {
  accounts.value = await window.api.getAccounts()
}

const driverLoaded = ref(true)
const wegameExePath = ref<string | null>(null)

onMounted(async () => {
  loadAccounts()

  // Listen to login stages
  window.api.onLoginProgress((msg) => {
    loginProgress.value = msg
  })

  // 检查驱动状态
  driverLoaded.value = await window.api.getDriverStatus()
  // 检查WeGame绑定状态
  wegameExePath.value = await window.api.getWegamePath()
})

const handleLinkDriver = async () => {
  const res = await window.api.selectAndLoadDriver()
  if (res.success) {
    driverLoaded.value = true
  } else {
    alert('绑定失败: ' + res.error)
  }
}

const handleLinkWegame = async () => {
  const res = await window.api.selectWegameExe()
  if (res.success) {
    wegameExePath.value = res.path!
  } else {
    alert('绑定失败: ' + res.error)
  }
}

const handleAddAccount = () => {
  showAddModal.value = true
}

const handleAccountSubmit = () => {
  loadAccounts()
}

const handleSetBan = (acc: any) => {
  targetAccountForBan.value = acc
  showBanModal.value = true
}

const showEditNameModal = ref(false)
const editableAccountDetails = ref<{id: string, name: string} | null>(null)

const handleEditName = (acc: any) => {
  editableAccountDetails.value = { ...acc }
  showEditNameModal.value = true
}

const submitEditName = async (newName: string) => {
  if (!editableAccountDetails.value) return
  const res = await window.api.updateAccountName(editableAccountDetails.value.id, newName)
  if (res.success) loadAccounts()
}

const handleDeleteAccount = async (id: string) => {
  if (confirm('确认删除该账号？')) {
    const res = await window.api.deleteAccount(id)
    if (res.success) {
      loadAccounts()
    }
  }
}

const targetAccountForLogin = ref<any | null>(null)
const animationWaitTime = ref(30)
const isWaitingAnimation = ref(false)
let animationTimer: any = null

const proceedToInject = async () => {
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
  isWaitingAnimation.value = false
  if (!targetAccountForLogin.value) return

  loginProgress.value = '准备物理注入流程...'
  try {
    const res = await window.api.startLogin(targetAccountForLogin.value.id)
    if (!res.success) {
      loginError.value = res.error || '登录流程触发失败'
    } else {
      loginProgress.value = '登录流程触发完毕，请在游戏中检查。'
    }
  } catch (err: any) {
    loginError.value = err.message
  } finally {
    setTimeout(() => {
      isLoggingIn.value = false
      targetAccountForLogin.value = null
    }, 2000)
  }
}

const handleSelectAccount = async (acc: any) => {
  if (isLoggingIn.value) return

  targetAccountForLogin.value = acc
  isLoggingIn.value = true
  loginError.value = ''
  loginProgress.value = '正在检测大厅状态...'

  // 给足够的时间让 Vue 渲染蒙层以消除卡死感
  await new Promise((r) => setTimeout(r, 100))

  const isRunning = await window.api.checkWegameRunning()
  if (isRunning) {
    const userConfirms = confirm(
      '【进程干涉检测】WeGame 正在运行！为了保证物理通信顺利防串号，需要先为您掐断当前大厅并抹除状态重启。\n\n是否授权强制退出？'
    )
    if (!userConfirms) {
      isLoggingIn.value = false
      targetAccountForLogin.value = null
      return
    }
  }

  loginProgress.value = isRunning ? '正在掐断并重启 WeGame...' : '即将唤起 WeGame 客户端...'

  try {
    const ksRes = await window.api.killAndStartWegame()
    if (!ksRes.success) throw new Error(ksRes.error)

    // Window 就绪，进入动画倒计时保护状态
    isWaitingAnimation.value = true
    animationWaitTime.value = 30

    const tick = () => {
      if (!isWaitingAnimation.value) return
      if (animationWaitTime.value <= 0) {
        proceedToInject()
        return
      }
      loginProgress.value = `等待大厅启动动画结束... (${animationWaitTime.value}s)`
      animationWaitTime.value--
      animationTimer = setTimeout(tick, 1000)
    }
    tick()
  } catch (err: any) {
    loginError.value = err.message
    setTimeout(() => {
      isLoggingIn.value = false
      targetAccountForLogin.value = null
    }, 2000)
  }
}

const handleCancelWait = () => {
  if (animationTimer) {
    clearTimeout(animationTimer)
    animationTimer = null
  }
  isWaitingAnimation.value = false
  window.api.cancelStartWegame()
}

const handleMinimize = () => window.api.minimizeWindow()
const handleClose = () => window.api.closeWindow()
</script>

<template>
  <n-config-provider :locale="zhCN" :date-locale="dateZhCN" :theme="darkTheme">
    <!-- Drag header -->
    <header class="app-header">
      <div class="app-title" style="padding-left: 1.5rem;">
        <img src="./assets/icon.png" alt="logo" style="width: 22px; height: 22px; border-radius: 4px; box-shadow: 0 0 4px rgba(0,0,0,0.3);" />
        PoroAuth <span class="tag">WeGame Edition</span>
      </div>
      <div class="window-controls">
        <button class="win-btn" @click="handleMinimize">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
        </button>
        <button class="win-btn close-btn-win" @click="handleClose">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
    </header>

    <main class="app-main">
      <div class="content-wrapper">
        <div class="section-title">
          <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 0.5rem;">
            <h2 style="margin-bottom: 0;">通行名册</h2>
            <button class="btn" style="padding: 0.3rem 0.6rem; font-size: 0.8rem; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; cursor: pointer;" @click="showConfigModal = true">
              ⚙️ 参数硬改调优
            </button>
          </div>
          <p>AES-256 本地加密直连，请确保 WeGame 与底层驱动已激活</p>
        </div>

        <AccountGrid
          :accounts="accounts"
          @add="handleAddAccount"
          @select="handleSelectAccount"
          @delete="handleDeleteAccount"
          @set-ban="handleSetBan"
          @edit-name="handleEditName"
        />
      </div>

      <!-- Add Account Dialog -->
      <AddAccountModal
        :show="showAddModal"
        @close="showAddModal = false"
        @submit="handleAccountSubmit"
      />

      <!-- Set Ban Modal -->
      <BanAccountModal
        :show="showBanModal"
        :account="targetAccountForBan"
        @close="showBanModal = false"
        @submit="handleAccountSubmit"
      />

      <!-- Quick Edit Name Modal -->
      <div v-if="showEditNameModal" class="modal-overlay" style="z-index: 2000; position: fixed; top:0; left:0; right:0; bottom:0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); display:flex; align-items:center; justify-content:center;" @click.self="showEditNameModal = false">
        <div class="modal-content glass" style="width: 350px; background: #1e293b; padding: 1.5rem; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1);">
          <h3 style="margin-top: 0; margin-bottom: 1rem; color: white;">修改标识备注</h3>
          <input 
            v-model="editableAccountDetails!.name" 
            style="width: 100%; padding: 0.75rem; border-radius: 6px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: white; margin-bottom: 1.5rem; outline: none;" 
            placeholder="新的显示名称"
            @keyup.enter="submitEditName(editableAccountDetails!.name); showEditNameModal = false"
          />
          <div style="display: flex; gap: 1rem; justify-content: flex-end;">
            <button class="btn" style="background: rgba(255,255,255,0.1);" @click="showEditNameModal = false">放弃</button>
            <button class="btn btn-primary" style="background: var(--primary-color);" @click="submitEditName(editableAccountDetails!.name); showEditNameModal = false">确定</button>
          </div>
        </div>
      </div>

      <!-- Tuning Config Modal -->
      <FlowConfigModal
        :show="showConfigModal"
        @close="showConfigModal = false"
      />

      <!-- Setup Overlay (Fullscreen Blocking) -->
      <div v-if="!driverLoaded || !wegameExePath" class="driver-overlay">
        <div class="driver-box glass">
          <h2>⚠️ 环境未完全就绪</h2>
          
          <div class="alert-box">
            <p><strong>注意：</strong>本程序主要针对 <strong>网吧版 WeGame</strong> 进行深度适配定位。标准版或旧版由于结构不同可能遇挫。<br/>请务必保证启动后的首屏为原生态二维码扫码界面！</p>
          </div>

          <!-- Driver Missing -->
          <div v-if="!driverLoaded" class="setup-item">
            <p>系统未检测到底层键鼠驱动 (dd63330.dll)，无法进行物理级注入拦截。</p>
            <div class="download-guide">
              <a href="https://github.com/ddxoft/master" target="_blank" class="github-btn">
                <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                前往 GitHub 获取
              </a>
            </div>
            <button class="btn btn-primary btn-sm" @click="handleLinkDriver">绑定驱动 DLL</button>
          </div>

          <!-- WeGame Path Missing -->
          <div v-if="!wegameExePath" class="setup-item">
            <p>未关联 WeGame 执行程序，PoroAuth 无法拦截和代办客户端的唤起清洗动作。</p>
            <button class="btn btn-primary btn-sm" @click="handleLinkWegame">绑定 wegame.exe</button>
          </div>

        </div>
      </div>

      <!-- Fullscreen Loading overlay for Login Flow -->
      <div v-if="isLoggingIn" class="login-overlay">
        <div class="loading-box glass">
          <div class="spinner"></div>
          <h3>自动注入中</h3>
          <p class="progress-text">{{ loginProgress }}</p>
          <p v-if="loginError" class="error-text">⚠️ {{ loginError }}</p>

          <div v-if="isWaitingAnimation && !loginError" style="display: flex; gap: 0.5rem; width: 100%; margin-top: 1.5rem;">
            <button 
              class="btn btn-primary" 
              style="flex: 2; border-radius: 8px; font-weight: bold;"
              @click="proceedToInject"
            >
              画面已就绪，立即注入！
            </button>
            <button 
              class="btn" 
              style="flex: 1; border-radius: 8px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);"
              @click="animationWaitTime += 30"
            >
              延长 30s
            </button>
          </div>

          <button 
            v-if="loginProgress.includes('WeGame') && !loginError && !isWaitingAnimation" 
            class="btn" 
            style="margin-top: 1rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);"
            @click="handleCancelWait"
          >
            取消唤起
          </button>
        </div>
      </div>
    </main>
  </n-config-provider>
</template>

<style scoped>
.app-header {
  height: 48px;
  -webkit-app-region: drag;
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(8px);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
}

.window-controls {
  display: flex;
  height: 100%;
  -webkit-app-region: no-drag;
}

.win-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  width: 48px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
}

.win-btn svg {
  width: 14px;
  height: 14px;
}

.win-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.win-btn.close-btn-win:hover {
  background: #e81123;
  color: white;
}

.app-title {
  font-weight: 600;
  font-size: 1rem;
  color: var(--text-primary);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.tag {
  font-size: 0.7rem;
  padding: 0.2rem 0.5rem;
  background: rgba(99, 102, 241, 0.2);
  color: var(--accent-color);
  border-radius: 4px;
  font-weight: 700;
}

.app-main {
  margin-top: 48px;
  height: calc(100vh - 48px);
  overflow-y: auto;
  padding: 2rem;
}

.content-wrapper {
  max-width: 1000px;
  margin: 0 auto;
}

.section-title {
  margin-bottom: 2rem;
}

.section-title h2 {
  font-size: 1.75rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.section-title p {
  color: var(--text-secondary);
  font-size: 0.95rem;
}

/* Driver Setup Overlay */
.driver-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  backdrop-filter: blur(14px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.driver-box {
  padding: 3rem 2.5rem;
  border-radius: 16px;
  max-width: 500px;
  border: 1px solid rgba(239, 68, 68, 0.4);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.25rem;
}

.driver-box h2 {
  color: var(--danger-color);
  font-size: 1.6rem;
  font-weight: 700;
}

.driver-box p {
  color: var(--text-secondary);
  line-height: 1.6;
}

.alert-box {
  background: rgba(234, 179, 8, 0.1);
  border-left: 4px solid var(--warning-color);
  padding: 1rem;
  border-radius: 4px;
  text-align: left;
  font-size: 0.9rem;
  color: #fbbf24;
}

.setup-item {
  width: 100%;
  padding: 1.25rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.setup-item p {
  font-size: 0.9rem;
  margin: 0;
}

.driver-box strong {
  color: var(--text-primary);
}

.download-guide {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
}

.download-guide p {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.github-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: #2b3137;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.github-btn:hover {
  background-color: #24292e;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
}

/* Login Loading Overlay */
.login-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.loading-box {
  padding: 2rem 3rem;
  border-radius: 16px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  min-width: 300px;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-left-color: var(--accent-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.progress-text {
  color: var(--accent-color);
  font-weight: 500;
  font-size: 0.95rem;
}

.error-text {
  color: var(--danger-color);
  background: rgba(239, 68, 68, 0.1);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
