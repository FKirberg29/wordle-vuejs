<script  setup lang="ts">
    import { ref } from "vue";
    import { getAuth, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    import { useRouter } from "vue-router";
    const router = useRouter()
    const email = ref("");
    const password = ref("");
    const errorMessage = ref()
    const googleProvider = new GoogleAuthProvider()

    const register = () => {
        signInWithEmailAndPassword(getAuth(), email.value, password.value)
            .then((data) => {
                console.log("User logged in successfully")
                router.push("/")
            })
            .catch((error) => {
                console.log(error.code)
                if (error.code == "auth/invalid-email")
                    errorMessage.value = "Invalid email"
                else if (error.code == "auth/user-not-found")
                    errorMessage.value = "Account does not exist"
                else if (error.code == "auth/wrong-password")
                    errorMessage.value = "Password is incorrect"
                else
                    errorMessage.value = "Email or password is incorrect"
                
            })
    };

    const signInWithGoogle = () => {
        signInWithPopup(getAuth(), googleProvider)
            .then((data) => {
                console.log("Google user logged in successfully")
                router.push("/")
            })
            .catch((error) => {
                console.log("Google Sign In Error Occured")
            })
    };
</script>

<template>
    <h2>Log In</h2>
    <p><input type="text" placeholder="Email" v-model="email" /></p>
    <p><input type="text" placeholder="Password" v-model="password" /></p>
    <p v-if="errorMessage">{{ errorMessage }}</p>
    <p><button @click="register">Submit</button></p>
    <p><button @click="signInWithGoogle">Sign In With Google</button></p>
</template>