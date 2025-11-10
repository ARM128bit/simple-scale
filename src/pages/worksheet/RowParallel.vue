<template>
  <q-tr class="parallel">
    <q-td
      class="parallel__actions q-gutter-sm"
      key="expand"
      :props="rowProps"
    >
      <q-btn
        v-if="rowProps.row.method.const_weight_rule"
        size="sm"
        color="accent"
        round
        :icon="rowProps.row.expand ? 'remove' : 'add'"
        @click="rowProps.row.expand = !rowProps.row.expand"
      />
      <q-btn
        :disable="
          !worksheetStore.worksheetIsLocked ||
          !rowProps.row.result ||
          (!settingsStore.settings.export.url && !settingsStore.settings.export.folder_path)
        "
        :loading="isExporting"
        size="sm"
        round
        icon="upload"
        @click="exportParallel"
      >
        <q-tooltip
          v-if="!settingsStore.settings.export.url && !settingsStore.settings.export.folder_path"
          anchor="bottom middle"
          self="top middle"
          :offset="[10, 10]"
          class="bg-orange-5 text-body2"
        >
          Для экспорта необходимо в настройках указать путь или URL
        </q-tooltip>
      </q-btn>
    </q-td>
    <q-td
      key="lab_id"
      :props="rowProps"
    >
      <q-input
        v-model.trim="rowProps.row.lab_id"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
        type="text"
        borderless
        @blur="worksheetStore.saveWorksheet"
      />
    </q-td>
    <q-td
      key="crucible_id"
      :props="rowProps"
    >
      <q-input
        v-model.trim="rowProps.row.crucible_id"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
        type="text"
        borderless
        @blur="worksheetStore.saveWorksheet"
      />
    </q-td>
    <q-td
      key="crucible_weight"
      :props="rowProps"
    >
      <q-input
        :model-value="rowProps.row.crucible_weight"
        type="number"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result'] || isPortOpen"
        :disable="!rowProps.row.lab_id || !rowProps.row.crucible_id"
        borderless
        @update:model-value="(value) => onChangeValue('crucible_weight', value)"
      />
    </q-td>
    <q-td
      key="sample_weight"
      :props="rowProps"
    >
      <q-input
        :model-value="rowProps.row.sample_weight"
        type="number"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result'] || isPortOpen"
        :disable="!rowProps.row.lab_id || !rowProps.row.crucible_id"
        borderless
        @update:model-value="(value) => onChangeValue('sample_weight', value)"
      />
    </q-td>
    <q-td
      key="final_weight"
      :props="rowProps"
    >
      <q-input
        :model-value="rowProps.row.final_weight"
        type="number"
        :readonly="
          !!rowProps.row['result'] ||
          !worksheetStore.worksheetIsLocked ||
          !!worksheetStore.selectedMethod?.const_weight_rule ||
          isPortOpen
        "
        :disable="!rowProps.row.lab_id || !rowProps.row.crucible_id"
        input-class="text-h4 text-left"
        borderless
        :tabindex="!!worksheetStore.selectedMethod?.const_weight_rule ? -1 : 0"
        @update:model-value="(value) => onChangeFinalWeight(value)"
      />
    </q-td>
    <q-td
      key="result"
      :props="rowProps"
      :class="{
        'passed-repeatabilite': rowProps.row.passed_repeatability === 'passed',
        'not-passed-repeatabilite': rowProps.row.passed_repeatability === 'not-passed',
      }"
      :style="rowProps.colsMap['result'].style"
    >
      <span class="text-h4">
        {{
          rowProps.row.result
            ? `${padDecimals(rowProps.row.result, rowProps.row.method.significant_digit)}%`
            : ''
        }}</span
      >
    </q-td>
    <q-td>
      <span class="text-h4">
        {{
          rowProps.row['exported_at'] ? (rowProps.row['exported_at'] as Date).toLocaleString() : ''
        }}
      </span>
    </q-td>
    <q-td
      v-for="col in noRequiredVisibleColumns"
      :key="col.name"
    >
      {{ rowProps.row[col.name] }}
    </q-td>
  </q-tr>

  <template v-if="rowProps.row.expand">
    <q-tr
      v-for="(sub_weighting, index) in rowProps.row.sub_weightings"
      :key="index"
      :props="rowProps"
      class="sub-weighting"
    >
      <q-td colspan="3">
        <div>
          <span>Масса №{{ index + 1 }}</span>
          <q-input
            :model-value="sub_weighting.weight"
            type="number"
            :tabindex="0"
            :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result'] || isPortOpen"
            :disable="!rowProps.row.lab_id || !rowProps.row.crucible_id"
            input-class="text-h4 text-left"
            borderless
            @blur="onBlurSubWeight(index)"
            @update:model-value="(value) => onChangeSubWeight(index, value)"
          />
        </div>
      </q-td>
      <q-td colspan="5">
        <span class="text-h4">{{ sub_weighting.weighted_at?.toLocaleString() }}</span>
      </q-td>
    </q-tr>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch, inject, type Ref, nextTick } from 'vue'
