<template>
  <q-table
    :rows="[...templatesStore.templates.values()]"
    :columns="column"
    :hide-pagination="true"
  >
    <template v-slot:body-cell="props">
      <q-td
        v-if="!editingTemplates.has(props.row)"
        :props="props"
      >
        {{ props.row[props.col.name] }}
      </q-td>
      <q-td
        v-else
        :props="props"
      >
        <q-input
          v-model="props.row[props.col.name]"
          input-class="text-left"
          type="text"
          dense
        />
      </q-td>
    </template>
    <template v-slot:body-cell-file="props">
      <q-td
        v-if="!editingTemplates.has(props.row)"
        :props="props"
      >
        {{ props.row[props.col.name].name }}
      </q-td>
      <q-td
        v-else
        :props="props"
      >
        <q-input
          :model-value="props.row[props.col.name].name"
          dense
          readonly
          @click="() => openTemplate(props.row)"
        >
          <template v-slot:prepend>
            <q-icon name="attach_file" />
          </template>
          <template v-slot:append>
            <q-icon
              name="clear"
              style="cursor: pointer"
              @click="() => clearTemplatePath(props.row)"
            />
          </template>
        </q-input>
      </q-td>
    </template>
    <template v-slot:body-cell-methods="props">
      <q-td
        v-if="!editingTemplates.has(props.row)"
        :props="props"
      >
        {{
          [...methodsStore.methods.values()]
            .filter((item) => props.row[props.col.name].includes(item.code))
            .map((item) => item.name)
            .join('; ')
        }}
      </q-td>
      <q-td
        v-else
        :props="props"
      >
        <q-select
          v-model="props.row[props.col.name]"
          :options="[...methodsStore.methods.values()]"
          label="Методы"
          option-value="code"
          option-label="name"
          emit-value
          map-options
          multiple
          dense
        />
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          v-if="!editingTemplates.has(props.row)"
          icon="edit"
          flat
          round
          @click="() => editingTemplates.add(props.row)"
        />
        <q-btn
          v-if="editingTemplates.has(props.row)"
          icon="check"
          flat
          round
          @click="
            () => {
              updateTemplate(props.row)
            }
          "
        />
        <q-btn
          v-if="editingTemplates.has(props.row)"
          icon="close"
          flat
          round
          @click="() => editingTemplates.delete(props.row)"
        />
        <q-btn
          icon="delete_outline"
          flat
          round
          @click="() => deleteTemplate(props.row)"
        />
      </q-td>
    </template>
    <template v-slot:bottom-row>
      <q-tr v-if="showAddTemplateForm">
        <q-td>
          <q-input
            v-model="templateForm.title"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td>
          <q-input
            :model-value="templateForm.file.name"
            dense
            readonly
            @click="() => openTemplate()"
          >
            <template v-slot:prepend>
              <q-icon name="attach_file" />
            </template>
            <template v-slot:append>
              <q-icon
                name="clear"
                style="cursor: pointer"
                @click="() => clearTemplatePath()"
              />
            </template>
          </q-input>
        </q-td>
        <q-td>
          <q-select
            v-model="templateForm.methods"
            :options="[...methodsStore.methods.values()]"
            label="Методы"
            option-value="code"
            option-label="name"
            emit-value
            map-options
            multiple
            dense
          />
        </q-td>
        <q-td class="text-right">
          <q-btn
            icon="check"
            flat
            round
            @click="addTemplate"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div class="row no-wrap items-center q-mt-md q-pa-sm">
    <q-space />
    <q-btn @click="toggleAddTemplateForm">{{ showAddTemplateForm ? 'Cancel' : 'Add' }}</q-btn>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import type { QTableColumn } from 'quasar'
import { useTemplatesStore } from '@/stores/templates'
import { templatesAPI } from '@/app/api'
import { useMethodsStore } from '@/stores/methods'

const methodsStore = useMethodsStore()
const templatesStore = useTemplatesStore()

const defaultTemplate = (): ITemplate => {
  return {
    title: '',
    file: { name: '', path: '' },
    methods: [],
  }
}
const showAddTemplateForm = ref(false)
const templateForm = reactive(defaultTemplate())

const addTemplate = async () => {
  await templatesStore.createTemplate(templateForm)
  toggleAddTemplateForm()
}

const updateTemplate = async (template: ITemplate) => {
  await templatesStore.updateTemplate(template)
  editingTemplates.delete(template)
}

const deleteTemplate = async (template: ITemplate) => {
  await templatesStore.deleteTemplate(template)
  editingTemplates.delete(template)
}

const openTemplate = async (template: ITemplate = templateForm) => {
  if (template.file.name) return
  const { name, path } = await templatesAPI.openTemplate()
  template.file.name = name
  template.file.path = path
}

const clearTemplatePath = async (template: ITemplate = templateForm) => {
  template.file.name = ''
  template.file.path = ''
}

const toggleAddTemplateForm = () => {
  if (showAddTemplateForm.value) {
    Object.assign(templateForm, defaultTemplate())
  }
  showAddTemplateForm.value = !showAddTemplateForm.value
}

const editingTemplates = reactive(new Set())

const column: QTableColumn<ITemplate & { actions: string }>[] = [
  { name: 'title', label: 'Наименование', field: 'title', align: 'left' },
  {
    name: 'file',
    label: 'Файл',
    field: 'file',
    align: 'left',
    style: 'max-width: 200px;min-width: 200px;',
    headerStyle: 'max-width: 200px;min-width: 200px;',
  },
  {
    name: 'methods',
    label: 'Методы',
    field: 'methods',
    align: 'left',
    style: 'max-width: 200px;min-width: 200px;',
    headerStyle: 'max-width: 200px;min-width: 200px;',
  },
  {
    name: 'actions',
    label: 'Действия',
    field: 'actions',
    align: 'right',
    style: 'max-width: 200px;min-width: 200px;',
    headerStyle: 'max-width: 200px;min-width: 200px;',
  },
]

onMounted(() => {
  templatesStore.loadTemplates()
})
</script>

<style scoped></style>
