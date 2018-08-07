declare module 'socket.io-routers' {

    import {Server, Socket} from 'socket.io';

    function router(): router.Router;

    namespace router {

        export interface Router {
            (socket: Socket, fn: (err?: any) => void): void

            use(pathOrFunc: string | ((io: Server, socket: Socket, err: any, ack: ((...params: any[]) => any) | undefined) => any), func?: (io: Server, socket: Socket, path: string, params: any[], ack: ((...params: any[]) => any) | undefined, next: (err?: any) => any) => any): Router;

            onConnect(func: (io: Server, socket: Socket, next: (err?: any) => any) => any): Router;

            onDisconnect(func: (io: Server, socket: Socket, reason: string | undefined, next: (err?: any) => any) => any): Router;
        }
    }


    export default router;
}

