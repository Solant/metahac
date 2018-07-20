<template>
    <b-form>
        <b-alert
                :show="showDismissibleAlert"
                variant="success"
                dismissible
                @dismissed="showDismissibleAlert=false"
        >
            Update complete
        </b-alert>
        <b-form-group>
            <b-form-checkbox
                    v-model="createEssentialData"
                    disabled
            >
                Create essential data
            </b-form-checkbox>
            <b-form-checkbox v-model="clearHMC">
                Clear hmc configuration
            </b-form-checkbox>
            <b-form-checkbox v-model="localizeTypes">
                Localize types
            </b-form-checkbox>
        </b-form-group>
        <b-button
                :disabled="pending"
                @click="updateClicked()"
        >
            Update
        </b-button>
    </b-form>
</template>

<script>
import { mapActions } from 'vuex';
import pick from 'lodash/pick';

export default {
    name: 'UpdateEnvironment',
    props: {
        env: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            clearHMC: true,
            createEssentialData: false,
            localizeTypes: true,
            createProjectData: false,
            dropTables: false,
            initMethod: 'UPDATE',
            patches: {},
            allParameters: {},
            pending: false,
            showDismissibleAlert: false,
        };
    },
    methods: {
        ...mapActions([
            'updateSystem',
        ]),
        updateClicked() {
            this.pending = true;
            this.updateSystem({
                id: this.env.id,
                payload: pick(this, [
                    'clearHMC',
                    'createEssentialData',
                    'localizeTypes',
                    'createProjectData',
                    'dropTables',
                    'initMethod',
                    'patches',
                    'allParameters',
                ]),
            })
                .then(() => {
                    this.pending = false;
                    this.showDismissibleAlert = true;
                });
        },
    },
};
</script>

<style scoped>

</style>
