var charm = require('charm')();
const cellular = require('./cell.js');


const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const token = "";
const username = "";
const channel = "";

const glider = [
    '001',
    '101',
    '011'
];


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
            wswrite("Received: '" + message.utf8Data + "'");

            cellular.addShape(glider, 0, 0);
        }
    });

    function sendMessage(msg) {
        connection.sendUTF(`PRIVMSG #${channel} :${msg}`);
    }
    
});

client.on('connectFailed', function(error) {
    wswrite('Connect Error: ' + error.toString());
});



const rows = 40;

function wswrite(msg){
    //console.log(msg);
    charm.position(0, rows + 2);

    charm
    .foreground('white')
    .write(msg)
    .erase('down');
        
    charm.position(0, 0);
}



client.connect('ws://irc-ws.chat.twitch.tv:80');




var iv = setInterval(function () {
    cellular.updateState();
    cellular.updateBoard();

}, 50);







