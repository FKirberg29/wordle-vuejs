<script  setup lang="ts">
    import { ref } from "vue";
    import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
    import { useRouter } from "vue-router";
    const router = useRouter()
    const email = ref("");
    const password = ref("");

    const register = () => {
        createUserWithEmailAndPassword(getAuth(), email.value, password.value)
            .then((data) => {
                console.log("User registered successfully")
                router.push("/")
            })
            .catch((error) => {
                console.log(error.code)
                alert(error.message)
            })
    };

    const signInWithGoogle = () => {

    };
</script>

<template>
    <h2>Sign Up</h2>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <p><input type="text" placeholder="Password" v-model="password" /></p>
    <p><button @click="register">Submit</button></p>
    <p><button @click="signInWithGoogle">Sign In With Google</button></p>
</template>