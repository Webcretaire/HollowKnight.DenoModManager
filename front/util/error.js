import Vue from "vue";

const vueInstance = new Vue();

export const axiosErrorCallback = error => {
  if (error?.response) {
    vueInstance.$bvToast.toast(
      `The API encountered an error, and returned code ${error.response.status}`,
      {
        title: `API error`,
        variant: "danger",
        solid: true
      }
    );
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    console.error(error.response.data);
    console.error(error.response.status);
    console.error(error.response.headers);
  } else if (error?.request) {
    vueInstance.$bvToast.toast(
      `The API did not respond, is the mod manager running ?`,
      {
        title: `API isn't responding`,
        variant: "danger",
        solid: true
      }
    );
    // The request was made but no response was received
    // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
    // http.ClientRequest in node.js
    console.error(error.request);
  } else if (error?.message) {
    vueInstance.$bvToast.toast(
      `Error while setting up the request at client side: ${error.message}`,
      {
        title: `Incorrect request`,
        variant: "danger",
        solid: true
      }
    );
    // Something happened in setting up the request that triggered an Error
    console.error("Error", error.message);
  } else {
    vueInstance.$bvToast.toast(
      "Sorry about that, feel free to open an issue on GitHub with all details that might be relevant",
      {
        title: "Unkown error",
        variant: "danger",
        solid: true
      }
    );
  }
};
