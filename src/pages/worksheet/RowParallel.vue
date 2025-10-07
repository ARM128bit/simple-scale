<template>
  <q-tr class="parallel">
    <q-td
      key="expand"
      :props="rowProps"
    >
      <q-btn
        v-if="rowProps.row.method.const_weight_rule"
        size="sm"
        color="accent"
        round
        dense
        :icon="rowProps.row.expand ? 'remove' : 'add'"
        @click="rowProps.row.expand = !rowProps.row.expand"
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
      />
    </q-td>
    <q-td
      key="crucible_weight"
      :props="rowProps"
    >
      <q-input
        v-model="rowProps.row.crucible_weight"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
        mask="#.####"
        fill-mask="0"
        reverse-fill-mask
        borderless
      />
    </q-td>
    <q-td
      key="sample_weight"
      :props="rowProps"
    >
      <q-input
        v-model="rowProps.row.sample_weight"
        input-class="text-h4 text-left"
        :readonly="!worksheetStore.worksheetIsLocked || !!rowProps.row['result']"
        mask="#.####"
        fill-mask="0"
        reverse-fill-mask
        borderless
      />
    </q-td>
    <q-td
      key="final_weight"
      :props="rowProps"
    >
      <q-input
        v-model="rowProps.row.final_weight"
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
      <q-td colspan="100%">
        <div>
          <span>Вес №{{ index + 1 }}</span>
          <q-input
            v-model.number="sub_weighting.weight"
            :readonly="!!rowProps.row['result'] && !worksheetStore.worksheetIsLocked"
            input-class="text-h4 text-left"
            type="number"
            borderless
            @blur="
              (event) =>
                rowProps.row.sub_weightings.length - 1 === index &&
                !!(event.target as HTMLInputElement)?.value &&
                checkConstantWeightMass()
            "
          />
        </div>
      </q-td>
    </q-tr>
  </template>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue'
import type { QTableSlots } from 'quasar'
import { useSettingsStore } from '@/stores/settings'
import { useWorksheetStore } from '@/stores/worksheet'

const rowProps = defineModel<Parameters<QTableSlots['body']>[0]>('row-props', { required: true })

const settingsStore = useSettingsStore()
const worksheetStore = useWorksheetStore()

const noRequiredVisibleColumns = computed(() =>
  settingsStore.settings.worksheet_columns.filter((col) => !col.required && col.visible),
)

const calcResult = () => {
  rowProps.value.row.calcResult()
  // unwatchFinalWeight()
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

// watch(
//   () => rowProps.value.row.sub_weightings,
//   (val) => {
//     if (val) {
//       checkConstantWeightMass()
//     }
//   },
//   { deep: true },
// )

watch(
  () => rowProps.value.row.final_weight,
  (val) => {
    if (val && !rowProps.value.row.result) {
      calcResult()
      worksheetStore.saveWorksheet()
    }
  },
)

watch(
  () => rowProps.value.row.result,
  (val, prevVal) => {
    if (val && !prevVal) {
      worksheetStore.addParallel()
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
.parallel td:focus-within {
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
