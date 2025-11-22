import { computed, ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { templatesAPI } from '@/app/api'

export const useTemplatesStore = defineStore('templates', () => {
  const loading = ref(false)
  const templates = reactive(new Map() as Map<ITemplate['id'], ITemplate>)

  async function createTemplate(template: ITemplate) {
    await templatesAPI.create(toRaw(template))
    loadTemplates()
  }

  async function updateTemplate(template: ITemplate) {
    await templatesAPI.updateTemplate(toRaw(template))
    await loadTemplates()
  }

  async function deleteTemplate(template: ITemplate) {
    await templatesAPI.deleteTemplate(toRaw(template))
    await loadTemplates()
  }

  async function loadTemplates() {
    loading.value = true
    try {
      const res = await templatesAPI.load()
      templates.clear()
      for (const template of res) {
        templates.set(template.id, {
          ...template,
          methods: template.methods.filter((method) => !!method),
        })
      }
    } catch (e: unknown) {
      console.log(e)
    } finally {
      loading.value = false
    }
  }

  return {
    templates: computed(() => templates),
    loading,
    loadTemplates,
    createTemplate,
    updateTemplate,
    deleteTemplate,
  }
})
