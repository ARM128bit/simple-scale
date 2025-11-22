import SettingMain from '@/pages/settings/SettingMain.vue'
import SettingMethods from '@/pages/settings/SettingMethods.vue'
import SettingUsers from '@/pages/settings/SettingUsers.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import SettingExport from '@/pages/settings/SettingExport.vue'
import SettingWorksheet from '@/pages/settings/SettingWorksheet.vue'
import SettingScales from '@/pages/settings/SettingScales.vue'
import SettingTemplates from '@/pages/settings/SettingTemplates.vue'
import SettingSerialPort from '@/pages/settings/SettingSerialPort.vue'
import WorksheetDesk from '@/pages/worksheet/WorksheetDesk.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      component: WorksheetDesk,
      name: 'worksheet-desk',
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
          component: SettingMethods,
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
          component: SettingUsers,
        },
        {
          path: 'templates',
          name: 'setting-templates',
          component: SettingTemplates,
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
