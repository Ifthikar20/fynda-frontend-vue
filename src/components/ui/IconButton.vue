<template>
  <button 
    class="icon-btn" 
    :class="[variant, size, { 'icon-only': !$slots.default }]"
    @click="$emit('click', $event)"
  >
    <slot name="icon"></slot>
    <span v-if="$slots.default" class="btn-text"><slot></slot></span>
  </button>
</template>

<script setup>
defineProps({
  variant: {
    type: String,
    default: 'default', // default, primary, danger, ghost
  },
  size: {
    type: String,
    default: 'md' // sm, md, lg
  }
})

defineEmits(['click'])
</script>

<style scoped>
.icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.4rem;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.15s ease;
  font-family: inherit;
}

/* Sizes */
.sm { padding: 0.35rem 0.6rem; font-size: 0.75rem; border-radius: 6px; }
.md { padding: 0.5rem 1rem; font-size: 0.85rem; border-radius: 8px; }
.lg { padding: 0.65rem 1.25rem; font-size: 0.95rem; border-radius: 10px; }

.sm.icon-only { padding: 0.35rem; }
.md.icon-only { padding: 0.5rem; }
.lg.icon-only { padding: 0.65rem; }

/* Variants */
.default {
  background: #fff;
  color: #1a1a1a;
  border: 1px solid #e0e0e0;
}
.default:hover { border-color: #1a1a1a; }

.primary {
  background: #1a1a1a;
  color: #fff;
}
.primary:hover { background: #333; }

.danger {
  background: transparent;
  color: #666;
}
.danger:hover { color: #ef4444; }

.ghost {
  background: transparent;
  color: #666;
}
.ghost:hover { color: #1a1a1a; background: #f5f5f5; }

.btn-text {
  white-space: nowrap;
}
</style>
