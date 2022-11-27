//selecting canvas and adding style to it
//pt - selecionando o canvas e adicionando estilos
const cvs = document.getElementById('cvs');
const ctx = cvs.getContext('2d');
cvs.style.border = "1px solid #fff";
cvs.style.position = "absolute";
cvs.style.bottom = "0"
//--------------------------------------------------------
const scoreDisplay = document.querySelector('.score');
const highScoreDisplay = document.querySelector('.high-score');
const gameOverDisplay = document.querySelector('.game-over');
const playAgain = document.querySelector('.play-again');




//game vars
const FPS = 1000 / 15 // = 15 frames 
// will be used with setInterval -- setInterval(function, FPS)
// pt - será usado com setInterval -- setInterval(função, FPS)
let gameLoop;
const squareSize = 20;
let currentDirection = "";
let directionsQueue = [];
const directions = {
    RIGHT: 'ArrowRight',
    LEFT: 'ArrowLeft',
    UP: 'ArrowUp',
    DOWN: 'ArrowDown'
}
let gameStarted = false;

//game colors
let boardColor = "#000";
let headColor = "#fff";
let bodyColor = "#999";
const foodColor = "orange";

//cvs dimensions
const width = cvs.width;
const height = cvs.height;
const horizontalSq = width / squareSize;
const verticalSq = height / squareSize;


function drawBoard() {
    ctx.fillStyle = boardColor;
    ctx.fillRect(0, 0, width, height);
}

function drawSquare(x, y, color) {
    //receives x and y (position) and the color que square will have
    //recebe a posição do quadrado através de x e y e a nvoa cor do quadrado
    ctx.fillStyle = color;
    ctx.fillRect(x * squareSize, y * squareSize, squareSize, squareSize);
    //will paint the square on posit x, y with the size of 20px by 20px ref l.15
    // multiply x and y by square size in order to always get a 20px by 20px position.
    //pt - vai pintar o quadrado na posição x, y com um tamanho de 20px por 20px
    //pt - multiplica x e y por 'square size' para termos apenas posiçoes a cada 20px
    ctx.strokeStyle = boardColor;//ref l.18   //this is just to separate the squares | pt- apenas para separar os quadrados
    ctx.strokeRect(x * squareSize, y * squareSize, squareSize, squareSize);
}

// drawSquare(0, 0, "#fff"); test, ok

//snake 
let snake = [
    { x: 2, y: 0 }, //heade
    { x: 1, y: 0 }, //body              initial positions
    { x: 0, y: 0 } //tail
]

function drawSnake() {
    //this function will take all the snake parts from the snake array l.46 and call the drawSquare function 
    //função pegará todos elementos do array 'snake' e chamará a função 'drawSquare' para cada uma. 
    snake.forEach((square, index) => {
        const color = index === 0 ? headColor : bodyColor; //-the first element receives a different color
        drawSquare(square.x, square.y, color);
    })
}

document.addEventListener('keyup', setDirection);
function setDirection(e) {
    const newDirection = e.key;
    const oldDirection = currentDirection;
    if (newDirection === directions.LEFT &&
        oldDirection !== directions.RIGHT
        || newDirection === directions.RIGHT &&
        oldDirection !== directions.LEFT
        || newDirection === directions.UP &&
        oldDirection !== directions.DOWN
        || newDirection === directions.DOWN &&
        oldDirection !== directions.UP
    ) {
        if (!gameStarted) {
            gameStarted = true;
            gameLoop = setInterval(frame, FPS);
        }
        directionsQueue.push(newDirection);
    }
}

function moveSnake() {
    if (!gameStarted) return;
    //get head position
    const head = { ...snake[0] } //spread :/
    if (directionsQueue.length) {
        currentDirection = directionsQueue.shift();

    }
    //change head position
    switch (currentDirection) {
        case directions.RIGHT:
            head.x += 1;
            break;
        case directions.LEFT:
            head.x -= 1;
            break;
        case directions.UP:
            head.y -= 1;
            break;
        case directions.DOWN:
            head.y += 1;
            break;
    }
    //remove tail
    if (hasEatenFood()) {
        food = createFood();
    } else {
        snake.pop();
    }
    //unshift new head
    snake.unshift(head)
}

function hasEatenFood() {
    const head = snake[0];
    return head.x === food.x && head.y === food.y;
}
//create the food
let food = createFood();
function createFood() {
    let food = { //max food position should be 19 and min 0
        x: Math.floor(Math.random() * horizontalSq), y: Math.floor(Math.random() * verticalSq) //l.27
    }
    while (snake.some(square => square.x === food.x && snake.y === food.y))
        food = {
            x: Math.floor(Math.random() * horizontalSq), y: Math.floor(Math.random() * verticalSq) //l.27
        };
    return food;
}
function drawFood() {
    drawSquare(food.x, food.y, foodColor);
}
//score display
const initialSnakeLength = snake.length;
let score = 0;
let highScore = localStorage.getItem('high-score') || 0;
function renderScore() {
    score = snake.length - initialSnakeLength;
    scoreDisplay.innerHTML = `🌞 ${score}`;
    highScoreDisplay.innerHTML = `🏆 ${highScore}`;
}

//hit wall
function hitWall() {
    const head = snake[0];

    return (
        head.x < 0 || head.x >= horizontalSq ||
        head.y < 0 || head.y >= verticalSq
    )
}

//hit self
function hitSelf() {
    const snakeBody = [...snake]
    const head = snakeBody.shift();

    return snakeBody.some(
        (square => square.x === head.x && square.y === head.y)
    )

}

//gameover
function gameOver() {
    const scoreGameOver = document.querySelector('.game-over-score .current')
    const highScoreGameOver = document.querySelector('.game-over-score .high')


    //calculate high score
    highScore = Math.max(score, highScore);
    localStorage.setItem('high-score', highScore);


    scoreGameOver.innerHTML = `🌞 ${score}`
    highScoreGameOver.innerHTML = `🏆 ${highScore}`


    gameOverDisplay.classList.remove('hide');
}



//loop function
function frame() {
    drawBoard();
    drawFood();
    moveSnake();
    drawSnake();
    renderScore();
    if (hitWall() || hitSelf()) {
        clearInterval(gameLoop);
        gameOver();
    }
}
frame();


playAgain.addEventListener('click', restartGame);

function restartGame() {
    snake = [
        { x: 2, y: 0 }, //heade
        { x: 1, y: 0 }, //body             
        { x: 0, y: 0 } //tail
    ];

    currentDirection = "";
    directionsQueue = [];

    gameOverDisplay.classList.add('hide');

    gameStarted = false;

    frame();
}