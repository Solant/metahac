<template>
    <div>
        <div class="status-row">
            <div
                    v-if="!isConfigLoading(env.id)"
                    class="status-row__text"
            >
                Updated
                <timeago
                        :since="env.config.updateDate"
                        :auto-update="10"
                />
            </div>
            <div
                    v-else
                    class="status-row__text"
            >Updating...</div>
            <b-button
                    :disabled="isConfigLoading(env.id)"
                    variant="success"
                    class="bem-btn bem-btn_flex"
                    @click="updateClicked"
            >
                <icon
                        :spin="isConfigLoading(env.id)"
                        name="sync-alt"
                />
            </b-button>
        </div>
        <b-alert
                :show="alertShown"
                dismissible
                variant="success"
                @dismissed="alertShown = false"
        >
            Property changed
        </b-alert>
        <b-form-group
                horizontal
                label="Filter prop names"
        >
            <b-input
                    v-model="configFilter"
                    :disabled="isConfigLoading(env.id)"
            />
        </b-form-group>
        <b-table
                ref="configTable"
                :busy="isConfigLoading(env.id)"
                :filter="configFilter"
                :current-page="configCurrentPage"
                :items="configTableProvider"
                :fields="{ name: { label: 'Name', sortable: true }, value: { label: 'Value' } }"
                :per-page="5"
                responsive
        >
            <template
                    slot="value"
                    slot-scope="data"
            >
                <b-form-checkbox
                        v-if="isBooleanVariable(data.value)"
                        :checked="data.value === 'true'"
                        @change="propertyChanged(data.item.name, $event.toString())"
                />
                <b-form-input
                        v-else
                        :value="data.value"
                        @change="propertyChanged(data.item.name, $event)"
                />
            </template>
        </b-table>
        <b-pagination
                :total-rows="configTableProvider({ filter: configFilter }).length"
                :per-page="5"
                v-model="configCurrentPage"
                align="center"
        />
    </div>
</template>

<script>
import icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/spinner';
import { createTimeago } from 'vue-timeago';
import { mapActions, mapState, mapGetters } from 'vuex';

export default {
    name: 'HacConfigTable',
    components: {
        icon,
        timeago: createTimeago(),
    },
    props: {
        env: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            configFilter: null,
            configCurrentPage: 1,
            alertShown: false,
        };
    },
    computed: {
        ...mapState(['currentEnv']),
        ...mapGetters([
            'isConfigLoading',
        ]),
    },
    watch: {
        env() {
            this.$nextTick(() => this.$refs.configTable.refresh());
        },
        'env.config.table': function watchConfig() {
            this.$nextTick(() => this.$refs.configTable.refresh());
        },
    },
    methods: {
        ...mapActions([
            'loadConfig',
            'changeHacProperty',
        ]),
        updateClicked() {
            this.loadConfig({ id: this.env.id })
                .then(() => this.$refs.configTable.refresh());
        },
        configTableProvider({ filter, currentPage, perPage } = {}) {
            let data = this.env.config.table || [];
            if (filter) {
                data = data.filter(c => c.name.toLowerCase().includes(filter.toLowerCase()));
            }
            if (currentPage) {
                data = data.slice((currentPage - 1) * perPage, currentPage * perPage);
            }
            return data || [];
        },
        propertyChanged(key, value) {
            this.changeHacProperty({ id: this.env.id, key, value })
                .then(() => { this.alertShown = true; });
        },
        isBooleanVariable(value) {
            return ['true', 'false'].includes(value);
        },
    },
};
</script>

<style scoped lang="scss">
    @import '../assets/tab-content';
</style>
