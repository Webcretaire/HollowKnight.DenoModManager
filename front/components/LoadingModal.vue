<template>
    <b-modal
        :id="id"
        class="loading-modal-c text-center"
        hide-header
        hide-footer
        centered
        size="sm"
        no-close-on-backdrop
        no-close-on-esc
    >
        <div class="spinner-box mt-3 mb-3">
            <div class="circle-border">
                <b-img src="~/assets/knight.png" class="circle-core"/>
            </div>
        </div>
    </b-modal>
</template>

<script>
import { LOADING_MODAL_ID } from "@/util/loading";

export default {
    name: "LoadingModal",
    data: () => ({
        id: LOADING_MODAL_ID,
    }),
};
</script>

<style lang="scss">
#loading-modal___BV_modal_content_ {
    background-color: var(--background-color);
}

.loading-modal-c {
    background-color: var(--background-color);
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: flex-start;
}
</style>

<style lang="scss" scoped>
@keyframes spin {
    from {
        transform: rotate(0);
    }
    to {
        transform: rotate(359deg);
    }
}

.spinner-box {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: transparent;
}

.circle-border {
    width: 10rem;
    height: 10rem;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    background: rgb(63, 249, 220);
    background: linear-gradient(
        0deg,
        rgba(63, 249, 220, 0.1) 33%,
        rgba(63, 249, 220, 1) 100%
    );
    animation: spin 0.8s linear 0s infinite;
}

.circle-core {
    width: 100%;
    height: 100%;
    animation: spin 0.8s linear 0s infinite reverse; // By inverting the animation it stays still
}
</style>