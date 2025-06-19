const gridElement = document.getElementById('grid');
const shapeSelectionElement = document.getElementById('shape-selection');
const scoreDisplay = document.getElementById('score');

let grid = Array(8).fill(null).map(() => Array(8).fill(0));
let availableShapes = [];
let selectedShape = null;
let selectedColor = '';
let score = 0;

const colors = ['red', 'blue', 'green', 'orange', 'purple', 'cyan', 'pink', 'yellow', 'magenta', 'lime'];

const getRandomColor = () => colors[Math.floor(Math.random() * colors.length)];

// Možné tvary
const allShapes = [
    { shape: [[1, 1], [1, 1]], color: getRandomColor() }, //cube
    { shape: [[1, 1, 1], [0, 1, 0]], color: getRandomColor() }, //"sipky" dolu
    { shape: [[1, 1, 1, 1]], color: getRandomColor() },//horizontalni i
    { shape: [[1, 0], [1, 0], [1, 1]], color: getRandomColor() },// prave dolu L
    { shape: [[1,1,1], [1,0,0]], color: getRandomColor()},//leve horizontalni L
    { shape: [[1,0], [1,1], [0,1]], color: getRandomColor()},//S nahoru
    { shape: [[1,0], [1,0], [1,0], [1,0]], color: getRandomColor()},//vertikalni i
    { shape: [[1, 1, 1, ]], color: getRandomColor() },//horizontalni i (3)
    { shape: [[0,1], [0,1], [1, 1]], color: getRandomColor() },//leve dolu L
    { shape: [[1,1,1], [0,0,1]], color: getRandomColor()}, //prave horizontalni L
    { shape: [[1,1,], [0,1], [0,1]], color: getRandomColor()}, //leve nahoru L
    { shape: [[1,1], [1,0], [1,0]], color:  getRandomColor()}, //prave nahoru L
    { shape: [[0,1], [1,1], [1,0]], color: getRandomColor()}, // S nahoru zdcadlo
    { shape: [[1,1,0], [0,1,1]], color: getRandomColor()}, //S
    { shape: [[0,1,1], [1,1,0]], color: getRandomColor()}, //S zdcadlo
    { shape: [[0,1,0], [1,1,1]], color: getRandomColor()}, //"sipky" nahoru
    { shape: [[1,1,1,1,1]], color: getRandomColor()}, //horizontalni i (5)
    { shape: [[1,0], [1,0], [1,0], [1,0], [1,0]], color: getRandomColor()},//vertikalni i (5)
    { shape: [[1,1,1], [1,1,1]], color: getRandomColor()}, //3x2
    { shape: [[1,1], [1,1], [1,1]], color: getRandomColor()}, //3x2
    { shape: [[1,1,1], [1,1,1], [1,1,1]], color: getRandomColor()}, //3x3
    { shape: [[0,1], [1,1], [0,1]], color: getRandomColor()}, //"sipky" doprava
    { shape: [[1,0], [1,1], [1,0]], color: getRandomColor()}, //"sipky" doleva
    { shape: [[1,1,1], [1,0,0], [1,0,0]], color: getRandomColor()},
    { shape: [[1,1,1], [0,0,1], [0,0,1]], color: getRandomColor()},
    { shape: [[0,0,1], [0,0,1], [1,1,1]], color: getRandomColor()},
    { shape: [[1,0,0], [1,0,0], [1,1,1]], color: getRandomColor()},



];

// Vykreslení mřížky
function createGrid() {
    gridElement.innerHTML = '';
    grid.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            const cellElement = document.createElement('div');
            cellElement.className = 'cell';
            cellElement.dataset.row = rowIndex;
            cellElement.dataset.col = colIndex;
            if (cell) {
                cellElement.style.backgroundColor = cell.color;
            }
            gridElement.appendChild(cellElement);
        });
    });
}

// Vykreslení tvarů v nabídce
function renderShapes() {
    shapeSelectionElement.innerHTML = '';
    availableShapes.forEach(({ shape, color }) => {
        const shapeElement = document.createElement('div');
        shapeElement.className = 'shape';
        shapeElement.draggable = true;
        shapeElement.addEventListener('dragstart', (event) => {
            event.dataTransfer.setData('shape', JSON.stringify({ shape, color }));
        });

        // Náhled tvarů
        const preview = document.createElement('div');
        preview.className = 'shape-preview';
        preview.style.display = 'grid';
        preview.style.gridTemplateColumns = `repeat(${shape[0].length}, 30px)`;
        preview.style.gridTemplateRows = `repeat(${shape.length}, 30px)`;

        shape.forEach(row => {
            row.forEach(cell => {
                const block = document.createElement('div');
                block.className = 'cell';
                block.style.width = '30px';
                block.style.height = '30px';
                block.style.backgroundColor = cell ? color : 'transparent';
                preview.appendChild(block);
            });
        });

        shapeElement.appendChild(preview);
        shapeSelectionElement.appendChild(shapeElement);
    });
}

