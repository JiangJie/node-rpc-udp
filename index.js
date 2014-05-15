'use strict';

var dgram = require('dgram');

var server = dgram.createSocket('udp4');

server.on('error', function(err) {
    console.trace(err.message);
    server.close();
});

server.on('message', function(msg, rinfo) {
    console.log('server got: ' + msg + ' from ' +
    rinfo.address + ':' + rinfo.port);

    msg = JSON.parse(msg);
    msg.params.push(function() {
        var message = JSON.stringify(Array.prototype.slice.call(arguments));
        console.log(message);
        message = new Buffer(message);
        server.send(message, 0, message.length, rinfo.port, rinfo.address, function(err, bytes) {
        });
    });
    methods[msg.method].apply(this, msg.params);
});

server.on('listening', function () {
    var address = server.address();
    console.log('server listening ' +
        address.address + ':' + address.port);
});

server.bind(5000);

var methods = {
    check: function(opt, fn) {
        if(!opt) return fn(new Error('params error'));

        if(opt.uid == 'jarvisjiang' && opt.pwd == 'test') return fn(null, true);

        fn(null, false);
    }
};