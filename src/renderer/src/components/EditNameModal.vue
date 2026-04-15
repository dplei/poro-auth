<script setup lang="ts">
import { ref, watch } from 'vue'
import { NModal, NInput, NButton, NSpace } from 'naive-ui'

const props = defineProps<{
  show: boolean
  account: { id: string; name: string } | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'submit', newName: string): void
}>()

const localName = ref('')

watch(
  () => props.account,
  (acc) => {
    if (acc) localName.value = acc.name
  },
  { immediate: true }
)

const handleSubmit = () => {
  if (!localName.value.trim()) return
  emit('submit', localName.value)
  emit('close')
}
</script>

<template>
  <n-modal
    :show="show"
    preset="card"
    title="修改标识备注"
    style="width: 380px"
    :bordered="false"
    @update:show="(val) => { if (!val) $emit('close') }"
  >
    <n-input
      v-model:value="localName"
      placeholder="新的显示名称"
      style="margin-bottom: 1.25rem"
      @keyup.enter="handleSubmit"
    />
    <n-space justify="end">
      <n-button @click="$emit('close')">放弃</n-button>
      <n-button type="primary" @click="handleSubmit">确定</n-button>
    </n-space>
  </n-modal>
</template>
