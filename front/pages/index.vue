<template>
    <div>
        <b-row>
            <b-col cols="12" class="mb-4">
                <p>
                    <b-img
                        src="~/assets/title.png"
                        id="dmm-title"
                        alt="Deno Mod Manager for Hollow Knight"
                    />
                </p>
                <p>
                    <em>
                        <strong>Warning:</strong> this tool is used to manage
                        mods after you installed the modding API, it won't
                        install the modding API for you, for that check pinned
                        messages in the
                        <a
                            href="https://discord.com/invite/hollowknight"
                            target="_blank"
                        >
                            Hollow Knight discord
                        </a>
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
                <p>
                    <em>
                        Website made by
                        <a
                            href="https://github.com/Webcretaire"
                            target="_blank"
                        >
                            @Webcretaire
                        </a>
                    </em>
                </p>
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
    data: () => ({
        mods: [],
        available: [],
    }),
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
    --background-color: rgb(37, 38, 43);
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

#dmm-title {
    max-width: 80vw;
    filter: drop-shadow(0 0 0.7rem black);
}
</style>