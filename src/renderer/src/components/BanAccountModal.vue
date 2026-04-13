<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass">
      <div class="modal-header">
        <h3>🛡️ 设置防封隔离期</h3>
        <button class="btn btn-icon close-btn" @click="$emit('close')">&times;</button>
      </div>

      <div class="modal-body">
        <p class="desc-text">
          当前操作账号：<strong>{{ account?.name }}</strong><br />
          设置后，账号在这个时间点解除之前，将会在大厅呈现被锁定无法选中的防误触状态。
        </p>

        <div class="form-group" style="margin-top: 1.5rem;">
          <label>预定解封时间点：</label>
          <n-date-picker 
            v-model:value="banUntilTime" 
            type="datetime" 
            clearable 
            placeholder="请选择解封的确切日期与时间" 
            style="width: 100%"
          />
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <div class="modal-footer">
          <button type="button" class="btn btn-danger" style="margin-right: auto;" @click="clearBan">清除封禁</button>
          <button type="button" class="btn" @click="$emit('close')">取消</button>
          <button type="button" class="btn btn-primary" :disabled="isSubmitting" @click="submit">
            {{ isSubmitting ? '保存中...' : '确认设置' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { NDatePicker } from 'naive-ui'

const props = defineProps<{
  show: boolean
  account: any | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit'): void
}>()

const banUntilTime = ref<number | null>(null)
const isSubmitting = ref(false)
const error = ref('')

watch(() => props.show, (val) => {
  if (val) {
    banUntilTime.value = props.account?.bannedUntil || null
    error.value = ''
    isSubmitting.value = false
  }
})

const clearBan = async () => {
  if (!props.account) return
  isSubmitting.value = true
  try {
    const res = await window.api.setBanTime(props.account.id, null)
    if (res.success) {
      emit('submit')
      emit('close')
    } else {
      error.value = res.error || '清除失败'
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}

const submit = async () => {
  if (!props.account) return
  isSubmitting.value = true
  try {
    const res = await window.api.setBanTime(props.account.id, banUntilTime.value)
    if (res.success) {
      emit('submit')
      emit('close')
    } else {
      error.value = res.error || '保存失败'
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0; left: 0; right: 0; bottom: 0;
  background: rgba(0,0,0,0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  width: 90%;
  max-width: 400px;
  border-radius: 16px;
  padding: 1.5rem;
  background: rgba(30, 41, 59, 0.9);
  border: 1px solid var(--border-color);
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.modal-header h3 {
  font-size: 1.15rem;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  font-size: 1.5rem;
  padding: 0;
  width: 32px;
  height: 32px;
}

.desc-text {
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--text-secondary);
}

.desc-text strong {
  color: var(--accent-color);
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}

.error-msg {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-top: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
