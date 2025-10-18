import { computed, ref, toRaw } from 'vue'
import { defineStore } from 'pinia'
import type { QTableColumn } from 'quasar'
import { useSettingsStore } from './settings'
import { CSV_DELIMITER, SUB_WEIGHT_DELIMITER } from '@/shared/constants'
import ResidueParallel from '@/entities/residue-parallel.class'
import LossParallel from '@/entities/loss-parallel.class'
import { useMethodsStore } from './methods'
import { useUsersStore } from './users'
import type Parallel from '@/entities/parallel.abstract'
import { worksheetAPI, exportAPI } from '@/app/api'

function* weightColumnGenerator(end: number) {
  for (let i = 1; i <= end; i++) {
    yield `_sub_weight ${i}`
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

function getValueByPath<T extends object>(obj: T, path: string): unknown {
  /* eslint-disable  @typescript-eslint/no-explicit-any */
  return path.split('.').reduce((acc: any, key) => acc?.[key], obj)
}

export const useWorksheetStore = defineStore('worksheet', () => {
  const usersStore = useUsersStore()
  const methodsStore = useMethodsStore()
  const settingsStore = useSettingsStore()

  const selectedUser = ref<IUser>()
  const selectedScale = ref<IScale>()
  const selectedMethod = ref<IMethod>()

  const worksheetFilePath = ref<string>()
  const worksheetFileName = computed({
    set(val: string | undefined) {
      worksheetFilePath.value = val
    },
    get() {
      const paths = worksheetFilePath.value?.split('/')
      if (!paths) return
      return paths[paths?.length - 1]
    },
  })
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
        ? new ResidueParallel({ method: selectedMethod.value, laborant: selectedUser.value })
        : new LossParallel({ method: selectedMethod.value, laborant: selectedUser.value })
    rawSheetData.value.push(parallel)
  }

  const exportByFile = async (parallel: IParallel) => {
    if (!selectedMethod.value?.code || !selectedUser.value || !worksheetIsLocked.value) return
    try {
      const data = settingsStore.settings.export.data_template?.replace(
        /{([a-z][\w-]*(?:\.[\w-]+)*)}/g,
        (_, key: string) => {
          return getValueByPath(parallel, key) as string
        },
      )
      if (data) {
        await exportAPI.exportByFile(selectedUser.value.fullName, selectedMethod.value.code, data)
        parallel.exported_at = new Date()
      }
    } catch (e: unknown) {
      console.log(e)
    }
  }

  const clearWorksheet = () => {
    rawSheetData.value = []
    worksheetFilePath.value = undefined
  }

  const toggleWorksheetLocking = (value?: boolean) => {
    worksheetIsLocked.value = typeof value === 'undefined' ? !worksheetIsLocked.value : value
  }

  const saveWorksheet = async () => {
    if (rawSheetData.value.length > 0 && selectedUser.value && selectedMethod.value) {
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
          [...weightColumnGenerator(maxCountSubWeightings)].join(CSV_DELIMITER),
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
            if (key === '_exported_at') {
              return obj['exported_at']?.toISOString()
            }
            return obj[key as keyof IParallel]
          })
        const subWeightings = obj.sub_weightings?.map(
          (item) => `${item.weight}${SUB_WEIGHT_DELIMITER}${item.weighted_at}`,
        )
        csv +=
          values.join(CSV_DELIMITER) +
          (subWeightings ? `;${subWeightings.join(CSV_DELIMITER)}` : '') +
          '\n'
      }

      const filePath = await worksheetAPI.save(
        selectedUser.value.fullName,
        selectedMethod.value.code,
        csv,
      )
      worksheetFileName.value = filePath
    }
  }

  const openWorksheet = async () => {
    const res = await worksheetAPI.open()
    if (!res.data) return
    const data = res.data.split('\n')
    const keys = data
      .splice(0, 1)[0]
      .split(CSV_DELIMITER)
      .map((key) => key.slice(1)) as unknown as Array<
      keyof Omit<ConstructorParameters<typeof Parallel>[0], 'sub_weightings'>
    >
    clearWorksheet()
    worksheetFileName.value = res.path
    for (const line of data) {
      if (!line) continue
      const _parallel: {
        [K in keyof Omit<
          ConstructorParameters<typeof Parallel>[0],
          'sub_weightings'
        >]?: ConstructorParameters<typeof Parallel>[0][K]
      } = {
        method: undefined,
        laborant: undefined,
        lab_id: undefined,
        crucible_id: undefined,
        crucible_weight: undefined,
        sample_weight: undefined,
        final_weight: undefined,
        result: undefined,
        exported_at: undefined,
      }
      const cells = line.split(CSV_DELIMITER)
      const subWeightings: ISubWeighting[] = []
      for (const idx in keys) {
        if (keys[idx] === 'laborant') {
          const [last_name, first_name] = cells[idx].split(' ')
          const laborant = usersStore.allUsers.find(
            (user) => user.first_name === first_name && user.last_name === last_name,
          )
          if (laborant) {
            if (!selectedUser.value) {
              selectedUser.value = laborant
            }
            _parallel[keys[idx]] = laborant
          }
          continue
        }
        if (keys[idx] === 'method') {
          const method = methodsStore.methods.get(cells[idx])
          if (method) {
            if (!selectedMethod.value) {
              selectedMethod.value = method
            }
            _parallel[keys[idx]] = method
          }
          continue
        }
        if (keys[idx] === 'exported_at') {
          _parallel[keys[idx]] = new Date(cells[idx])
          continue
        }
        if (keys[idx] === 'result') {
          _parallel[keys[idx]] = cells[idx] ? Number(cells[idx]) : undefined
          continue
        }
        if (keys[idx].includes('sub_weight')) {
          const [weight, weighted_at] = cells[idx].split(SUB_WEIGHT_DELIMITER)

          subWeightings.push({ weight, weighted_at: weighted_at ? new Date(weighted_at) : null })
          continue
        }
        _parallel[keys[idx]] = cells[idx]
      }

      if (_parallel.laborant && _parallel.method && _parallel.method.calc_type === 'RESIDUE') {
        rawSheetData.value.push(
          new ResidueParallel({
            ..._parallel,
            sub_weightings: subWeightings,
            laborant: _parallel.laborant,
            method: _parallel.method!,
          }),
        )
      }
      if (_parallel.laborant && _parallel.method && _parallel.method.calc_type === 'LOSS') {
        rawSheetData.value.push(
          new LossParallel({
            ..._parallel,
            sub_weightings: subWeightings,
            laborant: _parallel.laborant,
            method: _parallel.method!,
          }),
        )
      }
    }
  }

  return {
    worksheetIsLocked: computed(() => worksheetIsLocked.value),
    sheetColumns,
    sheetData: rawSheetData,
    worksheetFileName,
    selectedUser,
    selectedScale,
    selectedMethod,
    addParallel,
    clearWorksheet,
    toggleWorksheetLocking,
    openWorksheet,
    saveWorksheet,
    exportByFile,
  }
})
