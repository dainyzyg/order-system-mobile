import Vue from 'vue'
import MintUI from 'mint-ui'
import 'mint-ui/lib/style.css'
import indexedDBPlugin from './modules/indexedDBPlugin'
import App from './App'
import router from './router'

Vue.use(MintUI)
Vue.config.productionTip = false
Vue.use(indexedDBPlugin)
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  render: (h) => h(App)
})
