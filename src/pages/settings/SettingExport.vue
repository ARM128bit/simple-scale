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
      label="Папка экспорта результатов"
    />
    <q-input
      v-model="settings.settings.export.extension"
      label="Формат"
    />
    <q-input
      v-model="settings.settings.export.data_template"
      type="textarea"
      label="Шаблон"
    />
    <span>
      <i>Используйте формат <b>{variable}</b> для экспорта данных</i>
    </span>
    <!-- <q-toggle label="Передача данных по строчно" /> -->
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
