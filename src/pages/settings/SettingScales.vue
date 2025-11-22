<template>
  <q-table
    :rows="[...scalesStore.scales.values()]"
    :columns="column"
    :hide-pagination="true"
  >
    <template v-slot:body-cell="props">
      <q-td
        v-if="!editingScales.has(props.row)"
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
    <template v-slot:body-cell-enabled="props">
      <q-td :props="props">
        <q-checkbox
          v-model.number="props.row[props.col.name]"
          :disable="!editingScales.has(props.row)"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          v-if="!editingScales.has(props.row)"
          icon="edit"
          flat
          round
          @click="() => editingScales.add(props.row)"
        />
        <q-btn
          v-if="editingScales.has(props.row)"
          icon="check"
          flat
          round
          @click="
            () => {
              scalesStore.saveScales()
              editingScales.delete(props.row)
            }
          "
        />
        <q-btn
          v-if="editingScales.has(props.row)"
          icon="close"
          flat
          round
          @click="() => editingScales.delete(props.row)"
        />
        <q-btn
          icon="delete_outline"
          flat
          round
          @click="() => deleteScale(props.row)"
        />
      </q-td>
    </template>
    <template v-slot:bottom-row>
      <q-tr v-if="showAddScaleForm">
        <q-td>
          <q-checkbox v-model.number="addScaleForm.enabled" />
        </q-td>
        <q-td>
          <q-input
            v-model="addScaleForm.code"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td>
          <q-input
            v-model="addScaleForm.name"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td>
          <q-input
            v-model="addScaleForm.regex"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td>
          <q-input
            v-model="addScaleForm.serial_no"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td class="text-right">
          <q-btn
            icon="check"
            flat
            round
            @click="addScale"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <div class="row no-wrap items-center q-mt-md q-pa-sm">
    <q-space />
    <q-btn @click="toggleAddScaleForm">{{ showAddScaleForm ? 'Cancel' : 'Add' }}</q-btn>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import type { QTableColumn } from 'quasar'
import { useScalesStore } from '@/stores/scales'

const scalesStore = useScalesStore()

const defaultScale = (): IScale => {
  return {
    code: '',
    name: '',
    regex: null,
    enabled: true,
  }
}
const showAddScaleForm = ref(false)
const addScaleForm = reactive(defaultScale())

const addScale = async () => {
  await scalesStore.addScale(addScaleForm)
  toggleAddScaleForm()
}

const toggleAddScaleForm = () => {
  if (showAddScaleForm.value) {
    Object.assign(addScaleForm, defaultScale())
  }
  showAddScaleForm.value = !showAddScaleForm.value
}

const editingScales = reactive(new Set())

const column: QTableColumn<IScale & { actions: string }>[] = [
  { name: 'enabled', label: 'Активен?', field: 'enabled', align: 'left' },
  { name: 'code', label: 'Код', field: 'code', align: 'left' },
  { name: 'name', label: 'Наименование', field: 'name', align: 'left' },
  { name: 'regex', label: 'Регулярное выражение', field: 'regex', align: 'left' },
  { name: 'serial_no', label: 'Серийный номер', field: 'serial_no', align: 'left' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' },
]

const deleteScale = (scale: IScale) => {
  scalesStore.deleteScale(scale.code)
}
</script>

<style scoped></style>
