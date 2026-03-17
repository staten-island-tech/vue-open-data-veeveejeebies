<template>
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
})
</script>


<style scoped>


</style>

