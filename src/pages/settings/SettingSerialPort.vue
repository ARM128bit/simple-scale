<template>
  <q-form class="q-pa-sm">
    <q-input
      v-model.trim="settings.settings.serial_port.path"
      label="Port's path"
    />
    <q-input
      v-model.number="settings.settings.serial_port.baudrate"
      label="Baudrate"
    />
    <q-input
      v-model.number="settings.settings.serial_port.databits"
      label="Databits"
    />
    <q-input
      v-model.number="settings.settings.serial_port.stopbit"
      label="Stopbit"
    />
    <q-input
      v-model.trim="settings.settings.serial_port.pairly"
      label="Pairly"
    />
    <q-input
      v-model.trim="settings.settings.serial_port.termination_code"
      label="Termination code"
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
