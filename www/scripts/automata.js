var automata = {};

automata.colorLightBlue900 = "#01579B";
automata.colorYellow600 = "#FDD835";
automata.colorRed600 = "#E53935";
automata.colorBlue600 = "#1E88E5";
automata.colorGreenA400 = "#00E676";

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
    this.lineColor = automata.colorLightBlue900;
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
    this.liveColor = "white";
    this.deadColor = "black";
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

// renders current state to canvas
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

// Wireworld inherits from GridWorld
automata.Wireworld = function(rows, cols) {
    automata.GridWorld.call(this, rows, cols);
    this.emptyColor = "black";
    this.conductorColor = automata.colorYellow600;
    this.electronHeadColor = automata.colorBlue600;
    this.electronTailColor = automata.colorRed600;
    this.styles = {
        0: this.emptyColor,
        1: this.conductorColor,
        2: this.electronHeadColor,
        3: this.electronTailColor,
    };
}
automata.Wireworld.prototype = Object.create(automata.GridWorld.prototype);
automata.Wireworld.prototype.constructor = automata.Wireworld;

automata.Wireworld.prototype.nextCellValue = function(row, col) {
    var thisValue = this.cells[row][col];
    if (thisValue == 0) { // empty
        return 0;
    } else if (thisValue == 1) { // conductor
        // count eight connected electron head neighbors
        var electronHeads = 0;
        electronHeads += this.isInBounds(row-1, col-1) && this.cells[row-1][col-1] == 2;
        electronHeads += this.isInBounds(row, col-1) && this.cells[row][col-1] == 2;
        electronHeads += this.isInBounds(row+1, col-1) && this.cells[row+1][col-1] == 2;
        electronHeads += this.isInBounds(row-1, col) && this.cells[row-1][col] == 2;
        electronHeads += this.isInBounds(row+1, col) && this.cells[row+1][col] == 2;
        electronHeads += this.isInBounds(row-1, col+1) && this.cells[row-1][col+1] == 2;
        electronHeads += this.isInBounds(row+0, col+1) && this.cells[row][col+1] == 2;
        electronHeads += this.isInBounds(row+1, col+1) && this.cells[row+1][col+1] == 2;
        if (electronHeads == 1 || electronHeads == 2) {
            return 2;
        } else {
            return 1;
        }
    } else if (thisValue == 2) { // electron head
        return 3;
    } else { // electron tail
        return 1;
    }
}

// renders current state to canvas
automata.Wireworld.prototype.render = function(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = this.emptyColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var cellWidth = canvas.width / this.cols;
    var cellHeight = canvas.height / this.rows;
    for (var r = 0; r < this.rows; r++) {
        for (var c = 0; c < this.cols; c++) {
            var styleIndex = this.cells[r][c];
            if (styleIndex != 0) {
                ctx.fillStyle = this.styles[styleIndex];
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

// Rule110 inherits from GridWorld, though it is an elementary automata
automata.Rule110 = function(rows, cols) {
    automata.GridWorld.call(this, rows, cols);
    this.zeroColor = "black";
    this.oneColor = "white";
    this.currentRowColor = automata.colorGreenA400;
}
automata.Rule110.prototype = Object.create(automata.GridWorld.prototype);
automata.Rule110.prototype.constructor = automata.Rule110;

automata.Rule110.prototype.makeDefaultCells = function() {
    return automata.make2DArray(this.rows, this.cols, function(i, j) { return false; });
}

automata.Rule110.prototype.nextCellValue = function(row, col) {
    if (row == this.rows-1) {
        var left = this.cells[row][(col+this.cols-1)%this.cols];
        var right = this.cells[row][(col+1)%this.cols];
        var n = 100 * left + 10 * this.cells[row][col] + 1 * right;
        return (n != 111 && n != 100 && n != 0);
    } else {
        return this.cells[row+1][col];
    }
}



// renders current state to canvas
automata.Rule110.prototype.render = function(canvas) {
    var ctx = canvas.getContext('2d');
    ctx.fillStyle = this.zeroColor;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    var cellWidth = canvas.width / this.cols;
    var cellHeight = canvas.height / this.rows;
    ctx.fillStyle = this.oneColor
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
    ctx.fillRect(canvas.width-lineThickness, 0, lineThickness, canvas.height);
    // box around current row
    ctx.fillStyle = this.currentRowColor;
    ctx.fillRect(0, (this.rows-1)*cellHeight-halfLineThickness, canvas.width, lineThickness);
    ctx.fillRect(0, canvas.height-lineThickness, canvas.width, lineThickness);
    ctx.fillRect(0, canvas.height-cellHeight, lineThickness, cellHeight);
    ctx.fillRect(canvas.width-lineThickness, canvas.height-cellHeight, lineThickness, cellHeight);
}

