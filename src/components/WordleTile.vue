<script setup lang="ts">
import { withDefaults } from 'vue';

type WorldleTileProp = {
    letter: string,
    colorCode: string,
}
const props = withDefaults(defineProps<WorldleTileProp>(),
      {
         letter: "",
         colorCode: "",
      })
</script>


<template>
    <div class="grid-object">
        <span class="grid-tile-letter" :key="letter">
        <div class="grid-tile flip-tile" :key="colorCode">
            <div class="tile-face grid-tile-letter" :key="letter">{{ letter }}</div>
            <div class="tile-face tile-face-back" :class="colorCode">{{ letter }}</div>
        </div>
        </span>
    </div>
</template>