// Kontrola, zda lze umístit tvar na mřížku
function canPlaceShape(shape, startRow, startCol) {
    for (let row = 0; row < shape.length; row++) {
        for (let col = 0; col < shape[row].length; col++) {
            if (shape[row][col]) {
                let newRow = startRow + row;
                let newCol = startCol + col;
                if (newRow < 0 || newCol < 0 || newRow >= 8 || newCol >= 8 || grid[newRow][newCol]) {
                    return false;
                }
            }
        }
    }
    return true;
}


// Události přetahování
gridElement.addEventListener('dragover', (event) => {
    event.preventDefault();
    const cellIndex = Array.from(gridElement.children).indexOf(event.target);
    if (cellIndex === -1) return;
    const startRow = Math.floor(cellIndex / 8);
    const startCol = cellIndex % 8;
    highlightPreview(startRow, startCol);
});

gridElement.addEventListener('dragleave', () => {
    clearHighlight();
});

gridElement.addEventListener('drop', (event) => {
    event.preventDefault();
    const cellIndex = Array.from(gridElement.children).indexOf(event.target);
    if (cellIndex === -1) return;
    const startRow = Math.floor(cellIndex / 8);
    const startCol = cellIndex % 8;
    const draggedData = JSON.parse(event.dataTransfer.getData('shape'));
    selectedShape = draggedData.shape;
    selectedColor = draggedData.color;
    placeShape(startRow, startCol);
});



// Náhodné tvary
function getRandomShapes() {
    return [...allShapes].sort(() => 0.5 - Math.random()).slice(0, 3);
}

// Zahájení hry
availableShapes = getRandomShapes();
createGrid();
renderShapes();

// Kontrola a mazání vyplněných řádků/sloupců
function placeShape(startRow, startCol) {
    if (selectedShape && canPlaceShape(selectedShape, startRow, startCol)) {
        for (let row = 0; row < selectedShape.length; row++) {
            for (let col = 0; col < selectedShape[row].length; col++) {
                if (selectedShape[row][col]) {
                    grid[startRow + row][startCol + col] = { color: selectedColor };
                }
            }
        }

        score += selectedShape.flat().filter(Boolean).length;
        scoreDisplay.textContent = `Skóre: ${score}`;

        checkForCompletedRowsAndCols(); // Oprava – zavolání mazání vyplněných řádků/sloupců

        availableShapes = availableShapes.filter(shape => shape.color !== selectedColor);
        renderShapes();
        createGrid();

        if (availableShapes.length === 0) {
            availableShapes = getRandomShapes();
            renderShapes();
        }

        selectedShape = null;
        selectedColor = '';
    } else {
        alert("Nelze umístit tvar! Zkuste jiné místo.");
    }
}

function checkForCompletedRowsAndCols() {
    let clearedBlocks = 0;

    // Kontrola řádků
    for (let row = 0; row < 8; row++) {
        if (grid[row].every(cell => cell !== 0 && cell !== null)) {  // Opravená podmínka
            grid[row] = Array(8).fill(0);
            clearedBlocks += 8;
        }
    }

    // Kontrola sloupců
    for (let col = 0; col < 8; col++) {
        let fullCol = true;
        for (let row = 0; row < 8; row++) {
            if (grid[row][col] === 0 || grid[row][col] === null) {  // Opravená podmínka
                fullCol = false;
                break;
            }
        }
        if (fullCol) {
            for (let row = 0; row < 8; row++) {
                grid[row][col] = 0;
                clearedBlocks++;
            }
        }
    }

    score += clearedBlocks;
    scoreDisplay.textContent = `Skóre: ${score}`;

    createGrid(); // Překreslení mřížky po mazání
}
let draggingShape = null; // Aktuálně přetahovaný tvar
let draggingColor = ""; // Barva přetahovaného tvaru

// Přidání události dragstart na tvary
shapeSelectionElement.addEventListener("dragstart", (event) => {
    const shapeIndex = Array.from(shapeSelectionElement.children).indexOf(event.target.closest('.shape'));
    if (shapeIndex !== -1) {
        draggingShape = availableShapes[shapeIndex].shape;
        draggingColor = availableShapes[shapeIndex].color;
        event.dataTransfer.setData("shape", JSON.stringify(availableShapes[shapeIndex]));
    }
});

// Zvýraznění oblasti pro umístění tvaru (náhled během přetahování)
function highlightPreview(startRow, startCol) {
    clearHighlight(); // Nejprve vyčistit předchozí náhled

    if (!draggingShape) return; // Pokud nic netáhneme, neukazujeme nic

    for (let row = 0; row < draggingShape.length; row++) {
        for (let col = 0; col < draggingShape[row].length; col++) {
            if (draggingShape[row][col]) {
                let newRow = startRow + row;
                let newCol = startCol + col;

                if (newRow < 8 && newCol < 8) {
                    const cellIndex = newRow * 8 + newCol;
                    const cellElement = gridElement.children[cellIndex];

                    if (cellElement && grid[newRow][newCol] === 0) {
                        cellElement.style.backgroundColor = draggingColor;
                        cellElement.style.opacity = "0.5"; // Průhledný náhled
                        cellElement.classList.add("preview");
                    }
                }
            }
        }
    }
}

