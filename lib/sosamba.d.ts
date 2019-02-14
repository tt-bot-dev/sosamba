declare module "sosamba" {
    import { Client as ErisClient, Collection, ClientOptions } from "eris";
    import {Writable} from "stream";
    export class Client extends ErisClient {
        constructor(token: string, options: ClientOptions & {
            log: LogOptions
        });

        public loadCommands(path?: string);
        public loadEvents(path?: string);
        public log: Logger;
        public commands: Collection<object>;
        public events: Collection<Event>;
    }
    class SosambaBase {
        public constructor(sosamba: Client, fileName?: string, filePath?: string);
        public sosamba: Client;
        public file: string;
        public path: string;
        public id: string;
        public log: Logger;

        public mount(): void;
        public unmount(): void;
    }

    export class Event extends SosambaBase {
        public constructor(sosamba, fileName, filePath, options: {once: boolean, name: string});
        public prerequisites(...args): boolean;
        public run(...args): any;
    }

    export class Logger extends console.Console {
        constructor(options: { stdout ?: Writable[], stderr ?: Writable[], ignoreErrors: boolean, level: string[], name: string[] })
    }
}