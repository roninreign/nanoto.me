import isValid from 'nano-address-validator';
import { WebSocket } from 'ws';
import ReconnectingWebSocket from 'reconnecting-websocket';
import Mustache from 'mustache';
import { rawToMega } from 'nano-unit-converter';
import { notice } from './notice';

const watch = () => {

    //elements
    const accountEl = document.getElementById('address');
    const nodeEl = document.getElementById('node');
    const watchBtn = document.getElementById('watch');
    const status = document.getElementById('status');
    const notificationsEl = document.getElementById('notifications');
    const bookmark = document.getElementById('bookmark');
    const error = document.getElementById('error');

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
        data.subtype = message.message.block.subtype;

        return data;
    }

    const setStatus = (message) => {
        status.innerHTML = message;
    }

    const watch = (node, account) => {

        if (!isValid(account)) {
            error.innerHTML = "Invalid address";
            return;
        }

        if(node.trim().length <= 5){
            error.innerHTML = "Invalid node address";

            return;
        }
        setStatus('Connecting to node...');
        // Create a reconnecting WebSocket.
        // we wait a maximum of 5 seconds before retrying.
        const ws = new ReconnectingWebSocket(node, [], {
            WebSocket: WebSocket,
            connectionTimeout: 10000,
            maxRetries: 5,
            maxReconnectionDelay: 5000,
            minReconnectionDelay: 500 // if not set, initial connection will take a few seconds by default
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
            console.log(msg.data);
            const data_json = JSON.parse(msg.data);

            if (data_json.topic === "confirmation") {
                console.log('Confirmed', data_json.message.hash);

                //extract only what we need
                const data = parseMessage(data_json);

                //render the html
                renderRow(data);

                //send notification
                if (notice.enabled()) {
                    const messageString = data.subtype + ' | ' + data.time;

                    // const icon = "https://natricon.com/api/v1/nano?address=" + data.account + "&format=png"
                    
                    notice.push(data.amount + " NANO", messageString);
                }
            }
        };
        return true;
    }

    watchBtn.addEventListener('click', () => {
        const account = accountEl.value;
        const node = nodeEl.value;

        const started = watch(node, account);
        if(started){
        setBookmark(node, account);
        }
    });

    notificationsEl.addEventListener('click',  notice.enable);

    const setBookmark = (node, address) => {
        const searchParams = new URLSearchParams(window.location.search);

        if(!searchParams.has('address') || searchParams.get("address") !== address){
            searchParams.set("address", encodeURIComponent(address));
        }

        if(!searchParams.has('node') || searchParams.get("node") !== node){
            searchParams.set("node", encodeURIComponent(node));
        }

        bookmark.href = window.location.pathname + "?" +  searchParams.toString();
        bookmark.style.display = 'inline-block';
    }

    const checkIfSearchParamsExist = () => {
        const searchParams = new URLSearchParams(window.location.search);
         if(searchParams.has('node')){
            nodeEl.value = decodeURIComponent(searchParams.get('node'));
        }
        
        if(searchParams.has('address')){
            accountEl.value = decodeURIComponent(searchParams.get('address'));
            watchBtn.dispatchEvent(new Event('click'));
        }
    }

    checkIfSearchParamsExist();
}

window.onload = watch;