<template>
    <div>
<h1> </h1>


    </div>
</template>

<script>
import {ref, onMounted}

const SHSAT {
    
}

try {
  // Try to do this...
  const getScores = await fetch(url)
  if (!response.ok) throw new Error('Request failed')
  const data = await response.json()
  pokemon.value = data.results
} catch (error) {
  // If anything goes wrong, run this instead
  errorMessage.value = error.message
} finally {
  // This ALWAYS runs, whether it worked or failed
  isLoading.value = false
}
</script>

<style scoped>

</style>