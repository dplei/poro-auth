<script setup lang="ts">
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
  <div v-if="show" class="modal-overlay" @click.self="emit('close')">
    <div class="modal-content glass">
      <h3>高级：底层游标与时序参数覆盖</h3>
      <p style="color: #94a3b8; font-size: 0.8rem; margin-bottom: 1rem; margin-top: -10px;">
        所有修改会基于默认值进行覆盖保存，仅对特殊分辨率或新版有效。
      </p>
      
      <div class="form-group">
        <label>「账密登录」切换按钮比例 X (0~1)</label>
        <input v-model="form.SWITCH_TO_PWD_LOGIN_X" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label>「账密登录」切换按钮比例 Y (0~1)</label>
        <input v-model="form.SWITCH_TO_PWD_LOGIN_Y" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label>「账号框」物理光标落点比例 X</label>
        <input v-model="form.ACCOUNT_INPUT_X" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label>「账号框」物理光标落点比例 Y</label>
        <input v-model="form.ACCOUNT_INPUT_Y" type="number" step="0.01" />
      </div>
      <div class="form-group">
        <label>【时序】登录卡翻转延迟硬等期 (ms)</label>
        <input v-model="form.SWITCH_DELAY_MS" type="number" step="100" />
      </div>
      <div class="form-group">
        <label>【时序】单字符注入速度步长 (ms)</label>
        <input v-model="form.TYPE_DELAY_MS" type="number" step="10" />
      </div>

      <div class="modal-actions">
        <button class="btn btn-secondary" @click="emit('close')">放弃</button>
        <button class="btn btn-primary" @click="handleSubmit">覆盖参数</button>
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
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 2rem;
  border-radius: 12px;
  width: 440px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.5);
}

.modal-content h3 {
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.2rem;
}

.form-group {
  margin-bottom: 0.8rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.4rem;
  color: var(--text-secondary);
  font-size: 0.85rem;
}

.form-group input {
  width: 100%;
  padding: 0.6rem;
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: var(--text-primary);
}
.form-group input:focus {
  outline: none;
  border-color: var(--primary-color);
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.8rem;
}

.btn {
  padding: 0.5rem 1.25rem;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-primary {
  background: var(--primary-color);
  color: white;
}

.btn-secondary {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-primary);
}
</style>
