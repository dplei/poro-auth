<script setup lang="ts">
import { NButton, NGrid, NGridItem, NInputNumber, NModal } from 'naive-ui'
import { ref, watch } from 'vue'

const props = defineProps<{ show: boolean }>()
const emit = defineEmits<{ (e: 'close'): void; (e: 'submit'): void }>()

const form = ref<Record<string, number>>({})

watch(
  () => props.show,
  async (newVal) => {
    if (newVal) {
      form.value = await window.api.getFlowConfig()
    }
  }
)

const handleSubmit = async () => {
  await window.api.saveFlowConfig({
    SWITCH_TO_PWD_LOGIN_X: Number(form.value.SWITCH_TO_PWD_LOGIN_X),
    SWITCH_TO_PWD_LOGIN_Y: Number(form.value.SWITCH_TO_PWD_LOGIN_Y),
    ACCOUNT_INPUT_X: Number(form.value.ACCOUNT_INPUT_X),
    ACCOUNT_INPUT_Y: Number(form.value.ACCOUNT_INPUT_Y),
    SWITCH_DELAY_MS: Number(form.value.SWITCH_DELAY_MS),
    TYPE_DELAY_MS: Number(form.value.TYPE_DELAY_MS)
  })
  emit('submit')
  emit('close')
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v) => !v && emit('close')"
    preset="card"
    style="width: 520px"
    :bordered="false"
  >
    <template #header>
      <span class="modal-title">坐标与时序调整</span>
    </template>
    <template #header-extra>
      <span class="modal-subtitle">分辨率不匹配或点击偏移时在此手动校正</span>
    </template>

    <NGrid :cols="2" :x-gap="16" :y-gap="12">
      <NGridItem>
        <div class="field-label">切换登录按钮 X (0~1)</div>
        <NInputNumber
          v-model:value="form.SWITCH_TO_PWD_LOGIN_X"
          :step="0.01"
          :precision="3"
          :min="0"
          :max="1"
          size="small"
          style="width: 100%"
        />
      </NGridItem>
      <NGridItem>
        <div class="field-label">切换登录按钮 Y (0~1)</div>
        <NInputNumber
          v-model:value="form.SWITCH_TO_PWD_LOGIN_Y"
          :step="0.01"
          :precision="3"
          :min="0"
          :max="1"
          size="small"
          style="width: 100%"
        />
      </NGridItem>
      <NGridItem>
        <div class="field-label">账号输入框落点 X (0~1)</div>
        <NInputNumber
          v-model:value="form.ACCOUNT_INPUT_X"
          :step="0.01"
          :precision="3"
          :min="0"
          :max="1"
          size="small"
          style="width: 100%"
        />
      </NGridItem>
      <NGridItem>
        <div class="field-label">账号输入框落点 Y (0~1)</div>
        <NInputNumber
          v-model:value="form.ACCOUNT_INPUT_Y"
          :step="0.01"
          :precision="3"
          :min="0"
          :max="1"
          size="small"
          style="width: 100%"
        />
      </NGridItem>
      <NGridItem>
        <div class="field-label">翻卡等待时长 (ms)</div>
        <NInputNumber
          v-model:value="form.SWITCH_DELAY_MS"
          :step="100"
          :min="0"
          size="small"
          style="width: 100%"
        />
      </NGridItem>
      <NGridItem>
        <div class="field-label">按键注入间隔 (ms)</div>
        <NInputNumber
          v-model:value="form.TYPE_DELAY_MS"
          :step="10"
          :min="0"
          size="small"
          style="width: 100%"
        />
      </NGridItem>
    </NGrid>

    <template #footer>
      <div class="modal-actions">
        <NButton size="small" @click="emit('close')">取消</NButton>
        <NButton size="small" type="primary" @click="handleSubmit">保存</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped>
.modal-title {
  font-size: 0.95rem;
  font-weight: 600;
}

.modal-subtitle {
  font-size: 0.75rem;
  color: var(--text-secondary, #94a3b8);
}

.field-label {
  font-size: 0.78rem;
  color: var(--text-secondary, #94a3b8);
  margin-bottom: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
