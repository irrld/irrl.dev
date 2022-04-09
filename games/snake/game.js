const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const START_SPEED = 5;
const GAME_SIZE = 400;

var mainPage = document.getElementById("mainPage");
mainPage.style.height = GAME_SIZE + "px";
mainPage.style.width = GAME_SIZE + "px";

var deathScreen = document.getElementById("deathScreen");
deathScreen.style.display = "none";
deathScreen.style.height = GAME_SIZE + "px";
deathScreen.style.width = GAME_SIZE + "px";
var startScreen = document.getElementById("startScreen");
startScreen.style.height = GAME_SIZE + "px";
startScreen.style.width = GAME_SIZE + "px";

var deathScoreText = document.getElementById("deathScore");
var scoreText = document.getElementById("score");

var infoDiv = document.getElementById("info");
var dieSound = document.getElementById('dieSound');
var eatSound = document.getElementById('eatSound');
var startSound = document.getElementById('startSound');
var speedupSound = document.getElementById('speedupSound');
var muteButton = document.getElementById('mute');
var unmuteButton = document.getElementById('unmute');

var highestScore0 = document.getElementById('highestScore0');
var highestScore1 = document.getElementById('highestScore1');
if (window.sessionStorage.getItem('highest') == null){
    window.sessionStorage.setItem('highest', '0');
}


var canvas = document.getElementById("game");
canvas.width = GAME_SIZE;
canvas.height = GAME_SIZE;

var ctx = canvas.getContext("2d");

const foods = [];
const snake = [];

var previousDirection;
var direction;
var soundEnabled = true;

init();

var isPlaying = false;
var isDead = false;
var speed = START_SPEED;
var lastMove = window.performance.now();
var speedupAnimationTime = 0;

if (window.sessionStorage.getItem('muted') == 'true'){
    muteSound();
} else {
    unmuteSound();
}

function render() {
    if (isPlaying) {
        move();
        if (foods.length == 0) {
            spawnFood(1);
        }
    }

    drawFrame();
    requestAnimationFrame(render);
}
render();
function move() {
    if (!isDead) {
        var now = window.performance.now();
        if (lastMove + (1000 / speed) <= now) {
            lastMove = now;
            previousDirection = direction;
            moveSnake(previousDirection);
        }
    }
}
function drawFrame() {
    ctx.fillStyle = "#d6d6d6";
    ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);

    for (var i = 0; i < foods.length; i++) {
        var food = foods[i];
        ctx.fillStyle = "#00d42a";
        ctx.fillRect(food.x * 16, food.y * 16, 16, 16);
    }
    for (var i = 0; i < snake.length; i++) {
        var point = snake[i];
        if (speedupAnimationTime == 0) {
            if (i == snake.length - 1) {
                ctx.fillStyle = "#5c0009";
            } else {
                ctx.fillStyle = "#940000";
            }
        } else {
            if (speedupAnimationTime % 8 < 3) {
                if (i == snake.length - 1) {
                    ctx.fillStyle = "#ffffff";
                } else {
                    ctx.fillStyle = "#ffffff";
                }
            } else {
                if (i == snake.length - 1) {
                    ctx.fillStyle = "#5c0009";
                } else {
                    ctx.fillStyle = "#940000";
                }
            }
        }
        ctx.fillRect(point.x * 16, point.y * 16, 16, 16);
    }
    if (speedupAnimationTime > 0) {
        speedupAnimationTime--;
    }
}
function updateScore() {
    var score = Math.max(snake.length - 1, 0);
    deathScoreText.textContent = "You scored: " + score;
    scoreText.textContent = "Score: " + score;
    var highest = window.sessionStorage.getItem('highest');
    if (highest < score){
        highest = score;
        window.sessionStorage.setItem('highest', highest);
    }
    highestScore0.textContent = "Your highest: " + highest;
    highestScore1.textContent = "Your highest: " + highest;
}

function adjustSpeed() {
    var oldSpeed = speed;
    speed = Math.floor(Math.min(START_SPEED + (snake.length - 1) / 4, 20));
    if (oldSpeed != speed && isPlaying && !isDead) {
        if (soundEnabled)
            speedupSound.play();
        speedupAnimationTime = 5 * 16;
    }
}

function moveSnake(currentDirection) {
    var firstPoint;
    for (var i = 0; i < snake.length; i++) {
        var point = snake[i];
        if (i == 0) {
            firstPoint = { x: point.x, y: point.y };
        }
        var next = snake[i + 1];
        if (next != null) {
            point.x = next.x;
            point.y = next.y;
        } else {
            switch (currentDirection) {
                case DIRECTION_UP:
                    point.y -= 1;
                    break;
                case DIRECTION_DOWN:
                    point.y += 1;
                    break;
                case DIRECTION_LEFT:
                    point.x -= 1;
                    break;
                case DIRECTION_RIGHT:
                    point.x += 1;
                    break;
            }

            for (var j = 0; j < snake.length; j++) {
                if (j == i)
                    continue;
                var currentPoint = snake[j];
                if (point.x == currentPoint.x && point.y == currentPoint.y) {
                    die();
                    return;
                }
            }
        }
    }

    s: for (var j = 0; j < snake.length; j++) {
        var point = snake[j];
        if (point.x >= Math.floor(GAME_SIZE / 16) || point.y >= Math.floor(GAME_SIZE / 16) || point.x < 0 || point.y < 0) {
            die();
            return;
        }
        for (var i = 0; i < foods.length; i++) {
            var food = foods[i];
            if (point.x == food.x && point.y == food.y) {
                snake.unshift(firstPoint);
                foods.splice(i, 1);
                adjustSpeed();
                updateScore();
                if (soundEnabled)
                    eatSound.play();
                break s;
            }
        }
    }
}

