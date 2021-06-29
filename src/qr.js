import isValid from 'nano-address-validator';
import { getSendURI } from 'nano-uri-generator';
import QRCode from 'qrcode';
import { megaToRaw } from 'nano-unit-converter';

//elements
const canvas = document.getElementById('canvas')
const label = document.getElementById('label');
const amount = document.getElementById('amount');
const amountTarget = document.getElementById('amountTarget');
const address = document.getElementById('address');
const generate = document.getElementById('generate');
const error = document.getElementById('error');
const hide = document.getElementById('hide');
const logoSmall = document.getElementById('logoSmall');
const tooltip = document.getElementById('tooltip');

const showAmountInput = function () {
    amount.style.display = 'inline-block';
}

function setDataURL(uri, name) {
    const link = document.getElementById("download");
    link.style.display = 'inline-block'
    link.download = name;
    link.href = uri;
}

const generateCode = function () {
    const nanoAddress = address.value;
    const storeLabel = label.value;
    const sAmount = amount.value.trim();
    let raw = null;
    //clear error
    error.innerHTML = null;

    if (!isValid(nanoAddress)) {
        error.innerHTML = "Invalid address";
        return;
    }

    try {
        raw = sAmount.length > 0 ? megaToRaw(sAmount) : null;

    } catch (e) {
        error.innerHTML = "Invalid amount";
        return;
    }

    if (raw) {
        amountTarget.innerHTML = sAmount + " NANO";
    }

    const toQr = getSendURI(nanoAddress, raw, storeLabel);

    QRCode.toDataURL(toQr, { width: "1000" }, function (err, url) {
        setDataURL(url, 'qrcode');
    });

    QRCode.toCanvas(canvas, toQr, { width: "300" }, function (error) {
        if (error) console.error(error);

        // hide.style.display = 'inline-block';
        changeTitle();
        hideInput();


    });
    tooltip.style.display = 'block';
}

const clearQr = () => {
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);

    download.style.display = "none";
}

const hideInput = () => {
    const targets = document.getElementsByClassName('hideTarget');
    const len = targets.length - 1;
    for (let i = 0; i <= len; i++) {
        const el = targets[i];
        el.style.display = 'none';
    }
}

const showInput = () => {
    const targets = document.getElementsByClassName('hideTarget');
    const len = targets.length - 1;

    clearQr();

    for (let i = 0; i <= len; i++) {
        const el = targets[i];
        el.style.display = null;
    }

}


const changeTitle = () => {
    const storeLabel = document.getElementById('label').value.trim() || "";
    const labelTarget = document.getElementById("labelTarget");
    labelTarget.innerHTML = storeLabel;
    logoSmall.setAttribute('class', '');
}

const hideTooltip = () => {
    tooltip.style.display = 'none';
}

//Events
label.addEventListener('keyup', changeTitle);
label.addEventListener('blur', changeTitle);
// hide.addEventListener('click', hideInput);
address.addEventListener('keypress', clearQr);
generate.addEventListener('click', generateCode);
canvas.addEventListener('dblclick', showInput);
amountTarget.addEventListener('dblclick', showInput);
tooltip.addEventListener('click', hideTooltip);