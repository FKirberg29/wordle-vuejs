<script setup lang="ts">
import {ref, withDefaults} from "vue"

const seconds = ref(0)
const minutes = ref(0)
var timer = ref(0)

type TimerProp = {
  updateInterval: number
}
const props = withDefaults(defineProps<TimerProp>(),
    {
       updateInterval: 1000
    })
    
function updateTime() {
  seconds.value++;
  if (seconds.value === 60) {
    minutes.value++
    seconds.value = 0
  }
}

timer.value = setInterval(updateTime, props.updateInterval)
</script>


<template>
    <div>{{minutes.toLocaleString('en-US', { minimumIntegerDigits: 2})}}:{{seconds.toLocaleString('en-US', { minimumIntegerDigits: 2})}}</div>
</template>