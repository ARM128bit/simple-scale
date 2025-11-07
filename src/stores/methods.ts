import { computed, ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { methodsAPI } from '@/app/api'

export const useMethodsStore = defineStore('methods', () => {
  const loading = ref(false)
  const methods = reactive(new Map() as Map<IMethod['code'], IMethod>)

  async function addMethod(method: IMethodForm) {
    await methodsAPI.save([...toRaw(methods).values(), toRaw(method)])
    loadMethods()
  }
  async function saveMethods() {
    await methodsAPI.save([...toRaw(methods).values()])
    loadMethods()
  }

  async function loadMethods() {
    loading.value = true
    try {
      const res = await methodsAPI.load()
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
