<script setup lang="ts">
import { time, timeStamp } from 'console';
import axios, { AxiosResponse } from 'axios';
import { onMounted, ref, Ref, reactive, withDefaults } from 'vue';
import Timer from './Timer.vue';
import WordleTile from './WordleTile.vue';
import { Auth, getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, collection, addDoc } from "firebase/firestore"
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
      if (user.displayName)
        displayName = user.displayName
      else
        displayName = user.email
    }
    else {
      isLoggedIn.value = false
    }
    console.log("Wordle Logged In: "+ isLoggedIn.value)
    console.log("Wordle UID: " + uid.value)
  })
})

const date = new Date()
const gameName = ref("Wordle Clone")
const timerKey = ref(0)
var gameStartTime = Date.now()
var perfectColor = "Green"
var misplacedColor = "Yellow"
var incorrectColor = "Gray"

// List of words commented out and instead request from server
// const gameWords = ["books", "brown", "hello", "video", "water", "anger", "racer", "paper", "maker", "cakes", "lakes", "chase", "spoon", "fluff", "tough", "typer"]
var allowInput = true
var allowInputA = true
var allowInputB = true
var boardACorrect = false
var boardBCorrect = false
var checkButtonDisabled = false
var serverSolutionWordA = ""
var serverSolutionWordB = ""
var serverURL = "https://wordle-expressjs-server.onrender.com"

type WordleResponse = {
    solutionA: string,
    solutionB: string
}

const documentData = {
  secretWordA: ref(""),
  secretWordB: ref(""),
  numAttempts: ref(0),
  guessedWords: ref(["", "", "", "", ""]),
  gameWon: ref(true),
  elapsedGameTime: ref(2),
  timeStampUTC: ref(2)
}

const wordCheckerA = reactive({
  solutionWord: "",
  guessWord: ref(""),
  guessWordRowIndex: 0,
  guessWordIndex: 0,
  tempRowWord: "22222",
  rowWord: ["", "", "", "", "", ""],
  rowWordCondition: ["xxxxx", "xxxxx", "xxxxx", "xxxxx", "xxxxx", "xxxxx"]
})

const wordCheckerB = reactive({
  solutionWord: "",
  guessWord: ref(""),
  guessWordRowIndex: 0,
  guessWordIndex: 0,
  tempRowWord: "22222",
  rowWord: ["", "", "", "", "", ""],
  rowWordCondition: ["xxxxx", "xxxxx", "xxxxx", "xxxxx", "xxxxx", "xxxxx"]
})

// Commented out solution word assignment for server-based assignment
// wordCheckerA.solutionWord = gameWords[Math.floor(Math.random() * gameWords.length)]
// wordCheckerB.solutionWord = gameWords[Math.floor(Math.random() * gameWords.length)]
await getSolutionWordFromServer()
wordCheckerA.solutionWord = serverSolutionWordA
wordCheckerB.solutionWord = serverSolutionWordB

const keyBoardInput = (input: KeyboardEvent) => handleKeyBoardInput(input.key)
window.addEventListener('keyup', keyBoardInput)

