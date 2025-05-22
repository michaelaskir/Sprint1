'use strict'

var gGame
var gBoard
var gLevel

const BOMB = '💣'
const FLAG = '🚩'
const GAME_ON = '🙂'
const GAME_WON = '😎'
const GAME_LOST = '🙁'
const LIFE = '💗'
const HINT = '💡'

var gLives
var gHints
var gIsHint

var gMinesLocations
var gLocations
var firstClick
var elRestertBtn = document.querySelector('.restart')

var prevSize = 4 //deafult
var prevMines = 2 //deafult

var gTimerInterval

var gGameMode

var isDark

var lastClicks

var gIsManuallyCreate

var gIsMegaHint
var gMegaHints

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
    gLives = 3
    renderLives()

    gHints = 3
    renderHints()

    elRestertBtn.innerText = GAME_ON
    gMinesLocations = []
    gLocations = []
    firstClick = true

    prevSize = gLevel.SIZE
    prevMines = gLevel.MINES

    stopTimer()
    renderTimer()

    gGameMode = checkLevel()
    renderCurrBestScore()

    isDark = false

    lastClicks = []

    gIsManuallyCreate = false
    gIsMegaHint = false
    gMegaHints = {
        count: 1,
        firstClickLoc: {},
        secondClickLoc: {}
    }
    renderMegaHints()

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

function gameWon() {
    gGame.isOn = false
    console.log('you win!');
    elRestertBtn.innerText = GAME_WON
    stopTimer()
    // clearInterval(gTimerInterval)

    checkBestScore()
}

function expandReveal(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue
            if (i === rowIdx && j === colIdx) continue

            // console.log('gBoard[i][j]:', gBoard[i][j])
            const cell = gBoard[i][j]
            if (cell.isRevealed || cell.isMine || cell.isMarked) continue
            gBoard[i][j].isRevealed = true
            gGame.revealedCount++
            // console.log('gGame.revealedCount:', gGame.revealedCount)
            renderCell(i, j)
            if (!gBoard[i][j].minesAroundCount) expandReveal(board, i, j)
        }
    }
}

function onCellClicked(elCell, i, j) {
    if (firstClick) {
        if (gIsHint) return

        if (gIsManuallyCreate) {
            if (isMineAlreadyPlaced(i, j)) return

            gMinesLocations.push({ i, j })
            gBoard[i][j].isMine = true
            gLevel.MINES = gMinesLocations.length

            elCell.classList.add('manuall-mine')
            setTimeout(() => {
                elCell.classList.remove('manuall-mine')
            }, 500);

            return
        }
        else if (!gMinesLocations.length) { // only if no manuall bombs selected
            setRandMines({ i, j })
        }
        setMinesNegsCount(gBoard)


        gGame.isOn = true
        firstClick = false

        startTimer()
    }

    if (!gGame.isOn) return
    if (gBoard[i][j].isMarked) return
    if (gBoard[i][j].isRevealed) return

    if (gIsHint) {
        tempExpandReveal(gBoard, i, j)
        gIsHint = false
        renderHints()
        return
    }

    if (gIsMegaHint && gMegaHints.count) {
        megaTempExpandReveal(gBoard, i, j)
        gIsMegaHint
        return
    }

    gBoard[i][j].isRevealed = true
    elCell.classList.add('revealed')

    lastClicks.push({ elCell, i, j })// for undo

    if (gBoard[i][j].isMine) {
        elCell.innerText = BOMB

        gLives--
        renderLives()

        if (gLives === 0) {
            elRestertBtn.innerText = GAME_LOST
            revealAllBombs()
            stopTimer()
            gGame.isOn = false
            return
        }

        setTimeout(() => {
            gBoard[i][j].isRevealed = false
            elCell.classList.remove('revealed')
            elCell.innerText = ''
        }, 1000);
        return
    }

    gGame.revealedCount++
    console.log(gGame.revealedCount);

    if (gBoard[i][j].minesAroundCount) {
        elCell.innerText = gBoard[i][j].minesAroundCount
    } else { // empty space = no mines around
        expandReveal(gBoard, i, j)
    }

    if (checkGameOver()) {
        gameWon()
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
        gameWon()
    }
}

function onGetHint() {
    const elHints = document.querySelector('.hints')

    if (gIsHint) {
        gHints++
        gIsHint = false
        elHints.style.backgroundColor = ''
        return
    }
    gIsHint = true
    gHints--
    console.log('elHint:', elHints)
    elHints.style.backgroundColor = 'yellow'
}

function onSafeClick() {
    if (!gGame.isOn) return
    if (!gLocations.length) return

    var randLocation = gLocations.splice(randIdx, 1)[0]
    // console.log('gLocations:', gLocations)
    while (gBoard[randLocation.i][randLocation.j].isRevealed || gBoard[randLocation.i][randLocation.j].isMine) {
        var randIdx = getRandomInt(0, gLocations.length)
        var randLocation = gLocations.splice(randIdx, 1)[0]

        if (!gLocations.length) return
    }

    renderSafeCell(randLocation.i, randLocation.j)
    setTimeout(() => {
        renderSafeCell(randLocation.i, randLocation.j)
    }, 1500);
}

function onUndo() {
    if (!gGame.isOn) return
    if (!lastClicks.length) return

    var lastClick = lastClicks.pop()
    console.log('lastClicks:', lastClicks)
    console.log('lastClick:', lastClick)
    const cell = gBoard[lastClick.i][lastClick.j]

    if (cell.isMine) {
        gLives++
        renderLives()
        return
    }
    if (!cell.isRevealed || !lastClick) return

    if (cell.minesAroundCount) {
        cell.isRevealed = false
        gGame.revealedCount--
        unRenderCell(lastClick.i, lastClick.j)
    } else undoExpandReveal(gBoard, lastClick.i, lastClick.j)
}

