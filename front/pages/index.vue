<template>
    <div>
        <b-row>
            <b-col cols="12" class="mb-4">
                <h1>Hollow Knight mod manager</h1>
                <p>
                    <em>
                        <strong>Warning:</strong> this tool is used to manage
                        mods after you installed the modding API, it won't
                        install the modding API for you, for that check pinned
                        messages in the Hollow Knight discord
                    </em>
                </p>
            </b-col>
            <b-col cols="12" xl="6">
                <b-card title="Active mods" class="mb-5">
                    <mods-table :items="activeMods" v-on:reload="$fetch" />
                </b-card>
            </b-col>
            <b-col cols="12" xl="6">
                <b-card title="Disabled mods" class="mb-5">
                    <mods-table :items="inactiveMods" v-on:reload="$fetch" />
                </b-card>
            </b-col>
            <b-col cols="12">
                <b-card title="ModInstaller mods" class="mb-5">
                    <mod-installer-mods-table
                        :items="available"
                        v-on:reload="$fetch"
                    />
                </b-card>
            </b-col>
            <b-col cols="12">
                <p><em>Website made by @Webcretaire</em></p>
            </b-col>
        </b-row>
        <loading-modal />
    </div>
</template>

<script>
import ModsTable from "@/components/ModsTable.vue";
import ModInstallerModsTable from "@/components/ModInstallerModsTable.vue";
import { startLoading, endLoading } from "@/util/loading";
import LoadingModal from "@/components/LoadingModal.vue";

export default {
    components: { ModInstallerModsTable, ModsTable, LoadingModal },
    data() {
        return {
            mods: [],
            available: [],
        };
    },
    computed: {
        activeMods() {
            return this.mods.filter(({ active }) => active);
        },
        inactiveMods() {
            return this.mods.filter(({ active }) => !active);
        },
    },
    async fetch() {
        startLoading(this);

        this.$axios
            .$get("/mods/installed")
            .then((data) => {
                this.mods = data.mods;
            })
            .then(() =>
                this.$axios.$get("/mods/available").then((data) => {
                    this.available = data.mods;
                })
            )
            .finally(() => endLoading(this));
    },
};
</script>

<style lang="scss">
html,
body {
    --background-color:rgb(37, 38, 43);
    background-color: var(--background-color);
    margin: 0;
    padding: 1rem;
    min-height: 100vh;
}

h1,
p {
    color: white;
    text-align: center;
}
</style>