function handleKeyBoardInput(input: string) {
  if (allowInput && allowInputA) {
    if (input === "Enter" && wordCheckerA.guessWord.length == 5) {
      if (wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex][5] != "") {
        //Check for perfects
        wordCheckerA.tempRowWord = wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex]
        for (let i = 0; i < wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex].length; i++) {
          if (wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex][i] === wordCheckerA.solutionWord[i]) {
            const charArray = [...wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex]]
            charArray[i] = "p"
            wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex] = charArray.join('')
            const tempArray = [...wordCheckerA.tempRowWord]
            tempArray[i] = '1'
            wordCheckerA.tempRowWord = tempArray.join('')
          }
        }
        //Check for misplaced
        var checked = false
        for (let i = 0; i < wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex].length; i++) {
          console.log("------------")
          console.log("tempWord: "+wordCheckerA.tempRowWord)
          console.log("rowWordCond: "+wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex])
          checked = false
          for (let j = 0; j < wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex].length; j++) {
            if (!checked && i != j && wordCheckerA.tempRowWord[i] === wordCheckerA.solutionWord[j] && wordCheckerA.tempRowWord[j] != '1') {
              console.log("Checking letter index("+i+") for the ("+j+") time and checked="+checked)
              const charArray = [...wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex]]
              charArray[i] = "m"
              wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex] = charArray.join('')
              const tempArray = [...wordCheckerA.tempRowWord]
              tempArray[j] = '1'
              console.log("tempArray: "+tempArray)
              wordCheckerA.tempRowWord = tempArray.join('')
              checked = true
            }
          }
        }
        //Set the rest to incorrect
        for (let i = 0; i < wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex].length; i++) {
          if (wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex][i] == "x") {
            const charArray = [...wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex]]
            charArray[i] = "i"
            wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex] = charArray.join('')
          }
        }
        
        checkGame()
        wordCheckerA.guessWord = ""
        wordCheckerA.guessWordIndex = 0
        wordCheckerA.guessWordRowIndex++
      }
    } else if (input === "Backspace") {
      wordCheckerA.guessWord = wordCheckerA.guessWord.slice(0, -1)
      wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex] = wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex].slice(0, -1)
      if (wordCheckerA.guessWordIndex > 0 && wordCheckerA.guessWord[0] != "")
        wordCheckerA.guessWordIndex--
    } else if (/^[a-z]$/i.test(input) && wordCheckerA.guessWord.length < 5) {
      wordCheckerA.guessWord += input
      wordCheckerA.rowWord[wordCheckerA.guessWordRowIndex] += input
      wordCheckerA.guessWordIndex++
    }
  }

  //Board B
  if (allowInput && allowInputB) {
    if (input === "Enter" && wordCheckerB.guessWord.length == 5) {
      if (wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex][5] != "") {
        //Check for perfects
        wordCheckerB.tempRowWord = wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex]
        for (let i = 0; i < wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex].length; i++) {
          if (wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex][i] === wordCheckerB.solutionWord[i]) {
            const charArray = [...wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex]]
            charArray[i] = "p"
            wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex] = charArray.join('')
            const tempArray = [...wordCheckerB.tempRowWord]
            tempArray[i] = '1'
            wordCheckerB.tempRowWord = tempArray.join('')
          }
        }
        //Check for misplaced
        var checked = false
        for (let i = 0; i < wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex].length; i++) {
          console.log("------------")
          console.log("tempWord: "+wordCheckerB.tempRowWord)
          console.log("rowWordCond: "+wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex])
          checked = false
          for (let j = 0; j < wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex].length; j++) {
            if (!checked && i != j && wordCheckerB.tempRowWord[i] === wordCheckerB.solutionWord[j] && wordCheckerB.tempRowWord[j] != '1') {
              console.log("Checking letter index("+i+") for the ("+j+") time and checked="+checked)
              const charArray = [...wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex]]
              charArray[i] = "m"
              wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex] = charArray.join('')
              const tempArray = [...wordCheckerB.tempRowWord]
              tempArray[j] = '1'
              console.log("tempArray: "+tempArray)
              wordCheckerB.tempRowWord = tempArray.join('')
              checked = true
            }
          }
        }
        //Set the rest to incorrect
        for (let i = 0; i < wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex].length; i++) {
          if (wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex][i] == "x") {
            const charArray = [...wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex]]
            charArray[i] = "i"
            wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex] = charArray.join('')
          }
        }
        
        checkGame()
        wordCheckerB.guessWord = ""
        wordCheckerB.guessWordIndex = 0
        wordCheckerB.guessWordRowIndex++
      }
    } else if (input === "Backspace") {
      wordCheckerB.guessWord = wordCheckerB.guessWord.slice(0, -1)
      wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex] = wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex].slice(0, -1)
      if (wordCheckerB.guessWordIndex > 0 && wordCheckerB.guessWord[0] != "")
        wordCheckerB.guessWordIndex--
    } else if (/^[a-z]$/i.test(input) && wordCheckerB.guessWord.length < 5) {
      wordCheckerB.guessWord += input
      wordCheckerB.rowWord[wordCheckerB.guessWordRowIndex] += input
      wordCheckerB.guessWordIndex++
    }
  }
  //Disable game if maximum attempts has been reached
  if (allowInput) {
    if (wordCheckerA.guessWordRowIndex > 5 || wordCheckerB.guessWordRowIndex > 5 && allowInput == true) {
      allowInput = false
      checkButtonDisabled = true
      saveDataToFirebase(false)
      setTimeout(()=> {
          alert("Game Over")
      },500);
    }
  }
}