function die() {
    isDead = true;
    infoDiv.style.opacity = 1;
    infoDiv.style.height = "auto";
    deathScreen.style.display = "flex";
    scoreText.style.display = "none";
    if (soundEnabled)
        dieSound.play();
}

function startPlaying() {
    if (isDead) {
        isDead = false;
        infoDiv.style.opacity = 0;
        infoDiv.style.height = "0";
        if (soundEnabled)
            startSound.play();
        init();
    } else if (!isPlaying) {
        isPlaying = true;
        infoDiv.style.opacity = 0;
        infoDiv.style.height = "0";
        if (soundEnabled)
            startSound.play();
    } else {
        return;
    }
    deathScreen.style.display = "none";
    startScreen.style.display = "none";
    scoreText.style.display = "block";
}

function muteSound(){
    soundEnabled = false;
    muteButton.style.display = "none";
    unmuteButton.style.display = "inline-block";
    window.sessionStorage.setItem('muted', true);
}
function unmuteSound(){
    soundEnabled = true;
    muteButton.style.display = "inline-block";
    unmuteButton.style.display = "none";
    window.sessionStorage.setItem('muted', false);
}
function spawnFood(amount) {
    for (var i = 0; i < amount; i++) {
        var food;
        do {
            food = { x: Math.floor(Math.random() * (GAME_SIZE / 16)), y: Math.floor(Math.random() * (GAME_SIZE / 16)) };
        } while (foods.findIndex(foodFind, food) != -1);

        foods.push(food);
    }
}

function init() {
    direction = DIRECTION_DOWN;

    while (foods.length > 0) {
        foods.pop();
    }
    spawnFood(1);

    while (snake.length > 0) {
        snake.pop();
    }
    snake.push({ x: Math.floor(GAME_SIZE / 16 / 2 - 1), y: Math.floor(GAME_SIZE / 16 / 2 - 1) });
    updateScore();
    adjustSpeed();
}

function foodFind(arrayFood, food) {
    return arrayFood.x == food.x && arrayFood.y == food.y;
}

document.addEventListener('keydown', function (event) {
    if (event.key == 'ArrowUp') {
        if (moveUp()) {
            event.preventDefault();
        }
    } else if (event.key == 'ArrowRight') {
        if (moveRight()) {
            event.preventDefault();
        }
    } else if (event.key == 'ArrowLeft') {
        if (moveLeft()) {
            event.preventDefault();
        }
    } else if (event.key == 'ArrowDown') {
        if (moveDown()) {
            event.preventDefault();
        }
    } else if (event.key == 'Enter') {
        startPlaying();
    } else if (event.key == 'r' && isPlaying && !isDead) {
        init();
    }/* else if (event.key == 'f' && isPlaying) {
        spawnFood(1);
    }*/
});
function moveUp() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || previousDirection != DIRECTION_DOWN) {
        direction = DIRECTION_UP;
    }
    return true;
}
function moveDown() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || previousDirection != DIRECTION_UP) {
        direction = DIRECTION_DOWN;
    }
    return true;
}
function moveLeft() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || previousDirection != DIRECTION_RIGHT) {
        direction = DIRECTION_LEFT;
    }
    return true;
}
function moveRight() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || previousDirection != DIRECTION_LEFT) {
        direction = DIRECTION_RIGHT;
    }
    return true;
}

deathScreen.addEventListener('click', clickHandler);
startScreen.addEventListener('click', clickHandler);
function clickHandler(event) {
    startPlaying();
}

// Touch movements
document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchmove', handleTouchMove, false);

var xDown = null;
var yDown = null;

function getTouches(evt) {
    return evt.touches || evt.originalEvent.touches;
}

function handleTouchStart(evt) {
    const firstTouch = getTouches(evt)[0];
    xDown = firstTouch.clientX;
    yDown = firstTouch.clientY;
};

function handleTouchMove(evt) {
    if (!xDown || !yDown) {
        return;
    }

    var xUp = evt.touches[0].clientX;
    var yUp = evt.touches[0].clientY;

    var xDiff = xDown - xUp;
    var yDiff = yDown - yUp;

    if (Math.abs(xDiff) > Math.abs(yDiff)) {
        if (xDiff > 0) {
            evt.preventDefault();
            moveLeft();
        } else {
            evt.preventDefault();
            moveRight();
        }
    } else {
        if (yDiff > 0) {
            evt.preventDefault();
            moveUp();
        } else {
            evt.preventDefault();
            moveDown();
        }
    }

    xDown = null;
    yDown = null;
};