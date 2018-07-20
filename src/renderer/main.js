import Vue from 'vue';
import axios from 'axios';
import BootstrapVue from 'bootstrap-vue';

import App from './App';
import store from './store';

if (!process.env.IS_WEB) Vue.use(require('vue-electron'));
Vue.http = Vue.prototype.$http = axios;
Vue.config.productionTip = false;
Vue.use(BootstrapVue);

const onlineStatusJob = () => store.dispatch('schedulers/updateOnlineStatus');
onlineStatusJob();
setInterval(onlineStatusJob, 5000);

new Vue({
    components: { App },
    store,
    template: '<App/>',
}).$mount('#app');
