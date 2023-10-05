<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { Auth, getAuth, onAuthStateChanged, signOut } from "firebase/auth";

const router = useRouter()
const isLoggedIn = ref(false)
const uid = ref("")
var auth: Auth
var displayName: string | null
onMounted(() => {
  auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true
      uid.value = user.uid
      localStorage.setItem("uid", user.uid)
      if (user.displayName)
        displayName = user.displayName
      else
        displayName = user.email
    }
    else {
      isLoggedIn.value = false
    }
    console.log("App Logged In: "+ isLoggedIn.value)
    console.log("App UID: " + uid.value)
  })
})

const logOut = () => {
    signOut(auth)
}
</script>

<template>
  <nav>
    <RouterLink to="/" class="nav-bar-item">Home</RouterLink>
    <RouterLink to="/statistics" class="nav-bar-item" v-if="isLoggedIn">Statistics</RouterLink>
    <RouterLink to="/" class="nav-bar-item" @click="logOut" v-if="isLoggedIn">Log Out</RouterLink>
    <div class="nav-bar-item" v-if="isLoggedIn"></div>
    <RouterLink to="/login" class="nav-bar-item" v-else>Login</RouterLink>
    <div class="nav-bar-item" v-if="isLoggedIn"></div>
    <RouterLink to="/signup" class="nav-bar-item" v-else>Sign Up</RouterLink>
  </nav>
  <p v-if="isLoggedIn">{{ displayName }} is logged in.</p>
  <h1>Welcome</h1>
  <Suspense>
  <router-view></router-view>
  </Suspense>
  <h3>My word matching algorithm:</h3>
  <p>For my word matching algorithm, I created an object to keep track
    of various attributes such as the secret word, the current word being guessed,
    the index of all the words, and the words of each row and their index and matching condition.
    I used these attributes, so that when "Enter" or "Check" were press, the program would first make store a copy of the guess
    word to keep track of in tempRow. Then the program used a loop to check if each letter was a perfect match (same letter and position) of the secret 
    word and if so changed the letter's corresponding condition tracker to 'p' and the letter in tempRowWord to an arbitrary character of '1'.
    Then it would make a second pass to check for misplaced letters which it did by using a nested loop to check each letter against every single other
    letter in the secret word as well as making sure the corresponding letter in the tempRowWord is not a '1'. If such an occurence is found a checked boolean is set to true
    to ensure that the same index position letter does not get checked multiple times per word. Doing these checks in this order allows for the program to account
    for guess words with double or more letters where the secret word has less than that amount of that particular letter.
    By checking potential misplaced matches against the tempRowWord string, which has any matched letters replaced with a '1' character, the program
    does not accidently report multiple misplaced letters in the case that the guess word has multiple of a letter that the secret word only has one of.
    For example, in the case where the secret word is "DOLLY" and the guess word is "BUDDY", the program will only mark the first 'D' in "BUDDY" 
    as misplaced. Finally, a third pass is made that sets all the remaining letters to incorrect, or 'i' in the tracker.
  </p>
  <p>Once the three passes have completed, the program calls the checkGame() function, which stops the game
    and displays a win message if the current row's letters all have the condition 'p'. If the word is not a match,
    the game continues on to the next row by incrementing the indexes and reseting the word trackers, unless the final
    row was just played, in which case the game stops and displays a game over message.
  </p>
  <br>
  <h3>My Vue3 techniques for building the grid:</h3>
  <p>To build my grid I first created a new Vue file and component which would handle each tile of the 6x5 grid and would contain a letter
    and the correct tile color scheme for that letter. The tile component used a prop with default values to initialize each tile as a blank
    tile with a transparent background color. In the div of the tile component I used a flex display CSS style to keep the letters uniform and 
    centered in each tile. I then used a div with a gridbox CSS style in the HelloWordle component to hold 6 rows of these tiles, which are
    dynamically passed their corresponding letter to be displayed and also a code value that would determine what color scheme
    to display based on the accuracy of the letter placement. Due to the .board-grid CSS style the tiles were placed in a
    uniform 6x5 grid.
  </p>
</template>

<script>
  
</script>