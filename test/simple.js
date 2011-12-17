var upnode = require('../');
var dnode = require('dnode');
var test = require('tap').test;

test('simple', function (t) {
    t.plan(5);
    
    var port = Math.floor(Math.random() * 5e4 + 1e4);
    var up = upnode.connect(port);
    
    var messages = [];
    var iv = setInterval(function () {
        up(function (remote) {
            remote.time(function (t) {
                messages.push(t);
            });
        });
    }, 250);
    
    setTimeout(on, 500);
    setTimeout(function () {
        off();
    }, 1000);
    setTimeout(function () {
        on();
    }, 2000);
    setTimeout(function () {
        var r0 = messages.slice(0,3).reduce(function (acc, x) {
            if (x > acc.max) acc.max = x;
            if (x < acc.min) acc.min = x;
            return acc;
        }, { min : Infinity, max : -Infinity });
        t.ok(r0.max < Date.now());
        t.ok(r0.max > Date.now() - 5000);
        t.ok(r0.max - r0.min < 10);
        
        t.ok(messages[0] < messages[messages.length-1]);
        t.ok(messages.length > 5);
        
        off();
        up.close();
        clearInterval(iv);
        t.end();
    }, 3000);
    
    var server;
    function on () {
        server = dnode(function (client, conn) {
            this.time = function (cb) { cb(Date.now()) };
        });
        server.use(upnode.ping);
        server.listen(port);
    }
    
    function off () {
        server.end();
        server.close();
    }
});
