import { initializeApp } from "firebase/app";

// This is not sensitive data, but should be
// moved to environment variables.
// See https://stackoverflow.com/a/37484053.
const firebaseConfig = {
    apiKey: "AIzaSyAddUF68m2igTa-JmIblbZUjmx1CE3xwdQ",
    authDomain: "hanzigraph.com",
    projectId: "hanzigraph",
    storageBucket: "hanzigraph.appspot.com",
    messagingSenderId: "317168591112",
    appId: "1:317168591112:web:5b4580943b370526888cbd",
    databaseURL: "https://hanzigraph.firebaseio.com"
};

let initialize = function () {
    initializeApp(firebaseConfig);
};

export { initialize }