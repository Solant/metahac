import pick from 'lodash/pick';
import { checkOnline, getJobList } from '../../hacService';

const intervals = new Map();
const setIntervalAndRun = (fun, interval) => {
    fun();
    return setInterval(fun, interval);
};

const actions = {
    updateOnlineStatus({ rootState, commit, dispatch }) {
        rootState.environments
            .forEach(async (env) => {
                const online = await checkOnline({ ...pick(env, ['url', 'user', 'password']) });
                const prevStatus = env.online;
                commit('SET_ONLINE', {
                    id: env.id,
                    status: online,
                }, { root: true });
                if (!prevStatus && online) {
                    const jobs = setIntervalAndRun(() => dispatch('updateJobs'), 4000);
                    const logs = setIntervalAndRun(() => dispatch('updateLogs'), 60 * 60 * 1000);
                    const config = setIntervalAndRun(() => dispatch('updateConfigs'), 60 * 60 * 1000);

                    intervals.set(env.id, { jobs, logs, config });
                } else if (prevStatus && !online) {
                    Object.values(intervals.get(env.id))
                        .forEach(id => clearInterval(id));
                }
            });
    },
    updateJobs({ rootState, commit }) {
        rootState.environments
            .filter(env => env.online)
            .forEach((env) => {
                getJobList(pick(env, ['url', 'user', 'password']))
                    .then(jobs => commit('SET_JOBS', { id: env.id, jobs }, { root: true }));
            });
    },
    updateLogs({ rootState, dispatch }) {
        rootState.environments
            .filter(env => env.online)
            .forEach(env => dispatch('getLogs', { id: env.id }, { root: true }));
    },
    updateConfigs({ rootState, dispatch }) {
        rootState.environments
            .filter(env => env.online)
            .forEach(env => dispatch('loadConfig', { id: env.id }, { root: true }));
    },
};

export default { actions };
