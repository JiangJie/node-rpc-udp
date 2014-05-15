'use strict';

var dgram = require('dgram');

function done(err, f) {
    console.log(err, f);
}

function RPC(client, opt) {
    var self = this;

    this._host = opt.host;
    this._port = opt.port;

    this._client = client;

    this._client.on('message', function(msg, remote) {
        if(remote.address == self._host && remote.port == self._port) {
            self._client.close();
            console.log('client got: ' + msg + ' from ' + remote.address + ':' + remote.port);

            self._done.apply(self, JSON.parse(msg));
        }
    });
}

RPC.prototype.send = function(opt, fn) {
    var message  = JSON.stringify(opt);
    message = new Buffer(message);

    this._client.send(message, 0, message.length, this._port, this._host);

    this._done = fn;
};

function udpr(opt) {
    var client = dgram.createSocket('udp4');

    return new RPC(client, opt);
}

var opt = {
    method: 'check',
    params: [{uid: 'jarvisjiang', pwd: 'test'}]
};
udpr({
    host: '127.0.0.1',
    port: 5000
}).send(opt, function(err, res) {
    console.log(err, res);
})