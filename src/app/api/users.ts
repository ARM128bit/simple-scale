export const usersAPI = {
  async save(users: Omit<IUser, 'fullName'>[]) {
    await window.settings.setUsers(users)
  },
  async load(): Promise<Omit<IUser, 'fullName'>[]> {
    return await window.settings.getUsers()
  },
}
