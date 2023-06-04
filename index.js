const { getDecorators } = require('typescript');

var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();

             // dead   alive
var colors = [ 'black', 'green' ];



const rows = 20;
const cols = 40;

var board = [];
function clearBoard(size) { 
    for (let y = 0; y < rows; ++y) {
        board[y] = [];
        for (let x = 0; x < cols; ++x) {
            board[y][x] = 0;
        }
    }
}

// shape
// 0 0 1
// 1 0 1
// 0 1 1 
function initGlider() {
    board[0][2] = 1;

    board[1][0] = 1;
    board[1][2] = 1;

    board[2][1] = 1;
    board[2][2] = 1;
}


function initGliderGun() {
    board[5][1] = 1;
    board[5][2] = 1;
    board[6][1] = 1;
    board[6][2] = 1;

    
}



let stateChanges = [];

function updateState() {
    for (let y = 0; y < rows; ++y) {
        for (let x = 0; x < cols; ++x) {
            let state = board[y][x];
            let neighborCount = getNeighbors(y, x);

            // if (neighborCount > 0) {
            //     console.log(`y = ${y},  x = ${x},  neighbors = ${neighborCount}`);
            // }
            
            if (state === 1) { // alive
                switch (neighborCount) {
                    case 0:
                    case 1:
                        // underpopulation
                        let up = { y: y, x: x, val: 0 };
                        stateChanges.push(up);
                        //board[y, x] = 0; 
                        break;
                    case 2:
                    case 3:
                        // live (already alive)
                        //board[y, x] == 1; 
                        break;
                    case 4:
                    case 5:
                    case 6:
                    case 7:
                    case 8:
                        // overpopulation
                        let op = { y: y, x: x, val: 0 };
                        stateChanges.push(op);
                        //board[y, x] = 0; 
                        break;
                }
            } else { // dead
                if (neighborCount === 3) {
                    // reproduction
                    let rp = { y: y, x: x, val: 1 };
                    stateChanges.push(rp);
                    //board[y, x] = 1; 

                    // changeState()
                }
            }

        }
    }
}


// 0 0 0
// 0 X 0
// 0 0 0
function getNeighbors(y, x) {
    let count = 0;
    count += getRelativeState(y - 1, x - 1);
    count += getRelativeState(y - 1, x);
    count += getRelativeState(y - 1, x + 1);

    count += getRelativeState(y, x - 1);
    count += getRelativeState(y, x + 1);

    count += getRelativeState(y + 1, x - 1);
    count += getRelativeState(y + 1, x);
    count += getRelativeState(y + 1, x + 1);
    
    return count;
}

function getRelativeState(y, x) {
    // wrap y
    if (y >= rows) {
        y = 0;
    } else if (y < 0) {
        y = rows - 1;
    }

    // wrap x
    if (x >= cols) {
        x = 0;
    } else if (x < 0) {
        x = cols - 1;
    }

    let state = board[y][x];
    //console.log(`y = ${y},  x = ${x}`);
    return state;
}

function updateBoard() {
    // make the changes to the board
    for (let sc of stateChanges) {
        board[sc.y][sc.x] = sc.val;
        // and draw
        var color = colors[sc.val];
        charm
            .move(sc.x, sc.y)
            //.background(color)
            .foreground(color)
            .write(sc.val.toString())
        ;

        charm.position(0, 0);
        
    }
    stateChanges = [];
}

clearBoard();
initGlider();


var iv = setInterval(function () {
    updateState();
    updateBoard();

}, 100);