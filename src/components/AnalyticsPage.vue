<template>
  <div class="analytics-page">
    <!-- PIN Verification Gate -->
    <div v-if="!analyticsToken && !data" class="pin-gate">
      <div class="pin-card">
        <div class="pin-icon">🔐</div>
        <h2>Analytics Access</h2>
        <p class="pin-desc">Enter your 6-digit analytics PIN to continue.</p>

        <div v-if="pinError" class="pin-error">{{ pinError }}</div>

        <form @submit.prevent="verifyPin" class="pin-form">
          <div class="pin-input-group">
            <input
              v-for="i in 6"
              :key="i"
              :ref="el => { if (el) pinInputs[i - 1] = el }"
              type="password"
              inputmode="numeric"
              maxlength="1"
              class="pin-digit"
              :value="pinDigits[i - 1]"
              @input="onPinInput($event, i - 1)"
              @keydown="onPinKeydown($event, i - 1)"
              @paste="onPinPaste"
              :disabled="pinLoading"
            />
          </div>
          <button type="submit" class="pin-submit" :disabled="pinLoading || pinValue.length !== 6">
            {{ pinLoading ? 'Verifying…' : 'Verify PIN' }}
          </button>
        </form>

        <p class="pin-hint">
          PIN not working? Contact your admin to reset it.
        </p>
      </div>
    </div>

    <!-- Analytics Dashboard (shown after PIN verification) -->
    <template v-if="analyticsToken || data">
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

        <section class="panel">
          <h2>All users ({{ fmt(data.users.list?.length || 0) }})</h2>
          <div class="users-table-wrap">
            <table class="users-table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Name</th>
                  <th>Provider</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Last login</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in data.users.list || []" :key="u.id">
                  <td class="email">{{ u.email }}</td>
                  <td>{{ u.name || '—' }}</td>
                  <td>{{ u.provider }}</td>
                  <td>
                    <span v-if="u.is_staff" class="badge badge-staff">staff</span>
                    <span v-if="!u.is_active" class="badge badge-inactive">inactive</span>
                    <span v-if="u.is_active && !u.is_staff" class="badge badge-active">active</span>
                  </td>
                  <td>{{ fmtDate(u.created_at) }}</td>
                  <td>{{ u.last_login ? fmtDate(u.last_login) : '—' }}</td>
                </tr>
                <tr v-if="!(data.users.list || []).length">
                  <td colspan="6" class="muted">No users</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </template>
    </template>
  </div>
</template>

<script setup>
// Analytics Dashboard v2 — PIN-gated access
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { Chart, registerables } from 'chart.js'
import { useAuth, getAccessToken, getRefreshToken, setTokens } from '../stores/authStore'

Chart.register(...registerables)

const router = useRouter()
const { state } = useAuth()

const data = ref(null)
const loading = ref(false)
const error = ref('')
const chartEl = ref(null)
let chart = null

// API base URL (same as api.js)
const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD ? 'https://api.outfi.ai' : 'http://127.0.0.1:8000')

// Refresh access token using the refresh token
async function refreshAccessToken() {
  const refresh = getRefreshToken()
  if (!refresh) return null

  try {
    const res = await fetch(`${API_BASE}/api/auth/token/refresh/`, {
      method: 'POST',
      mode: 'cors',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    })

    if (!res.ok) return null

    const data = await res.json()
    setTokens({ access: data.access, refresh: data.refresh || refresh })
    return data.access
  } catch {
    return null
  }
}

// Make an authenticated fetch, retrying once with refreshed token on 401
async function authFetch(url, options = {}) {
  let token = getAccessToken()
  if (!token) return null

  const makeRequest = (t) =>
    fetch(url, {
      ...options,
      mode: 'cors',
      credentials: 'include',
      headers: { ...options.headers, 'Authorization': `Bearer ${t}` },
    })

  let res = await makeRequest(token)

  // If 401, try refreshing the token and retry once
  if (res.status === 401) {
    const newToken = await refreshAccessToken()
    if (!newToken) return null
    res = await makeRequest(newToken)
  }

  return res
}

// PIN verification state
const analyticsToken = ref(null)
const pinDigits = reactive(['', '', '', '', '', ''])
const pinInputs = ref([])
const pinLoading = ref(false)
const pinError = ref('')

const pinValue = computed(() => pinDigits.join(''))

const fmt = (n) => (n == null ? '—' : Number(n).toLocaleString())

const fmtDate = (iso) => {
  if (!iso) return '—'
  const d = new Date(iso)
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
}

const generatedLabel = computed(() => {
  if (!data.value) return 'loading…'
  return 'updated ' + new Date(data.value.generated_at).toLocaleString()
})

// ─── PIN input handlers ────────────────────────────────────────────────

function onPinInput(event, index) {
  const val = event.target.value.replace(/\D/g, '')
  pinDigits[index] = val ? val[0] : ''
  event.target.value = pinDigits[index]

  // Auto-advance to next input
  if (val && index < 5) {
    nextTick(() => pinInputs.value[index + 1]?.focus())
  }
}

function onPinKeydown(event, index) {
  if (event.key === 'Backspace' && !pinDigits[index] && index > 0) {
    pinDigits[index - 1] = ''
    nextTick(() => pinInputs.value[index - 1]?.focus())
  }
}

function onPinPaste(event) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') || '').replace(/\D/g, '').slice(0, 6)
  for (let i = 0; i < 6; i++) {
    pinDigits[i] = pasted[i] || ''
  }
  const focusIndex = Math.min(pasted.length, 5)
  nextTick(() => pinInputs.value[focusIndex]?.focus())
}

