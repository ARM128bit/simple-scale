<template>
  <nav>
    <q-tabs
      inline-label
      align="left"
      class="bg-purple text-white shadow-2"
    >
      <q-route-tab
        :to="{ name: 'worksheet-desk' }"
        label="Worksheet"
      />

      <!-- :disable="worksheetStore.worksheetIsLocked" -->
      <q-route-tab
        :to="{ name: 'settings' }"
        label="Settings"
      >
        <!-- v-if="worksheetStore.worksheetIsLocked" -->
        <q-tooltip
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

<script setup lang="ts"></script>

<style scoped></style>
