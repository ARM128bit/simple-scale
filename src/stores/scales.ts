import { computed, ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'

export const useScalesStore = defineStore('scales', () => {
  const loading = ref(false)
  const scales = reactive(new Map() as Map<IScale['code'], IScale>)

  async function saveScales() {
    // Should not be a proxy object
    await window.settings.setScales([...toRaw(scales).values()])
    loadScales()
  }

  async function loadScales() {
    loading.value = true
    try {
      const res = (await window.settings.getScales()) as IScale[]
      scales.clear()
      for (const scale of res) {
        scales.set(scale.code, { ...scale, enabled: Boolean(scale.enabled) })
      }
    } catch (e: unknown) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  async function addScale(scale: IScale) {
    await window.settings.setScales([...toRaw(scales).values(), toRaw(scale)])
    loadScales()
  }

  async function deleteScale(key: IScale['code']) {
    scales.delete(key)
  }

  return {
    scales: computed(() => scales),
    loading,
    loadScales,
    saveScales,
    addScale,
    deleteScale,
  }
})
