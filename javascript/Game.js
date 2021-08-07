import Snake from "./Snake.js"
import SnakeCell from "./SnakeCell.js"

// Consts
const BOARD_SIZE = 12
const SNAKE_X_START = ~~(BOARD_SIZE / 2)
const SNAKE_Y_START = ~~(BOARD_SIZE / 2)
const DIRECTION = Object.freeze({"UP":0, "RIGHT":1, "DOWN":2, "LEFT":3})

// Variables
let gameInterval
let intervalTime = 300
let board = new Array(BOARD_SIZE).fill(0).map((row) => (new Array(BOARD_SIZE).fill(0)))
let snake = new Snake(SNAKE_X_START, SNAKE_Y_START, SNAKE_X_START, SNAKE_Y_START - 1)
let snakeDirection = DIRECTION.RIGHT
let snakeNewDirection = DIRECTION.RIGHT
let snakeArray = []
let score = 0
let food = {x: null, y: null}
let ate = 0

// Get input and set the direction of snake
function input(event)
{
    if (event.key === "ArrowUp" && snakeDirection !== DIRECTION.DOWN)
        snakeNewDirection = DIRECTION.UP
    else if (event.key === "ArrowRight" && snakeDirection !== DIRECTION.LEFT)
        snakeNewDirection = DIRECTION.RIGHT
    else if (event.key === "ArrowDown" && snakeDirection !== DIRECTION.UP)
        snakeNewDirection = DIRECTION.DOWN
    else if (event.key === "ArrowLeft" && snakeDirection !== DIRECTION.RIGHT)
        snakeNewDirection = DIRECTION.LEFT
}

// Draw board
function drawBoard()
{
    let boardBodyElement = document.getElementById("board-body")
    let boardHTML = ""
    let x = 0
    board.forEach((row) => {
        let y = 0
        boardHTML += "<div class=\"row\">"
        row.forEach((col) =>  {
            if (isInSnakeArray(x, y))
                if (snake.head.x === x && snake.head.y === y)
                    boardHTML += `<div class=\"cell snake-head-cell\" x=${x} y=${y}></div>`
                else
                    boardHTML += `<div class=\"cell snake-body-cell\" x=${x} y=${y}></div>`
            else if (x === food.x && y === food.y)
                boardHTML += `<div class=\"cell food-cell\" x=${x} y=${y}></div>`
            else
                boardHTML += `<div class=\"cell\" x=${x} y=${y}></div>`
            y++
        })
        boardHTML += "</div>"
        x++
    })
    boardBodyElement.innerHTML = boardHTML
}

// Draw the score
function drawScore()
{
    document.getElementById("score").innerText = score
}

// Draw game over on screen with retry button
function drawGameOver()
{
    let boardElement = document.getElementById("board")
        let gameOverHTML = 
            `<div class="game-over">
                Game Over
                <button class="button" id="retry-button">Retry</div>
            </div>`
        boardElement.innerHTML += gameOverHTML
        document.getElementById("retry-button").onclick = retry
}

// Retry button fucntion
function retry()
{
    let boardElement = document.getElementsByClassName("game-over")
    while(boardElement.length > 0)
    {
        boardElement[0].parentNode.removeChild(boardElement[0])
    }
    snake = new Snake(SNAKE_X_START, SNAKE_Y_START, SNAKE_X_START, SNAKE_Y_START - 1)
    snakeArray = []
    score = 0
    intervalTime = 300
    snakeDirection = DIRECTION.RIGHT
    snakeNewDirection = DIRECTION.RIGHT
    startGame()
}

function retryButton(event)
{
    if (event.key === "Enter")
    {
        document.getElementById('retry-button').click()
    }
}

// Move the snake in its direction
function moveSnake()
{
    let current = snake.tail
    let next = snake.tail.next
    let oldHeadX = snake.head.x
    let oldHeadY = snake.head.y

    if (snakeDirection === DIRECTION.RIGHT)
        snake.head.y++
    else if (snakeDirection === DIRECTION.LEFT)
        snake.head.y--
    else if (snakeDirection === DIRECTION.UP)
        snake.head.x--
    else if (snakeDirection === DIRECTION.DOWN)
        snake.head.x++

    if (checkEatFood())
    {
        let newCell

        while(current.next != snake.head)
            current = current.next

        newCell = new SnakeCell(oldHeadX, oldHeadY)
        current.next = newCell
        newCell.next = snake.head

        return 1
    }
    else
    {
        while(next.next != null)
        {
            current.x = next.x
            current.y = next.y
            next = next.next
            current = current.next
        }
        current.x = oldHeadX
        current.y = oldHeadY

        return 0
    }
}

// Update snake set that holds snake cells positions
function updateSnakeArray() 
{
    let cell = new SnakeCell()
    snakeArray = []
    cell = snake.tail
    while(true)
    {
        snakeArray.push([cell.x, cell.y])
        if (cell.next != null)
            cell = cell.next
        else
            break
    }
}

// Check if snake collided with walls or it self
function checkCollision()
{
    if (snake.head.x > BOARD_SIZE - 1 ||
         snake.head.y > BOARD_SIZE - 1 ||
         snake.head.x < 0 ||
         snake.head.y < 0
        )
    {
        clearInterval(gameInterval)
        return 1
    }

    for (let i = 0; i < snakeArray.length - 1; i++)
    {
        if (snakeArray[i].toString() === [snake.head.x, snake.head.y].toString())
        {
            clearInterval(gameInterval)
            return 1
        }
    }
    return 0
}

// Helper function to check if the [x, y] is contained in snake array
function isInSnakeArray(x, y)
{
    for (let i = 0; i < snakeArray.length; i++)
    {
        if (snakeArray[i].toString() === [x, y].toString())
            return 1
    }
    return 0
}

// Generate new food
function generateFood()
{
    do
    {
        food.x = Math.floor(Math.random() * (BOARD_SIZE))
        food.y = Math.floor(Math.random() * (BOARD_SIZE))
    }
    while (isInSnakeArray(food.x, food.y))
}

// Check if the snake ate the food
function checkEatFood()
{
    if (snake.head.x === food.x && snake.head.y === food.y)
    {
        score++
        drawScore()
        return 1
    }
    return 0
}

// Main
function game() 
{
    document.removeEventListener("keydown", input)
    snakeDirection = snakeNewDirection
    // If snake ate
    ate = moveSnake()
    document.addEventListener("keydown", input)
    updateSnakeArray()
    if (ate)
        generateFood()
    if (checkCollision())
    {
        drawGameOver()
        document.addEventListener("keydown", retryButton)
        return 0
    }
    drawBoard()
    if (ate)
    {
        clearInterval(gameInterval) 
        if (intervalTime > 80)
            intervalTime -= 10
        gameInterval = setInterval(game, intervalTime);
    }
}

// Start game interval
function startGame()
{
    updateSnakeArray()
    generateFood()
    drawBoard()
    drawScore()
    document.addEventListener("keydown", input)
    gameInterval = setInterval(game, intervalTime);
}

// Start the game
startGame()
