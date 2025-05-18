'use strict'

var gGame
var gBoard
var gLevel

const BOMB = '💣'
const FLAG = '🚩'

var gMinesLocations
var firstClick

function onInit() {
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = {
        SIZE: 4,
        MINES: 2
    }
    gMinesLocations = []
    firstClick = true

    gBoard = buildBoard()
    renderBoard(gBoard)
}

function checkGameOver() {
    if (gGame.revealedCount !== gLevel.SIZE ** 2 - gLevel.MINES) return false
    if (gGame.markedCount !== gLevel.MINES) return false

    for (var i = 0; i < gMinesLocations.length; i++) {
        var cell = gBoard[gMinesLocations[i].i][gMinesLocations[i].j]
        if (!cell.isMarked) return false
    }
    return true
}

function expandReveal(board, elCell, i, j) {
    const rowIdx = i
    const colIdx = j
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            gBoard[i][j].isRevealed = true
            elCell.classList.add('revealed')
        }
    }
}


function onCellMarked(elCell, i, j) {
    document.addEventListener('contextmenu', function (e) {
        e.preventDefault();
    });
    if (!gGame.isOn) return
    if (gBoard[i][j].isRevealed) return

    if (!gBoard[i][j].isMarked) {
        gBoard[i][j].isMarked = true
        gGame.markedCount++
        elCell.innerText = FLAG
    } else {
        gBoard[i][j].isMarked = false
        gGame.markedCount--
        elCell.innerText = ''
    }

    if (checkGameOver()) {
        gGame.isOn = false
        console.log('you win!');

    }
}

function onCellClicked(elCell, i, j) {
    if (firstClick) {
        //
        gGame.isOn = true
        firstClick = false
    }

    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return

    gBoard[i][j].isRevealed = true
    elCell.classList.add('revealed')

    if (gBoard[i][j].isMine) {
        elCell.innerText = BOMB
        gGame.isOn = false
        return
    }

    gGame.revealedCount++
    console.log(gGame.revealedCount);

    if (gBoard[i][j].minesAroundCount) {
        elCell.innerText = gBoard[i][j].minesAroundCount
    } else {
        expandReveal(gBoard, elCell, i, j)
    }

    if (checkGameOver()) {
        gGame.isOn = false
        console.log('you win!');

    }
}

function buildBoard() {
    console.log("hi");
    const size = gLevel.SIZE
    var board = []
    var locations = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
            locations.push({ i, j })
        }
    }
    board = setRandMines(board, locations)
    board = setMinesNegsCount(board)
    console.log(board)

    return board
}

function setMinesNegsCount(board) {


    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNegsMines(board, i, j)

        }
    }
    return board
}

function countNegsMines(board, rowIdx, colIdx) {
    var countMines = 0
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue
            if (board[i][j].isMine) {
                countMines++
            }
        }
    }
    return countMines
}

function setRandMines(board, locations) {
    for (var i = 0; i < gLevel.MINES; i++) {
        var randIdx = getRandomInt(0, locations.length)
        var randLocation = locations.splice(randIdx, 1)[0]

        console.log('randLocation:', randLocation)
        gMinesLocations.push(randLocation)
        board[randLocation.i][randLocation.j].isMine = true
    }
    return board
}