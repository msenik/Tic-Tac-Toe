let state = {
  actions: [], //[['ch','r',...]]
  currentPosition: -1,
  winVector: null, //'vertical', 'horizontal', 'diagonal-right', 'diagonal-left'
  winCells: [],
  isDraw: false
};

window.addEventListener("load", function(e) {
  loadWindow();
});
window.addEventListener("focus", function(e) {
  loadWindow();
});

function loadWindow() {
  let storageState = localStorage.getItem("state");
  if (storageState) {
    state = JSON.parse(storageState);
  }
  if (state.winVector || state.isDraw) {
    clearState();
  }
  render(state);
}

function clearState() {
  state.actions = [];
  state.currentPosition = -1;
  state.winVector = null;
  state.winCells = [];
  state.isDraw = false;
}

function renderField({ actions, currentPosition, winVector, winCells }) {
  //Clear clasess
  [...document.querySelectorAll(".cell")].forEach(el => {
    el.className = "cell";
  });

  //Add figure class
  for (let i = 0; i <= currentPosition; i++) {
    let item = actions[i];
    let element = document.querySelector("#c-" + item);
    let className = i % 2 ? "r" : "ch";
    element.classList.add(className);
  }

  //Decorate win cells
  if (winCells.length > 0) {
    winCells.forEach(c => {
      let element = document.querySelector("#c-" + c);
      element.classList.add("win", winVector);
    });
  }
}

function renderUndo({ actions, currentPosition, winCells, isDraw }) {
  const btn = document.querySelector(".undo-btn");
  const lng = actions.length;
  if (currentPosition >= 0 && !winCells.length) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
  if (isDraw) {
    btn.disabled = true;
  }
}

function renderRedo({ actions, currentPosition, winCells, isDraw }) {
  const btn = document.querySelector(".redo-btn");
  const lng = actions.length;
  // if (currentPosition >= 0 && currentPosition < lng - 1 && !winCells.length) {
  if (currentPosition < lng - 1 && !winCells.length) {
    btn.disabled = false;
  } else {
    btn.disabled = true;
  }
  if (isDraw) {
    btn.disabled = true;
  }
}

function renderTitle({ winCells, isDraw }) {
  const node = document.querySelector(".won-title");
  const messageElement = document.querySelector(".won-message");
  if (winCells.length > 0) {
    node.classList.remove("hidden");
    const winFigure = document
      .querySelector("#c-" + winCells[0])
      .classList.contains("ch")
      ? "ch"
      : "r";
    messageElement.textContent = winFigure == "ch"
      ? "Crosses won!"
      : "Toes won!";
  } else if (isDraw) {
    node.classList.remove("hidden");
    messageElement.textContent = "It's a draw!";
  } else {
    node.classList.add("hidden");
    const messageElement = document.querySelector(".won-message");
    messageElement.textContent = "";
  }
}

function render(state) {
  renderField(state);
  renderUndo(state);
  renderRedo(state);
  renderTitle(state);
  localStorage.setItem("state", JSON.stringify(state));

  //console.log(localStorage.getItem("state"));
}

function listenTo(event, selector, handler) {
  document.addEventListener(event, e => {
    if (e.target.matches(selector)) {
      handler(e);
      //debugger;
      render(state);
    }
  });
}

function handleCellClick(e) {
  if (state.winCells.length) return;
  //(state.isDraw) return;
  state.actions.length = state.currentPosition + 1;
  const el = e.target;
  const index = +el.dataset.id;
  state.actions.push(index);
  state.currentPosition = state.actions.length - 1;
  checkWin();
}

function handleUndoBtnClick(e) {
  state.currentPosition -= 1;
}

function handleRedoBtnClick(e) {
  state.currentPosition += 1;
}

function handleRestartClick(e) {
  clearState();
}

function checkWin() {
  const winComb = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];
  const winVectors = [
    "horizontal",
    "horizontal",
    "horizontal",
    "vertical",
    "vertical",
    "vertical",
    "diagonal-right",
    "diagonal-left"
  ];
  let actionsCh = [...state.actions].filter((e, i) => !(i % 2));
  let actionsR = [...state.actions].filter((e, i) => i % 2);
  for (let [index, value] of winComb.entries()) {
    let isChWin = value.every((el, i) => {
      return actionsCh.includes(el);
    });
    let isRWin = value.every((el, i) => {
      return actionsR.includes(el);
    });
    if (isChWin || isRWin) {
      state.winCells = value;
      state.winVector = winVectors[index];
    }
  }

  let draw = winComb.some(value => {
    let containsCh = value.some((el, i) => {
      return actionsCh.includes(el);
    });

    let containsR = value.some((el, i) => {
      return actionsR.includes(el);
    });

    return !(containsCh && containsR);
  });

  if (!draw) {
    state.isDraw = true;
  }
}

function bindEvents() {
  listenTo("click", ".cell", handleCellClick);
  listenTo("click", ".undo-btn", handleUndoBtnClick);
  listenTo("click", ".redo-btn", handleRedoBtnClick);
  listenTo("click", ".restart-btn", handleRestartClick);
}

bindEvents();
