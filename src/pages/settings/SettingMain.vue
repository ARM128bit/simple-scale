<template>
  <q-splitter
    :model-value="250"
    unit="px"
    class="full-height"
  >
    <template v-slot:before>
      <q-tabs
        vertical
        class="text-teal"
      >
        <q-route-tab
          :to="{ name: 'setting-worksheet' }"
          icon="edit_document"
          label="Worksheet"
        />
        <q-route-tab
          :to="{ name: 'setting-methods' }"
          icon="science"
          label="Methods"
        />
        <q-route-tab
          :to="{ name: 'setting-serial-port' }"
          icon="usb"
          label="Serial port"
        />
        <q-route-tab
          :to="{ name: 'setting-scales' }"
          icon="balance"
          label="Scales"
        />
        <q-route-tab
          :to="{ name: 'setting-users' }"
          icon="person"
          label="Users"
        />
        <q-route-tab
          :to="{ name: 'setting-templates' }"
          icon="upload_file"
          label="Templates"
        />
        <q-route-tab
          :to="{ name: 'setting-export' }"
          icon="upload_file"
          label="Export"
        />
      </q-tabs>
    </template>

    <template v-slot:after>
      <RouterView />
    </template>
  </q-splitter>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<style scoped></style>
