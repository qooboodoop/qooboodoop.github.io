importScripts('/webpact.js')

var mpad = function (x) {
    while (x.length < 8) {
        x = '0' + x
    }
    return x
}


var mstrength = function (x) {
    c = 0
    while (x[c] == '0') {
        c += 1
    }
    return c
}

var curhashstrength = function (x) {
    return mstrength(Array.from(Pact.crypto.base64UrlDecodeArr(x)).map((x) => mpad(x.toString(2))).reduce((x, y) => x + y))
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

var curhash = undefined
var running = false
var qthis = undefined
var guess = undefined
var strongest_nonce = undefined
var strongest_nonce_strength = undefined
onmessage = function (x) {
    qthis = this
    y = JSON.parse(x.data)
    if (y.type == "end") {
        running = false
        return
    }
    else if (y.type == "continue") {
        running = true
    } else if (y.type == "set_hash") {
        curhash = y.data.curhash
        if (y.data.strongest_nonce_found_strength != undefined) {

            strongest_nonce_strength = Math.max(curhashstrength(curhash), y.data.strongest_nonce_found_strength)
        } else {
            strongest_nonce_strength = curhashstrength(curhash)
        }
        // if (y.data.strongest_nonce != undefined) {
        //     strongest_nonce_strength = curhashstrength(Pact.crypto.hash(curhash + "" + y.data.strongest_nonce))
        // } else {

        //     strongest_nonce_strength = curhashstrength(curhash)
        // }
    }
    if (running) {
        for (var c = 0; c < 5000; c++) {
            guess = makeid(Math.floor(Math.random() * 31) + 1)
            if (curhashstrength(Pact.crypto.hash(curhash + "" + guess)) > strongest_nonce_strength) {
                running = false
                strongest_nonce_strength = curhashstrength(Pact.crypto.hash(curhash + "" + guess))
                strongest_nonce = guess
                console.log("miner", "fnd")
                postMessage({ res: "found", data: { nonce: guess } })
                return
            }
        }
    }
    if (running) {
        postMessage({ res: "notfoundyet", data: guess })
    }

}