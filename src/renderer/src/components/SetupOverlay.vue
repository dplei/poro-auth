<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{
  driverLoaded: boolean
  wegameExePath: string | null
}>()

defineEmits<{
  (e: 'link-driver'): void
  (e: 'link-wegame'): void
}>()
</script>

<template>
  <div v-if="!driverLoaded || !wegameExePath" class="driver-overlay">
    <div class="driver-box glass">
      <h2>⚠️ 环境未完全就绪</h2>

      <div class="alert-box">
        <p>
          <strong>注意：</strong>本程序主要针对 <strong>网吧版 WeGame</strong>
          进行深度适配定位。标准版或旧版由于结构不同可能遇挫。<br />
          请务必保证启动后的首屏为原生态二维码扫码界面！
        </p>
      </div>

      <!-- 驱动缺失 -->
      <div v-if="!driverLoaded" class="setup-item">
        <p>系统未检测到底层键鼠驱动 (dd63330.dll)，无法进行物理级注入拦截。</p>
        <div class="download-guide">
          <a href="https://github.com/ddxoft/master" target="_blank" class="github-btn">
            <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16">
              <path
                d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
              />
            </svg>
            前往 GitHub 获取
          </a>
        </div>
        <n-button type="primary" size="small" @click="$emit('link-driver')">绑定驱动 DLL</n-button>
      </div>

      <!-- WeGame 未关联 -->
      <div v-if="!wegameExePath" class="setup-item">
        <p>未关联 WeGame 执行程序，PoroAuth 无法拦截和代办客户端的唤起清洗动作。</p>
        <n-button type="primary" size="small" @click="$emit('link-wegame')">绑定 wegame.exe</n-button>
      </div>
    </div>
  </div>
</template>

<style scoped>
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

.driver-box strong {
  color: var(--text-primary);
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

.download-guide {
  background: rgba(255, 255, 255, 0.05);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  width: 100%;
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
</style>
