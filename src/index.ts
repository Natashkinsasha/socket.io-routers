import {Socket} from "socket.io";
import * as wildcard from "micromatch"

export type Ack = (...params: any[]) => void;

export type Next = (err?: any) => void

export type Reason = 'client namespace disconnect' | 'io server disconnect' | 'io client disconnect' |  'ping timeout'  | string;

export type OnDisconnect = (socket: Socket, reason: Reason | undefined, next: Next) => void;

export type OnConnect = (socket: Socket, next: Next) => void;

export type ErrorHandler = (socket: Socket, err: any, ack: Ack | undefined) => any;

export type Handler<T extends any[]> = (socket: Socket, event: string, params: T, ack: Ack | undefined, next: Next) => any;




class RouterContext{

    public onConnectFunc?: OnConnect;
    public onDisconnectFunc?: OnDisconnect;
    public events: Array<string> = [];
    public routers: Map<string, Handler<any>> = new Map();
    public errorHandlers: Array<ErrorHandler> = [];

    public use = <T extends any[]>(eventOrFunc: string | ErrorHandler, func?: Handler<T>): void => {
        if (typeof eventOrFunc === "function") {
            this.errorHandlers.push(eventOrFunc)
        } else if (func){
            const event = eventOrFunc;
            this.events.push(event);
            this.routers.set(event, func);
        }
    }

    public onConnect = (func: OnConnect): void => {
        this.onConnectFunc = func;
    };

    public onDisconnect = (func: OnDisconnect): void => {
        this.onDisconnectFunc = func;
    };
}

function handle<T extends any[]>(context: RouterContext, event: string, args: ReadonlyArray<any>, socket: Socket)  {
    const last = args[args.length - 1];
    const ack: Ack | undefined = last instanceof Function ? last : undefined;
    const params: T = (ack ? args.slice(0, args.length - 1) : args.slice(0, args.length)) as T;
    const foundEvents = Array.from(context.routers.keys()).filter((routerEvent)=>{
        return  routerEvent === event || wildcard.isMatch(routerEvent, event)
    });
    const findEvent = foundEvents[0];
    const func: Handler<T> | undefined = findEvent ? context.routers.get(findEvent) : undefined;
    func && func(socket, event, params, ack, getNext(context, socket, ack));
}

function connect (context: RouterContext, socket: Socket, next: Next) {
    context.onConnectFunc && context.onConnectFunc(socket, next);
}

function disconnect(context: RouterContext, socket: Socket, reason: Reason | undefined, next: Next) {
    context.onDisconnectFunc && context.onDisconnectFunc(socket, reason, next);
}

function getNext(context: RouterContext, socket: Socket, ack?: Ack ) {
    return (err?: any) => {
        if(err){
            context.errorHandlers[0] && context.errorHandlers[0](socket, err, ack);
        }
    }
}

function router(context: RouterContext, socket: Socket, next: Next) {
    connect(context, socket, getNext(context, socket));

    socket.use(([ event, ...args ], next: Next) => {
        handle(context, event, args, socket);
        next();
    });

    socket.on("disconnect", (reason) => {
        disconnect(context, socket, reason, getNext(context, socket));
    });


    next();
}

function createRouter(context: RouterContext) {
    return (socket: Socket, next: Next) => router(context, socket, next)
}

export {createRouter, RouterContext}



