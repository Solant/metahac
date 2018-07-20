import Vue from 'vue';
import Vuex from 'vuex';
import nanoid from 'nanoid';
import pick from 'lodash/pick';
import Jszip from 'jszip';
import cloneDeep from 'lodash/cloneDeep';

import { getHacConfig, changeProperty, prepareLogZip, downloadLogZip, getCsrfToken, startUpdate, executeFlexibleSearch, getLogList } from '../hacService';
import schedulers from './modules/schedulers';

Vue.use(Vuex);

const findEnv = (state, id) => state.environments.find(e => e.id === id);

const getters = {
    isLogLoading: state => id => findEnv(state, id).logs.loading,
    isConfigLoading: state => id => findEnv(state, id).config.loading,
};

const additionalHacProps = {
    online: undefined,
    config: {
        updateDate: undefined,
        loading: false,
        table: undefined,
    },
    jobs: undefined,
    logs: {
        table: undefined,
        loading: false,
        updateDate: undefined,
    },
    lastFsQuery: undefined,
};

const mutations = {
    ADD_ENVIRONMENT(state, payload) {
        state.environments.push({
            id: nanoid(),
            ...payload,
            ...additionalHacProps,
        });
    },
    REMOVE_ENVIRONMENT(state, { id }) {
        state.environments.splice(state.environments.findIndex(e => e.id === id), 1);
    },
    SET_ONLINE(state, { id, status }) {
        state.environments.find(e => e.id === id).online = status;
    },
    SAVE_STATE(state) {
        const data = state.environments.map(e => pick(e, ['id', 'url', 'user', 'password', 'name']));
        localStorage.setItem('environments', JSON.stringify(data));
    },
    SELECT_CURRENT_ENV(state, { id }) {
        state.currentEnv = state.environments.find(e => e.id === id);
    },
    CONFIG_UPDATE_STARTED(state, { id }) {
        const env = state.environments.find(e => e.id === id);
        env.config.loading = true;
    },
    CONFIG_UPDATE_FAILED(state, { id }) {
        const env = state.environments.find(e => e.id === id);
        env.config.loading = false;
    },
    CONFIG_UPDATE_FINISHED(state, { id, config }) {
        const env = state.environments.find(e => e.id === id);
        env.config.loading = false;
        env.config.updateDate = Date.now();
        env.config.table = config;
    },
    CHANGE_CONFIG_PROPERTY(state, { id, key, value }) {
        const env = state.environments.find(e => e.id === id);
        env.config.table.find(c => c.name === key).value = value;
    },
    SET_JOBS(state, { id, jobs }) {
        state.environments.find(e => e.id === id).jobs = jobs;
    },
    LOG_UPDATE_STARTED(state, { id }) {
        const env = state.environments.find(e => e.id === id);
        env.logs.loading = true;
    },
    LOG_UPDATE_FINISHED(state, { id, logs }) {
        const env = state.environments.find(e => e.id === id);
        env.logs.table = logs;
        env.logs.loading = false;
        env.logs.updateDate = Date.now();
    },
    FLEXIBLE_QUERY_UPDATED(state, { id, query }) {
        state.environments.find(e => e.id === id).lastFsQuery = query;
    },
};

const actions = {
    addEnvironment({ commit }, payload) {
        commit('ADD_ENVIRONMENT', payload);
        commit('SAVE_STATE');
    },
    removeEnvironment({ commit }, { id }) {
        commit('REMOVE_ENVIRONMENT', { id });
        commit('SAVE_STATE');
    },
    selectCurrentEnv({ commit }, { id }) {
        commit('SELECT_CURRENT_ENV', { id });
    },
    loadConfig({ state, commit }, { id }) {
        commit('CONFIG_UPDATE_STARTED', { id });
        const env = state.environments.find(e => e.id === id);
        return getHacConfig(pick(env, ['url', 'user', 'password']))
            .then(({ config }) => commit('CONFIG_UPDATE_FINISHED', { id: env.id, config }));
    },
    getLogs({ state, commit }, { id }) {
        commit('LOG_UPDATE_STARTED', { id });
        const env = findEnv(state, id);
        return getLogList(pick(env, ['url', 'user', 'password']))
            .then(logs => commit('LOG_UPDATE_FINISHED', { id, logs }));
    },
    changeHacProperty({ state, commit }, { id, key, value }) {
        const env = state.environments.find(e => e.id === id);
        return getCsrfToken(env)
            .then(csrf => changeProperty({ ...pick(env, ['url', 'user', 'password']), key, value, csrf }))
            .then(() => commit('CHANGE_CONFIG_PROPERTY', { id, key, value }));
    },
    downloadLogFile({ state }, { id, filePath }) {
        const env = state.environments.find(e => e.id === id);
        return getCsrfToken(pick(env, ['url', 'user', 'password']))
            // eslint-disable-next-line arrow-body-style
            .then((csrf) => {
                return prepareLogZip({ ...pick(env, ['url', 'user', 'password']), filePath, csrf })
                    .then(() => downloadLogZip({ ...pick(env, ['url', 'user', 'password']), csrf }))
                    .then(Jszip.loadAsync)
                    .then((zip) => {
                        const filePaths = Object.keys(zip.files);
                        const name = filePaths.find(f => f.startsWith('logs/') && f !== 'logs/supportzip.log');
                        return zip.files[name].async('text');
                    });
            });
    },
    updateSystem({ state }, { id, payload }) {
        const env = state.environments.find(e => e.id === id);
        return getCsrfToken(env)
            .then(csrf => startUpdate({ ...pick(env, ['url', 'user', 'password']), csrf, payload }));
    },
    executeFlexSearch({ state }, { id, payload }) {
        const env = state.environments.find(e => e.id === id);
        return getCsrfToken(env)
            .then(csrf => executeFlexibleSearch({ ...pick(env, ['url', 'user', 'password']), csrf, payload }))
            .then((data) => {
                if (data.exception) {
                    return { exceptionMessage: data.exception.message };
                }

                const headers = data.headers;
                const result = [];
                data.resultList.forEach((row) => {
                    const obj = {};
                    row.forEach((col, i) => {
                        obj[headers[i]] = col;
                    });
                    result.push(obj);
                });
                return { headers, items: result, executionTime: data.executionTime };
            });
    },
};

const state = {
    environments: [],
    currentEnv: undefined,
};

state.environments = (JSON.parse(localStorage.getItem('environments')) || [])
    .map(env => Object.assign({}, cloneDeep(additionalHacProps), env));

export default new Vuex.Store({
    strict: process.env.NODE_ENV !== 'production',
    getters,
    mutations,
    actions,
    state,
    modules: {
        schedulers: {
            ...schedulers,
            namespaced: true,
        },
    },
});
