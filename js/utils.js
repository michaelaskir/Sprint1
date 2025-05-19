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
  strHTML += '</tbody></table>'

  const elContainer = document.querySelector('.board-container')
  elContainer.innerHTML = strHTML
}

function renderCell(i, j) {
  // Select the elCell and set the value
  const elCell = document.querySelector(`.cell-${i}-${j}`)


  if (gBoard[i][j].isMine) {
    elCell.innerText = BOMB
  } else if (gBoard[i][j].minesAroundCount) {
    elCell.innerText = gBoard[i][j].minesAroundCount
  }
  elCell.classList.add('revealed')
}


function getRandomInt(min, max) {
  const minCeiled = Math.ceil(min);
  const maxFloored = Math.floor(max);
  return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled); // The maximum is exclusive and the minimum is inclusive
}


