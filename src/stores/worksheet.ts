import { computed, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { QTableColumn } from 'quasar'
import { useSettingsStore } from './settings'
import { CSV_DELIMITER } from '@/shared/constants'
import ResidueParallel from '@/entities/residue-parallel.class'
import LossParallel from '@/entities/loss-parallel.class'

function* weightGenerator(end: number) {
  for (let i = 1; i <= end; i++) {
    yield `weight ${i}`
  }
}

export const absoluteComparsion = (
  first_value: number,
  second_value: number,
  difference: number,
) => {
  return Math.abs(first_value - second_value) <= difference
}

export const relativeComparsion = (
  first_value: number,
  second_value: number,
  difference: number,
) => {
  return ((first_value + second_value) / 2) * difference >= Math.abs(first_value - second_value)
}

export const useWorksheetStore = defineStore('worksheet', () => {
  const settingsStore = useSettingsStore()

  const selectedUser = ref<IUser>()
  const selectedScale = ref<IScale>()
  const selectedMethod = ref<IMethod>()

  const rawSheetData = ref<IParallel[]>([])

  const worksheetIsLocked = ref(false)

  const sheetColumns = computed(
    () =>
      settingsStore.settings.worksheet_columns
        .filter((col) => col.required || col.visible)
        .map((col) => ({
          ...col,
          align: 'left',
        })) as QTableColumn<IWorksheetColumn>[],
  )

  const addParallel = () => {
    if (
      !worksheetIsLocked.value ||
      !selectedMethod.value ||
      !selectedUser.value ||
      !selectedScale.value
    )
      return
    const parallel =
      selectedMethod.value.calc_type === 'RESIDUE'
        ? new ResidueParallel(selectedMethod.value, selectedUser.value)
        : new LossParallel(selectedMethod.value, selectedUser.value)
    rawSheetData.value.push(parallel)
  }

  const clearWorksheet = () => {
    rawSheetData.value = []
  }

  const toggleWorksheetLocking = (value?: boolean) => {
    worksheetIsLocked.value = typeof value === 'undefined' ? !worksheetIsLocked.value : value
  }

  const saveWorksheet = () => {
    if (
      rawSheetData.value.length > 0 &&
      selectedUser.value &&
      selectedMethod.value &&
      worksheetIsLocked.value
    ) {
      const keys = Object.keys(rawSheetData.value[0])
      let csv = ''

      const maxCountSubWeightings = rawSheetData.value.reduce((acc, curr) => {
        return Math.max(curr.sub_weightings?.length ?? 0, acc)
      }, 0)

      // Extract headers
      csv +=
        [
          ...[
            keys
              .map((key) => {
                if (!['_sub_weightings', 'expand', '_passed_repeatability'].includes(key)) {
                  return key
                }
              })
              .filter((key) => key)
              .join(CSV_DELIMITER),
          ],
          [...weightGenerator(maxCountSubWeightings)].join(CSV_DELIMITER),
        ].join(CSV_DELIMITER) + '\n'

      // Extract values
      for (const obj of toRaw(rawSheetData.value)) {
        const values = keys
          .filter((key) => !['_sub_weightings', 'expand', '_passed_repeatability'].includes(key))
          .map((key) => {
            if (key === '_method') {
              return obj['method'].code
            }
            if (key === '_laborant') {
              return obj['laborant']
            }
            return obj[key as keyof IParallel]
          })
        const subWeightings = obj.sub_weightings?.map((item) => item.weight) ?? []
        csv += values.join(CSV_DELIMITER) + ';' + subWeightings.join(CSV_DELIMITER) + '\n'
      }
      const username = `${selectedUser.value.last_name}_${selectedUser.value.first_name}`
      window.worksheet.saveWorksheet({
        username: username,
        method: selectedMethod.value.code,
        data: csv,
      })
    }
  }

  const openWorksheet = async () => {
    const res = await window.worksheet.openWorksheet()
    const data = res.split('\n')
    const keys = data.splice(0, 1)[0].split(CSV_DELIMITER)
    for (const row of data) {
      if (!row) continue
      console.log(row.split(CSV_DELIMITER))
    }
    console.log(keys)
  }

  return {
    worksheetIsLocked: computed(() => worksheetIsLocked.value),
    sheetColumns,
    sheetData: rawSheetData,
    selectedUser,
    selectedScale,
    selectedMethod,
    addParallel,
    clearWorksheet,
    toggleWorksheetLocking,
    openWorksheet,
    saveWorksheet,
  }
})
