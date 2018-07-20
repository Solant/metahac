<template>
    <b-form @submit="createEnvironment">
        <b-alert
                :variant="alert.variant"
                show
        >{{ alert.text }}</b-alert>
        <b-form-group label="environment name:">
            <b-form-input v-model="name"/>
        </b-form-group>
        <b-form-group
                label="hac url:"
                description="for example https://localhost:9002/hac"
        >
            <b-form-input v-model="url"/>
        </b-form-group>
        <b-form-group label="user:">
            <b-form-input v-model="user"/>
        </b-form-group>
        <b-form-group label="password:">
            <b-form-input
                    v-model="password"
                    :type="showPassword ? '' : 'password'"
            />
        </b-form-group>
        <b-form-group>
            <b-form-checkbox v-model="showPassword">
                Show password
            </b-form-checkbox>
        </b-form-group>
        <b-button
                :disabled="alert.pending"
                variant="success"
                @click="testConnection"
        >
            <icon
                    v-if="alert.pending"
                    name="spinner"
                    pulse
            />
            Test connection
        </b-button>
        <b-button type="submit">Save</b-button>
    </b-form>
</template>

<script>
import icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/spinner';
import pick from 'lodash/pick.js';
import { checkOnline } from '../hacService';

export default {
    name: 'CreateHacForm',
    components: {
        icon,
    },
    data() {
        return {
            url: '',
            user: '',
            password: '',
            name: '',
            showPassword: false,
            alert: {
                text: 'Connection was not tested yet',
                variant: 'secondary',
                pending: false,
            },
        };
    },
    methods: {
        testConnection() {
            checkOnline(pick(this, ['url', 'user', 'password']))
                .then((res) => {
                    if (res) {
                        this.alert.variant = 'success';
                        this.alert.text = 'Connection is fine';
                    } else {
                        this.alert.variant = 'danger';
                        this.alert.text = 'Unable to connect to hac';
                    }
                    this.alert.pending = false;
                });
            this.alert.pending = true;
        },
        createEnvironment(event) {
            event.preventDefault();
            this.$store.dispatch('addEnvironment', pick(this, ['name', 'url', 'user', 'password']));
        },
    },
};
</script>
