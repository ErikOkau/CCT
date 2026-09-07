<script setup lang="ts">
import { getGuide } from '~/utils/guildGuides'
</script>

<template>
  <BossGuideLayout :guide="getGuide('mgev')" />
</template>
