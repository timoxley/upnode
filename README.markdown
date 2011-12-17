upnode
======

Keep a dnode connection alive and re-establish state between reconnects
with a transactional message queue.

example
=======

Write a dnode server as usual but enable the upnode ping middleware with
`server.use(upnode.ping)`.

server.js:

``` js
var dnode = require('dnode');
var upnode = require('upnode');

var server = dnode(function (client, conn) {
    this.time = function (cb) { cb(new Date().toString()) };
});
server.use(upnode.ping);
server.listen(7000);
```

Now when you want to make a call to the server, guard your connection in the
`up()` function. If the connection is alive the callback fires immediately.
If the connection is down the callback is buffered and fires when the connection
is ready again.

client.js:

``` js
var upnode = require('upnode');
var up = upnode.connect(7000);

setInterval(function () {
    up(function (remote) {
        remote.time(function (t) {
            console.log('time = ' + t);
        });
    });
}, 1000);
```

If we fire the client up first, then wait a few seconds to fire up the server:

```
$ node client.js & sleep 5; node server.js
[1] 9165
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:48 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:49 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:50 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:51 GMT-0800 (PST)
time = Fri Dec 16 2011 23:47:52 GMT-0800 (PST)
```

we can see that the first 5 seconds worth of requests are buffered and all come
through at `23:47:48`. The requests then come in one per second once the
connection has been established.

If we kill the server and bring it back again while the client is running we can
observe a similar discontinuity as all the pending requests come through at `23:50:20`:

```
$ node client.js 
time = Fri Dec 16 2011 23:50:11 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:11 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:12 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:13 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:20 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:21 GMT-0800 (PST)
time = Fri Dec 16 2011 23:50:22 GMT-0800 (PST)
```

methods
=======

var upnode = require('upnode')

var up = upnode(constructor={}).connect(...)
--------------------------------------------

Establish a new dnode-style connection with the dnode function or object
`constructor` and the connection parameters which may contain host strings, port
numbers, option objects, and a connection callback in any order.

Returns a transaction function `up()` for the connection.

If you give `.connect()` a callback, you *must* emit an `'up', remote` event on
the `conn` object with the remote object you want to make available to the
subsequent `up()` transactions.

If you don't pass a callback to `.connect()` this default callback is used:

``` js
function (remote, conn) {
    conn.emit('up', remote);
}
```

The callback must emit an `'up'` event so that state can be rebuilt between
connection interruptions. A great use for this behavior is authentication where
certain functionality is only made available through the callback to a
`.auth(username, password, cb)` function on the remote. For that case you could
write a connection callback that looks like:

``` js
function (remote, conn) {
    remote.auth(user, pass, function (err, obj) {
        if (err) console.error(err)
        else conn.emit('up', obj)
    });
}
```

and your dnode sessions will be re-authenticated between reconnects. The remote
object handle in `up()` will be the `obj` result provided by the `auth()`
callback.

Besides being passed directly to dnode's `.connect(...)`, these additional
option-object arguments are respected:

* ping - Interval in milliseconds to send pings to the remote server.
    Default 10000. Set to 0 to disable pings.
* timeout - Time in milliseconds to wait for a ping response before triggering a
    reconnect. Default 5000.
* reconnect - Time in milliseconds to wait between reconnection attempts.
    Default 1000.

var up = upnode.connect(...)
----------------------------

Shortcut for `upnode({}).connect(...)` like how `dnode.connect(...)` is a
shortcut for `dnode({}).connect(...)`.

up(cb)
------

Create a new transaction from the callback `cb`.

If the connection is ready, `cb(remote, conn)` will fire immediately.
Otherwise `cb` will be queued until the connection is available again.

upnode.ping()
-------------

Middleware that sets `this.ping` to `function (cb) { cb() }`.

In your dnode server, do `server.use(upnode.ping)`.

install
=======

With [npm](http://npmjs.org) do:

    npm install upnode

license
=======

MIT/X11