async function newGame() {
  await getSolutionWordFromServer()
  gameStartTime = Date.now()
  //Reset Board A
  // Commented out client-based solution word generator for server-based
  // wordCheckerA.solutionWord = gameWords[Math.floor(Math.random() * gameWords.length)]
  wordCheckerA.solutionWord = serverSolutionWordA
  wordCheckerA.guessWord = ""
  wordCheckerA.guessWordIndex = 0
  wordCheckerA.guessWordRowIndex = 0
  for (let i = 0; i < wordCheckerA.rowWord.length; i++) {
    wordCheckerA.rowWord[i] = ""
    wordCheckerA.rowWordCondition[i] = "xxxxx"
  }
  allowInputA = true
  boardACorrect = false
  //Reset Board B
  // Commented out client-based solution word generator for server-based
  // wordCheckerB.solutionWord = gameWords[Math.floor(Math.random() * gameWords.length)]\
  wordCheckerB.solutionWord = serverSolutionWordB
  wordCheckerB.guessWord = ""
  wordCheckerB.guessWordIndex = 0
  wordCheckerB.guessWordRowIndex = 0
  for (let i = 0; i < wordCheckerB.rowWord.length; i++) {
    wordCheckerB.rowWord[i] = ""
    wordCheckerB.rowWordCondition[i] = "xxxxx"
  }
  allowInputB = true
  boardBCorrect = false
  allowInput = true
  checkButtonDisabled = false
  timerKey.value++
}

function checkGameButton() {
  handleKeyBoardInput("Enter")
}

function checkGame() {
  if (wordCheckerA.rowWordCondition[wordCheckerA.guessWordRowIndex] == "ppppp") {
    allowInputA = false
    boardACorrect = true
  }
  if (wordCheckerB.rowWordCondition[wordCheckerB.guessWordRowIndex] == "ppppp") {
    allowInputB = false
    boardBCorrect = true
  }
  console.log("Board A Correct: "+boardACorrect)
  console.log("Board B Correct: "+boardBCorrect)
  if (boardACorrect && boardBCorrect) {
    allowInput = false
    checkButtonDisabled = true
    saveDataToFirebase(true)
    setTimeout(()=> {
         alert("You Win!")
      },500);
  }
}

function changeStyleSheetRule(selector: string, value: string) {
    const styleSheet = document.styleSheets[0]
    for(var i = 0; i < styleSheet.cssRules.length; i++) {
        if(styleSheet.cssRules[i].cssText.includes(selector)) {
          styleSheet.deleteRule(i)
          styleSheet.insertRule(selector+" { color: white; background-color: "+value+"}", i)
        }
    }
}

function updateColors() {
      perfectColor = (<HTMLInputElement>document.getElementById("perfectColor")).value
      misplacedColor = (<HTMLInputElement>document.getElementById("misplacedColor")).value
      incorrectColor = (<HTMLInputElement>document.getElementById("incorrectColor")).value
      changeStyleSheetRule(".p", perfectColor)
      changeStyleSheetRule(".m", misplacedColor)
      changeStyleSheetRule(".i", incorrectColor)
}

function saveDataToFirebase(gameWon: boolean) {
  //The secret words
  documentData.secretWordA.value = wordCheckerA.solutionWord
  documentData.secretWordB.value = wordCheckerB.solutionWord
  //The words used by the user in their attempts to find the secret word
  let aWords = wordCheckerA.rowWord.filter(a => a !== "")
  let bWords = wordCheckerB.rowWord.filter(a => a !== "")
  if (aWords.length >= bWords.length) {
    documentData.guessedWords.value = wordCheckerA.rowWord
    documentData.numAttempts.value = wordCheckerA.guessWordRowIndex
  }
  else {
    documentData.guessedWords.value = wordCheckerB.rowWord
    documentData.numAttempts.value = wordCheckerB.guessWordRowIndex
  }
  if (aWords.length == bWords.length)
    documentData.numAttempts.value -= 1
  if (gameWon)
    documentData.numAttempts.value += 1
  //If the player won/lost the game
  documentData.gameWon.value = gameWon
  //The total time (in seconds) for the user to win (or lose) the game
  documentData.elapsedGameTime.value = Math.floor((Date.now() - gameStartTime) / 1000)
  //The date/time of the player starts the game
  documentData.timeStampUTC.value = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), date.getUTCHours(), date.getUTCMinutes(), date.getUTCSeconds());
  var localDate = new Date(documentData.timeStampUTC.value)

  console.log(documentData.secretWordA.value)
  console.log(documentData.secretWordB.value)
  console.log(documentData.numAttempts)
  console.log(documentData.guessedWords.value)
  console.log(documentData.gameWon.value)
  console.log(documentData.elapsedGameTime.value)
  console.log(documentData.timeStampUTC.value)
  console.log(localDate)

  //If a user is logged in send the data to Firebase using the uid.
  if (isLoggedIn.value) {
    const docData = {
      timeStampUTC: documentData.timeStampUTC.value,
      gameWon: documentData.gameWon.value,
      numAttempts: documentData.numAttempts.value,
      elapsedGameTime: documentData.elapsedGameTime.value,
      secretWordA: documentData.secretWordA.value,
      secretWordB: documentData.secretWordB.value,
      guessedWords: documentData.guessedWords.value
    }
    const wordleCollection = collection(db, "users", uid.value, "wordleGameStats")
    addDoc(wordleCollection, docData);
  }
}

