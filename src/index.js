import wildcard from "wildcard";
import merge from "utils-merge";

let proto = {};

export default function Router() {
    function router(socket, next) {
        router.connect(socket.server, socket);
        socket.use(function (packet, next) {
            router.handle(packet, socket, socket.server);
            next();
        });
        socket.on("disconnect", (reason) => {
            router.disconnect(socket.server, socket, reason);
        });
        next();
    }

    merge(router, proto);
    return router;
}

proto.handle = function (packet, socket, io) {
    const path = packet[0];
    const last = packet[packet.length - 1];
    const ack = last instanceof Function ? last : undefined;
    const params = ack ? packet.slice(1, packet.length - 1) : packet.slice(1, packet.length);
    const findPath = this.routers && wildcard(path, Array.from(this.routers.keys()))[0];
    const next = (err) => {
        if(err){
            this.errorHandler && this.errorHandler(io, socket, path, params, ack, err);
        }
    }
    findPath && this.routers.get(findPath)(io, socket, path, params, ack, next);
}

proto.connect = function (io, socket) {
    this.con && this.con(io, socket);
}

proto.disconnect = function (io, socket, reason) {

    this.dis && this.dis(io, socket, reason);
}

proto.use = function (pathOrFunc, func) {
    if (typeof pathOrFunc === "function") {
        this.errorHandler = pathOrFunc
    } else {
        const path = pathOrFunc;
        if (!this.routers) {
            this.routers = new Map();
        }

        this.routers.set(path, func);
    }
    return this;
}

proto.onConnect = function (func) {
    this.con = func;
    return this;
}

proto.onDisconnect = function (func) {
    this.dis = func;
    return this;
}




