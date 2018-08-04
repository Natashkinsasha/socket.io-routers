import {Socket, Server} from "socket.io";

declare function router(): router.Router;

declare namespace router {

    export interface Router {
        (socket: Socket, fn: (err?: any) => void): void

        use(pathOrFunc: string | ((io: Server, socket: Socket, path: string, params: any[], ack: (params?: any[]) => any, err: any) => any), func?: (io: Server, socket: Socket, path: string, params: any[], ack: (params?: any[]) => any, next: (err?: any) => any) => any): Router;

        onConnect(func: (io: Server, socket: Socket) => any): Router;

        onDisconnect(func: (io: Server, socket: Socket, reason: string | undefined) => any): Router;
    }
}

export = router;