async function getSolutionWordFromServer() {
  // Using Render.com url
  console.log("Retrieving solution words from " + serverURL)
  await axios.request({method: "GET", url: serverURL})
  .then((res:AxiosResponse) => res.data)
  .then((w: WordleResponse) => {
    console.log(`The secret word for board A from the server is ${w.solutionA}`)
    console.log(`The secret word for board B from the server is ${w.solutionB}`)
    serverSolutionWordA = w.solutionA
    serverSolutionWordB = w.solutionB
  })
}
</script>

<template>
  <p>My CIS 371 {{ gameName }}</p>
  <p>By Fabian Kirberg</p>
  <Timer :key="timerKey"></Timer>

  <div class="boards-flex">
    <div class="boardA" style="margin-right: 153px;">Board A</div>
    <div class="boardB" style="margin-left: 153px;">Board B</div>
  </div>
  <div class="boards-flex">
    <div id="board-grid" class="boardA">
      <WordleTile v-for="n in 5" :letter="wordCheckerA.rowWord[0][n-1]" :color-code="wordCheckerA.rowWordCondition[0][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerA.rowWord[1][n-1]" :color-code="wordCheckerA.rowWordCondition[1][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerA.rowWord[2][n-1]" :color-code="wordCheckerA.rowWordCondition[2][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerA.rowWord[3][n-1]" :color-code="wordCheckerA.rowWordCondition[3][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerA.rowWord[4][n-1]" :color-code="wordCheckerA.rowWordCondition[4][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerA.rowWord[5][n-1]" :color-code="wordCheckerA.rowWordCondition[5][n-1]"></WordleTile>
    </div>
    <div id="board-grid" class="boardB">
      <WordleTile v-for="n in 5" :letter="wordCheckerB.rowWord[0][n-1]" :color-code="wordCheckerB.rowWordCondition[0][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerB.rowWord[1][n-1]" :color-code="wordCheckerB.rowWordCondition[1][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerB.rowWord[2][n-1]" :color-code="wordCheckerB.rowWordCondition[2][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerB.rowWord[3][n-1]" :color-code="wordCheckerB.rowWordCondition[3][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerB.rowWord[4][n-1]" :color-code="wordCheckerB.rowWordCondition[4][n-1]"></WordleTile>
      <WordleTile v-for="n in 5" :letter="wordCheckerB.rowWord[5][n-1]" :color-code="wordCheckerB.rowWordCondition[5][n-1]"></WordleTile>
    </div>
  </div>

  <button @mousedown="newGame">New Game</button>
  <button @mousedown="checkGameButton" :disabled="checkButtonDisabled">Check</button>
  <div class="color-selector-grid">
    <h3 class="csg1">Background Color Selector</h3>
    <div class="csg2 color-selector">
      <div >Perfect Match:</div>
      <select id="perfectColor" @change="updateColors()">
        <option value="green">Green</option>
        <option value="blue">Blue</option>
        <option value="purple">Purple</option>
      </select>
      </div>
    <div class="csg3 color-selector">
      <div>Misplaced Match:</div>
      <select id="misplacedColor" @change="updateColors()">
        <option value="gold">Yellow</option>
        <option value="orange">Orange</option>
        <option value="pink">Pink</option>
      </select>
    </div>
    <div class="csg4 color-selector">
      <div>Missing:</div>
      <select id="incorrectColor" @change="updateColors()">
        <option value="gray">Gray</option>
        <option value="red">Red</option>
        <option value="black">Black</option>
      </select>
    </div>
  </div>
  <div>
    <p>Mouse over to reveal the secret word for board A: </p>
    <span class="hidden">{{ wordCheckerA.solutionWord }}</span>
  </div>
  <div>
    <p>Mouse over to reveal the secret word for board B: </p>
    <span class="hidden">{{ wordCheckerB.solutionWord }}</span>
  </div>
</template>