// ─── PIN verification ──────────────────────────────────────────────────

async function verifyPin() {
  if (pinValue.value.length !== 6) return

  pinLoading.value = true
  pinError.value = ''

  try {
    const res = await authFetch(`${API_BASE}/api/auth/analytics/verify-pin/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin: pinValue.value }),
    })

    if (!res) {
      pinError.value = 'Session expired. Please log in again.'
      return
    }

    const payload = await res.json()

    if (!res.ok) {
      pinError.value = payload?.error || payload?.detail || `Verification failed (${res.status}).`
      for (let i = 0; i < 6; i++) pinDigits[i] = ''
      nextTick(() => pinInputs.value[0]?.focus())
      return
    }

    if (payload.analytics_token) {
      analyticsToken.value = payload.analytics_token
      await load()
    } else {
      pinError.value = payload?.error || 'No session token received.'
    }
  } catch (e) {
    pinError.value = 'Network error. Please try again.'
    console.error('[Analytics] PIN verification error:', e)
  } finally {
    pinLoading.value = false
  }
}

// ─── Data loading ──────────────────────────────────────────────────────

async function load() {
  // Refresh profile to get latest is_staff flag (in case it was promoted after login)
  if (!state.user?.is_staff) {
    try {
      const { fetchProfile } = useAuth()
      await fetchProfile()
    } catch { /* ignore */ }
  }

  if (!state.user?.is_staff) {
    error.value = 'Staff permissions required. Please log out and log back in.'
    return
  }

  if (!analyticsToken.value) return

  loading.value = true
  error.value = ''
  try {
    const res = await authFetch(`${API_BASE}/api/auth/analytics/data/`, {
      headers: { 'X-Analytics-Token': analyticsToken.value },
    })

    if (!res.ok) {
      const errPayload = await res.json().catch(() => ({}))
      if (res.status === 403) {
        const errorMsg = errPayload?.error || ''
        if (errorMsg.includes('expired') || errorMsg.includes('session')) {
          analyticsToken.value = null
          data.value = null
          pinError.value = 'Session expired. Please re-enter your PIN.'
          for (let i = 0; i < 6; i++) pinDigits[i] = ''
          return
        }
        error.value = 'You need staff permissions to view analytics.'
      } else if (res.status === 401) {
        error.value = 'Session expired. Please sign in again.'
      } else {
        error.value = `Failed to load analytics (${res.status}).`
      }
      return
    }

    data.value = await res.json()
    await nextTick()
    renderChart()
  } catch (e) {
    error.value = 'Failed to load analytics: ' + (e.message || 'unknown error')
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

onMounted(() => {
  // Focus first PIN input on mount
  nextTick(() => pinInputs.value[0]?.focus())
})

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

/* ─── PIN Gate ────────────────────────────────────────────────── */

.pin-gate {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
}

.pin-card {
  background: #171a21;
  border: 1px solid #262b36;
  border-radius: 16px;
  padding: 40px 36px;
  text-align: center;
  max-width: 400px;
  width: 100%;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.pin-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.pin-card h2 {
  margin: 0 0 8px;
  font-size: 20px;
  font-weight: 600;
  color: #e6e8ee;
}

.pin-desc {
  color: #8a93a6;
  font-size: 13px;
  margin: 0 0 24px;
}

.pin-error {
  background: #3a1820;
  border: 1px solid #6b2030;
  padding: 10px 14px;
  border-radius: 8px;
  color: #ffb3c1;
  font-size: 13px;
  margin-bottom: 18px;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%, 60% { transform: translateX(-6px); }
  40%, 80% { transform: translateX(6px); }
}

.pin-form {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.pin-input-group {
  display: flex;
  gap: 8px;
}

.pin-digit {
  width: 44px;
  height: 52px;
  background: #0f1115;
  border: 2px solid #262b36;
  border-radius: 10px;
  color: #e6e8ee;
  font-size: 22px;
  font-weight: 600;
  text-align: center;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  caret-color: #ff5fa2;
}

.pin-digit:focus {
  border-color: #ff5fa2;
  box-shadow: 0 0 0 3px rgba(255, 95, 162, 0.15);
}

.pin-digit:disabled {
  opacity: 0.5;
}

.pin-submit {
  background: linear-gradient(135deg, #ff5fa2, #e04590);
  color: white;
  border: none;
  border-radius: 10px;
  padding: 12px 32px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.2s, transform 0.1s;
  width: 100%;
  max-width: 200px;
}

.pin-submit:hover:not(:disabled) {
  opacity: 0.9;
  transform: translateY(-1px);
}

.pin-submit:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pin-hint {
  color: #5a6070;
  font-size: 11px;
  margin: 20px 0 0;
}

/* ─── Dashboard ───────────────────────────────────────────────── */

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

/* ─── Users table ────────────────────────────────────────────── */
.users-table-wrap {
  overflow-x: auto;
  margin: 0 -4px;
}
.users-table {
  width: 100%;
  min-width: 720px;
}
.users-table th,
.users-table td {
  white-space: nowrap;
}
.users-table td.email {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  color: #e6e8ee;
}
.badge {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-right: 4px;
}
.badge-active {
  background: #14351f;
  color: #7ee0a0;
  border: 1px solid #1f5030;
}
.badge-staff {
  background: #3a1f52;
  color: #d4a3ff;
  border: 1px solid #5b2d82;
}
.badge-inactive {
  background: #3a1820;
  color: #ffb3c1;
  border: 1px solid #6b2030;
}
</style>
