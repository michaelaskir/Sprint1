'use strict'

var gGame
var gBoard
var gLevel

const BOMB = '💣'
const FLAG = '🚩'
const GAME_ON = '🙂'
const GAME_WON = '😎'
const GAME_LOST = '🙁'

var gMinesLocations
var gLocations
var firstClick
var elRestertBtn = document.querySelector('.restart')

var prevSize = 4 //deafult
var prevMines = 2 //deafult

function onInit(SIZE = prevSize, MINES = prevMines) {
    gGame = {
        isOn: false,
        revealedCount: 0,
        markedCount: 0,
        secsPassed: 0
    }
    gLevel = {
        SIZE,
        MINES
    }
    elRestertBtn.innerText = GAME_ON
    gMinesLocations = []
    gLocations = []
    firstClick = true

    prevSize = gLevel.SIZE
    prevMines = gLevel.MINES

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

function expandReveal(board, elCell, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            // console.log('gBoard[i][j]:', gBoard[i][j])

            const cell = gBoard[i][j]
            if (cell.isRevealed || cell.isMine) continue
            gBoard[i][j].isRevealed = true
            gGame.revealedCount++
            // console.log('gGame.revealedCount:', gGame.revealedCount)
            renderCell(i, j)

            if (!gBoard[i][j].minesAroundCount) expandReveal(board, elCell, i, j)
        }
    }
}

function onCellClicked(elCell, i, j) {
    if (firstClick) {
        gBoard = setRandMines(gBoard, { i, j })
        gBoard = setMinesNegsCount(gBoard)
        gGame.isOn = true
        firstClick = false
    }

    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return

    gBoard[i][j].isRevealed = true
    elCell.classList.add('revealed')

    if (gBoard[i][j].isMine) {
        elCell.innerText = BOMB
        elRestertBtn.innerText = GAME_LOST
        revealAllBombs()
        gGame.isOn = false
        return
    }

    gGame.revealedCount++
    console.log(gGame.revealedCount);

    if (gBoard[i][j].minesAroundCount) {
        elCell.innerText = gBoard[i][j].minesAroundCount
    } else { // empty space = no mines around
        expandReveal(gBoard, elCell, i, j)
    }

    if (checkGameOver()) {
        gGame.isOn = false
        console.log('you win!');
        elRestertBtn.innerText = GAME_WON
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
        elRestertBtn.innerText = GAME_WON
    }
}

function revealAllBombs() {
    for (var i = 0; i < gMinesLocations.length; i++) {
        const cell = gMinesLocations[i]
        console.log('cell.i, cell.j:', cell.i, cell.j)
        renderCell(cell.i, cell.j)
    }
}

function buildBoard() {
    console.log("hi");
    const size = gLevel.SIZE
    var board = []
    // var locations = []
    for (var i = 0; i < size; i++) {
        board[i] = []
        for (var j = 0; j < size; j++) {
            board[i][j] = {
                minesAroundCount: 0,
                isRevealed: false,
                isMine: false,
                isMarked: false
            }
            gLocations.push({ i, j })
        }
    }
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

function setRandMines(board, firstClickLoc) {
    console.log('gMinesLocations:', gMinesLocations)
    var size = gLevel.MINES
    for (var i = 0; i < size; i++) {
        var randIdx = getRandomInt(0, gLocations.length)
        var randLocation = gLocations.splice(randIdx, 1)[0]

        if (randLocation.i === firstClickLoc.i && randLocation.j === firstClickLoc.j) {
            size++
            continue
        }
        console.log('randLocation:', randLocation)
        board[randLocation.i][randLocation.j].isMine = true
        gMinesLocations.push(randLocation)
    }
    return board
}