<template>
  <div class="analytics-page">
    <header class="page-header">
      <div>
        <h1>Analytics</h1>
        <p class="meta">{{ generatedLabel }}</p>
      </div>
      <div class="actions">
        <button class="btn" :disabled="loading" @click="load">
          {{ loading ? 'Refreshing…' : 'Refresh' }}
        </button>
      </div>
    </header>

    <div v-if="error" class="error">
      {{ error }}
    </div>

    <template v-if="data">
      <section class="tiles">
        <div class="tile">
          <div class="label">Total users</div>
          <div class="value">{{ fmt(data.users.total) }}</div>
        </div>
        <div class="tile">
          <div class="label">Active</div>
          <div class="value">{{ fmt(data.users.active) }}</div>
        </div>
        <div class="tile">
          <div class="label">Last 24h</div>
          <div class="value">{{ fmt(data.users.signups_24h) }}</div>
          <div class="sub">new signups</div>
        </div>
        <div class="tile">
          <div class="label">Last 7 days</div>
          <div class="value">{{ fmt(data.users.signups_7d) }}</div>
          <div class="sub">new signups</div>
        </div>
        <div class="tile">
          <div class="label">Last 30 days</div>
          <div class="value">{{ fmt(data.users.signups_30d) }}</div>
          <div class="sub">new signups</div>
        </div>
        <div class="tile">
          <div class="label">Staff</div>
          <div class="value">{{ fmt(data.users.staff) }}</div>
        </div>
      </section>

      <section class="panel">
        <h2>Daily signups (last 30 days)</h2>
        <canvas ref="chartEl"></canvas>
      </section>

      <section class="row">
        <div class="panel">
          <h2>Signup source</h2>
          <table>
            <thead>
              <tr><th>Provider</th><th class="num">Users</th></tr>
            </thead>
            <tbody>
              <tr v-for="p in data.users.by_provider" :key="p.provider">
                <td>{{ p.provider }}</td>
                <td class="num">{{ fmt(p.count) }}</td>
              </tr>
              <tr v-if="!data.users.by_provider.length">
                <td colspan="2" class="muted">No data</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="panel">
          <h2>Engagement</h2>
          <table>
            <thead>
              <tr><th>Metric</th><th class="num">Count</th></tr>
            </thead>
            <tbody>
              <tr v-for="(v, k) in data.engagement" :key="k">
                <td>{{ k.replace(/_/g, ' ') }}</td>
                <td class="num">{{ fmt(v) }}</td>
              </tr>
              <tr v-if="!Object.keys(data.engagement).length">
                <td colspan="2" class="muted">No data</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import api from '../utils/api'
import { useAuth } from '../stores/authStore'

Chart.register(...registerables)

const router = useRouter()
const { state } = useAuth()

const data = ref(null)
const loading = ref(false)
const error = ref('')
const chartEl = ref(null)
let chart = null

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString())

const generatedLabel = computed(() => {
  if (!data.value) return 'loading…'
  return 'updated ' + new Date(data.value.generated_at).toLocaleString()
})

async function load() {
  // Defensive: shouldn't reach here without staff, but bounce just in case
  if (!state.user?.is_staff) {
    router.replace({ name: 'Home' })
    return
  }

  loading.value = true
  error.value = ''
  try {
    const res = await api.get('/api/auth/analytics/data/')
    data.value = res.data
    await nextTick()
    renderChart()
  } catch (e) {
    if (e.response?.status === 403) {
      error.value = 'You need staff permissions to view analytics.'
    } else if (e.response?.status === 401) {
      error.value = 'Session expired. Please sign in again.'
    } else {
      error.value = 'Failed to load analytics: ' + (e.message || 'unknown error')
    }
  } finally {
    loading.value = false
  }
}

function renderChart() {
  if (!chartEl.value || !data.value) return
  const labels = data.value.daily_signups.map((d) => d.date.slice(5))
  const values = data.value.daily_signups.map((d) => d.count)

  if (chart) chart.destroy()
  chart = new Chart(chartEl.value.getContext('2d'), {
    type: 'bar',
    data: {
      labels,
      datasets: [
        {
          label: 'Signups',
          data: values,
          backgroundColor: '#ff5fa2',
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false } },
      scales: {
        x: { ticks: { color: '#8a93a6' }, grid: { color: '#1f232c' } },
        y: {
          ticks: { color: '#8a93a6', precision: 0 },
          grid: { color: '#1f232c' },
          beginAtZero: true,
        },
      },
    },
  })
}

watch(() => data.value, () => {
  if (data.value) nextTick(renderChart)
})

onMounted(load)
onBeforeUnmount(() => {
  if (chart) chart.destroy()
})
</script>

<style scoped>
.analytics-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 28px 24px 60px;
  color: #e6e8ee;
  background: #0f1115;
  min-height: 100vh;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
}

.page-header h1 {
  margin: 0;
  font-size: 22px;
  font-weight: 600;
}

.meta {
  margin: 4px 0 0;
  color: #8a93a6;
  font-size: 12px;
}

.btn {
  background: #1f232c;
  color: #e6e8ee;
  border: 1px solid #262b36;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  font-size: 13px;
}
.btn:hover:not(:disabled) {
  border-color: #ff5fa2;
}
.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: #3a1820;
  border: 1px solid #6b2030;
  padding: 12px 16px;
  border-radius: 8px;
  color: #ffb3c1;
  margin-bottom: 18px;
}

.tiles {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 14px;
  margin-bottom: 22px;
}

.tile {
  background: #171a21;
  border: 1px solid #262b36;
  border-radius: 10px;
  padding: 16px 18px;
}
.tile .label {
  color: #8a93a6;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.tile .value {
  font-size: 28px;
  font-weight: 600;
  margin-top: 6px;
}
.tile .sub {
  color: #8a93a6;
  font-size: 11px;
  margin-top: 4px;
}

.panel {
  background: #171a21;
  border: 1px solid #262b36;
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 20px;
}
.panel h2 {
  margin: 0 0 14px;
  font-size: 12px;
  font-weight: 600;
  color: #8a93a6;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.panel canvas {
  max-height: 280px;
}

.row {
  display: flex;
  gap: 20px;
  flex-wrap: wrap;
}
.row > .panel {
  flex: 1 1 320px;
  min-width: 0;
}

table {
  width: 100%;
  border-collapse: collapse;
}
th,
td {
  text-align: left;
  padding: 8px 10px;
  border-bottom: 1px solid #262b36;
  font-size: 13px;
}
th {
  color: #8a93a6;
  font-weight: 500;
}
td.num,
th.num {
  text-align: right;
}
.muted {
  color: #8a93a6;
}
</style>
