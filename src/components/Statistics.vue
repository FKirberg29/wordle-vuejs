<script  setup lang="ts">
import { onMounted, ref, Ref, withDefaults} from 'vue';
import Chart from './Chart.vue';
import { Auth, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, collection, getDocs, DocumentData } from '@firebase/firestore';
import { initializeApp } from "firebase/app";

// My web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA0OMmmKiL7hbzPxvzkHOR0QLRnOudQFq4",
  authDomain: "cis371-wordle-54824.firebaseapp.com",
  projectId: "cis371-wordle-54824",
  storageBucket: "cis371-wordle-54824.appspot.com",
  messagingSenderId: "184828852254",
  appId: "1:184828852254:web:5af0e1eede75d0e90b960f"
};
// Initialize Firebase and Firestore DB
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

const updateTable = ref(0)
const isLoggedIn = ref(false)
var id = ""
var uid = ref("")
var auth: Auth
var displayName: string | null
onMounted(() => {
  auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    if (user) {
      isLoggedIn.value = true
      uid.value = user.uid
      if (user.displayName)
        displayName = user.displayName
      else
        displayName = user.email
    }
    else {
      isLoggedIn.value = false
    }
  })
})
auth = getAuth()
const user = auth.currentUser
if (user) {
  uid.value = user.uid
}

//Prevents uid from being lost on page refresh
console.log("LS: "+localStorage.getItem("uid"))
const notNull = localStorage.getItem("uid")
if (notNull)
  id = notNull

var arrayOfWordleGames: { date: any; attempts: any; gameWon: any; time: any; secretWordA: any; secretWordB: any; guessedWords: any; }[] = []
const querySnapshot = await getDocs(collection(db, "users", id, "wordleGameStats"));
querySnapshot.forEach((doc) => {
    //doc.data() is never undefined for query doc snapshots
    var date = doc.get("timeStampUTC")
    date = new Date(date)
    var attempts = doc.get("numAttempts")
    var gameWon = doc.get("gameWon")
    var time = doc.get("elapsedGameTime")
    var secretWordA = doc.get("secretWordA")
    var secretWordB = doc.get("secretWordB")
    var guessedWords = doc.get("guessedWords")
    guessedWords = guessedWords.splice(0, attempts)
    let wordleGame = {
        date: date,
        gameWon: gameWon,
        attempts: attempts,
        time: time,
        secretWordA: secretWordA,
        secretWordB: secretWordB,
        guessedWords: guessedWords
    }
    arrayOfWordleGames.push(wordleGame)
});

const columnNames = [ 'Date/Time', 'Game Won', 'Num of Attempts', 'Game Time in Seconds', 'Secret Word A', 'Secret Word B', 'Guessed Words']

function sortByDate() {
    arrayOfWordleGames = arrayOfWordleGames.sort((a, b) => {
        return a.date.getTime() - b.date.getTime();
    });
    updateTable.value++
}

function sortByTime() {
    arrayOfWordleGames = arrayOfWordleGames.sort((a, b) => {
        return a.time - b.time;
    });
    updateTable.value++
}

function sortByAttempts() {
    arrayOfWordleGames = arrayOfWordleGames.sort((a, b) => {
        return a.attempts - b.attempts;
    });
    updateTable.value++
}
</script>

<template>
    <h2>Statistics</h2>
    <button @mousedown="sortByDate">Sort by Date</button>
    <button @mousedown="sortByTime">Sort by Time</button>
    <button @mousedown="sortByAttempts">Sort by Attempts</button>
    <table class="stats-table" :key="updateTable">
      <thead>
          <tr>
              <th v-for="column in columnNames">{{column}}</th>
          </tr>
      </thead>
      <tbody>
          <tr v-for="x,i in arrayOfWordleGames">
              <td v-for="y,j in arrayOfWordleGames[i]">{{y}}</td>
          </tr>
      </tbody>
    </table>
    <Chart></Chart>
</template>