<template>
  <q-table
    :rows="[...methodsStore.methods.values()]"
    :columns="column"
    :hide-pagination="true"
  >
    <template v-slot:body="props">
      <q-tr>
        <q-td
          key="enabled"
          :props="props"
        >
          <q-checkbox
            v-model="props.row.enabled"
            :disable="!editingMethods.has(props.row)"
          />
        </q-td>
        <q-td
          key="code"
          :props="props"
        >
          <q-input
            v-model="props.row.code"
            :readonly="!editingMethods.has(props.row)"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td
          key="name"
          :props="props"
        >
          <q-input
            v-model="props.row.name"
            :readonly="!editingMethods.has(props.row)"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td
          key="significant_digit"
          :props="props"
        >
          <q-input
            v-model="props.row.significant_digit"
            :readonly="!editingMethods.has(props.row)"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td
          key="calc_type"
          :props="props"
        >
          <q-select
            v-model="props.row.calc_type"
            :options="CalcTypeOptions"
            :readonly="!editingMethods.has(props.row)"
            emit-value
            map-options
            dense
          />
        </q-td>
        <q-td
          key="const_weight_rule"
          :props="props"
        >
          <q-input
            v-model="props.row.const_weight_rule"
            :readonly="!editingMethods.has(props.row)"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td
          key="repeatability_rules"
          :props="props"
        >
          <div
            v-for="rule in props.row.repeatability_rules"
            :key="rule.id"
          >
            от {{ rule.start }} до {{ rule.end }} {{ rule.value }}
            {{ rule.type === 'absolute' ? 'абсолютных' : 'относительно среднего' }};
          </div>
        </q-td>
        <q-td
          key="actions"
          :props="props"
        >
          <q-btn
            v-if="!editingMethods.has(props.row)"
            icon="edit"
            flat
            round
            @click="() => editingMethods.add(props.row)"
          />
          <q-btn
            v-if="editingMethods.has(props.row)"
            icon="check"
            flat
            round
            @click="
              () => {
                methodsStore.saveMethods()
                editingMethods.delete(props.row)
              }
            "
          />
          <q-btn
            v-if="editingMethods.has(props.row)"
            icon="close"
            flat
            round
            @click="() => editingMethods.delete(props.row)"
          />
          <q-btn
            icon="delete_outline"
            flat
            round
            @click="() => deleteMethod(props.row)"
          />
        </q-td>
      </q-tr>
      <template v-if="editingMethods.has(props.row)">
        <q-tr
          v-for="(rule, index) in props.row.repeatability_rules"
          class="repeatability-rule"
          :key="index"
        >
          <q-td
            colspan="2"
            class="text-right"
          >
            Диапазон сходимости {{ index + 1 }}
          </q-td>
          <q-td colspan="2">
            <q-select
              v-model="rule.type"
              :options="RepeatabilityTypeOptions"
              label="Тип"
              emit-value
              map-options
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model.number="rule.start"
              input-class="text-left"
              label="Начальное значение"
              type="number"
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model.number="rule.end"
              input-class="text-left"
              label="Конечное значение"
              type="number"
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model.number="rule.value"
              input-class="text-left"
              label="Значение"
              type="number"
              dense
            />
          </q-td>
          <q-td class="text-right q-gutter-sm">
            <q-btn
              v-if="index === props.row.repeatability_rules.length - 1"
              size="sm"
              color="blue"
              round
              dense
              icon="add"
              @click="() => props.row.repeatability_rules.push(defaultRepeatabilityRule())"
            />
            <q-btn
              size="sm"
              round
              dense
              icon="delete_outline"
              @click="
                () =>
                  props.row.repeatability_rules.filter(
                    (item: IRepeatabilityRule) => item.id !== rule.id,
                  )
              "
            />
          </q-td>
        </q-tr>
      </template>
    </template>
    <template v-slot:bottom-row>
      <template v-if="showAddMethodForm">
        <q-tr>
          <q-td>
            <q-checkbox v-model.number="addMethodForm.enabled" />
          </q-td>
          <q-td>
            <q-input
              v-model="addMethodForm.code"
              input-class="text-left"
              type="text"
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model="addMethodForm.name"
              input-class="text-left"
              type="text"
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model="addMethodForm.significant_digit"
              input-class="text-left"
              type="text"
              dense
            />
          </q-td>
          <q-td>
            <q-select
              v-model="addMethodForm.calc_type"
              :options="CalcTypeOptions"
              emit-value
              map-options
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model="addMethodForm.const_weight_rule"
              input-class="text-left"
              type="text"
              dense
            />
          </q-td>
          <q-td> </q-td>
          <q-td class="text-right">
            <q-btn
              icon="check"
              flat
              round
              @click="addMethod"
            />
          </q-td>
        </q-tr>
        <q-tr
          v-for="(rule, index) in addMethodForm.repeatability_rules"
          class="repeatability-rule"
          :key="index"
        >
          <q-td
            colspan="2"
            class="text-right"
          >
            Диапазон сходимости {{ index + 1 }}
          </q-td>
          <q-td colspan="2">
            <q-select
              v-model="rule.type"
              :options="RepeatabilityTypeOptions"
              label="Тип"
              emit-value
              map-options
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model.number="rule.start"
              input-class="text-left"
              label="Начальное значение"
              type="number"
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model.number="rule.end"
              input-class="text-left"
              label="Конечное значение"
              type="number"
              dense
            />
          </q-td>
          <q-td>
            <q-input
              v-model.number="rule.value"
              input-class="text-left"
              label="Значение"
              type="number"
              dense
            />
          </q-td>
          <q-td class="text-right">
            <q-btn
              v-if="index === addMethodForm.repeatability_rules.length - 1"
              size="sm"
              color="blue"
              round
              dense
              icon="add"
              @click="addRuleToAddMethodForm"
            />
          </q-td>
        </q-tr>
      </template>
    </template>
  </q-table>
  <q-space />
  <div class="row no-wrap items-center q-mt-md q-pa-sm">
    <q-space />
    <q-btn @click="toggleAddMethodForm">{{ showAddMethodForm ? 'Cancel' : 'Add' }}</q-btn>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useMethodsStore } from '@/stores/methods'
