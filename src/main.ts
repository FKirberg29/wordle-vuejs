import { createApp } from "vue";
import "./style.css";
import App from "./App.vue";

import {createRouter, createWebHashHistory} from "vue-router";
import HelloWordleVue from "./components/HelloWordle.vue";
import LoginVue from "./components/Login.vue";
import SignupVue from "./components/Signup.vue";
import StatisticsVue from "./components/Statistics.vue";

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0OMmmKiL7hbzPxvzkHOR0QLRnOudQFq4",
  authDomain: "cis371-wordle-54824.firebaseapp.com",
  projectId: "cis371-wordle-54824",
  storageBucket: "cis371-wordle-54824.appspot.com",
  messagingSenderId: "184828852254",
  appId: "1:184828852254:web:5af0e1eede75d0e90b960f"
};

// Initialize Firebase
initializeApp(firebaseConfig);

const myComponentRoutes = [
    { path: "/", component: HelloWordleVue },
    { path: "/login", component: LoginVue },
    { path: "/signup", component: SignupVue },
    { path: "/statistics", component: StatisticsVue}
];

const myRouter = createRouter({routes: myComponentRoutes, history: createWebHashHistory()});

createApp(App)
    .use(myRouter)
    .mount("#app");
