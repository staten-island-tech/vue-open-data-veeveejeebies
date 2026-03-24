<template>

  <div>
    <Pie v-if="chartData" :data="chartData" />
  </div>


  <div class="container">
    <div v-for="(scores, index) in SHSAT" :key="index">
      <p>{{ scores.summary }}</p>
      <p>{{ scores.year }}</p>
      <p>{{ scores.total }}</p>
    </div>

    <p v-if="isLoading" class="status">Loading...</p>
    <p v-else-if="errorMessage" class="status error">{{ errorMessage }}</p>
  </div>
</template>


<script setup>
import { ref, onMounted } from 'vue'

const SHSAT = ref([])
const isLoading = ref(false)
const errorMessage = ref('')

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
  } catch (error) {
    SHSAT.value = []
    errorMessage.value = error instanceof Error ? error.message : 'Unable to display SHSAT data.'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  getSHSATSCORES()

  
  const data = {
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
};
})
const actions = [
  {
    name: 'Randomize',
    handler(chart) {
      chart.data.datasets.forEach(dataset => {
        dataset.data = Utils.numbers({count: chart.data.labels.length, min: 0, max: 100});
      });
      chart.update();
    }
  },
  {
    name: 'Add Dataset',
    handler(chart) {
      const data = chart.data;
      const newDataset = {
        label: 'Dataset ' + (data.datasets.length + 1),
        backgroundColor: [],
        data: [],
      };

      for (let i = 0; i < data.labels.length; i++) {
        newDataset.data.push(Utils.numbers({count: 1, min: 0, max: 100}));

        const colorIndex = i % Object.keys(Utils.CHART_COLORS).length;
        newDataset.backgroundColor.push(Object.values(Utils.CHART_COLORS)[colorIndex]);
      }

      chart.data.datasets.push(newDataset);
      chart.update();
    }
  },
  {
    name: 'Add Data',
    handler(chart) {
      const data = chart.data;
      if (data.datasets.length > 0) {
        data.labels.push('data #' + (data.labels.length + 1));

        for (let index = 0; index < data.datasets.length; ++index) {
          data.datasets[index].data.push(Utils.rand(0, 100));
        }

        chart.update();
      }
    }
  },
  {
    name: 'Remove Dataset',
    handler(chart) {
      chart.data.datasets.pop();
      chart.update();
    }
  },
  {
    name: 'Remove Data',
    handler(chart) {
      chart.data.labels.splice(-1, 1); // remove the label first

      chart.data.datasets.forEach(dataset => {
        dataset.data.pop();
      });

      chart.update();
    }
  }
];


</script>


<style scoped>


</style>

