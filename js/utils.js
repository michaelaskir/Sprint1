'use strict'

function renderBoard(board) {

  var strHTML = ''
  for (var i = 0; i < board.length; i++) {

    strHTML += '<tr>'
    for (var j = 0; j < board[0].length; j++) {

      strHTML += `<td class="cell-${i}-${j}"onclick="onCellClicked(this, ${i}, ${j})"
            oncontextmenu="onCellMarked(this, ${i}, ${j})"></td>`
    }
    strHTML += '</tr>'
  }

  const elContainer = document.querySelector('.board-container')
  elContainer.innerHTML = strHTML
}

function renderCell(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`)


  if (gBoard[i][j].isMine) {
    elCell.innerText = BOMB
  } else if (gBoard[i][j].minesAroundCount) {
    elCell.innerText = gBoard[i][j].minesAroundCount
  }
  elCell.classList.add('revealed')
}

function unRenderCell(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`)

  elCell.innerText = ''
  elCell.classList.remove('revealed')
}

function renderLives() {
  const elLives = document.querySelector('.lives')
  elLives.innerText = LIFE.repeat(gLives)
}

function renderHints() {
  const elHints = document.querySelector('.hints')
  elHints.style.backgroundColor = ''

  elHints.innerText = HINT.repeat(gHints)
}

function renderMegaHints() {
  const elBtn = document.querySelector('.mega-hint span')

  elBtn.innerText = gIsMegaHint ? 'On' : 'Off'
  elBtn.style.color = 'white'
  if(!gMegaHints.count) elBtn.style.color = 'red'
}

function renderTimer() {
  document.querySelector('.timer span').innerText = gGame.secsPassed
}

function renderCurrBestScore() {
  const scoreBoard = document.querySelector(".scores")

  var currBestScore = localStorage.getItem(gGameMode)
  if (!currBestScore) currBestScore = 'not achieved yet'

  scoreBoard.innerText = `Best score for ${gGameMode} difficulity is ${currBestScore}`
}

function renderSafeCell(i, j) {
  const elCell = document.querySelector(`.cell-${i}-${j}`)

  elCell.classList.toggle('safe')
}


function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}


