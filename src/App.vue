<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useDraggable, useScroll } from '@vueuse/core'
//@ts-ignore
import phareGeoJson from '../phares.json'
import { Position } from './utils/Position'
import { Lighthouse } from './utils/LightHouse'
import LightPoint from './components/LightPoint.vue'

const el = ref<HTMLElement | null>(null)

const posInputs = ref<{ lat: number; lon: number }>({
  lat: 47.8031492759155,
  lon: -4.374060505059933
})

const movedM = ref(0)
// `style` will be a helper computed for `left: ?px; top: ?px;`
const { x } = useDraggable(el, {
  initialValue: { x: 40, y: 40 }
})

watch(x, (newX) => {
  const elemWidth = el.value?.clientWidth ?? 0
  x.value = Math.max(Math.min(newX, 0), -(elemWidth - (elemWidth / 360) * 100))
})

const myPos = ref<Position>(new Position(posInputs.value.lat, posInputs.value.lon))
const lightHouseRefs = ref<any>([])

const lightHouses = computed(() =>
  phareGeoJson.features
    .map((feature) => Lighthouse.fromGeoJson(feature))
    .filter(
      (lighthouse) =>
        lighthouse.pos.getDistanceFromLatLonInKm(myPos.value) <
        lighthouse.maxLightRange * 1.852 * 1.5
    )
    .filter((lighthouse) => lighthouse.name != 'Unknown')
)
</script>

<template>
  <main>
    <div
      ref="el"
      :style="{ left: x + 'px' }"
      style="position: fixed"
      class="horizon"
      @wheel="(v) => (x += v.deltaY - v.deltaX)"
    >
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
          {{ lightHouse.pos.getDistanceFromLatLonInKm(myPos).toFixed(2) }} km -
          {{ lightHouse.name }}
        </div>
        <LightPoint
          :color="lightHouse.getSectorByViewingPosition(myPos)?.color"
          :dark-intervals="lightHouse.getSectorByViewingPosition(myPos)?.darkIntervals || [0]"
          :light-intervals="lightHouse.getSectorByViewingPosition(myPos)?.brightIntervals || [100]"
        />
      </div>
    </div>
  </main>
  <footer>
    <label for="lat">Latitude</label>
    <input name="lat" v-model="posInputs.lat" placeholder="47.81173852663933" type="number" />
    <label for="lon">Longitude</label>
    <input name="lon" v-model="posInputs.lon" placeholder="-4.336981646486701" type="number" />
    <button
      @click="
        () => {
          myPos.lat = posInputs.lat
          myPos.lon = posInputs.lon
        }
      "
    >
      Update Position
    </button>
    <div class="grow"></div>
    <div>Current Position: {{ myPos.lat }}, {{ myPos.lon }}</div>
  </footer>
</template>

<style scoped>
footer {
  width: 100svw;
  height: 4rem;
  position: fixed;
  bottom: 0;
  background-color: #282730;
  display: flex;
  padding: 1rem;
  font-size: large;
}

footer .grow {
  flex-grow: 1;
}

footer input {
  margin-left: 0.5rem;
  margin-right: 2rem;
  background-color: #3c3b46;
  color: white;
  font-size: large;
  outline: none;
  border: none;
  padding-left: 0.5rem;
}
footer button {
  background-color: #007cff;
  outline: none;
  border: none;
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  font-size: large;
  border-radius: 0.5rem;
}

/* Chrome, Safari, Edge, Opera */
footer input::-webkit-outer-spin-button,
footer input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
footer input[type='number'] {
  -moz-appearance: textfield;
}

.horizon {
  width: 360svw;
  height: 100svh;
  background-color: #050022;
  overflow: hidden;
  cursor: all-scroll;
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
  top: 40%;
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
