<template>
  <nav>
    <q-tabs
      inline-label
      align="left"
      class="bg-purple text-white shadow-2"
    >
      <q-route-tab
        :to="{ name: 'worksheet' }"
        label="Worksheet"
      />

      <q-route-tab
        :to="{ name: 'settings' }"
        label="Settings"
        :disable="worksheetStore.worksheetIsLocked"
      >
        <q-tooltip
          v-if="worksheetStore.worksheetIsLocked"
          anchor="bottom middle"
          self="top middle"
          :offset="[10, 10]"
          class="bg-orange-5 text-body2"
        >
          Чтобы зайти в настройки необходимо остановить работу с рабочим листом
        </q-tooltip>
      </q-route-tab>
    </q-tabs>
  </nav>
</template>

<script setup lang="ts">
import { useWorksheetStore } from '@/stores/worksheet'

const worksheetStore = useWorksheetStore()
</script>

<style scoped></style>