import { Notify, type QTableSlots } from 'quasar'
import { useSettingsStore } from '@/stores/settings'
import { useWorksheetStore } from '@/stores/worksheet'

const rowProps = defineModel<Parameters<QTableSlots['body']>[0]>('row-props', { required: true })

const props = defineProps<{ uuid: string }>()

const isPortOpen = inject<Ref<boolean>>('is-port-open')
const isExporting = ref(false)

const settingsStore = useSettingsStore()
const worksheetStore = useWorksheetStore(props.uuid)

const noRequiredVisibleColumns = computed(() =>
  settingsStore.settings.worksheet_columns.filter((col) => !col.required && col.visible),
)

const onChangeValue = (field: string, value: string | number | null) => {
  rowProps.value.row[field] = value
  worksheetStore.saveWorksheet()
}

const onChangeFinalWeight = (value: string | number | null) => {
  rowProps.value.row['final_weight'] = value
  if (Number(value) === 0) return
  if (value && !rowProps.value.row.result) {
    rowProps.value.row.calcResult()
    exportParallel()
    worksheetStore.saveWorksheet()
  }
}

const onChangeSubWeight = (index: number, value: string | number | null) => {
  rowProps.value.row.sub_weightings[index].weight = value
  if (isPortOpen?.value) {
    rowProps.value.row.sub_weightings[index].weighted_at = new Date()
    if (
      worksheetStore.worksheetIsLocked &&
      rowProps.value?.row.sub_weightings.length - 1 === index &&
      !!value &&
      Number(value) !== 0
    )
      checkConstantWeightMass()
  }
}

const onBlurSubWeight = (index: number) => {
  if (worksheetStore.worksheetIsLocked && rowProps.value?.row.sub_weightings.length - 1 === index)
    checkConstantWeightMass()
}

const checkConstantWeightMass = async () => {
  const finalWeight = rowProps.value.row.determineFinalWeightByConstWeightRule()
  if (isFinite(finalWeight)) {
    rowProps.value.row.calcResult()
    exportParallel()
  } else {
    rowProps.value.row.addSubWeighting()
    await nextTick()
  }
  worksheetStore.saveWorksheet()
}

const exportParallel = async () => {
  if (!settingsStore.settings.export.url && !settingsStore.settings.export.folder_path) {
    Notify.create({
      message: 'Для экспорта необходимо в настройках указать путь или URL',
      position: 'top-right',
    })
    return
  }
  isExporting.value = true
  try {
    if (!!settingsStore.settings.export.url) await worksheetStore.exportByURL(rowProps.value.row)
    if (!!settingsStore.settings.export.folder_path)
      await worksheetStore.exportByFile(rowProps.value.row)
    rowProps.value.row.exported_at = new Date()
  } catch (e) {
    console.error(e)
  }
  isExporting.value = false
}

const unwatchResult = watch(
  () => rowProps.value.row.result,
  (val, prevVal) => {
    if (val && !prevVal) {
      worksheetStore.addParallel()
      unwatchResult()
    }
  },
)

const padDecimals = (number: string, precision: number) => {
  const str = String(number)
  // eslint-disable-next-line prefer-const
  let [int, dec = ''] = str.split('.')
  dec = dec.padEnd(precision, '0')
  return int + '.' + dec
}

onMounted(() => {
  rowProps.value.row.expand = true
})
</script>

<style scoped lang="scss">
// .parallel:not(:first-of-type) td {
// border-top-width: 2px;
// border-top-color: #000 !important;
// }
.parallel td:not(.parallel__actions):focus-within,
.sub-weighting td:focus-within {
  background-color: $light-blue-3;
}

.passed-repeatabilite {
  background-color: $light-green-11;
}
.not-passed-repeatabilite {
  background-color: $red-11;
}
</style>
<style lang="scss">
.parallel,
.sub-weighting {
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
}
</style>
