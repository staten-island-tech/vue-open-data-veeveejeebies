<template>
  <div>
  
    <div v-if="currentPage === 'home'" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; background:#f0f4f8;">
  <h1 style="font-size:3rem; font-weight:800; color:#1a202c; margin-bottom:10px;">SHSAT Data</h1>
  <nav style="display:flex; gap:20px; font-size:1rem;">
    <span style="color:#1a202c; font-weight:600; cursor:pointer;" @click="currentPage = 'home'">Home</span>
    <span style="color:#ccc;">|</span>
    <span style="color:#36a2eb; cursor:pointer;" @click="switchChart('shsat'); currentPage = 'charts'">SHSAT</span>
    <span style="color:#ccc;">|</span>
    <span style="color:#36a2eb; cursor:pointer;" @click="switchChart('ethnicity'); currentPage = 'charts'">Ethnicity</span>
  </nav>
</div>

    
    <div v-else style="padding:20px;">
      <div style="display:flex; align-items:center; gap:16px; margin-bottom:20px;">
        <button @click="currentPage = 'home'" style="padding:6px 14px; background:#eee; border:none; border-radius:4px; cursor:pointer; font-weight:600;">← Back</button>
        <h1 style="margin:0; font-size:1.4rem; color:#1a202c; font-family:Georgia, serif;">SHSAT Data</h1>
      </div>

      <nav style="margin-bottom: 20px;">
        <button :class="{ active: selectedChart==='shsat' }" @click="switchChart('shsat')">SHSAT Data</button>
        <button :class="{ active: selectedChart==='ethnicity' }" @click="switchChart('ethnicity')">Ethnicity Data</button>
      </nav>

      <div v-if="selectedChart==='shsat'">
        <h2>Total SHSAT Test Takers by Year</h2>
        <div style="width:100%; max-width:600px; height:400px;">
          <canvas ref="shsatCanvas"></canvas>
        </div>
      </div>

      <div v-else>
        <h2>Ethnicity Breakdown of Total Offers (Most Recent Year)</h2>
        <div style="width:100%; max-width:700px; height:400px;">
          <canvas ref="ethnicityCanvas"></canvas>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Chart,
  PieController,
  BarController,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
  Title
} from 'chart.js'

Chart.register(PieController, BarController, ArcElement, BarElement, CategoryScale, LinearScale, Tooltip, Legend, Title)

const currentPage = ref('home')
const selectedChart = ref('shsat')
const shsatCanvas = ref(null)
const ethnicityCanvas = ref(null)

let shsatChart = null
let ethnicityChart = null
let shsatChartData = null
let ethnicityChartData = null

async function getSHSATSCORES() {
  try {
    const res = await fetch('https://data.cityofnewyork.us/resource/unse-x4pq.json')
    const data = await res.json()
    const testerRows = data.filter(i => i.summary === 'Total Testers')
    shsatChartData = {
      labels: testerRows.map(i => i.year),
      datasets:[{
        label: 'Total Test Takers',
        data: testerRows.map(i => Number(i.total.replace(/,/g, ''))),
        backgroundColor:['#ff6384','#36a2eb','#ffcd56','#4bc0c0','#9966ff','#ff9f40','#c9cbcf','#4bc0c0','#f77825','#a1c45a','#d4a5a5']
      }]
    }
    drawShsatChart()
  } catch(e){ console.error('SHSAT fetch error', e) }
}

async function getEthnicityData() {
  try {
    const res = await fetch('https://data.cityofnewyork.us/resource/unse-x4pq.json')
    const data = await res.json()
    const offerRows = data.filter(i =>
      i.summary === 'Total Offers, by Ethnicity' || i.summary === 'Total Offer'
    )
    const latest = offerRows[offerRows.length - 1]
    ethnicityChartData = {
      labels: ['Native American', 'Asian', 'Black', 'Latinx', 'White', 'Multi-Racial'],
      datasets:[{
        label: `Total Offers ${latest.year}`,
        data: [
          Number(latest.native_american.replace(/,/g,'')),
          Number(latest.asian.replace(/,/g,'')),
          Number(latest.black.replace(/,/g,'')),
          Number(latest.latinx.replace(/,/g,'')),
          Number(latest.white.replace(/,/g,'')),
          Number(latest.multi_racial.replace(/,/g,''))
        ],
        backgroundColor: ['#ff6384','#36a2eb','#ffcd56','#4bc0c0','#9966ff','#ff9f40']
      }]
    }
    drawEthnicityChart()
  } catch(e){ console.error('Ethnicity fetch error', e) }
}

function drawShsatChart() {
  if(!shsatCanvas.value || !shsatChartData) return
  if(shsatChart) { shsatChart.destroy(); shsatChart = null }
  shsatChart = new Chart(shsatCanvas.value.getContext('2d'), {
    type: 'pie',
    data: shsatChartData,
    options: { responsive:true, maintainAspectRatio:false, plugins:{legend:{position:'top'}} }
  })
}

function drawEthnicityChart() {
  if(!ethnicityCanvas.value || !ethnicityChartData) return
  if(ethnicityChart) { ethnicityChart.destroy(); ethnicityChart = null }
  ethnicityChart = new Chart(ethnicityCanvas.value.getContext('2d'), {
    type: 'bar',
    data: ethnicityChartData,
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { position: 'top' } },
      scales: {
        y: { beginAtZero: true, title: { display: true, text: 'Number of Offers' } },
        x: { title: { display: true, text: 'Ethnicity' } }
      }
    }
  })
}

function switchChart(chart) {
  selectedChart.value = chart
  setTimeout(() => {
    if(chart === 'shsat') drawShsatChart()
    else drawEthnicityChart()
  }, 50)
}

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
  background: #b08eff;
  color: white;
}
</style>