<template>
  <div>
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
      <!-- Use local PieChart component -->
      <PieChart v-if="shsatChartData" :chart-data="shsatChartData" />
    </div>

    <!-- Ethnicity Chart -->
    <div v-else-if="selectedChart === 'ethnicity'">
      <h2>Ethnicity Breakdown of Students and Offers</h2>
      <PieChart v-if="ethnicityChartData" :chart-data="ethnicityChartData" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, defineComponent } from 'vue'
import { Chart, Title, Tooltip, Legend, ArcElement } from 'chart.js'

// Register Chart.js components (required)
Chart.register(Title, Tooltip, Legend, ArcElement)

// --- Original API fetch state ---
const SHSAT = ref([])
const shsatChartData = ref(null)
const ethnicityData = ref([])
const ethnicityChartData = ref(null)
const isLoading = ref(false)
const errorMessage = ref('')
const selectedChart = ref('shsat')

// --- Original API fetch function for SHSAT (unchanged) ---
async function getSHSATSCORES() {
  isLoading.value = true
  errorMessage.value = ''

  try {
    const response = await fetch('https://data.cityofnewyork.us/resource/unse-x4pq.json')

    if (!response.ok) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()
    SHSAT.value = Array.isArray(data) ? data : []

    // Prepare chart data for SHSAT pie chart
    shsatChartData.value = {
      labels: SHSAT.value.slice(0, 5).map(item => item.year),
      datasets: [
        {
          label: 'SHSAT Totals',
          data: SHSAT.value.slice(0, 5).map(item => Number(item.total)),
          backgroundColor: [
            '#ff6384',
            '#36a2eb',
            '#ffcd56',
            '#4bc0c0',
            '#9966ff'
          ],
        }
      ]
    }
  } catch (error) {
    SHSAT.value = []
    errorMessage.value = error instanceof Error ? error.message : 'Unable to display SHSAT data.'
  } finally {
    isLoading.value = false
  }
}

// --- Fetch ethnicity data ---
// NOTE: Replace the URL below with your real ethnicity data API endpoint
async function getEthnicityData() {
  try {
    const response = await fetch('https://your-ethnicity-api-endpoint.json') // <-- CHANGE this URL to your real API
    if (!response.ok) throw new Error(`Request failed with status ${response.status}`)

    const data = await response.json()
    ethnicityData.value = Array.isArray(data) ? data : []

    // Prepare ethnicity chart data with two datasets
    ethnicityChartData.value = {
      labels: ethnicityData.value.map(item => item.ethnicity),
      datasets: [
        {
          label: 'Total Students',
          data: ethnicityData.value.map(item => Number(item.total_students) || 0),
          backgroundColor: generateColors(ethnicityData.value.length),
        },
        {
          label: 'Offers',
          data: ethnicityData.value.map(item => Number(item.offers) || 0),
          backgroundColor: generateColors(ethnicityData.value.length, 0.5),
        }
      ]
    }
  } catch (error) {
    ethnicityData.value = []
  }
}

// Utility function to generate consistent RGBA colors
function generateColors(count, opacity = 1) {
  const baseColors = [
    '255, 99, 132',
    '54, 162, 235',
    '255, 206, 86',
    '75, 192, 192',
    '153, 102, 255',
    '255, 159, 64',
    '199, 199, 199',
  ]
  const colors = []
  for (let i = 0; i < count; i++) {
    const c = baseColors[i % baseColors.length]
    colors.push(`rgba(${c}, ${opacity})`)
  }
  return colors
}

// --- New local PieChart component ---
// This component creates a canvas and renders a Chart.js Pie chart
const PieChart = defineComponent({
  name: 'PieChart',
  props: {
    chartData: {
      type: Object,
      required: true,
    }
  },
  setup(props) {
    const canvasRef = ref(null)
    let chartInstance = null

    // Create / update Chart.js instance when data changes
    watch(() => props.chartData, (newData) => {
      if (chartInstance) {
        chartInstance.data = newData
        chartInstance.update()
      } else if (canvasRef.value) {
        chartInstance = new Chart(canvasRef.value.getContext('2d'), {
          type: 'pie',
          data: newData,
          options: {
            responsive: true,
            plugins: {
              legend: {
                position: 'top',
              },
              title: {
                display: false,
              }
            }
          }
        })
      }
    }, { immediate: true })

    // Cleanup Chart instance on unmount
    onUnmounted(() => {
      if (chartInstance) {
        chartInstance.destroy()
      }
    })

    return () => (
      <canvas ref={canvasRef}></canvas>
    )
  }
})

onMounted(() => {
  // Call original API fetch functions on mount
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