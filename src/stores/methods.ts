import { computed, ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'

export const useMethodsStore = defineStore('methods', () => {
  const loading = ref(false)
  const methods = reactive(new Map() as Map<IMethod['code'], IMethod>)

  async function saveMethods() {
    // Should not be a proxy object
    await window.settings.setMethods([...toRaw(methods).values()])
    loadMethods()
  }

  async function loadMethods() {
    loading.value = true
    try {
      const res = (await window.settings.getMethods()) as IMethod[]
      methods.clear()
      for (const method of res) {
        methods.set(method.code, { ...method, enabled: Boolean(method.enabled) })
      }
    } catch (e: unknown) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  async function addMethod(method: IMethodForm) {
    await window.settings.setMethods([...toRaw(methods).values(), toRaw(method)])
    loadMethods()
  }

  async function deleteMethod(key: IMethod['code']) {
    methods.delete(key)
  }

  return {
    methods: computed(() => methods),
    loading,
    loadMethods,
    saveMethods,
    addMethod,
    deleteMethod,
  }
})
