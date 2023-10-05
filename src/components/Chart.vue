<script setup lang="ts">
import { initializeApp } from '@firebase/app';
import { Auth, getAuth, onAuthStateChanged } from '@firebase/auth';
import { getFirestore, getDocs, collection } from '@firebase/firestore';
import { Chart, ChartConfiguration, ChartItem } from 'chart.js/auto'
import { onMounted, ref } from 'vue';


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
console.log("LS2: "+localStorage.getItem("uid"))
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

var attemptsArray = [0,0,0,0,0]
for (let x of arrayOfWordleGames) {
  attemptsArray[x.attempts-2]++
}

const chartLabels = [2,3,4,5,6]

const data = {
    labels: chartLabels,
    datasets: [{
        label: "Number of Attempts in a Game",
        backgroundColor: "rgb(204, 109, 0)",
        borderColor: "rgb(204, 109, 0)",
        xAxisID: "x",
        yAxisID: "y",
        data: attemptsArray,
    }]
}

const config: ChartConfiguration = {
    type: 'bar',
    data: data,
    options: {
        scales: {
            y: {
                min: 0,
                max: 10,
                title: {
                    display: true,
                    text: '# of Games',
                },
                ticks: {
                    stepSize: 1,
                }
            },
            x: {
                title: {
                    display: true,
                    text: '# of Attempts',
                }
            }
        }
    }
}

onMounted(() => {
    const canvasTag = <ChartItem>document.getElementById('bar-chart')
    const barChart = new Chart(canvasTag, config)
})
</script>

<template>
    <div class="outer-chart">
        <canvas id="bar-chart" height="400" width="400"></canvas>
    </div>
</template>