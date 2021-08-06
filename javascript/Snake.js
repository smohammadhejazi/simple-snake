import SnakeCell from "./SnakeCell.js"

export default class Snake
{
    constructor(headX, headY, tailX, tailY)
    {
        this.head = new SnakeCell(headX, headY)
        this.tail = new SnakeCell(tailX, tailY)
        this.tail.next = this.head
    }
}
