import { ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'

export const useSettingsStore = defineStore('settings', () => {
  const loading = ref(false)

  const settings = reactive<ISetting>({
    export: { url: '', worksheet_folder_path: '', folder_path: '' },
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
        label: 'Вес пустого тигля',
        field: 'crucible_weight',
        name: 'crucible_weight',
        required: true,
        visible: true,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Вес навески',
        field: 'sample_weight',
        name: 'sample_weight',
        required: true,
        visible: true,
        style: 'max-width: 150px;min-width: 175px',
      },
      {
        label: 'Конечный вес',
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
      await window.settings.setSettings(toRaw(settings))
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
      const res = (await window.settings.getSettings()) as ISetting
      Object.assign(settings, {
        export: res.export,
        serial_port: res.serial_port,
        worksheet_columns: res.worksheet_columns.map((col) => {
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
