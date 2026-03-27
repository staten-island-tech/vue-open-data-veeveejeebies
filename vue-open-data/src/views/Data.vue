<template>
  <div style="padding:20px;">
    <!-- Chart selection buttons -->
    <nav style="margin-bottom: 20px;">
      <button :class="{ active: selectedChart==='shsat' }" @click="selectedChart='shsat'">SHSAT Data</button>
      <button :class="{ active: selectedChart==='ethnicity' }" @click="selectedChart='ethnicity'">Ethnicity Data</button>
    </nav>

    <!-- SHSAT Chart -->
    <div v-if="selectedChart==='shsat'">
      <h2>SHSAT Test Takers and Accepted Students</h2>
      <PieChart v-if="shsatChartData" :data="shsatChartData"/>
    </div>

    <!-- Ethnicity Chart -->
    <div v-else>
      <h2>Ethnicity Breakdown</h2>
      <PieChart v-if="ethnicityChartData" :data="ethnicityChartData"/>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, onMounted, onBeforeUnmount, watch } from 'vue'
import { Chart, ArcElement, Tooltip, Legend, Title } from 'chart.js'
Chart.register(ArcElement, Tooltip, Legend, Title)

// --- State ---
const selectedChart = ref('shsat')
const shsatChartData = ref(null)
const ethnicityChartData = ref(null)

// --- SHSAT API ---
async function getSHSATSCORES() {
  try {
    const res = await fetch('https://data.cityofnewyork.us/resource/unse-x4pq.json')
    const data = await res.json()
    const firstFive = data.slice(0,5)
    shsatChartData.value = {
      labels: firstFive.map(i => i.year || 'N/A'),
      datasets:[{
        label:'SHSAT Totals',
        data:firstFive.map(i => Number(i.total) || 0),
        backgroundColor:['#ff6384','#36a2eb','#ffcd56','#4bc0c0','#9966ff']
      }]
    }
  } catch(e){ console.error('SHSAT fetch error', e) }
}

// --- Mock Ethnicity Data ---
function getEthnicityData() {
  const data = [
    { ethnicity:'Asian', total_students:5000, offers:3000 },
    { ethnicity:'Black', total_students:4000, offers:800 },
    { ethnicity:'Hispanic', total_students:4500, offers:900 },
    { ethnicity:'White', total_students:3000, offers:2000 }
  ]
  ethnicityChartData.value = {
    labels: data.map(i=>i.ethnicity),
    datasets:[
      { label:'Total Students', data:data.map(i=>i.total_students), backgroundColor:['#ff6384','#36a2eb','#ffcd56','#4bc0c0'] },
      { label:'Offers', data:data.map(i=>i.offers), backgroundColor:['#ff6384AA','#36a2ebAA','#ffcd56AA','#4bc0c0AA'] }
    ]
  }
}

// --- PieChart component ---
const PieChart = defineComponent({
  props:{ data:Object },
  setup(props){
    const canvasRef = ref(null)
    let chartInstance = null

    const createChart = () => {
      if(canvasRef.value && props.data){
        chartInstance = new Chart(canvasRef.value.getContext('2d'), {
          type:'pie',
          data:props.data,
          options:{
            responsive:true,
            maintainAspectRatio:false,
            plugins:{legend:{position:'top'}}
          }
        })
      }
    }

    watch(() => props.data, (newData) => {
      if(chartInstance && newData){
        chartInstance.data = newData
        chartInstance.update()
      } else {
        createChart()
      }
    }, { immediate: true })

    onBeforeUnmount(() => { if(chartInstance) chartInstance.destroy() })

    return { canvasRef }
  },
  template: `
    <div style="width:100%; max-width:600px; height:400px;">
      <canvas ref="canvasRef"></canvas>
    </div>
  `
})

// --- Fetch Data ---
onMounted(()=>{
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