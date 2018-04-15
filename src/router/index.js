import Vue from 'vue'
import Router from 'vue-router'
import Order from '@/views/Order'
import Inventory from '@/views/Inventory'
import Sales from '@/views/Sales'
import Setting from '@/views/Setting'
import SettingPC from '@/views/SettingPC'
import Menu from '@/views/Menu'

Vue.use(Router)
const routes = [
  { path: '/', redirect: '/menu' },
  { path: '/order', component: Order },
  { path: '/inventory', component: Inventory },
  { path: '/sales', component: Sales },
  { path: '/menu', component: Menu },
  { path: '/settingpc', component: SettingPC }
]
if (window.toString() === '[object global]') {
  routes.push({ path: '/setting', component: SettingPC })
} else {
  routes.push({ path: '/setting', component: Setting })
}
export default new Router({
  routes
})
