<template>
    <div>
        <div class="bem-flex-console">
            <codemirror
                    :options="cmOptions"
                    v-model="flexibleSearchQuery"
                    class="bem-flex-console__query"
            />
            <b-button
                    :disabled="pending"
                    variant="success"
                    class="bem-btn bem-btn_flex bem-flex-console__button"
                    @click="execute"
            >
                <icon
                        v-if="pending"
                        name="spinner"
                        pulse
                />
                <icon
                        v-if="!pending"
                        name="play"
                />
                Run
            </b-button>
            <b-button v-b-modal.fsOptions class="bem-btn bem-btn_flex bem-flex-console__button">
                <icon name="cog"/>
                Options
            </b-button>
        </div>
        <b-alert
                :show="!!lastResult.exceptionMessage"
                variant="danger"
        >
            {{ lastResult.exceptionMessage }}
        </b-alert>
        <b-alert :show="!lastResult.exceptionMessage" variant="success">
            Found {{ (lastResult.items || []).length }} items in {{ lastResult.executionTime }}ms
        </b-alert>

        <b-pagination
                v-if="!lastResult.exceptionMessage"
                :total-rows="resultProvider().length"
                :per-page="5"
                v-model="currentPage"
        />
        <b-table
                ref="fsTable"
                :fields="lastResult.headers"
                :items="resultProvider"
                :current-page="currentPage"
                :per-page="5"
                responsive
                striped
                hover
        />
        <b-modal id="fsOptions">
            <b-form>
                <b-form-group label="Max result count">
                    <b-form-input v-model="payload.maxCount" type="number"/>
                </b-form-group>
                <b-form-group label="User">
                    <b-form-input v-model="payload.user"/>
                </b-form-group>
            </b-form>
        </b-modal>
    </div>
</template>

<script>
import icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/spinner';
import 'vue-awesome/icons/play';
import 'vue-awesome/icons/cog';
import { mapActions } from 'vuex';
import { codemirror } from 'vue-codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/mode/sql/sql';
import 'codemirror/theme/base16-light.css';
import debounce from 'lodash/debounce';

export default {
    name: 'HacFlexibleSearch',
    components: {
        codemirror,
        icon,
    },
    props: {
        env: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            pending: false,
            currentPage: 1,
            payload: {
                sqlQuery: '',
                maxCount: 200,
                user: 'admin',
                locale: 'en',
                commit: false,
            },
            lastResult: {
                headers: undefined,
                items: undefined,
                exceptionMessage: undefined,
                executionTime: undefined,
            },
            cmOptions: {
                // codemirror options
                tabSize: 4,
                mode: 'text/sql',
                theme: 'base16-light',
                lineNumbers: true,
                line: true,
                viewportMargin: Infinity,
                lineWrapping: true,
            },
        };
    },
    computed: {
        flexibleSearchQuery: {
            get() {
                return this.env.lastFsQuery || '';
            },
            set: debounce(
                function debouncedSetter(value) {
                    this.$store.commit('FLEXIBLE_QUERY_UPDATED', {
                        id: this.env.id,
                        query: value,
                    });
                },
                150,
            ),
        },
    },
    methods: {
        ...mapActions([
            'executeFlexSearch',
        ]),
        execute() {
            this.pending = true;
            this.executeFlexSearch({
                id: this.env.id,
                payload: {
                    ...this.payload,
                    flexibleSearchQuery: this.flexibleSearchQuery,
                },
            })
                .then(({ items, headers, exceptionMessage, executionTime }) => {
                    this.lastResult.items = items;

                    const formattedHeaders = {};
                    headers.forEach((h) => {
                        formattedHeaders[h] = { label: h };
                    });
                    this.lastResult.headers = formattedHeaders;
                    this.lastResult.exceptionMessage = exceptionMessage;
                    this.lastResult.executionTime = executionTime;
                })
                .then(() => {
                    this.pending = false;
                })
                .then(() => {
                    this.$refs.fsTable.refresh();
                })
                .catch((reason) => {
                    this.pending = false;
                    this.lastResult.exceptionMessage = reason;
                });
        },
        resultProvider({ currentPage, perPage } = {}) {
            let data = this.lastResult.items || [];
            if (currentPage) {
                data = data.slice((currentPage - 1) * perPage, currentPage * perPage);
            }
            return data || [];
        },
    },
};
</script>

<style lang="scss" scoped>
    /deep/ .CodeMirror {
        height: auto;
    }

    .bem-btn {
        &_flex {
            display: flex;
            align-items: center;
            justify-content: center;

            .fa-icon {
                margin-right: 5px;
            }
        }
    }

    .bem-flex-console {
        display: flex;
        > * {
            margin-right: 10px;
        }
        > *:last-child {
            margin-right: 0;
        }
        &__query {
            flex-grow: 1;
        }
        &__button {
            align-self: flex-start;
        }
    }
</style>
