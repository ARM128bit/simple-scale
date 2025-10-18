<template>
  <div class="row q-gutter-sm q-pa-sm">
    <q-select
      v-model="worksheetStore.selectedUser"
      :options="usersStore.filteredUsers"
      :option-label="(option: IUser) => `${option.first_name} ${option.last_name}`"
      :readonly="worksheetStore.worksheetIsLocked"
      label="Пользователь"
      class="col text-h6"
      clearable
    />
  </div>
  <div class="row q-gutter-sm q-pa-sm">
    <q-select
      v-model="worksheetStore.selectedMethod"
      :options="[...methodsStore.methods.values()].filter((scale) => scale.enabled)"
      :readonly="worksheetStore.worksheetIsLocked"
      option-label="name"
      label="Метод"
      class="col text-h6"
      clearable
    />
    <q-select
      v-model="worksheetStore.selectedScale"
      :options="[...scalesStore.scales.values()].filter((scale) => scale.enabled)"
      :readonly="worksheetStore.worksheetIsLocked"
      option-label="name"
      label="Весы"
      class="col text-h6"
      clearable
    />
  </div>
  <div class="row q-gutter-sm q-pa-sm">
    <q-btn
      icon="folder"
      :disable="worksheetStore.worksheetIsLocked"
      @click="worksheetStore.openWorksheet"
    >
      Открыть
    </q-btn>
    <q-btn
      icon="save"
      @click="worksheetStore.saveWorksheet"
    >
      Сохранить рабочий лист
    </q-btn>
    <q-btn
      :disable="worksheetStore.worksheetIsLocked || worksheetStore.sheetData.length === 0"
      @click="worksheetStore.clearWorksheet"
    >
      Закрыть лист
    </q-btn>
    <q-btn
      :icon="worksheetStore.worksheetIsLocked ? 'stop' : 'play_arrow'"
      :disable="
        !worksheetStore.selectedMethod ||
        !worksheetStore.selectedScale ||
        !worksheetStore.selectedUser ||
        !settingsStore.settings.serial_port.path
      "
      @click="toggleWork"
    >
      {{ worksheetStore.worksheetIsLocked ? 'Остановить работу' : 'Начать работу' }}
      <q-tooltip
        v-if="
          !worksheetStore.selectedMethod ||
          !worksheetStore.selectedScale ||
          !worksheetStore.selectedUser ||
          !settingsStore.settings.serial_port.path
        "
        anchor="top middle"
        self="bottom middle"
        :offset="[10, 10]"
        class="bg-orange-5 text-body2"
      >
        {{
          !settingsStore.settings.serial_port.path
            ? 'Необходимо в настройках указать путь COM порта'
            : 'Для начала работы необходимо выбрать весы, метод и пользователя'
        }}
      </q-tooltip>
    </q-btn>
  </div>
  <div class="row q-gutter-sm q-ma-sm">
    {{
      worksheetStore.worksheetFileName
        ? `Открытый файл: ${worksheetStore.worksheetFileName}`
        : 'Откройте ранее сохранный рабочий лист или начните работу с чистого листа'
    }}
  </div>
  <q-table
    row-key="lab_id"
    :rows="sheetData"
    :columns="worksheetStore.sheetColumns"
    separator="cell"
    table-header-class="bg-orange text-h5"
    :hide-pagination="true"
    :rows-per-page-options="[0]"
    class="q-mb-sm"
  >
    <template v-slot:body="props">
      <row-parallel
        :key="props.rowIndex"
        :row-props="props"
      />
    </template>
  </q-table>
  <q-btn
    :disable="!worksheetStore.worksheetIsLocked"
    @click="worksheetStore.addParallel"
  >
    Add row
  </q-btn>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUsersStore } from '@/stores/users'
import { useScalesStore } from '@/stores/scales'
import { useMethodsStore } from '@/stores/methods'
import { useSettingsStore } from '@/stores/settings'
import { absoluteComparsion, relativeComparsion, useWorksheetStore } from '../../stores/worksheet'
import RowParallel from './RowParallel.vue'

const usersStore = useUsersStore()
const scalesStore = useScalesStore()
const methodsStore = useMethodsStore()
const settingsStore = useSettingsStore()
const worksheetStore = useWorksheetStore()

const sheetData = computed(() => {
  const data = []
  const temp = [...worksheetStore.sheetData]
  while (temp.length > 0) {
    const [parallel] = temp.splice(0, 1)

    const otherParallels = data.filter((item) => item.lab_id === parallel.lab_id)
    data.push(parallel)
    if (!parallel.result || otherParallels.length >= 2 || otherParallels.length === 0) {
      continue
    }
    const [earlyMovedParallel] = otherParallels
    if (!earlyMovedParallel.result) continue
    for (const rule of earlyMovedParallel.method.repeatability_rules) {
      if (rule.start <= earlyMovedParallel.result && rule.end > earlyMovedParallel.result) {
        if (
          (rule.type === 'absolute' &&
            absoluteComparsion(parallel.result, earlyMovedParallel.result, rule.value)) ||
          (rule.type === 'relative' &&
            relativeComparsion(parallel.result, earlyMovedParallel.result, rule.value))
        ) {
          parallel.passed_repeatability = 'passed'
          earlyMovedParallel.passed_repeatability = 'passed'
        } else {
          parallel.passed_repeatability = 'not-passed'
          earlyMovedParallel.passed_repeatability = 'not-passed'
        }
      }
    }
  }

  return data
})

const runSerialPort = async () => {
  if (!worksheetStore.selectedScale) return
  await window.serialPort.initSerialPort(worksheetStore.selectedScale.regex)
}

const toggleWork = async () => {
  if (!worksheetStore.worksheetIsLocked) {
    runSerialPort()
  } else {
    const res = await window.serialPort.closeSerialPort()
    if (res) worksheetStore.toggleWorksheetLocking(false)
  }
}

onMounted(async () => {
  await window.serialPort.listenSerialPort((data: string) => {
    const input = document.activeElement as HTMLInputElement
    if (input) {
      input.value = data
      // const tabEvent = new KeyboardEvent('keyup', { key: 'Tab', bubbles: true })
      input.dispatchEvent(new Event('input', { bubbles: true }))
      // setTimeout(() => {
      //   document.dispatchEvent(tabEvent)
      // }, 0)
    }
  })
  await window.serialPort.successfulOpenSerialPort((data: boolean) => {
    if (data) worksheetStore.toggleWorksheetLocking(true)
  })
})
</script>

<style scoped lang="scss"></style>
