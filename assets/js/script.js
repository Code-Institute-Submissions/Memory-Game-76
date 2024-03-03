const movesCounterElement = document.getElementById("moves-count");
const timeDisplayElement = document.getElementById("time");
const startButtonElement = document.getElementById("start");
const stopButtonElement = document.getElementById("stop");
const gameContainerElement = document.querySelector(".game-container");
const resultElement = document.getElementById("result");
const controlsContainerElement = document.querySelector(".controls-container");
const cardCountElement = document.querySelector("#total-count");
const headingElement = document.querySelector(".heading");
const descriptionElement = document.querySelector(".description");
let cardElements;
let intervalId;
let firstCardElement = false;
let secondCardElement = false;
let animationCount = 0;
let confettiTriggered = false;
let animationID;
let canClickFlag = true;
let cardMatchCounter = 0;
let secondsCount = 0,
  minutesCount = 0;
let movesCounterValue = 0,
  winCounterValue = 0;

//Items array
const itemsArray = [
  { name: "apple", image: "apple.png" },
  { name: "orange", image: "orange.png" },
  { name: "strawberry", image: "strawberry.png" },
  { name: "grapes", image: "grapes.png" },
  { name: "watermelon", image: "watermelon.png" },
  { name: "lemon", image: "lemon.png" },
  { name: "dragon-fruit", image: "dragon-fruit.png" },
  { name: "bananas", image: "bananas.png" },
  { name: "mango", image: "mango.png" },
  { name: "avocado", image: "avocado.png" },
  { name: "passion-fruit", image: "passion-fruit.png" },
  { name: "cherries", image: "cherries.png" },
];

//For timer
const timeUpdater = () => {
  secondsCount += 1;
  //minutes logic
  if (secondsCount >= 60) {
    minutesCount += 1;
    secondsCount = 0;
  }
  //format time before displaying
  let secondsValue = secondsCount < 10 ? `0${secondsCount}` : secondsCount;
  let minutesValue = minutesCount < 10 ? `0${minutesCount}` : minutesCount;
  timeDisplayElement.innerHTML = `<span>Time:</span>${minutesValue}:${secondsValue}`;
};

//For calculating moves
const updateMovesCounter = () => {
  movesCounterValue += 1;
  movesCounterElement.innerHTML = `<span>Moves:</span>${movesCounterValue}`;
};

//Pick random objects from the items array
const generateRandomItems = (size = 4) => {
  //temporary array
  let tempArray = [...itemsArray];
  //initializes cardValues array
  let cardValuesArray = [];
  //size should be double (4*4 matrix)/2 since pairs of objects would exist
  size = (size * size) / 2;
  //Random object selection
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * tempArray.length);
    cardValuesArray.push(tempArray[randomIndex]);
    //once selected remove the object from temp array
    tempArray.splice(randomIndex, 1);
  }
  return cardValuesArray;
};

const generateMatrix = (cardValuesArray, size = 4) => {
  gameContainerElement.innerHTML = "";
  cardValuesArray = [...cardValuesArray, ...cardValuesArray];
  //simple shuffle
  cardValuesArray.sort(() => Math.random() - 0.5);
  for (let i = 0; i < size * size; i++) {
    /*
                    Create Cards
                    before => front side (contains question mark)
                    after => back side (contains actual image);
                    data-card-values is a custom attribute which stores the names of the cards to match later
                  */
    gameContainerElement.innerHTML += `
     <div class="card-container" data-card-value="${cardValuesArray[i].name}">
        <div class="card-before">🤔</div>
        <div class="card-after">
        <img src="assets/images/${cardValuesArray[i].image}" class="image"/></div>
     </div>
     `;
  }
  //Grid
  gameContainerElement.style.gridTemplateColumns = `repeat(${size},auto)`;

  //Cards
  cardElements = document.querySelectorAll(".card-container");

  cardElements.forEach((cardElement) => {
    cardElement.addEventListener("click", () => {
      // If selected card is not matched yet then only run (i.e already matched card when clicked would be ignored)
      if (!cardElement.classList.contains("matched") && canClickFlag) {
        // Flip the clicked card
        cardElement.classList.add("flipped");

        // If it is the first card (!firstCardElement since firstCardElement is initially false)
        if (!firstCardElement) {
          // So the current card will become firstCardElement
          firstCardElement = cardElement;
          // Current card's value becomes firstCardElementValue
          firstCardElementValue = cardElement.getAttribute("data-card-value");
        } else if (cardElement !== firstCardElement) {
          // Increment moves since the user selected the second card
          updateMovesCounter();
          // secondCardElement and value
          secondCardElement = cardElement;
          let secondCardElementValue =
            cardElement.getAttribute("data-card-value");

          if (firstCardElementValue == secondCardElementValue) {
            // If both cards match, add matched class so these cards would be ignored next time
            firstCardElement.classList.add("matched");
            secondCardElement.classList.add("matched");

            // Card Match Count

            const matchedElements =
              document.querySelectorAll(".matched").length;

            if (matchedElements > 0 && matchedElements % 2 == 0) {
              cardMatchCounter++;
              cardCountElement.textContent = cardMatchCounter;
            }

            // Set firstCardElement to false since the next card would be the first now
            firstCardElement = false;
            // WinCounterValue increment as the user found a correct match
            winCounterValue += 1;
            // Check if winCounterValue == half of cardValuesArray
            if (winCounterValue == Math.floor(cardValuesArray.length / 2)) {
              // Check if confetti animation hasn't been triggered since the last win
              if (!confettiTriggered) {
                // Trigger confetti animation
                initConfetti();
                render();
                document.querySelector("#canvas").style.zIndex = "1";

                // Set the flag to true to indicate confetti animation has been triggered
                confettiTriggered = true;
              }

              // Display win message and handle other win-related logic
              resultElement.innerHTML = `<h2>You Won</h2><h4>Moves: ${movesCounterValue}</h4>`;
              stopGameFunction(); // Stop the game
            }
          } else {
            // If the cards don't match
            // Flip the cards back to normal
            let [tempFirst, tempSecond] = [firstCardElement, secondCardElement];
            firstCardElement = false;
            secondCardElement = false;
            canClickFlag = false; // Disable further clicks temporarily
            let delay = setTimeout(() => {
              tempFirst.classList.remove("flipped");
              tempSecond.classList.remove("flipped");
              canClickFlag = true; // Re-enable clicks after the cards are flipped back
            }, 700);
          }
        }
      }
    });
  });
};