import type { QTableColumn } from 'quasar'
import { CalcTypeOptions, RepeatabilityTypeOptions } from '@/shared/constants'

const methodsStore = useMethodsStore()
const defaultRepeatabilityRule = (): IRepeatabilityRuleForm => {
  return {
    start: undefined,
    end: undefined,
    type: 'absolute',
    value: undefined,
  }
}
const defaultMethod = (): IMethodForm => {
  return {
    code: '',
    name: '',
    repeatability_rules: [defaultRepeatabilityRule()],
    calc_type: 'LOSS',
    const_weight_rule: '',
    significant_digit: 2,
    enabled: true,
  }
}
const showAddMethodForm = ref(false)
const addMethodForm = reactive(defaultMethod())

const addMethod = async () => {
  await methodsStore.addMethod(addMethodForm)
  toggleAddMethodForm()
}

const addRuleToAddMethodForm = () => {
  addMethodForm.repeatability_rules.push(defaultRepeatabilityRule())
}

const toggleAddMethodForm = () => {
  if (showAddMethodForm.value) {
    Object.assign(addMethodForm, defaultMethod())
  }
  showAddMethodForm.value = !showAddMethodForm.value
}

const editingMethods = reactive(new Set())

const column: QTableColumn<IMethod & { actions: string }>[] = [
  { name: 'enabled', label: 'Активен?', field: 'enabled', align: 'left' },
  { name: 'code', label: 'Код', field: 'code', align: 'left' },
  { name: 'name', label: 'Наименование', field: 'name', align: 'left' },
  {
    name: 'significant_digit',
    label: 'Значащие разряды',
    field: 'significant_digit',
    align: 'left',
  },
  { name: 'calc_type', label: 'Calc', field: 'calc_type', align: 'left' },
  {
    name: 'const_weight_rule',
    label: 'Const weight rule',
    field: 'const_weight_rule',
    align: 'left',
  },
  { name: 'repeatability_rules', label: 'Сходимость', field: 'repeatability_rules', align: 'left' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' },
]

const deleteMethod = (method: IMethod) => {
  methodsStore.deleteMethod(method.code)
}
</script>

<style scoped></style>

<style lang="scss">
.repeatability-rule {
  input[type='number']::-webkit-inner-spin-button,
  input[type='number']::-webkit-outer-spin-button {
    appearance: none;
    margin: 0;
  }
}
</style>
