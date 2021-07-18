<template>
    <div>
        <b-table striped hover :items="items" :fields="fields">
            <template #cell(modInstallerData)="row">
                <a v-if="row.value && row.value.Name" class="text-info" :href="getId(row.value.Name)">
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
import slugify from 'slugify';
import { startLoading } from "@/util/loading";

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
        enableMod(mod) {
            startLoading(this);
            this.$axios.$get(`/mod/${mod.dll}/enable`).finally(() => {
                this.$emit("reload");
            });
        },
        disableMod(mod) {
            startLoading(this);
            this.$axios.$get(`/mod/${mod.dll}/disable`).finally(() => {
                this.$emit("reload");
            });
        },
        uninstallMod(mod) {
            startLoading(this);
            this.$axios.$get(`/mod/${mod.Name}/uninstall`).finally(() => {
                this.$emit("reload");
            });
        },
        getId(str) {
            return `#mi_row_${slugify(str)}`;
        }
    },
};
</script>