function onManuallyCreate() {
    if (gGame.isOn || gGame.secsPassed) return // only on start of the game

    gIsManuallyCreate = !gIsManuallyCreate
    const elBtn = document.querySelector('.manually-create span')
    elBtn.innerText = gIsManuallyCreate ? 'On' : 'Off'
}

function onMegaHint() {
    console.log('hi');
    if (!gGame.isOn || !gMegaHints.count) return // only on start of the game

    gIsMegaHint = !gIsMegaHint


    renderMegaHints()

}

function undoExpandReveal(board, rowIdx, colIdx) {

    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue

            const cell = board[i][j]
            if (cell.isMine) continue

            if (cell.isRevealed) {
                cell.isRevealed = false
                gGame.revealedCount--
                unRenderCell(i, j)

                if (!cell.minesAroundCount) {
                    undoExpandReveal(board, i, j)
                }
            }
        }
    }
}
function onChangeMode(elBtn) {

    const elBody = document.querySelector('body')
    // console.log('elBody:', elBody)
    elBody.classList.toggle('dark')
    elBtn.classList.toggle('dark')

    if (!isDark) elBtn.innerText = 'Light Mode'
    else elBtn.innerText = 'Dark Mode'

    isDark = !isDark
}

function tempExpandReveal(board, rowIdx, colIdx) {
    for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
        if (i < 0 || i >= board.length) continue
        for (var j = colIdx - 1; j <= colIdx + 1; j++) {
            if (j < 0 || j >= board[0].length) continue

            // const cell = board[i][j]
            renderCell(i, j)
        }
    }

    setTimeout(() => {
        for (var i = rowIdx - 1; i <= rowIdx + 1; i++) {
            if (i < 0 || i >= board.length) continue
            for (var j = colIdx - 1; j <= colIdx + 1; j++) {
                if (j < 0 || j >= board[0].length) continue

                const cell = board[i][j]
                if (cell.isRevealed) continue
                unRenderCell(i, j)
            }
        }
    }, 1500);
}

function megaTempExpandReveal(board, rowIdx, colIdx) {

    if (gMegaHints.firstClickLoc.i === undefined && gMegaHints.firstClickLoc.j === undefined) {
        gMegaHints.firstClickLoc = { i: rowIdx, j: colIdx }
        return
    }
    gMegaHints.count--
    gMegaHints.secondClickLoc = { i: rowIdx, j: colIdx }

    const firstCell = gMegaHints.firstClickLoc
    const secondCell = gMegaHints.secondClickLoc

    const firstRow = Math.min(firstCell.i, secondCell.i)
    const lastRow = Math.max(firstCell.i, secondCell.i)
    const firstCol = Math.min(firstCell.j, secondCell.j)
    const lastCol = Math.max(firstCell.j, secondCell.j)

    for (var i = firstRow; i < lastRow + 1; i++) {
        for (var j = firstCol; j < lastCol + 1; j++) {
            if (board[i][j].isRevealed) continue
            renderCell(i, j)
        }
    }

    setTimeout(() => {
        for (var i = firstRow; i < lastRow + 1; i++) {
            for (var j = firstCol; j < lastCol + 1; j++) {
                if (board[i][j].isRevealed) continue
                unRenderCell(i, j)
            }
        }

        gIsMegaHint = false
        renderMegaHints()
    }, 2000);

}

function revealAllBombs() {
    for (var i = 0; i < gMinesLocations.length; i++) {
        const cell = gMinesLocations[i]
        console.log('cell.i, cell.j:', cell.i, cell.j)
        renderCell(cell.i, cell.j)
    }
}

function checkBestScore() {
    // if (gGame.isOn || gStartTime === 0) return

    const scoreBoard = document.querySelector(".scores")

    if (typeof (Storage) !== "undefined") {
        var currBestScore = localStorage.getItem(gGameMode)

        // if (!currBestScore) currBestScore = 'wasnt achieved yet'


        if (!currBestScore || gGame.secsPassed < currBestScore) {
            localStorage.setItem(gGameMode, gGame.secsPassed)
        }
    }
    renderCurrBestScore()
}

function checkLevel() {

    if (gLevel.SIZE === 4 && gLevel.MINES === 2) {
        return 'Beginner'
    } else if (gLevel.SIZE === 8 && gLevel.MINES === 14) {
        return 'Medium'
    } else {
        return 'Expert'
    }
}

function startTimer() {
    gTimerInterval = setInterval(updatedTimer, 1000)
}

function updatedTimer() {
    gGame.secsPassed++
    renderTimer()
}

function stopTimer() {
    clearInterval(gTimerInterval)
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
    // console.log(board)

    return board
}

function setMinesNegsCount(board) {


    for (var i = 0; i < board.length; i++) {
        for (var j = 0; j < board[0].length; j++) {
            board[i][j].minesAroundCount = countNegsMines(board, i, j)

        }
    }
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

function setRandMines(firstClickLoc) {
    var size = gLevel.MINES
    for (var i = 0; i < size; i++) {
        var randIdx = getRandomInt(0, gLocations.length)
        var randLocation = gLocations.splice(randIdx, 1)[0]

        if (randLocation.i === firstClickLoc.i && randLocation.j === firstClickLoc.j) {
            size++
            continue
        }
        console.log('randLocation:', randLocation)
        gBoard[randLocation.i][randLocation.j].isMine = true
        gMinesLocations.push(randLocation)
    }
}

function isMineAlreadyPlaced(iIdx, jIdx) {
    for (var i = 0; i < gMinesLocations.length; i++) {
        const cell = gMinesLocations[i]
        if (cell.i === iIdx && cell.j === jIdx) return true
    }
    return false
}


