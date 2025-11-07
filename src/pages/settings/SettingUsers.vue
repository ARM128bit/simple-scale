<template>
  <q-table
    :rows="usersStore.allUsers"
    :columns="column"
    :hide-pagination="true"
    :loading="usersStore.loading"
  >
    <template v-slot:body-cell="props">
      <q-td
        v-if="!editingUsers.has(props.row)"
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
          v-model="props.row[props.col.name]"
          :disable="!editingUsers.has(props.row)"
        />
      </q-td>
    </template>
    <template v-slot:body-cell-actions="props">
      <q-td :props="props">
        <q-btn
          v-if="!editingUsers.has(props.row)"
          icon="edit"
          flat
          round
          @click="() => editingUsers.add(props.row)"
        />
        <q-btn
          v-if="editingUsers.has(props.row)"
          icon="check"
          flat
          round
          @click="
            () => {
              usersStore.saveUsers()
              editingUsers.delete(props.row)
            }
          "
        />
        <q-btn
          v-if="editingUsers.has(props.row)"
          icon="close"
          flat
          round
          @click="() => editingUsers.delete(props.row)"
        />
        <q-btn
          icon="delete_outline"
          flat
          round
          @click="() => deleteUser(props.row)"
        />
      </q-td>
    </template>
    <template v-slot:bottom-row>
      <q-tr v-if="showAddUserForm">
        <q-td>
          <q-checkbox v-model.number="addUserForm.enabled" />
        </q-td>
        <q-td>
          <q-input
            v-model="addUserForm.last_name"
            input-class="text-left"
            type="text"
            dense
          />
        </q-td>
        <q-td>
          <q-input
            v-model="addUserForm.first_name"
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
            @click="addUser"
          />
        </q-td>
      </q-tr>
    </template>
  </q-table>
  <q-space />
  <div class="row no-wrap items-center q-mt-md q-pa-sm">
    <q-space />
    <q-btn @click="toggleAddUserForm">{{ showAddUserForm ? 'Cancel' : 'Add' }}</q-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import type { QTableColumn } from 'quasar'
import { useUsersStore } from '@/stores/users'
import { User } from '@/entities/user.class'

const usersStore = useUsersStore()

const defaultUser = (): IUser => {
  return new User({ first_name: '', last_name: '', enabled: true })
}
const showAddUserForm = ref(false)
const addUserForm = reactive(defaultUser())

const addUser = () => {
  usersStore.addUser(addUserForm)
  toggleAddUserForm()
}

const toggleAddUserForm = () => {
  if (showAddUserForm.value) {
    Object.assign(addUserForm, defaultUser())
  }
  showAddUserForm.value = !showAddUserForm.value
}
const editingUsers = reactive(new Set())

const column: QTableColumn<IUser & { actions: string }>[] = [
  { name: 'enabled', label: 'Активен?', field: 'enabled', align: 'left' },
  { name: 'last_name', label: 'Фамилия', field: 'last_name', align: 'left' },
  { name: 'first_name', label: 'Имя', field: 'first_name', align: 'left' },
  { name: 'actions', label: 'Действия', field: 'actions', align: 'right' },
]

const deleteUser = (user: IUser) => {
  usersStore.deleteUser(user.id)
}
</script>

<style scoped></style>
