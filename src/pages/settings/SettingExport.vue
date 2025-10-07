<template>
  <q-form class="q-pa-sm">
    <q-input
      v-model="settings.settings.export.worksheet_folder_path"
      label="Пользовательская папка для хранения рабочих листов"
    />
    <q-input
      v-model="settings.settings.export.url"
      label="URL на сторонний ресурс"
    />
    <q-input
      v-model="settings.settings.export.folder_path"
      label="Папка экспорта результата"
    />
    <!-- <q-toggle label="Передача данных по строчно" /> -->
  </q-form>
  <div class="row no-wrap items-center q-mt-md q-pa-sm">
    <q-space />
    <q-btn>Save</q-btn>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settings = useSettingsStore()
</script>

<style scoped></style>
