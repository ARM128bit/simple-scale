<script setup lang="ts">
import { onMounted } from 'vue'
import DefaultLayout from './layouts/DefaultLayout.vue'
import { useUsersStore } from '@/stores/users'
import { useScalesStore } from '@/stores/scales'
import { useMethodsStore } from '@/stores/methods'
import { useSettingsStore } from './stores/settings'
import { useRoute } from 'vue-router'

const usersStore = useUsersStore()
const scalesStore = useScalesStore()
const methodsStore = useMethodsStore()
const settingsStore = useSettingsStore()
const route = useRoute()

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
      <keep-alive>
        <component
          :is="Component"
          :key="route.fullPath"
        />
      </keep-alive>
    </router-view>
  </DefaultLayout>
</template>

<style scoped></style>
