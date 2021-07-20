<template>
    <div>
        <b-table striped hover :items="items" :fields="fields">
            <template #cell(modInstallerData)="row">
                <a
                    v-if="row.value && row.value.Name"
                    class="text-info"
                    :href="getId(row.value.Name)"
                >
                    {{ row.value.Name || "Unknown" }}
                </a>
                <span v-else class="text-warning">Unknown</span>
            </template>
            <template #cell(actions)="row">
                <b-button
                    size="sm"
                    :variant="row.item.active ? 'danger' : 'success'"
                    @click="
                        row.item.active
                            ? disableMod(row.item)
                            : enableMod(row.item)
                    "
                >
                    {{ row.item.active ? "Disable" : "Enable" }}
                </b-button>
                <b-button
                    v-if="
                        row.item.modInstallerData &&
                        row.item.modInstallerData.Name
                    "
                    size="sm"
                    variant="warning"
                    @click="uninstallMod(row.item.modInstallerData)"
                >
                    Uninstall
                </b-button>
            </template>
        </b-table>
    </div>
</template>

<script>
import slugify from "slugify";
import { startLoading } from "@/util/loading";
import { axiosErrorCallback } from "@/util/error";

export default {
    name: "ModsTable",
    props: {
        items: {
            required: true,
        },
    },
    data() {
        return {
            fields: [
                { key: "dll", label: "File (dll)" },
                { key: "modInstallerData", label: "ModInstaller Name" },
                { key: "actions", label: "Actions" },
            ],
        };
    },
    methods: {
        apiCall(url) {
            startLoading(this);
            this.$axios
                .$get(url)
                .catch(axiosErrorCallback)
                .finally(() => {
                    this.$emit("reload");
                });
        },
        enableMod(mod) {
            this.apiCall(`/mod/${mod.dll}/enable`);
        },
        disableMod(mod) {
            this.apiCall(`/mod/${mod.dll}/disable`);
        },
        uninstallMod(mod) {
            this.apiCall(`/mod/${mod.dll}/uninstall`);
        },
        getId(str) {
            return `#mi_row_${slugify(str)}`;
        },
    },
};
</script>