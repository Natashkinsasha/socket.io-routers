socket.io-routers
================

Router to use with socket.io


## Installation

Npm
```javascript
npm install socket.io-routers
```

Yarn
```javascript
yarn add socket.io-routers
```

# Support

This library is quite fresh, and maybe has bugs. Write me an **email** to *natashkinsash@gmail.com* and I will fix the bug in a few working days.

# Quick start

```javascript

const {RouterContext, createRouter} = require('socket.io-routers');
const Server = require('socket.io');

const io = Server();

const routerContext = new RouterContext();

routerContext.onConnect((io, socket, next) => {
    doSmth();
});

routerContext.onDisconnect((io, socket, reason, next) => {
    doSmth();
});

routerContext.use("test", (socket, event, params, ack, next) => {
        doSmth()
            .then((msg)=>{
                ack(msg);
            })
            .catch((err)=>{
                next(err);
            })
});

routerContext.use((io, socket, err, ack) => {
    socket.emit("error", err.message)
});

server.use(createRouter(routerContext));


io.listen(3000);

```
