import * as cellular from './cell.js';
import WebSocket from 'ws';
import dotenv from 'dotenv';
import {Chalk} from 'chalk';


const COLOR = {
    WHITE: '#FFFFFF',
    RED: '#FF0000',
    GREEN: '#00FF00',
}

// get cl args
if (process.argv.length > 2) {
    var channel = process.argv[2];
} else {
    write("Arg 2 'channel' is required", COLOR.RED)
    process.exit(1);
}

// load .env file
dotenv.config();
const username = process.env.TWITCH_USER_ACCOUNT;
if (!username) {
    write("Environment variable 'TWITCH_USER_ACCOUNT' is required", COLOR.RED)
    process.exit(1);
}
const token = process.env.TWITCH_AUTH_TOKEN;
if (!token) {
    write("Environment variable 'TWITCH_AUTH_TOKEN' is required", COLOR.RED)
    process.exit(1);
}


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

const client = new WebSocket('ws://irc-ws.chat.twitch.tv:80');

client.on('open', function() {
    write('WebSocket Connected');
    // Send CAP (optional), PASS, and NICK messages
    client.send('CAP REQ :twitch.tv/membership twitch.tv/tags twitch.tv/commands');
    client.send('PASS oauth:' + token);
    client.send('NICK ' + username);

    client.send(`JOIN #${channel},#${channel}`);

    cellular.addShapeCenter(growthPattern);
});

client.on('message', function(buffer) {
    let uft8message = buffer.toString('utf8');
    parseMessages(uft8message);
});

client.on('close', function() {
    write('WebSocket Closed', COLOR.WHITE);
});

client.on('error', function(error) {
    write("WebSocket Error: " + error.toString(), COLOR.RED);
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
    client.send(`PONG :tmi.twitch.tv\r\n`);
    write('PING PONG', COLOR.WHITE);
    cellular.addShapeCenter(growthPattern);
}

function getChat(msg) {
    let user = getUsername(msg);
    let color = getUsernameColor(msg);
    let chat = getChatMessage(msg);
    
    writeChat(user, color, chat);

    // random direction glider
    let i = randomInt(4);
    cellular.addShapeRandom(gliders[i]);
}

function getUsername(msg) {
    const DISPLAY_NAME = 'display-name=';
    let start = msg.indexOf(DISPLAY_NAME) + DISPLAY_NAME.length;
    let end = msg.indexOf(';', start);
    let user = msg.substring(start, end);

    return user;
}

function getUsernameColor(msg) {
    const COLOR = 'color=';
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
    client.send(`PRIVMSG #${channel} :${msg}`);
}

function randomInt(max) {
    return Math.floor(Math.random() * max);
}

const chalk = new Chalk({level: 2})
function write(msg, color = COLOR.WHITE){
    if (process.stdout.isTTY) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0, cellular.rows + 2);
        process.stdout.write(chalk.hex(color)(msg));
        process.stdout.clearScreenDown();
        process.stdout.cursorTo(0, 0);
    } else {
        console.log(msg);
    }
}

function writeChat(user, color, msg) {
    if (process.stdout.isTTY) {
        process.stdout.clearLine();
        process.stdout.cursorTo(0, cellular.rows + 2);
        process.stdout.write(chalk.hex(color)(user) + chalk.white(': ' + msg));
        process.stdout.clearScreenDown();
        process.stdout.cursorTo(0, 0);
    } else {
        console.log(msg)
    }
}

var iv = setInterval(function () {
    cellular.updateState();
    cellular.updateBoard();

}, 50);
