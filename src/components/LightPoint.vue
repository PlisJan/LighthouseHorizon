<script setup lang="ts">
import { onMounted, ref } from 'vue'

const props = defineProps<{
  darkIntervals: number[]
  lightIntervals: number[]
  color: 'red' | 'white' | 'green' | undefined
}>()

const isOn = ref<boolean>(true)
const stepNum = ref<number>(0)

const intervals = ref<number[]>([])

for (let i = 0; i < props.lightIntervals.length; i++) {
  intervals.value.push(props.lightIntervals[i])
  intervals.value.push(props.darkIntervals[i])
}

function setNextStep() {
  if (intervals.value[stepNum.value] == 0 || intervals.value[stepNum.value] == undefined) return
  setTimeout(() => {
    isOn.value = !isOn.value
    setNextStep()
  }, intervals.value[stepNum.value] * 1000)
  stepNum.value = (stepNum.value + 1) % intervals.value.length
}

onMounted(() => {
  setNextStep()
})
</script>

<template>
  <div class="lightWrapper">
    <Transition name="fade">
      <div class="lighthouse" :class="color" v-if="isOn"></div>
    </Transition>
  </div>
</template>

<style scoped>
.lighthouse {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-top: 1rem;
  background-color: blue;
}
.lightWrapper {
  width: 0.6rem;
  height: 0.6rem;
}

.lighthouse.red {
  background-color: red;
}
.lighthouse.green {
  background-color: green;
}
.lighthouse.white {
  background-color: lightyellow;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.1s linear;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
