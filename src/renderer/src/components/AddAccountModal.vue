<template>
  <div v-if="show" class="modal-overlay" @click.self="$emit('close')">
    <div class="modal-content glass">
      <div class="modal-header">
        <h3>添加新账号</h3>
        <button class="btn btn-icon close-btn" @click="$emit('close')">&times;</button>
      </div>

      <form @submit.prevent="submit" class="modal-body">
        <!-- Intelligent Paste Area -->
        <div class="form-group parse-area">
          <label>智能识别 (支持粘贴发货文本)</label>
          <textarea
            v-model="pasteText"
            rows="2"
            placeholder="粘贴如: 账号----密码----大区..."
          ></textarea>
        </div>

        <div v-if="parsedAccounts.length > 0" class="parsed-list">
          <label>点击选择要填入的账号：</label>
          <div
            v-for="(opt, idx) in parsedAccounts"
            :key="idx"
            class="parsed-item"
            @click="selectParsed(opt)"
          >
            <div class="opt-main">
              <span class="opt-acc">{{ opt.account }}</span>
              <span class="opt-name">{{ opt.name }}</span>
            </div>
            <div v-if="opt.meta" class="opt-meta">{{ opt.meta }}</div>
          </div>
        </div>

        <div class="divider"></div>

        <div class="form-group">
          <label>备注名称 (大区/等级等)</label>
          <input
            ref="firstInput"
            v-model="form.name"
            type="text"
            required
            placeholder="请输入标识名称"
          />
        </div>

        <div class="form-group">
          <label>英雄联盟 / QQ账号</label>
          <input v-model="form.account" type="text" required placeholder="请输入账号" />
        </div>

        <div class="form-group">
          <label>登录密码</label>
          <div class="password-wrapper">
            <input
              v-model="form.password"
              :type="showPassword ? 'text' : 'password'"
              required
              placeholder="请输入密码"
            />
            <button
              type="button"
              class="eye-btn"
              @click="showPassword = !showPassword"
              title="切换显示/隐藏密码"
              tabindex="-1"
            >
              <svg
                v-if="showPassword"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                <circle cx="12" cy="12" r="3"></circle>
              </svg>
              <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path
                  d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24M1 1l22 22"
                ></path>
              </svg>
            </button>
          </div>
          <p class="help-text" style="font-size: 0.7rem; margin-top: 4px">采用硬件加密</p>
        </div>

        <div v-if="error" class="error-msg">{{ error }}</div>

        <div class="modal-footer">
          <button type="button" class="btn" @click="$emit('close')">取消</button>
          <button type="submit" class="btn btn-primary" :disabled="isSubmitting">
            {{ isSubmitting ? '保存中...' : '安全保存' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, nextTick, computed } from 'vue'

const props = defineProps<{
  show: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', form: { name: string; account: string; pass: string }): void
}>()

const firstInput = ref<HTMLInputElement | null>(null)
const isSubmitting = ref(false)
const error = ref('')
const showPassword = ref(false)

// Intelligent Paste Logic
const pasteText = ref('')
const parsedAccounts = computed(() => {
  const lines = pasteText.value
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
  const options: Array<{ account: string; password: string; name: string; meta: string }> = []

  for (const line of lines) {
    // 处理包含 ---- 的分隔（典型发货格式）
    if (line.includes('----')) {
      const parts = line.split('----').map((p) => p.trim())
      if (parts.length >= 2) {
        options.push({
          account: parts[0],
          password: parts[1],
          name: parts.length > 2 ? parts[2] : '未命名账号',
          meta: parts.slice(3).join(' | ')
        })
      }
    } else if (line.includes(' ')) {
      // 简单兜底处理空格格式，假设首位纯数字是账号
      const parts = line.split(/\s+/)
      if (parts.length >= 2 && /^\d+$/.test(parts[0])) {
        options.push({
          account: parts[0],
          password: parts[1],
          name: parts.length > 2 ? parts[2] : '未命名账号',
          meta: parts.slice(3).join(' | ')
        })
      }
    }
  }
  return options
})

const selectParsed = (opt: any) => {
  form.account = opt.account
  form.password = opt.password
  form.name = opt.name
  pasteText.value = '' // Click -> clear
}

const form = reactive({
  name: '',
  account: '',
  password: ''
})

watch(
  () => props.show,
  (val) => {
    if (val) {
      form.name = ''
      form.account = ''
      form.password = ''
      pasteText.value = ''
      error.value = ''
      showPassword.value = false
      isSubmitting.value = false
      nextTick(() => {
        firstInput.value?.focus()
      })
    }
  }
)

const submit = async () => {
  if (!form.name || !form.account || !form.password) return
  isSubmitting.value = true
  try {
    const res = await window.api.addAccount(form.name, form.account, form.password)
    if (res.success) {
      emit('submit', { name: form.name, account: form.account, pass: form.password })
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
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  width: 90%;
  max-width: 450px;
  border-radius: 16px;
  padding: 1.5rem;
  animation: slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
  background: rgba(30, 41, 59, 0.8);
  max-height: 90vh;
  overflow-y: auto;
}

.divider {
  height: 1px;
  background: var(--border-color);
  margin: 1rem 0;
}

.parse-area textarea {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px dashed var(--accent-color);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 0.9rem;
  resize: vertical;
  transition: all 0.2s;
}

.parse-area textarea:focus {
  outline: none;
  border-style: solid;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.parsed-list {
  margin-top: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parsed-list > label {
  font-size: 0.8rem;
  color: #10b981;
}

.parsed-item {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
}

.parsed-item:hover {
  background: rgba(99, 102, 241, 0.15);
  border-color: var(--accent-color);
}

.opt-main {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.opt-acc {
  font-family: monospace;
  font-weight: 600;
  color: var(--text-primary);
}

.opt-name {
  font-size: 0.85rem;
  color: var(--accent-color);
  background: rgba(99, 102, 241, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
}

.opt-meta {
  font-size: 0.75rem;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
}

.close-btn {
  background: transparent;
  font-size: 1.5rem;
  padding: 0;
  width: 32px;
  height: 32px;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
  color: var(--text-secondary);
}

.form-group input {
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: rgba(0, 0, 0, 0.2);
  color: var(--text-primary);
  font-family: inherit;
  font-size: 1rem;
  transition: all 0.2s;
}

.form-group input:focus {
  outline: none;
  border-color: var(--accent-color);
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2);
}

.password-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-wrapper input {
  padding-right: 2.5rem;
}

.eye-btn {
  position: absolute;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.2s;
}

.eye-btn:hover {
  color: var(--text-primary);
}

.eye-btn svg {
  width: 1.25rem;
  height: 1.25rem;
}

.help-text {
  font-size: 0.75rem;
  color: #10b981;
  margin-top: 0.5rem;
}

.error-msg {
  color: var(--danger-color);
  font-size: 0.85rem;
  margin-bottom: 1rem;
}

.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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
</style>
