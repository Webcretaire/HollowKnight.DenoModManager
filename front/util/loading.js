export const LOADING_MODAL_ID = "loading-modal";

export const startLoading = ctx => {
  ctx.$bvModal.show(LOADING_MODAL_ID);
};

export const endLoading = ctx => {
  ctx.$bvModal.hide(LOADING_MODAL_ID);
};
