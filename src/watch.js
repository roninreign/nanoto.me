import { WebSocket } from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';
import Mustache from 'mustache';
import { rawToMega } from 'nano-unit-converter';

const watch = () => {
    //elements
    const accountEl = document.getElementById('address');
    const nodeEl = document.getElementById('node');
    const watchBtn = document.getElementById('watch');
    const status = document.getElementById('status');
    //template
    const template = document.getElementById('item-template').innerHTML;
    Mustache.parse(template);

    const render = (data) => {
        return Mustache.render(template, data);
    }

    const renderRow = (data) => {

        const rendered = render(data);
        const confirmations = document.getElementById('confirmations');
        confirmations.innerHTML = rendered + confirmations.innerHTML;
    }

    const parseMessage = (message) => {
        const data = {};

        data.time = new Date(Number(message.time));
        data.hash = message.message.hash;
        data.account = message.message.account;
        data.amount = rawToMega(message.message.amount);

        return data;
    }

    const setStatus = (message) => {
        status.innerHTML = message;
    }

    const watch = (node, account) => {
        setStatus('Connecting to node...');

        // console.log("watching", account, node);
        // Create a reconnecting WebSocket.
        // we wait a maximum of 5 seconds before retrying.
        const ws = new ReconnectingWebSocket(node, [], {
            WebSocket: WebSocket,
            connectionTimeout: 1000,
            maxRetries: 100000,
            maxReconnectionDelay: 5000,
            minReconnectionDelay: 10 // if not set, initial connection will take a few seconds by default
        });

        // As soon as we connect, subscribe to block confirmations
        ws.onopen = () => {
            setStatus("Connected to node");
            const confirmation_subscription = {
                "action": "subscribe",
                "topic": "confirmation",
                options: {
                    accounts: [account]
                }
            }

            ws.send(JSON.stringify(confirmation_subscription));
        };

        // The node sent us a message
        ws.onmessage = msg => {
            // console.log(msg.data);
            const data_json = JSON.parse(msg.data);

            if (data_json.topic === "confirmation") {
                console.log('Confirmed', data_json.message.hash);
                const data = parseMessage(data_json);
                renderRow(data);
            }
        };

    }

    watchBtn.addEventListener('click', () => {
        const account = accountEl.value;
        const node = nodeEl.value;

        watch(node, account);
    });
}

window.onload = watch;