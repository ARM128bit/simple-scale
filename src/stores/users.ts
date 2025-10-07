import { computed, ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@/entities/user.class'

export const useUsersStore = defineStore('users', () => {
  const loading = ref(false)
  const users = reactive(new Map() as Map<IUser['id'], IUser>)

  async function saveUsers() {
    // Should not be a proxy object
    await window.settings.setUsers([...toRaw(users).values()])
    loadUsers()
  }

  async function addUser(user: IUser) {
    await window.settings.setUsers([...toRaw(users).values(), toRaw(user)])
    loadUsers()
  }

  async function loadUsers() {
    const res = (await window.settings.getUsers()) as IUser[]
    users.clear()
    for (const user of res) {
      users.set(user.id, new User({ ...user, enabled: Boolean(user.enabled) }))
    }
  }

  async function deleteUser(key: IUser['id']) {
    users.delete(key)
  }

  return {
    allUsers: computed(() => [...users.values()]),
    filteredUsers: computed(() => [...users.values()].filter((user) => user.enabled)),
    loading,
    loadUsers,
    saveUsers,
    addUser,
    deleteUser,
  }
})
