import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import elementIcon from "./plugins/icons";

// import axios from "axios";

const app = createApp(App);
// app.config.globalProperties.$axios = axios
app.use(store)
app.use(router)
app.use(ElementPlus)
app.use(elementIcon)
app.mount('#app')
