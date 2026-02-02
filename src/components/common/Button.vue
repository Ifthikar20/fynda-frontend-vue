<template>
  <button 
    :class="['btn', variant, size, { loading, disabled }]"
    :disabled="disabled || loading"
    @click="$emit('click', $event)"
  >
    <span v-if="loading" class="spinner"></span>
    <span v-if="$slots.icon && !loading" class="btn-icon">
      <slot name="icon"></slot>
    </span>
    <span class="btn-text">
      <slot></slot>
    </span>
  </button>
</template>

<script setup>
defineProps({
  variant: { 
    type: String, 
    default: 'primary',
    validator: (v) => ['primary', 'secondary', 'outline', 'ghost', 'danger'].includes(v)
  },
  size: { 
    type: String, 
    default: 'medium',
    validator: (v) => ['small', 'medium', 'large'].includes(v)
  },
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false }
})

defineEmits(['click'])
</script>

<style scoped>
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

/* Sizes */
.btn.small { padding: 6px 12px; font-size: 0.8rem; }
.btn.medium { padding: 10px 18px; font-size: 0.9rem; }
.btn.large { padding: 14px 28px; font-size: 1rem; }

/* Variants */
.btn.primary {
  background: #1a1a1a;
  color: #fff;
}
.btn.primary:hover:not(:disabled) {
  background: #333;
}

.btn.secondary {
  background: #f5f5f5;
  color: #1a1a1a;
}
.btn.secondary:hover:not(:disabled) {
  background: #eee;
}

.btn.outline {
  background: transparent;
  color: #1a1a1a;
  border: 1px solid #ddd;
}
.btn.outline:hover:not(:disabled) {
  background: #f5f5f5;
  border-color: #ccc;
}

.btn.ghost {
  background: transparent;
  color: #666;
}
.btn.ghost:hover:not(:disabled) {
  background: #f5f5f5;
  color: #1a1a1a;
}

.btn.danger {
  background: #ef4444;
  color: #fff;
}
.btn.danger:hover:not(:disabled) {
  background: #dc2626;
}

/* States */
.btn.disabled,
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn.loading {
  pointer-events: none;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.btn-icon {
  display: flex;
}
</style>
