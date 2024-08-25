<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useDraggable } from '@vueuse/core'
//@ts-ignore
import phareGeoJson from '../phares.json'
import { Position } from './utils/Position'
import { Lighthouse, sequence2Animation } from './utils/LightHouse'
import LightPoint from './components/LightPoint.vue'

const el = ref<HTMLElement | null>(null)

const movedM = ref(0)
// `style` will be a helper computed for `left: ?px; top: ?px;`
const { x, y, style } = useDraggable(el, {
  initialValue: { x: 40, y: 40 }
})

watch(x, (newX) => {
  movedM.value += newX
})

const myPos: Position = new Position(48.09458309416971, -4.469361596098759)
const lightHouseRefs = ref<any>([])

const lightHouses = phareGeoJson.features
  .map((feature) => Lighthouse.fromGeoJson(feature))
  .filter(
    (lighthouse) => lighthouse.pos.getDistanceFromLatLonInKm(myPos) < lighthouse.maxLightRange * 3
  )
</script>

<template>
  <main>
    <div ref="el" :style="{ left: x + 'px' }" style="position: fixed" class="horizon">
      <div class="navbar">
        <span v-for="i in 36" :key="i" class="coords">{{ ((i - 1) * 10 + 180) % 360 }}<br />|</span>
      </div>
      <div
        class="lighthouseContainer"
        v-for="lightHouse in lightHouses"
        ref="lightHouseRefs"
        :id="lightHouse.name"
        :key="lightHouse.name"
        :style="{
          left: 'calc(50% + 1rem + ' + myPos.direction(lightHouse.pos) + 'svw)',
          opacity: Math.min(
            (lightHouse.maxLightRange - lightHouse.pos.getDistanceFromLatLonInKm(myPos)) /
              (5 * lightHouse.maxLightRange) +
              1,
            1
          )
        }"
      >
        <div class="lighthouseName">
          {{ lightHouse.getSectorByViewingPosition(myPos)?.color }} --
          {{ lightHouse.pos.getDistanceFromLatLonInKm(myPos).toFixed(2) }} km -
          {{ lightHouse.name }}
        </div>
        <LightPoint
          :color="lightHouse.getSectorByViewingPosition(myPos)?.color"
          :dark-intervals="lightHouse.getSectorByViewingPosition(myPos)?.darkIntervals || [100]"
          :light-intervals="lightHouse.getSectorByViewingPosition(myPos)?.brightIntervals || [100]"
        />
      </div>
    </div>
  </main>
</template>

<style scoped>
.horizon {
  width: 360svw;
  height: 100svh;
  background-color: #050022;
  overflow: hidden;
}

.coords {
  padding-left: 1rem;
  padding-right: 1rem;
  width: 10svw;
}

.lighthouse {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  margin-top: 1rem;
  background-color: blue;
}
.lighthouseContainer {
  width: 5rem;
  height: 20rem;
  position: absolute;
  top: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 1rem;
}

.lighthouseContainer .lighthouseName {
  /* background-color: green; */
  width: 100%;
  height: 100%;
  display: flex;
  vertical-align: baseline;
  /* align-content: center; */
  align-items: center;
  justify-content: flex-end;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.navbar {
  display: flex;
  justify-content: center; /* Align horizontal */
  align-items: center;
  width: 100%;
  height: 4rem;
  padding: 0 2rem;
  text-align: center;
  font-size: 1rem;
  font-weight: bold;
  border-bottom: 1px solid #f00;
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
</style>
