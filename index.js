'use strict';

var cluster = require('cluster');

if(cluster.isMaster) {
    // Array.apply(null, Array(4)).forEach(function() {
    //     cluster.fork();
    // });
    cluster.fork();

    cluster.on('error', function(err) {
        console.trace(err.message);
    });

    cluster.on('exit', function(worker) {
        console.log('worker ' + worker.process.pid + ' exit');
        cluster.fork();
    });

    cluster.on('disconnect', function(worker) {
        console.log('worker ' + worker.process.pid + ' disconnect');
        cluster.fork();
    });
} else {
    var d = require('domain').create();

    d.on('error', function() {
        cluster.worker.disconnect();
    });

    d.run(init);
}

function init() {

    var dgram = require('dgram');

    var server = dgram.createSocket('udp4');

    server.on('error', function(err) {
        console.trace(err.message);
        // server.close();
    });

    server.on('close', function() {
        console.log('server closed @ %s', Date());
    });

    server.on('message', function(msg, remote) {
        console.log('server got: ' + msg + ' from ' + remote.address + ':' + remote.port);

        msg = JSON.parse(msg);
        msg.params.push(function() {
            var message = JSON.stringify(Array.prototype.slice.call(arguments));

            message = new Buffer(message);

            server.send(message, 0, message.length, remote.port, remote.address, function(err, bytes) {
            });
        });
        methods[msg.method].apply(this, msg.params);
    });

    server.on('listening', function () {
        var address = server.address();

        console.log('server listening ' + address.address + ':' + address.port);
    });

    server.bind(5000);

    var methods = {
        check: function(opt, fn) {
            if(!opt) return fn(new Error('params error'));

            if(opt.uid == 'jarvisjiang' && opt.pwd == 'test') return fn(null, true);

            fn(null, false);
        }
    };
}