var charm = require('charm')();
charm.pipe(process.stdout);
charm.reset();
const cellular = require('./cell.js');


const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const token = "";
const username = "";
const channel = "";


const growthPattern = [
    '0000000',
    '0111010',
    '0100000',
    '0000110',
    '0011010',
    '0101010',
    '0000000'
];

// rotate in code later?
const gliders = [
    [ // down right
        '001',
        '101',
        '011',
    ], [ // down left
        '100',
        '101',
        '110',
    ], [ // up right
        '011',
        '101',
        '001',
    ], [ // up left
        '110',
        '101',
        '100',
    ]
];

function randomInt(max) {
    return Math.floor(Math.random() * max);
}


client.on('connect', function(connection) {
    //console.log('WebSocket Client Connected');
    // Send CAP (optional), PASS, and NICK messages
    connection.sendUTF('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands');
    connection.sendUTF('PASS oauth:' + token);
    connection.sendUTF('NICK ' + username);

    connection.sendUTF(`JOIN #${channel},#${channel}`);




    connection.on('error', function(error) {
        wswrite("Connection Error: " + error.toString());
    });
    connection.on('close', function() {
        wswrite('echo-protocol Connection Closed');
    });
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            
            // ping
            if (message.utf8Data === 'PING :tmi.twitch.tv\r\n') {
                sendPong();
                cellular.addShapeCenter(growthPattern);
            } else {
                parseMessages(message.utf8Data);
            }


            //wswrite("Received: '" + message.utf8Data + "'");

            // random direction glider
            let i = randomInt(4);
            cellular.addShapeRandom(gliders[i]);
        }
    });

    function parseMessages(messages) {
        let msgs = messages.split('\r\n');
        for (let msg of msgs) {
            parseMessage(msg);
        }
    }
    
    function parseMessage(msg) {
        if (msg.startsWith('PING :')) {
            sendPong();
        } else if (msg.includes('PRIVMSG')) {
            getChat(msg);
        } else if (msg.includes('GLOBALUSERSTATE')) {
            // getGlobalUserState(msg);
        } else if (msg.includes('USERSTATE')) {
            // getUserState(msg);
        }
    }
    
    function sendPong() {
        connection.sendUTF(`PONG :tmi.twitch.tv\r\n`);
    }

    function getChat(msg) {
        let user = getUsername(msg);
        let color = getUsernameColor(msg);
        let chat = getChatMessage(msg);
        
        writeChat(user, color, chat);
    }

    function getUsername(msg) {
        const DISPLAY_NAME = 'display-name=';
        let start = msg.indexOf(DISPLAY_NAME) + DISPLAY_NAME.length;
        let end = msg.indexOf(';', start);
        let user = msg.substring(start, end);

        return user;
    }


    function getUsernameColor(msg) {
        const COLOR = 'color=#';
        let c_start = msg.indexOf(COLOR) + COLOR.length;
        let c_end = msg.indexOf(';', c_start);
        let color = msg.substring(c_start, c_end);

        return color;
    }

    function getChatMessage(msg) {
        const CHAT_MSG = 'PRIVMSG';
        let start = msg.indexOf(CHAT_MSG) + CHAT_MSG.length;
        let msg_start = msg.indexOf(':', start) + 1;
        let chat = msg.substring(msg_start);

        return chat;
    }
    

    function sendMessage(msg) {
        connection.sendUTF(`PRIVMSG #${channel} :${msg}`);
    }
    
});

client.on('connectFailed', function(error) {
    wswrite('Connect Error: ' + error.toString());
});


function wswrite(msg){
    //console.log(msg);
    

    charm
        .foreground('white')
        .write(msg)
        .erase('down')
    ;

    // reset
    charm
        .position(0, 0);
}

function writeChat(user, color, msg) {
    // this color math is incorrect lol
    let colorNum = parseInt(color, 16) % 256;

    charm.position(0, cellular.rows + 2);
    charm
        .foreground(colorNum)
        .write(user)
        .foreground('white')
        .write(': ' + msg)
        .erase('down')
    ;

    // reset
    charm
        .position(0, 0);
}


client.connect('ws://irc-ws.chat.twitch.tv:80');


var iv = setInterval(function () {
    cellular.updateState();
    cellular.updateBoard();

}, 50);


