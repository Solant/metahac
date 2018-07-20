<template>
    <div class="main-container">
        <div class="main-container__side-bar">
            <b-list-group>
                <HacListElement
                        v-for="env in environments"
                        :key="env.id"
                        :env="env"
                        @click.native="selectCurrentEnv({ id: env.id })"
                />
            </b-list-group>
            <b-button
                    v-b-modal.addHacModal
                    variant="success"
                    class="main-container__side-bar__add"
            >
                <icon name="plus" />
            </b-button>
        </div>
        <div class="main-container__content">
            <b-card v-if="currentEnv">
                <b-tabs
                        card
                        lazy
                >
                    <b-tab
                            title="Configuration"
                            active
                    >
                        <HacConfigTable :env="currentEnv"/>
                    </b-tab>
                    <b-tab title="Jobs">
                        <b-table
                                :items="currentEnv.jobs"
                                :fields="['jobCode', 'cronJobCode']"
                                responsive
                        />
                    </b-tab>
                    <b-tab title="Logs">
                        <HacLogTable :env="currentEnv"/>
                    </b-tab>
                    <b-tab title="Update">
                        <UpdateEnvironment :env="currentEnv"/>
                    </b-tab>
                    <b-tab title="FlexSearch">
                        <HacFlexibleSearch :env="currentEnv"/>
                    </b-tab>
                </b-tabs>
            </b-card>
        </div>

        <b-modal id="addHacModal">
            <CreateHacForm/>
        </b-modal>
    </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';
import icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/plus';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';

import CreateHacForm from './components/CreateHacForm.vue';
import HacListElement from './components/HacListElement.vue';
import HacConfigTable from './components/HacConfigTable.vue';
import HacLogTable from './components/HacLogTable.vue';
import UpdateEnvironment from './components/UpdateEnvironment.vue';
import HacFlexibleSearch from './components/HacFlexibleSearch.vue';

export default {
    name: 'App',
    components: {
        HacConfigTable,
        CreateHacForm,
        HacListElement,
        HacLogTable,
        UpdateEnvironment,
        HacFlexibleSearch,
        icon,
    },
    computed: {
        ...mapState([
            'environments',
            'currentEnv',
        ]),
    },
    methods: {
        ...mapActions([
            'selectCurrentEnv',
        ]),
    },
};
</script>
<style scoped lang="scss">
    .side-bar {
        height: 100%;
        overflow: auto;
    }

    code {
        color: black;
    }

    .main-container {
        height: 100vh;
        display: flex;
        &__side-bar {
            width: 20vw;
            max-width: 250px;
            overflow-y: auto;
            position: relative;
            &__add {
                width: 50px;
                height: 50px;
                border-radius: 25px;
                position: absolute;
                right: 0;
                bottom: 0;
            }
        }
        &__content {
            flex: 1;
            max-height: 100vh;
            overflow: auto;
            & /deep/ .card-body {
                padding: 0;
            }
            & /deep/ .tab-content {
                padding-left: 1.25rem;
                padding-right: 1.25rem;
                padding-top: 1.25rem;
            }
        }
    }
</style>