// Vyčištění náhledu
function clearHighlight() {
    document.querySelectorAll(".preview").forEach(cell => {
        cell.style.opacity = "1";
        cell.style.backgroundColor = "";
        cell.classList.remove("preview");
    });
}

// Události pro hover efekt při přetahování
gridElement.addEventListener("dragover", (event) => {
    event.preventDefault();
    
    const cellIndex = Array.from(gridElement.children).indexOf(event.target);
    if (cellIndex === -1) return;

    const startRow = Math.floor(cellIndex / 8);
    const startCol = cellIndex % 8;

    highlightPreview(startRow, startCol);
});

// Když myš opustí plochu, smaže se náhled
gridElement.addEventListener("dragleave", () => {
    clearHighlight();
});

// Událost pro umístění tvaru
gridElement.addEventListener("drop", (event) => {
    event.preventDefault();
    clearHighlight(); // Odstranění náhledu po položení

    const cellIndex = Array.from(gridElement.children).indexOf(event.target);
    if (cellIndex === -1) return;

    const startRow = Math.floor(cellIndex / 8);
    const startCol = cellIndex % 8;

    const draggedData = JSON.parse(event.dataTransfer.getData("shape"));
    selectedShape = draggedData.shape;
    selectedColor = draggedData.color;

    placeShape(startRow, startCol);
});

// Přidáme do HTML prvek pro zobrazení Game Over zprávy
const gameOverElement = document.createElement('div');
gameOverElement.id = 'game-over';
gameOverElement.style.position = 'absolute';
gameOverElement.style.top = '50%';
gameOverElement.style.left = '50%';
gameOverElement.style.transform = 'translate(-50%, -50%)';
gameOverElement.style.background = 'rgba(0, 0, 0, 0.8)';
gameOverElement.style.color = 'white';
gameOverElement.style.padding = '20px';
gameOverElement.style.fontSize = '2rem';
gameOverElement.style.textAlign = 'center';
gameOverElement.style.display = 'none'; // Skryté na začátku
gameOverElement.innerHTML = 'Game Over!';
document.body.appendChild(gameOverElement);

// Přidání tlačítka pro restartování hry
const restartButton = document.createElement('button');
restartButton.textContent = 'Restartovat Hru';
restartButton.style.marginTop = '20px';
restartButton.addEventListener('click', restartGame);

// Funkce pro kontrolu, zda je tlačítko již přidáno
function addRestartButton() {
    if (!gameOverElement.contains(restartButton)) {
        gameOverElement.appendChild(restartButton);
    }
}

// Funkce pro restartování hry
function restartGame() {
    // Resetování proměnných
    grid = Array(8).fill(null).map(() => Array(8).fill(0));
    availableShapes = getRandomShapes();
    score = 0;
    scoreDisplay.textContent = `Skóre: ${score}`;

    // Skrytí zprávy "Game Over"
    gameOverElement.style.display = 'none';

    // Znovu vykreslení mřížky a tvarů
    createGrid();
    renderShapes();
}

function checkGameOver() {
    for (const { shape } of availableShapes) {
        for (let row = 0; row <= 8 - shape.length; row++) {
            for (let col = 0; col <= 8 - shape[0].length; col++) {
                if (canPlaceShape(shape, row, col)) {
                    return false; // Pokud existuje možnost umístění, hra pokračuje
                }
            }
        }
    }
    gameOverElement.style.display = 'block'; // Zobrazí zprávu Game Over
    addRestartButton(); // Přidání tlačítka pro restart
    return true;
}



// Po každém umístění tvaru zkontrolujeme, jestli hra neskončila
function placeShape(startRow, startCol) {
    if (selectedShape && canPlaceShape(selectedShape, startRow, startCol)) {
        for (let row = 0; row < selectedShape.length; row++) {
            for (let col = 0; col < selectedShape[row].length; col++) {
                if (selectedShape[row][col]) {
                    grid[startRow + row][startCol + col] = { color: selectedColor };
                }
            }
        }

        score += selectedShape.flat().filter(Boolean).length;
        scoreDisplay.textContent = `Skóre: ${score}`;

        checkForCompletedRowsAndCols();

        availableShapes = availableShapes.filter(shape => shape.color !== selectedColor);
        renderShapes();
        createGrid();

        if (availableShapes.length === 0) {
            availableShapes = getRandomShapes();
            renderShapes();
        }

        selectedShape = null;
        selectedColor = '';

        if (checkGameOver()) {
            return; // Pokud je game over, ukončíme funkci
        }
    } else {
    }
}

// Funkce pro restartování hry
function restartGame() {
    // Resetování proměnných
    grid = Array(8).fill(null).map(() => Array(8).fill(0));
    availableShapes = getRandomShapes();
    score = 0;
    scoreDisplay.textContent = `Skóre: ${score}`;

    // Skrytí zprávy "Game Over"
    gameOverElement.style.display = 'none';

    // Znovu vykreslení mřížky a tvarů
    createGrid();
    renderShapes();
}


