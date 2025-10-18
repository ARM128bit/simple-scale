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
        :disable="!worksheetStore.worksheetIsLocked || !rowProps.row.result"
        :loading="isExporting"
        size="sm"
        round
        icon="upload"
        @click="exportByFile"
      />
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
        v-model.trim="rowProps.row.crucible_weight"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
        mask="#.####"
        fill-mask="0"
        reverse-fill-mask
        borderless
        @blur="worksheetStore.saveWorksheet"
      />
    </q-td>
    <q-td
      key="sample_weight"
      :props="rowProps"
    >
      <q-input
        v-model.trim="rowProps.row.sample_weight"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
        mask="#.####"
        fill-mask="0"
        reverse-fill-mask
        borderless
        @blur="worksheetStore.saveWorksheet"
      />
    </q-td>
    <q-td
      key="final_weight"
      :props="rowProps"
    >
      <q-input
        v-model.trim="rowProps.row.final_weight"
        :readonly="
          // !!rowProps.row['result'] ||
          !worksheetStore.worksheetIsLocked || !!worksheetStore.selectedMethod?.const_weight_rule
        "
        input-class="text-h4 text-left"
        mask="#.####"
        fill-mask="0"
        reverse-fill-mask
        borderless
        @blur="calcResult"
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
      <span class="text-h4"> {{ rowProps.row.result }}{{ rowProps.row.result ? '%' : '' }}</span>
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
            v-model.trim="sub_weighting.weight"
            :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
            input-class="text-h4 text-left"
            mask="#.####"
            fill-mask="0"
            reverse-fill-mask
            borderless
            @blur="
              (event) =>
                worksheetStore.worksheetIsLocked &&
                rowProps.row.sub_weightings.length - 1 === index &&
                !!(event.target as HTMLInputElement)?.value &&
                Number((event.target as HTMLInputElement).value) !== 0 &&
                checkConstantWeightMass()
            "
          />
        </div>
      </q-td>
      <q-td colspan="4">
        <span class="text-h4">{{ sub_weighting.weighted_at?.toLocaleString() }}</span>
      </q-td>
    </q-tr>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import type { QTableSlots } from 'quasar'
import { useSettingsStore } from '@/stores/settings'
import { useWorksheetStore } from '@/stores/worksheet'

const rowProps = defineModel<Parameters<QTableSlots['body']>[0]>('row-props', { required: true })

const isExporting = ref(false)

const settingsStore = useSettingsStore()
const worksheetStore = useWorksheetStore()

const noRequiredVisibleColumns = computed(() =>
  settingsStore.settings.worksheet_columns.filter((col) => !col.required && col.visible),
)

const calcResult = () => {
  rowProps.value.row.calcResult()
}

const checkConstantWeightMass = () => {
  const finalWeight = rowProps.value.row.determineFinalWeightByConstWeightRule()
  if (isFinite(finalWeight)) {
    calcResult()
  } else {
    rowProps.value.row.addSubWeighting()
  }
  worksheetStore.saveWorksheet()
}

const exportByFile = async () => {
  isExporting.value = true
  try {
    await worksheetStore.exportByFile(rowProps.value.row)
    rowProps.value.row.exported_at = new Date()
  } catch (e) {
    console.error(e)
  }
  isExporting.value = false
}

const unwatchFinalWeight = watch(
  () => rowProps.value.row.final_weight,
  (val) => {
    if (Number(val) === 0) return
    if (val && !rowProps.value.row.result) {
      calcResult()
      exportByFile()
      worksheetStore.saveWorksheet()
      unwatchFinalWeight()
    }
  },
)

const unwatchResult = watch(
  () => rowProps.value.row.result,
  (val, prevVal) => {
    if (val && !prevVal) {
      worksheetStore.addParallel()
      unwatchResult()
    }
  },
)

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
