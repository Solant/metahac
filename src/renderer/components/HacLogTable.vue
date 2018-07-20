<template>
    <div>
        <div class="status-row">
            <div
                    v-if="!isLogLoading(env.id)"
                    class="status-row__text"
            >
                Updated
                <timeago
                        :since="env.logs.updateDate"
                        :auto-update="10"
                />
            </div>
            <div
                    v-else
                    class="status-row__text"
            >Updating...</div>
            <b-button
                    :disabled="isLogLoading(env.id)"
                    variant="success"
                    class="bem-btn bem-btn_flex"
                    @click="getLogs({ id: env.id })"
            >
                <icon
                        :spin="isLogLoading(env.id)"
                        name="sync-alt"
                />
            </b-button>
        </div>

        <b-form-group
                horizontal
                label="Filter"
        >
            <b-input v-model="logFilter"/>
        </b-form-group>
        <b-pagination
                :total-rows="logTableProvider({ filter: logFilter }).length"
                :per-page="5"
                v-model="logPage"
        />
        <b-table
                ref="logTable"
                :per-page="5"
                :current-page="logPage"
                :filter="logFilter"
                :items="logTableProvider"
                :fields="logTableFields"
                :busy="isLogLoading(env.id) || logFileDownloading"
                responsive
                striped
        >
            <template
                    slot="size"
                    slot-scope="data"
            >
                {{ data.item.size }} kb
            </template>
            <template
                    slot="viewButton"
                    slot-scope="data"
            >
                <b-button
                        :disabled="isLogLoading(env.id)"
                        @click="downloadLogAndShow({ id: env.id, filePath: data.item.absolute })"
                >
                    View log
                </b-button>
            </template>
        </b-table>
        <b-modal
                ref="logModal"
                size="lg"
                class="modal_full-screen"
        >
            <pre class="line-number">
                <span
                    v-for="(line, i) in currentLogContent.split('\n')"
                    :key="i"
                >{{ line }}</span>
            </pre>
        </b-modal>
    </div>
</template>

<script>
import icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/sync-alt';
import { createTimeago } from 'vue-timeago';
import { mapActions, mapGetters } from 'vuex';

export default {
    name: 'HacLogTable',
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
            logFileDownloading: false,
            logFilter: '',
            logPage: 1,
            logTableFields: {
                name: {},
                absolute: {
                    tdClass: 'wrap-table-col',
                },
                size: {},
                viewButton: {},
            },
            currentLogContent: '',
        };
    },
    computed: {
        ...mapGetters([
            'isLogLoading',
        ]),
    },
    watch: {
        env() {
            this.$nextTick(() => this.$refs.logTable.refresh());
        },
    },
    methods: {
        ...mapActions([
            'downloadLogFile',
            'getLogs',
        ]),
        downloadLogAndShow({ id, filePath }) {
            this.logFileDownloading = true;
            this.downloadLogFile({ id, filePath })
                .then((log) => {
                    this.currentLogContent = log;
                    this.$refs.logModal.show();
                })
                .finally(() => {
                    this.logFileDownloading = false;
                });
        },
        logTableProvider({ filter, currentPage, perPage } = {}) {
            let data = this.env.logs.table || [];
            if (filter) {
                data = data.filter(l =>
                    l.name.toLowerCase().includes(filter.toLowerCase())
                        || l.absolute.toLowerCase().includes(filter.toLowerCase()));
            }
            if (currentPage) {
                data = data.slice((currentPage - 1) * perPage, currentPage * perPage);
            }
            return data || [];
        },
    },
};
</script>

<style lang="scss">
    @import "../assets/tab-content";

    .wrap-table-col {
        max-width: 250px;
    }

    .modal_full-screen {
        .modal-dialog {
            width: 98%;
            max-width: 98%;
            margin-top: 0;
            margin-bottom: 0;
        }
        .modal-body {
            height: 75vh;
            overflow: scroll;
        }
    }

    /*https://codepen.io/elomatreb/pen/hbgxp*/
    pre.line-number {
        font-family: monospace;
        background-color: #fff;
        padding: 0.5em;
        border-radius: .25em;
        line-height: 0;
        counter-reset: line;
        overflow: visible;

        span {
            display: block;
            line-height: 1.5rem;

            &:before {
                counter-increment: line;
                content: counter(line);
                display: inline-block;
                border-right: 1px solid #ddd;
                padding: 0 .5em;
                margin-right: .5em;
                color: #888
            }
        }
    }
</style>
