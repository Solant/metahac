<template>
    <b-list-group-item
            :class="wrapperClass"
            :active="currentEnv === env"
            button
    >
        {{ env.name }}
        <icon
                name="trash"
                class="hac-element__delete"
                @click.native.stop="removeWithConfirm"
        />
        <span v-if="env.jobs" class="hac-element__jobs">
            {{ env.jobs.length }}
            <icon name="cogs"/>
        </span>
    </b-list-group-item>
</template>

<script>
import { mapState } from 'vuex';
import icon from 'vue-awesome/components/Icon.vue';
import 'vue-awesome/icons/trash';
import 'vue-awesome/icons/cogs';
import 'vue-awesome/icons/info-circle';

export default {
    name: 'HacListElement',
    components: {
        icon,
    },
    props: {
        env: {
            type: Object,
            required: true,
        },
    },
    computed: {
        ...mapState([
            'currentEnv',
        ]),
        wrapperClass() {
            return {
                'hac-element--online': this.env.online === true,
                'hac-element--offline': this.env.online === false,
                'hac-element--unknown': this.env.online === undefined,
            };
        },
    },
    methods: {
        removeWithConfirm() {
            // eslint-disable-next-line no-alert
            if (confirm('Delete environment?')) {
                this.$store.dispatch('removeEnvironment', { id: this.env.id });
            }
        },
    },
};
</script>

<style scoped>
    .hac-element__jobs {
        float: right;
        margin-right: 5px;
    }

    .hac-element__delete {
        float: right;
    }

    .hac-element--online {
        border-left: 5px green solid;
    }

    .hac-element--offline {
        border-left: 5px red solid;
    }

    .hac-element--undefined {
        border-left: 5px gray solid;
    }
</style>
