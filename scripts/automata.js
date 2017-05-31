var automata = {};

automata.colorBlue = "#01579B";

automata.make2DArray = function(rows, cols, valueFunc) {
    var arr = new Array(rows);
    for (var i = 0; i < rows; i++) {
        arr[i] = new Array(cols);
        for (var j = 0; j < cols; j++) {
            arr[i][j] = valueFunc(i, j);
        }
    }
    return arr;
}

automata.GridWorld = function(rows, cols) {
    this.rows = rows;
    this.cols = cols;
    this.lineColor = automata.colorBlue;
    this.liveColor = "white";
    this.deadColor = "black";
}

automata.GridWorld.prototype.makeDefaultCells = function() {
    return automata.make2DArray(this.rows, this.cols, function(i, j) { return 0; });
}

automata.GridWorld.prototype.init = function() {
    this.old_cells = this.makeDefaultCells();
    this.cells = this.makeDefaultCells();
}

// override this
automata.GridWorld.prototype.nextCellValue = function(row, col) {
    return 0;
}

automata.GridWorld.prototype.update = function() {
    var arr = this.old_cells;
    for (var i = 0; i < this.rows; i++) {
        for (var j = 0; j < this.cols; j++) {
            arr[i][j] = this.nextCellValue(i, j);
        }
    }
    this.old_cells = this.cells;
    this.cells = arr;
}

automata.GridWorld.prototype.isInBounds = function(row, col) {
    return row >= 0 && row < this.rows && col >= 0 && col < this.cols; 
}


// GameOfLife inherits from GridWorld
automata.GameOfLife = function(rows, cols) {
    automata.GridWorld.call(this, rows, cols);
}
automata.GameOfLife.prototype = Object.create(automata.GridWorld.prototype);
automata.GameOfLife.prototype.constructor = automata.GameOfLife;

automata.GameOfLife.prototype.makeDefaultCells = function() {
    return automata.make2DArray(this.rows, this.cols, function(i, j) { return false; });
}

automata.GameOfLife.prototype.nextCellValue = function(row, col) {
    // count eight connected live neighbors
    var liveNeighbors = 0;
    liveNeighbors += this.isInBounds(row-1, col-1) && this.cells[row-1][col-1];
    liveNeighbors += this.isInBounds(row, col-1) && this.cells[row][col-1];
    liveNeighbors += this.isInBounds(row+1, col-1) && this.cells[row+1][col-1];
    liveNeighbors += this.isInBounds(row-1, col) && this.cells[row-1][col];
    liveNeighbors += this.isInBounds(row+1, col) && this.cells[row+1][col];
    liveNeighbors += this.isInBounds(row-1, col+1) && this.cells[row-1][col+1];
    liveNeighbors += this.isInBounds(row+0, col+1) && this.cells[row][col+1];
    liveNeighbors += this.isInBounds(row+1, col+1) && this.cells[row+1][col+1];
    // return if cell should live or die
    if (this.cells[row][col]) {
        return (liveNeighbors == 2 || liveNeighbors == 3);
    } else {
        return liveNeighbors == 3;
    }
}


automata.GameOfLife.prototype.render = function(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = this.deadColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = this.liveColor;
    var cellWidth = canvas.width / this.cols;
    var cellHeight = canvas.height / this.rows;
    for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
            if (this.cells[r][c]) {
                ctx.fillRect(c*cellHeight, r*cellWidth, cellHeight, cellWidth);
            }
        }
    }
    var lineThickness = 4;
    var halfLineThickness = 2;
    ctx.fillStyle = this.lineColor;
    for (var r = 1; r < this.rows; r++) {
        ctx.fillRect(0, r*cellHeight-halfLineThickness, canvas.width, lineThickness);
    }
    for (var c = 1; c < this.cols; c++) {
        ctx.fillRect(c*cellWidth-lineThickness, 0, lineThickness, canvas.height);
    }
    ctx.fillRect(0, 0, canvas.width, lineThickness);
    ctx.fillRect(0, 0, lineThickness, canvas.height);
    ctx.fillRect(0, canvas.height-lineThickness, canvas.width, lineThickness);
    ctx.fillRect(canvas.width-lineThickness, 0, lineThickness, canvas.height);
}
