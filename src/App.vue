<script setup lang="ts">
import DefaultLayout from './layouts/DefaultLayout.vue'
import { useUsersStore } from '@/stores/users'
import { useScalesStore } from '@/stores/scales'
import { useMethodsStore } from '@/stores/methods'
import { onMounted } from 'vue'
import { useSettingsStore } from './stores/settings'

const usersStore = useUsersStore()
const scalesStore = useScalesStore()
const methodsStore = useMethodsStore()
const settingsStore = useSettingsStore()

onMounted(() => {
  usersStore.loadUsers()
  scalesStore.loadScales()
  methodsStore.loadMethods()
  settingsStore.loadSettings()
})
</script>

<template>
  <DefaultLayout>
    <router-view v-slot="{ Component }">
      <keep-alive include="WorkSheet">
        <component
          :is="Component"
          :key="$route.fullPath"
        />
      </keep-alive>
    </router-view>
  </DefaultLayout>
</template>

<style scoped></style>
