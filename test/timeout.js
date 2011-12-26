var upnode = require('../');
var dnode = require('dnode');
var test = require('tap').test;

test('timeout', function (t) {
    t.plan(2);
    
    var port = Math.floor(Math.random() * 5e4 + 1e4);
    var up = upnode.connect(port);
    
console.log('0');
    up(10, function (remote) {
console.log('1');
        t.ok(!remote);
        
        on();
        up(1000, function (remote) {
console.log('2');
            t.ok(remote);
            off();
            t.end();
        });
    });
    
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
