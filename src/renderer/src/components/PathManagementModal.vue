<script setup lang="ts">
import { NModal, NButton, NSpace, NTag } from 'naive-ui'

defineProps<{
  show: boolean
  driverLoaded: boolean
  wegameExePath: string | null
}>()

defineEmits<{
  (e: 'close'): void
  (e: 'relink-driver'): void
  (e: 'relink-wegame'): void
}>()
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="🔗 路径管理"
    style="width: 500px"
    :bordered="false"
    @update:show="(val) => { if (!val) $emit('close') }"
  >
    <!-- 驱动路径 -->
    <div class="path-item">
      <div class="path-item-header">
        <span class="path-label">底层键鼠驱动</span>
        <n-tag :type="driverLoaded ? 'success' : 'error'" size="small" :bordered="false" round>
          {{ driverLoaded ? '✓ 已就绪' : '✗ 未绑定' }}
        </n-tag>
      </div>
      <div class="path-value">
        <span v-if="driverLoaded" class="path-text">dd63330.dll · 已加载</span>
        <span v-else class="path-text muted">未绑定驱动</span>
      </div>
      <n-button size="small" style="margin-top: 0.15rem" @click="$emit('relink-driver')">
        重新选择驱动 DLL
      </n-button>
    </div>

    <!-- WeGame 路径 -->
    <div class="path-item" style="margin-top: 1rem">
      <div class="path-item-header">
        <span class="path-label">WeGame 可执行程序</span>
        <n-tag :type="wegameExePath ? 'success' : 'error'" size="small" :bordered="false" round>
          {{ wegameExePath ? '✓ 已关联' : '✗ 未关联' }}
        </n-tag>
      </div>
      <div class="path-value">
        <span v-if="wegameExePath" class="path-text" :title="wegameExePath">{{ wegameExePath }}</span>
        <span v-else class="path-text muted">未关联 wegame.exe</span>
      </div>
      <n-button size="small" style="margin-top: 0.15rem" @click="$emit('relink-wegame')">
        重新选择 wegame.exe
      </n-button>
    </div>

    <template #footer>
      <n-space justify="end">
        <n-button @click="$emit('close')">关闭</n-button>
      </n-space>
    </template>
  </n-modal>
</template>

<style scoped>
.path-item {
  padding: 1rem 1.25rem;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.path-item-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.path-label {
  font-size: 0.85rem;
  font-weight: 600;
}

.path-value {
  min-height: 1.4rem;
}

.path-text {
  font-size: 0.82rem;
  color: var(--text-secondary);
  display: block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  max-width: 100%;
  font-family: 'Consolas', monospace;
}

.path-text.muted {
  opacity: 0.45;
  font-style: italic;
}
</style>
