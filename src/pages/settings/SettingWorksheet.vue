<template>
  <q-form class="q-pa-sm">
    <q-checkbox
      v-for="item in settings.settings.worksheet_columns"
      :key="item.name"
      v-model="item.visible"
      class="row fit"
      :disable="item.required"
      :label="item.label"
    />
  </q-form>
  <div class="row no-wrap items-center q-mt-md q-pa-sm">
    <q-space />
    <q-btn @click="settings.saveSettings">Save</q-btn>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<style scoped></style>
