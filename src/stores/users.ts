import { computed, ref, reactive, toRaw } from 'vue'
import { defineStore } from 'pinia'
import { User } from '@/entities/user.class'
import { usersAPI } from '@/app/api'

export const useUsersStore = defineStore('users', () => {
  const loading = ref(false)
  const users = reactive(new Map() as Map<IUser['id'], IUser>)

  async function saveUsers() {
    loadUsers()
  }

  async function addUser(user: IUser) {
    await usersAPI.save(
      [...toRaw(users).values(), toRaw(user)].map((item) => ({
        id: item.id,
        first_name: item.first_name,
        last_name: item.last_name,
        enabled: item.enabled,
        created_at: item.created_at,
      })),
    )
    loadUsers()
  }

  async function loadUsers() {
    const res = await usersAPI.load()
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