// Heading and Description

//Start game
startButtonElement.addEventListener("click", () => {
  cardMatchCounter = 0;
  cardCountElement.textContent = "0";
  headingElement.style.display = "none";
  descriptionElement.style.display = "none";
  movesCounterValue = 0;
  secondsCount = 0;
  minutesCount = 0;
  //controls amd buttons visibility
  controlsContainerElement.classList.add("hide");
  stopButtonElement.classList.remove("hide");
  startButtonElement.classList.add("hide");
  //Start timer
  intervalId = setInterval(timeUpdater, 1000);
  //initial moves
  movesCounterElement.innerHTML = `<span>Moves:</span> ${movesCounterValue}`;
  initializerFunction();
});

//Stop game
stopButtonElement.addEventListener(
  "click",
  (stopGameFunction = () => {
    cardCountElement.textContent = "0";
    cardMatchCounter = 0;
    headingElement.style.display = "block";
    descriptionElement.style.display = "block";
    controlsContainerElement.classList.remove("hide");
    stopButtonElement.classList.add("hide");
    startButtonElement.classList.remove("hide");
    clearInterval(intervalId);
  })
);
//Initialize values and func calls
const initializerFunction = () => {
  resultElement.innerText = "";
  winCounterValue = 0;
  let cardValuesArray = generateRandomItems();
  generateMatrix(cardValuesArray);
  // Reset confettiTriggered flag
  confettiTriggered = false;
};

//-----------Var Inits--------------
canvas = document.getElementById("canvas");
ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
cx = ctx.canvas.width / 2;
cy = ctx.canvas.height / 2;

let confetti = [];
const confettiCount = 300;
const gravity = 0.5;
const terminalVelocity = 5;
const drag = 0.075;
const colors = [
  { front: "red", back: "darkred" },
  { front: "green", back: "darkgreen" },
  { front: "blue", back: "darkblue" },
  { front: "yellow", back: "darkyellow" },
  { front: "orange", back: "darkorange" },
  { front: "pink", back: "darkpink" },
  { front: "purple", back: "darkpurple" },
  { front: "turquoise", back: "darkturquoise" },
];

//-----------Functions--------------
resizeCanvas = () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cx = ctx.canvas.width / 2;
  cy = ctx.canvas.height / 2;
};

randomRange = (min, max) => Math.random() * (max - min) + min;

initConfetti = () => {
  for (let i = 0; i < confettiCount; i++) {
    confetti.push({
      color: colors[Math.floor(randomRange(0, colors.length))],
      dimensions: {
        x: randomRange(10, 20),
        y: randomRange(10, 30),
      },

      position: {
        x: randomRange(0, canvas.width),
        y: canvas.height - 1,
      },

      rotation: randomRange(0, 2 * Math.PI),
      scale: {
        x: 1,
        y: 1,
      },

      velocity: {
        x: randomRange(-25, 25),
        y: randomRange(0, -50),
      },
    });
  }
};

//---------Render-----------
render = () => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confetti.forEach((confetto, index) => {
    let width = confetto.dimensions.x * confetto.scale.x;
    let height = confetto.dimensions.y * confetto.scale.y;

    // Move canvas to position and rotate
    ctx.translate(confetto.position.x, confetto.position.y);
    ctx.rotate(confetto.rotation);

    // Apply forces to velocity
    confetto.velocity.x -= confetto.velocity.x * drag;
    confetto.velocity.y = Math.min(
      confetto.velocity.y + gravity,
      terminalVelocity
    );
    confetto.velocity.x += Math.random() > 0.5 ? Math.random() : -Math.random();

    // Set position
    confetto.position.x += confetto.velocity.x;
    confetto.position.y += confetto.velocity.y;

    // Delete confetti when out of frame
    if (confetto.position.y >= canvas.height) confetti.splice(index, 1);

    // Loop confetto x position
    if (confetto.position.x > canvas.width) confetto.position.x = 0;
    if (confetto.position.x < 0) confetto.position.x = canvas.width;

    // Spin confetto by scaling y
    confetto.scale.y = Math.cos(confetto.position.y * 0.1);
    ctx.fillStyle =
      confetto.scale.y > 0 ? confetto.color.front : confetto.color.back;

    // Draw confetti
    ctx.fillRect(-width / 2, -height / 2, width, height);

    // Reset transform matrix
    ctx.setTransform(1, 0, 0, 1, 0, 0);
  });

  if (animationCount > 1) {
    // Fire off another round of confetti
    if (confetti.length <= 10) {
      initConfetti();
      animationCount++;
    }
  }

  animationID = window.requestAnimationFrame(render);

  if (confetti.length == 0) {
    document.querySelector("#canvas").style.zIndex = "-1";
    window.cancelAnimationFrame(animationID);
  }

  console.log(confetti);
};
