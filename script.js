// Selecting DOM elements
const gameContainer = document.getElementById("game-container");
const player = document.getElementById("player");
const startButton = document.getElementById("start-button");
const timerDisplay = document.getElementById("timer");
const finishLine = document.getElementById("finish-line");
const gameMusic = document.getElementById("game-music");
const homeScreen = document.getElementById("home-screen");
const instructionsScreen = document.getElementById("instructions-screen");
const instructionsButton = document.getElementById("instructions-button");
const homeButton = document.getElementById("home-button");

let gameActive = false; // Game state flag
let timer = 60; // Countdown timer
let greenLight = true; // Indicates whether it is green light
let movementInterval; // Interval for player movement checks
let lightInterval; // Interval for alternating lights
let countdownInterval; // Interval for countdown timer

// Show instructions screen when instructions button is clicked
instructionsButton.addEventListener("click", () => {
    homeScreen.style.display = "none"; // Hide home screen
    instructionsScreen.style.display = "flex"; // Show instructions screen
});

// Show home screen when home button is clicked
homeButton.addEventListener("click", () => {
    instructionsScreen.style.display = "none"; // Hide instructions screen
    homeScreen.style.display = "flex"; // Show home screen
});
// Start button click event listener
startButton.addEventListener("click", () => {
    homeScreen.style.display = "none"; // Hide home screen
    gameActive = true; // Activate game
    initializeGame(); // Start game logic
});

//music handling
function playMusicAndStartLights() {
    console.log("playMusicAndStartLights() called"); // Debugging log
    gameMusic.currentTime = 0; // Reset music to start
    gameMusic.play(); // Play the music for 5 seconds
    console.log("Music started"); // Debugging log
    document.getElementById("enemy").style.backgroundImage = "url('doll.png')"; // Set green image
    greenLight = true; // Set light to green
    gameContainer.style.backgroundColor = "#d4ffd4"; // Change background color to green

    // After 5 seconds, switch to red light
    setTimeout(() => {
        console.log("Switching to red light"); // Debugging log
        gameMusic.pause(); // Pause the music after 5 seconds
        gameMusic.currentTime = 0; // Reset music to start
        greenLight = false; // Set light to red
        gameContainer.style.backgroundColor = "#ffcccc"; // Change background color to red
        document.getElementById("enemy").style.backgroundImage = "url('dollfront.png')"; // Set red image

        // After 2 seconds, switch back to green light
        setTimeout(() => {
            console.log("Switching to green light"); // Debugging log
            greenLight = true; // Set light to green
            gameContainer.style.backgroundColor = "#d4ffd4"; // Change background color to green
            document.getElementById("enemy").style.backgroundImage = "url('doll.png')"; // Set green image
            playMusicAndStartLights(); // Play the music again for 5 seconds
        }, 2000);
    }, 5000);
}

// Game initialization
function initializeGame() {
    startCountdown(); // Start timer
    playMusicAndStartLights(); // Start music and light changes
}

// Function to start the countdown timer
function startCountdown() {
    countdownInterval = setInterval(() => {
        timer--;
        timerDisplay.textContent = `Time: ${timer}`;

        // Lose condition: Time runs out before any player reaches the finish line
        if (timer <= 0) {
            const players = document.querySelectorAll('.player');
            let anyPlayerAtFinishLine = false;

            players.forEach((player) => {
                const playerBottom = parseInt(window.getComputedStyle(player).bottom, 10);
                const finishLineTop = gameContainer.clientHeight - 50;

                if (playerBottom >= finishLineTop) {
                    anyPlayerAtFinishLine = true;
                }
            });

            if (!anyPlayerAtFinishLine) {
                endGame("Time's Up! You Lose!");
            }
        }
    }, 1000);
}

// Light alternation logic
function alternateLights() {
    lightInterval = setInterval(() => {
        if (greenLight) {
            gameContainer.style.backgroundColor = "#d4ffd4"; // Keep background green
        } else {
            gameContainer.style.backgroundColor = "#ffcccc"; // Keep background red
        }
    }, 3000); // Change light every 3 seconds
}

// Define an array to hold the speed of each player
const playerSpeeds = Array.from({ length: 6 }, () => Math.floor(Math.random() * 3) + 1); // Random speed between 1 and 5 pixels

