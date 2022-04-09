const DIRECTION_UP = 0;
const DIRECTION_RIGHT = 1;
const DIRECTION_DOWN = 2;
const DIRECTION_LEFT = 3;
const TARGET_FPS = 5; // game speed
const GAME_SIZE = 400;
const OPTIMAL_FRAME_TIME = 1000 / TARGET_FPS;

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


var canvas = document.getElementById("game");
canvas.width = GAME_SIZE;
canvas.height = GAME_SIZE;

var ctx = canvas.getContext("2d");

var id = setInterval(tick, OPTIMAL_FRAME_TIME);


const foods = [];
const snake = [];

var lastDirection;
var direction;

init();

var lastFrame = 0;
var lastFpsTime = 0;
var isPlaying = false;
var isDead = false;

function tick() {
    if (lastFrame == 0) {
        now = window.performance.now();
    }
    var now = window.performance.now();
    var updateTime = now - lastFrame;
    lastFrame = now;
    var deltaTime = updateTime / OPTIMAL_FRAME_TIME;
    lastFpsTime += updateTime;

    if (lastFpsTime >= 1000) {
        lastFpsTime = 0;
    }

    ctx.fillStyle = "#d6d6d6";
    ctx.fillRect(0, 0, GAME_SIZE, GAME_SIZE);

    if (!isPlaying) {
        return;
    }
    deathScoreText.textContent = "You scored: " + (snake.length - 1);
    scoreText.textContent = "Score: " + (snake.length - 1);

    for (var i = 0; i < foods.length; i++) {
        var food = foods[i];
        ctx.fillStyle = "#00d42a";
        ctx.fillRect(food.x * 16, food.y * 16, 16, 16);
    }
    for (var i = 0; i < snake.length; i++) {
        var point = snake[i];
        if (i == snake.length - 1) {
            ctx.fillStyle = "#5c0009";
        } else {
            ctx.fillStyle = "#940000";
        }
        ctx.fillRect(point.x * 16, point.y * 16, 16, 16);
    }

    if (!isDead){
        lastDirection = direction;
        moveSnake(lastDirection);
    }
    if (foods.length == 0) {
        spawnFood(1);
    }
}

function adjustSpeed() {
    clearInterval(id);
    id = setInterval(tick, 1000 / Math.min(TARGET_FPS + (snake.length - 1) / 4, 20));
}

function moveSnake(direction) {
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
            switch (direction) {
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
                break s;
            }
        }
    }
}

function die() {
    isDead = true;
    deathScreen.style.display = "flex";
    scoreText.style.display = "none";
}

function startPlaying() {
    if (isDead){
        isDead = false;
        init();
    } else if (!isPlaying){
        isPlaying = true;
    } else {
        return;
    }
    deathScreen.style.display = "none";
    startScreen.style.display = "none";
    scoreText.style.display = "block";
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
    scoreText.textContent = "Score: 0";
    adjustSpeed();
}

function foodFind(arrayFood, food) {
    return arrayFood.x == food.x && arrayFood.y == food.y;
}

document.addEventListener('keydown', function (event) {
    var checkDirection = snake.length > 1;
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
    if (!checkDirection || lastDirection != DIRECTION_DOWN) {
        direction = DIRECTION_UP;
    }
    return true;
}
function moveDown() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || lastDirection != DIRECTION_UP) {
        direction = DIRECTION_DOWN;
    }
    return true;
}
function moveLeft() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || lastDirection != DIRECTION_RIGHT) {
        direction = DIRECTION_LEFT;
    }
    return true;
}
function moveRight() {
    if (!isPlaying || isDead) {
        return false;
    }

    var checkDirection = snake.length > 1;
    if (!checkDirection || lastDirection != DIRECTION_LEFT) {
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