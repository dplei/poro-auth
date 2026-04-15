<script setup lang="ts">
import { NButton } from 'naive-ui'

defineProps<{
  show: boolean
  progress: string
  error: string
  isWaitingAnimation: boolean
}>()

defineEmits<{
  (e: 'proceed'): void
  (e: 'extend'): void
  (e: 'cancel'): void
}>()
</script>

<template>
  <div v-if="show" class="login-overlay">
    <div class="loading-box glass">
      <div class="spinner"></div>
      <h3>自动注入中</h3>
      <p class="progress-text">{{ progress }}</p>
      <p v-if="error" class="error-text">⚠️ {{ error }}</p>

      <div
        v-if="isWaitingAnimation && !error"
        style="display: flex; gap: 0.5rem; width: 100%; margin-top: 1.5rem"
      >
        <n-button
          type="primary"
          style="flex: 2; border-radius: 8px; font-weight: bold"
          @click="$emit('proceed')"
        >
          画面已就绪，立即注入！
        </n-button>
        <n-button
          style="flex: 1; border-radius: 8px"
          @click="$emit('extend')"
        >
          延长 30s
        </n-button>
      </div>

      <n-button
        v-if="progress.includes('WeGame') && !error && !isWaitingAnimation"
        style="margin-top: 1rem"
        @click="$emit('cancel')"
      >
        取消唤起
      </n-button>
    </div>
  </div>
</template>

<style scoped>
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
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
