import { ref, reactive } from 'vue'
import { defineStore } from 'pinia'
import { settingsAPI } from '@/app/api'

export const useSettingsStore = defineStore('settings', () => {
  const loading = ref(false)

  const settings = reactive<ISetting>({
    export: {
      url: '',
      worksheet_folder_path: '',
      folder_path: '',
      extension: '',
      data_template: '{lab_id}={result}',
    },
    worksheet_columns: [
      { label: 'Actions', field: 'expand', name: 'expand', required: true, visible: true },
      { label: 'Lab No', field: 'lab_id', name: 'lab_id', required: true, visible: true },
      {
        label: 'Идентификатор тигля',
        field: 'crucible_id',
        name: 'crucible_id',
        required: true,
        visible: true,
        style: 'max-width: 100px;min-width: 100px',
      },
      {
        label: 'Масса пустого тигля',
        field: 'crucible_weight',
        name: 'crucible_weight',
        required: true,
        visible: true,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Масса навески',
        field: 'sample_weight',
        name: 'sample_weight',
        required: true,
        visible: true,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Конечная масса',
        field: 'final_weight',
        name: 'final_weight',
        required: true,
        visible: true,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Результат',
        field: 'result',
        name: 'result',
        required: true,
        visible: true,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Лаборант',
        field: 'laborant',
        name: 'laborant',
        required: false,
        visible: false,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Весы',
        field: 'scale_no',
        name: 'scale_no',
        required: false,
        visible: false,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Расчитано',
        field: 'calculated_at',
        name: 'calculated_at',
        required: false,
        visible: false,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Экспортировано',
        field: 'exported_at',
        name: 'exported_at',
        required: true,
        visible: true,
        format: (val: string) => {
          return new Date(val).toLocaleDateString()
        },
        style: 'max-width: 150px;min-width: 175px',
      },
    ],
    serial_port: {
      path: '',
      baudrate: 1200,
      databits: 7,
      stopbit: 1,
      pairly: 'odd',
      termination_code: 'CRLF',
    },
  })

  async function saveSettings() {
    loading.value = true
    try {
      // Should not be a proxy object
      await settingsAPI.save({
        ...settings,
        worksheet_columns: settings.worksheet_columns.map((col) => ({
          name: col.name,
          visible: col.visible ?? false,
        })),
      })
      loadSettings()
    } catch (e: unknown) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  async function loadSettings() {
    loading.value = true
    try {
      const _settings = await settingsAPI.load()
      Object.assign(settings, {
        export: _settings.export,
        serial_port: _settings.serial_port,
        worksheet_columns: _settings.worksheet_columns.map((col) => {
          const foundCol = settings.worksheet_columns.find((_col) => _col.name === col.name)
          return {
            ...col,
            ...foundCol,
          }
        }),
      })
    } catch (e: unknown) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  return {
    settings,
    loading,
    saveSettings,
    loadSettings,
  }
})
