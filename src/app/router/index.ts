import SettingMain from '@/pages/settings/SettingMain.vue'
import MethodsList from '@/pages/settings/SettingMethods.vue'
import UsersList from '@/pages/settings/SettingUsers.vue'
import WorkSheet from '@/pages/worksheet/WorkSheet.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import SettingExport from '@/pages/settings/SettingExport.vue'
import SettingWorksheet from '@/pages/settings/SettingWorksheet.vue'
import SettingScales from '@/pages/settings/SettingScales.vue'
import SettingSerialPort from '@/pages/settings/SettingSerialPort.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'worksheet',
      component: WorkSheet,
    },
    {
      path: '/settings',
      name: 'settings',
      component: SettingMain,
      children: [
        {
          path: '',
          name: 'setting-worksheet',
          component: SettingWorksheet,
          alias: ['worksheet'],
        },
        {
          path: 'methods',
          name: 'setting-methods',
          component: MethodsList,
        },
        {
          path: 'serial-port',
          name: 'setting-serial-port',
          component: SettingSerialPort,
        },
        {
          path: 'scales',
          name: 'setting-scales',
          component: SettingScales,
        },
        {
          path: 'users',
          name: 'setting-users',
          component: UsersList,
        },
        {
          path: 'export',
          name: 'setting-export',
          component: SettingExport,
        },
      ],
    },
  ],
})

export default router
