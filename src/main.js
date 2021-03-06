// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import ElementUI from 'element-ui'
import Router from 'vue-router'
import store from './store/store.js'
import axios from 'axios'

import '../static/css/common.css'                 // 引入共用样式
import 'element-ui/lib/theme-default/index.css'   // 引入elementUI样式

Vue.use(ElementUI)
Vue.use(Router)
Vue.prototype.$http = axios

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  template: '<App/>',
  components: {App}
})
