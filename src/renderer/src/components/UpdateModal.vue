<script setup lang="ts">
const props = defineProps<{
  show: boolean
  status: 'available' | 'downloading' | 'downloaded' | 'error' | null
  updateInfo: any
  progress: any
  errorMessage: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'download'): void
  (e: 'install'): void
}>()

const formatBytes = (bytes: number) => {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatReleaseNotes = (notes: any) => {
  if (!notes) return '修复已知问题，优化体验。'
  if (typeof notes === 'string') return notes
  // If it's an array for some reason
  if (Array.isArray(notes)) {
    return notes.map((n) => n.note || n).join('\n')
  }
  return JSON.stringify(notes)
}
</script>

<template>
  <div v-if="show" class="modal-overlay" @click.self="status !== 'downloading' && emit('close')">
    <div class="modal-content glass">
      <div class="modal-header">
        <h3>🎉 发现新版本</h3>
        <button v-if="status !== 'downloading'" class="close-btn" @click="emit('close')">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div class="modal-body">
        <template v-if="updateInfo">
          <div class="version-tag">版本 v{{ updateInfo.version }}</div>

          <div v-if="status === 'available'" class="release-notes">
            <pre>{{ formatReleaseNotes(updateInfo.releaseNotes) }}</pre>
          </div>

          <div v-if="status === 'downloading' && progress" class="download-progress">
            <div class="progress-bar-container">
              <div class="progress-bar-fill" :style="{ width: progress.percent + '%' }"></div>
            </div>
            <div class="progress-stats">
              <span>{{ progress.percent.toFixed(1) }}%</span>
              <span
                >{{ formatBytes(progress.transferred) }} / {{ formatBytes(progress.total) }}</span
              >
              <span>{{ formatBytes(progress.bytesPerSecond) }}/s</span>
            </div>
          </div>

          <div v-if="status === 'downloaded'" class="success-message">
            <svg
              viewBox="0 0 24 24"
              width="48"
              height="48"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="color: #10b981; margin-bottom: 1rem"
            >
              <path d="M22 11.08V12a10 10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            <p>更新包已准备就绪，重启立享新功能！</p>
          </div>

          <div v-if="status === 'error'" class="error-message">
            <p>更新过程中发生错误：</p>
            <code>{{ errorMessage }}</code>
          </div>
        </template>
      </div>

      <div class="modal-footer">
        <button
          v-if="status === 'available' || status === 'error'"
          class="btn"
          style="background: rgba(255, 255, 255, 0.1)"
          @click="emit('close')"
        >
          稍后再说
        </button>

        <button
          v-if="status === 'available' || status === 'error'"
          class="btn btn-primary"
          @click="emit('download')"
        >
          立刻下载更新
        </button>

        <button v-if="status === 'downloading'" class="btn btn-primary" disabled>
          正在下载中...
        </button>

        <button
          v-if="status === 'downloaded'"
          class="btn btn-primary"
          style="background: #10b981"
          @click="emit('install')"
        >
          立即重启并安装
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  width: 460px;
  max-width: 90vw;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.5),
    0 10px 10px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-header h3 {
  margin: 0;
  color: var(--text-primary);
  font-size: 1.25rem;
}

.close-btn {
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}

.close-btn svg {
  width: 20px;
  height: 20px;
}

.modal-body {
  padding: 1.5rem;
}

.version-tag {
  display: inline-block;
  background: rgba(99, 102, 241, 0.2);
  color: var(--accent-color);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.85rem;
  font-weight: 600;
  margin-bottom: 1rem;
}

.release-notes {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 1rem;
  max-height: 200px;
  overflow-y: auto;
}

.release-notes pre {
  margin: 0;
  white-space: pre-wrap;
  font-family: inherit;
  font-size: 0.9rem;
  color: var(--text-secondary);
  line-height: 1.6;
}

.download-progress {
  padding: 1rem 0;
}

.progress-bar-container {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 9999px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.progress-bar-fill {
  height: 100%;
  background: var(--accent-color);
  border-radius: 9999px;
  transition: width 0.2s ease-out;
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  font-size: 0.85rem;
  color: var(--text-secondary);
}

.success-message {
  text-align: center;
  padding: 2rem 0;
}

.success-message p {
  color: var(--text-primary);
  font-weight: 500;
  font-size: 1.1rem;
}

.error-message {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 4px solid var(--danger-color);
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.error-message p {
  margin: 0 0 0.5rem 0;
  color: var(--danger-color);
  font-size: 0.9rem;
  font-weight: bold;
}

.error-message code {
  color: #fca5a5;
  font-size: 0.8rem;
  word-break: break-all;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  color: white;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-primary {
  background: var(--accent-color);
}

.btn-primary:hover:not(:disabled) {
  filter: brightness(1.1);
}
</style>
