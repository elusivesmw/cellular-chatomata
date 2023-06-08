var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();

             // dead   alive
var colors = [ 'black', 'green' ];

const rows = 40;
const cols = 80;
const wrapping = true;

var board = Array(rows).fill('0'.repeat(cols));

function getState(x, y) {
    let char = board[y].charAt(x);
    return parseInt(char);
}

function setState(x, y, val) {
    let row = board[y];
    let chars = [...row];
    chars[x] = val;
    board[y] = chars.join('');
}

function addShapeCenter(shape) {
    let height = shape.length;
    let width = shape[0].length;

    let x = Math.floor(cols/2 - width/2);
    let y = Math.floor(rows/2 - height/2);

    addShape(shape, x, y);
}

function addShapeRandom(shape) {
    let height = shape.length;
    let width = shape[0].length;

    let x = randomInt(cols - width - 1);
    let y = randomInt(rows - height - 1);

    addShape(shape, x, y);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

function addShape(shape, bx, by) {
    if (shape.length > rows) return;
    // assume rows have same col length
    if (shape[0].length > cols) return;

    for (let r = 0; r < shape.length; ++r) {
        let sr = shape[r];

        for (let c = 0; c < sr.length; ++c) {
            let char = sr[c];
            // need to handle wrapping
            setState(bx + c, by + r, char);
        }
    }
}


let stateChanges = [];

function updateState() {
    for (let y = 0; y < rows; ++y) {
        for (let x = 0; x < cols; ++x) {
            let state = getState(x, y);
            let neighborCount = getNeighbors(x, y);

            // if (neighborCount > 0) {
            //     console.log(`y = ${y},  x = ${x},  neighbors = ${neighborCount}`);
            // }
            
            if (state === 1) { // alive
                switch (neighborCount) {
                    case 0:
                    case 1:
                        // underpopulation
                        let up = { x: x, y: y, val: 0 };
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
                        let op = { x: x, y: y, val: 0 };
                        stateChanges.push(op);
                        //board[y, x] = 0; 
                        break;
                }
            } else { // dead
                if (neighborCount === 3) {
                    // reproduction
                    let rp = { x: x, y: y, val: 1 };
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
function getNeighbors(x, y) {
    let count = 0;
    count += getRelativeState(x - 1, y - 1);
    count += getRelativeState(x    , y - 1);
    count += getRelativeState(x + 1, y - 1);

    count += getRelativeState(x - 1, y);
    count += getRelativeState(x + 1, y);

    count += getRelativeState(x - 1, y + 1);
    count += getRelativeState(x    , y + 1);
    count += getRelativeState(x + 1, y + 1);
    
    return count;
}

function getRelativeState(x, y) {
    x = wrap(x, cols);
    y = wrap(y, rows);
    if (x === null || y === null) return 0; // if no wrapping, consider out of bounds cell as dead

    let state = getState(x, y);
    
    return state;
}

function wrap(pos, max) {
    if (pos >= max) {
        return wrapping ? 0 : null;
    } else if (pos < 0) {
        return wrapping ? max - 1 : null;
    }
    return pos;
}

function updateBoard() {
    // make the changes to the board
    for (let sc of stateChanges) {
        setState(sc.x, sc.y, sc.val);
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

//addShape(glider, 0, 0);
//addShape(gliderGun, 0, 0);
//zaddShapeCenter(growthPattern);

module.exports = { updateState, updateBoard, addShape, addShapeCenter, addShapeRandom, rows };
