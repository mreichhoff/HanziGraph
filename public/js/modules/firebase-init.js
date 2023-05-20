import { initializeApp } from "firebase/app";

const firebaseConfig = {
    apiKey: "AIzaSyCSwqkjJjpr42k7-uwS-u17TU4QyUv_N8I",
    authDomain: "japanesegraph.com",
    databaseURL: "https://japanesegraph-default-rtdb.firebaseio.com",
    projectId: "japanesegraph",
    storageBucket: "japanesegraph.appspot.com",
    messagingSenderId: "337410493736",
    appId: "1:337410493736:web:d21b8cc57ed2058660541d"
};

let initialize = function () {
    initializeApp(firebaseConfig);
};

export { initialize }