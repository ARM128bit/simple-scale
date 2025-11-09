<template>
  <div class="row q-gutter-sm q-pa-lg">
    <q-select
      v-model="selectedScale"
      :options="[...scalesStore.scales.values()].filter((scale) => scale.enabled)"
      :readonly="isPortOpen"
      option-label="name"
      label="Весы"
      class="col text-h6"
      clearable
    />
    <q-btn
      icon="usb"
      :disable="!selectedScale || !settingsStore.settings.serial_port.path"
      @click="() => (isPortOpen ? stopSerialPort() : runSerialPort())"
    >
      {{ isPortOpen ? 'Отключить весы' : 'Подключить весы' }}

      <q-tooltip
        v-if="!settingsStore.settings.serial_port.path"
        anchor="bottom middle"
        self="top middle"
        :offset="[10, 10]"
        class="bg-orange-5 text-body2"
      >
        Необходимо в настройках указать путь COM порта
      </q-tooltip>
    </q-btn>
  </div>
  <q-tab-panels
    v-model="tab"
    animated
    class="full-height"
  >
    <q-tab-panel
      v-for="tab in tabs"
      :key="tab.uuid"
      :name="tab.uuid"
      keep-alive
    >
      <suspense>
        <WorksheetItem
          v-model:tab="tab as IWorksheetTab"
          :is-port-open="isPortOpen"
        />
        <template #fallback>
          <q-inner-loading :showing="true" />
        </template>
      </suspense>
    </q-tab-panel>
  </q-tab-panels>
  <q-tabs
    v-model="tab"
    align="left"
    narrow-indicator
    inline-label
  >
    <q-tab
      v-for="(tab, idx) in tabs"
      class="worksheet-tab"
      :key="tab.uuid"
      :name="tab.uuid"
      :disable="anyLockedWorksheet"
      :label="
        tab.method?.name ? `${tab.method?.name}, ${tab.laborant?.fullName ?? ''}` : 'Выберите метод'
      "
    >
      <q-btn
        v-if="tabs.length > 1"
        icon-right="delete"
        dense
        class="q-ml-sm"
        :style="{ 'pointer-events': 'auto' }"
        :disable="anyLockedWorksheet"
        @click.stop="() => removeTab(idx)"
      />
    </q-tab>
    <q-btn
      icon="add"
      :disable="emptyTab || anyLockedWorksheet"
      @click="addTab"
    >
      <q-tooltip
        v-if="emptyTab"
        anchor="bottom middle"
        self="top middle"
        :offset="[10, 10]"
        class="bg-orange-5 text-body2"
      >
        Нельзя создавать множество пустых вкладок
      </q-tooltip>
    </q-btn>
  </q-tabs>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, onMounted, ref, toRaw, provide } from 'vue'
import { useScalesStore } from '@/stores/scales'
import { useSettingsStore } from '@/stores/settings'
import { useWorksheetStore } from '@/stores/worksheet'
import { Notify } from 'quasar'

const WorksheetItem = defineAsyncComponent(() => import('./WorksheetItem.vue'))

const defaultTab = (): IWorksheetTab => {
  return {
    uuid: crypto.randomUUID(),
    isLocked: false,
    method: undefined,
    laborant: undefined,
  }
}

const isPortOpen = ref(false)
provide('is-port-open', isPortOpen)
const tab = ref<string>()
const tabs = ref<IWorksheetTab[]>([])
const selectedScale = ref<IScale>()

const scalesStore = useScalesStore()
const settingsStore = useSettingsStore()

const emptyTab = computed(() => tabs.value.some((tab) => !tab.method || !tab.laborant))
const anyLockedWorksheet = computed(() => tabs.value.some((tab) => tab.isLocked))

const addTab = () => {
  if (emptyTab.value) return
  const newTab = defaultTab()
  tabs.value.push(newTab)
  tab.value = newTab.uuid
}

const removeTab = (idx: number) => {
  if (tabs.value.length <= 1) return
  const store = useWorksheetStore(tabs.value[idx].uuid)
  store.$dispose()
  tabs.value.splice(idx, 1)
  if (tabs.value.length > 0) {
    tab.value = tabs.value[tabs.value.length - 1].uuid
  } else {
    tab.value = ''
  }
}

const runSerialPort = async () => {
  if (!selectedScale.value) return
  await window.serialPort.initSerialPort(toRaw(selectedScale.value))
}

const stopSerialPort = async () => {
  const res = await window.serialPort.closeSerialPort()
  if (res) isPortOpen.value = false
}

onMounted(async () => {
  addTab()
  await window.serialPort.listenSerialPort((data: string) => {
    const input = document.activeElement as HTMLInputElement
    if (!selectedScale.value?.regex) return
    const value = data.match(selectedScale.value.regex)?.[0]
    if (input && value) {
      input.value = value
      input.dispatchEvent(new Event('input', { bubbles: true }))
      const tabElements = Array.from(
        document
          // Get all elements that can be focusable
          .querySelectorAll<HTMLElement>(
            'a, button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
          ),
      )

        // reverse, then sort by tabIndex descending to put 0s last but maintain original order
        // .reverse()
        .sort((a: HTMLElement, b: HTMLElement) => (a.tabIndex > b.tabIndex ? -1 : 1))
      if (input.tabIndex === -1) {
        tabElements[0].focus()
        return
      }

      // find the current index in the tab list of the currently focused element
      const currentIndex = tabElements.findIndex((e) => e === input)

      // get the next element in the list ("%" will loop the index around to 0)
      const nextIndex = (currentIndex + 1) % tabElements.length
      tabElements[nextIndex].focus()
    }
  })
  await window.serialPort.successfulOpenSerialPort((data: boolean) => {
    if (!data)
      Notify.create({
        message:
          'Не удалось открыть порт, проверьте подключение весов и/или корректно ли указан путь к COM-порту',
        icon: 'warning',
        position: 'top-right',
      })
    if (data) isPortOpen.value = data
  })
})
</script>

<style>
.worksheet-tab .q-tab__content {
  flex-direction: row;
}
</style>