window.addEventListener("keydown", (e) => {
    if (!gameActive) return; // Ignore movement if game inactive

    // Check if the light is red
    if (!greenLight && e.key === "ArrowUp") {
        // Eliminate the player who moved during red light
        const players = document.querySelectorAll('.player');
        players.forEach((player) => {
            const currentBottom = parseInt(window.getComputedStyle(player).bottom, 10);
            // If the specific player is moving during red light, eliminate them
            if (currentBottom > 0 && player.style.display !== 'none') {
                player.style.display = 'none'; // Hide only the player who moved
                const playerId = player.id; // Get the ID of the eliminated player
                console.log(`Player with ID ${playerId} eliminated.`); // Log the eliminated player ID
                // Set the speed to 0 for the eliminated player
                const index = parseInt(playerId.replace('player', '')) - 1; // Extract index from ID
                playerSpeeds[index] = 0; // Set speed to 0 to prevent further movement
            }
        });

        // Immediately check if all players are eliminated
        checkWinCondition();
        return; // Exit the function to prevent further movement
    }

    // Move each player when the ArrowUp key is pressed
    if (e.key === "ArrowUp") {
        const players = document.querySelectorAll('.player');
        players.forEach((player, index) => {
            const currentBottom = parseInt(window.getComputedStyle(player).bottom, 10); // Get current bottom position
            const gameContainerHeight = gameContainer.clientHeight; // Get the height of the game container

            // Check if the player can move without going out of bounds
            if (currentBottom + playerSpeeds[index] < gameContainerHeight - 48) { // 50 is the height of the finish line
                player.style.bottom = `${currentBottom + playerSpeeds[index]}px`; // Move player up by their respective speed
            }
        });

        // Check win condition after moving players
        checkWinCondition();
    }
});

function endGame(message) {
    clearInterval(countdownInterval); // Stop the timer
    clearInterval(lightInterval); // Stop the light alternation
    gameMusic.pause(); // Pause the music
    gameMusic.currentTime = 0; // Reset music to start
    gameActive = false; // Set game state to inactive

    // Deactivate the game container
    gameContainer.style.pointerEvents = "none"; // Disable interactions
    gameContainer.style.opacity = "0.5"; // Dim the game container

    // Stop the doll movement
    document.getElementById("enemy").style.backgroundImage = "url('doll.png')"; // Set doll image to static
    clearInterval(movementInterval); // Stop the doll movement

    // Show the in-game screen with the replay button
    if (message.includes("You Win")) {
        document.getElementById("end-game-message").textContent = message; // Set win message
        document.getElementById("end-game-screen").style.display = "flex"; // Show win screen
    } else {
        document.getElementById("lose-game-message").textContent = message; // Set lose message
        document.getElementById("lose-game-screen").style.display = "flex"; // Show lose screen
    }
}

function resetGame() {
    console.log("resetGame() called"); // Debugging log
    timer = 60; // Reset timer
    timerDisplay.textContent = `Time: ${timer}`; // Update timer display

    // Reset player positions and visibility
    const players = document.querySelectorAll('.player');
    players.forEach(player => {
        player.style.display = 'block'; // Show player
        player.style.bottom = '10px'; // Reset position
    });

    // Reset player speeds
    for (let i = 0; i < playerSpeeds.length; i++) {
        playerSpeeds[i] = Math.floor(Math.random() * 3) + 1; // Random speed between 1 and 3
    }

    // Hide end-game and lose screens
    document.getElementById("end-game-screen").style.display = "none";
    document.getElementById("lose-game-screen").style.display = "none";

    // Reactivate the game container
    gameContainer.style.pointerEvents = "auto"; // Enable interactions
    gameContainer.style.opacity = "1"; // Restore full opacity

    // Reset game state
    gameActive = true; // Set game active
    startCountdown(); // Restart the countdown
    gameMusic.currentTime = 0; // Reset music to start
    playMusicAndStartLights(); // Restart music and light changes
}

document.getElementById("restart-button").addEventListener("click", () => {
    console.log("Restart button clicked"); // Debugging log
    resetGame();
});

document.getElementById("try-again-button").addEventListener("click", () => {
    console.log("Try Again button clicked"); // Debugging log
    resetGame();
});

// Function to check if all players have reached the finish line
function checkWinCondition() {
    const players = document.querySelectorAll('.player');
    let activePlayers = 0; // Count of players still active (not eliminated)
    let playersAtFinishLine = 0; // Count of players who have reached the finish line

    players.forEach((player) => {
        const playerBottom = parseInt(window.getComputedStyle(player).bottom, 10);
        const finishLineTop = gameContainer.clientHeight - 50; // Top of the finish line

        console.log(`Player ID: ${player.id}, Bottom: ${playerBottom}, Finish Line Top: ${finishLineTop}`); // Debugging log

        // Check if the player is visible (not eliminated)
        if (player.style.display !== 'none') {
            activePlayers++; // Count active players

            // Check if this player has reached the finish line
            if (playerBottom >= finishLineTop) {
                console.log(`Player ${player.id} has reached the finish line!`); // Debugging log
                playersAtFinishLine++; // Increment count of players at the finish line
            }
        }
    });

    console.log(`Active Players: ${activePlayers}, Players at Finish Line: ${playersAtFinishLine}`); // Debugging log

    // Win condition: All remaining players reach the finish line
    if (playersAtFinishLine === players.length) {
        console.log("Win condition met!"); // Debugging log
        endGame("Congratulaions! You Win!");
    }
    // Lose condition: All players are eliminated
    else if (activePlayers === 0) {
        console.log("Lose condition met!"); // Debugging log
        endGame("You have been eliminated!");
    }
}