<template>
  <div>
    <!-- Chart selection buttons -->
    <nav style="margin-bottom: 20px;">
      <button 
        :class="{ active: selectedChart === 'shsat' }" 
        @click="selectedChart = 'shsat'">
        SHSAT Data
      </button>
      <button 
        :class="{ active: selectedChart === 'ethnicity' }" 
        @click="selectedChart = 'ethnicity'">
        Ethnicity Data
      </button>
    </nav>

    <!-- SHSAT Chart -->
    <div v-if="selectedChart === 'shsat'">
      <h2>SHSAT Test Takers and Accepted Students by School</h2>
      <PieChart v-if="shsatChartData" :data="shsatChartData" />
    </div>

    <!-- Ethnicity Chart -->
    <div v-else-if="selectedChart === 'ethnicity'">
      <h2>Ethnicity Breakdown of Students and Offers</h2>
      <PieChart v-if="ethnicityChartData" :data="ethnicityChartData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, onBeforeUnmount, defineComponent } from 'vue'
import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js'

// Register Chart.js components
Chart.register(Title, Tooltip, Legend, ArcElement)

// --- State ---
const SHSAT = ref([])
const shsatChartData = ref(null)
const ethnicityData = ref([])
const ethnicityChartData = ref(null)
const selectedChart = ref('shsat')

// --- Original API fetch for SHSAT (unchanged) ---
async function getSHSATSCORES() {
  try {
    const response = await fetch('https://data.cityofnewyork.us/resource/unse-x4pq.json')
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    const data = await response.json()
    SHSAT.value = Array.isArray(data) ? data : []

    shsatChartData.value = {
      labels: SHSAT.value.slice(0, 5).map(item => item.year),
      datasets: [
        {
          label: 'SHSAT Totals',
          data: SHSAT.value.slice(0, 5).map(item => Number(item.total)),
          backgroundColor: ['#ff6384','#36a2eb','#ffcd56','#4bc0c0','#9966ff']
        }
      ]
    }
  } catch (error) {
    SHSAT.value = []
  }
}

// --- Fetch ethnicity data ---
async function getEthnicityData() {
  try {
    const response = await fetch('https://your-ethnicity-api-endpoint.json') // Replace with real API
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)
    const data = await response.json()
    ethnicityData.value = Array.isArray(data) ? data : []

    ethnicityChartData.value = {
      labels: ethnicityData.value.map(item => item.ethnicity),
      datasets: [
        {
          label: 'Total Students',
          data: ethnicityData.value.map(item => Number(item.total_students) || 0),
          backgroundColor: generateColors(ethnicityData.value.length)
        },
        {
          label: 'Offers',
          data: ethnicityData.value.map(item => Number(item.offers) || 0),
          backgroundColor: generateColors(ethnicityData.value.length, 0.5)
        }
      ]
    }
  } catch (error) {
    ethnicityData.value = []
  }
}

// --- Simple color generator ---
function generateColors(count, opacity = 1) {
  const baseColors = ['255, 99, 132','54, 162, 235','255, 206, 86','75, 192, 192','153, 102, 255','255, 159, 64','199, 199, 199']
  const colors = []
  for (let i = 0; i < count; i++) {
    const c = baseColors[i % baseColors.length]
    colors.push(`rgba(${c}, ${opacity})`)
  }
  return colors
}

// --- Local PieChart component (simplest version, no JSX) ---
const PieChart = defineComponent({
  name: 'PieChart',
  props: { data: Object },
  setup(props) {
    const canvasRef = ref(null)
    let chartInstance = null

    watch(() => props.data, (newData) => {
      if (!canvasRef.value) return
      if (chartInstance) {
        chartInstance.data = newData
        chartInstance.update()
      } else {
        chartInstance = new Chart(canvasRef.value.getContext('2d'), {
          type: 'pie',
          data: newData,
          options: { responsive: true, plugins: { legend: { position: 'top' } } }
        })
      }
    }, { immediate: true })

    onBeforeUnmount(() => { if (chartInstance) chartInstance.destroy() })

    return { canvasRef }
  },
  template: `<canvas ref="canvasRef"></canvas>`
})

// --- Run API fetch on mount ---
onMounted(() => {
  getSHSATSCORES()
  getEthnicityData()
})
</script>

<style scoped>
nav button {
  margin-right: 10px;
  padding: 6px 12px;
  border: none;
  cursor: pointer;
  background: #eee;
  border-radius: 4px;
  font-weight: 600;
}
nav button.active {
  background: #36a2eb;
  color: white;
}
</style>