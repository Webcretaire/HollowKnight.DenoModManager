<template>
    <div>
        <b-table
            striped
            hover
            :items="items"
            :fields="fields"
            primary-key="Name"
        >
            <template #cell(link)="row">
                <a target="_blank" :href="row.value">{{ row.value }}</a>
            </template>
            <template #cell(actions)="row">
                <b-button
                    v-if="!row.item.installed"
                    size="sm"
                    variant="info"
                    @click="installMod(row.item)"
                >
                    Install
                </b-button>
                <b-button
                    v-else
                    size="sm"
                    variant="warning"
                    @click="uninstallMod(row.item)"
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
    name: "ModInstallerModsTable",
    props: {
        items: {
            required: true,
        },
    },
    data() {
        return {
            fields: [
                {
                    key: "Name",
                    tdAttr: (value) => ({ id: `mi_row_${slugify(value)}` }),
                },
                { key: "Link", label: "Download" },
                { key: "actions", label: "Actions" },
            ],
        };
    },
    methods: {
        installMod(mod) {
            startLoading(this);
            this.$axios
                .$get(`/mod/${mod.Name}/install`)
                .catch(axiosErrorCallback)
                .finally(() => {
                    this.$emit("reload");
                });
        },
        uninstallMod(mod) {
            startLoading(this);
            this.$axios
                .$get(`/mod/${mod.Name}/uninstall`)
                .catch(axiosErrorCallback)
                .finally(() => {
                    this.$emit("reload");
                });
        },
    },
};
</script>