import { runInContext } from "vm";

declare module "sosamba" {
    import { Client as ErisClient,
        Collection,
        ClientOptions,
        Message,
        Guild,
        TextChannel,
        User,
        Member,
        
        
    } from "eris";
    import { Writable } from "stream";

    type StopReason = 0 | 1 | 2 | 3;
    export class Client extends ErisClient {
        constructor(token: string, options: ClientOptions & {
            log: LogOptions
        });

        public loadCommands(path?: string);
        public loadEvents(path?: string);
        public log: Logger;
        public commands: Collection<Command>;
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
        public constructor(sosamba: Client, fileName: string, filePath: string, options: {once: boolean, name: string});
        public prerequisites(...args: any[]): boolean;
        public run(...args: any[]): any;
    }

    export class Command extends SosambaBase {
        public constructor(sosamba: Client, fileName: string, filePath: string, options: {
            name: string,
            args: string,
            argParser: ArgumentParser
        })
        public run(ctx, args: any): void
    }

    export class ArgumentParser {
        public constructor(client: Client);
        parse(content: string, ctx: any): any
    }

    export class Context {
        public constructor(sosamba: Client, msg: Message);
        public sosamba: Client;
        public guild: Guild;
        public channel: TextChannel;
        public author: User;
        public member: Member;
        public message: Message;
        async send(content: MessageContent, file?: MessageFile): Promise<Message>;
        async registerReactionMenu(menu: ReactionMenu): Promise<void>;
    }
    export class Logger extends console.Console {
        constructor(options: { stdout ?: Writable[], stderr ?: Writable[], ignoreErrors: boolean, level: string[], name: string[] })
    }

    export function constructQuery<T>(ctx: Context, collection: Collection<T>|T[], predicate: (query: string) => (item: T) => boolean, itemName: string, displayAs?: (item: T) => string): T;
    export class GlobalUser extends User {}
    export class ReactionMenu {
        public constructor(ctx: Context, msg: Message);
        public sosamba: Client;
        public user: string;
        public callbacks: {
            [key: string]: (menu: ReactionMenu) => void | Promise<void>;
        };
        public ctx: Context;
        public context: Context;
        public message: Message;
        public id: string;
        public timeout: number | boolean;
        public async canRunCallback(emoji: string): Promise<boolean>;
        public async prepareEmoji(): Promise<void>;
        public async stopCallback(reason: StopReason): Promise<void>;
    }

    export class SimpleArgumentParser extends ArgumentParser {
        public parse(content: string): string[];
    }

    export class SwitchArgumentParser extends SimpleArgumentParser {
        public constructor(sosamba: Client, args: {
            [key: string]: {
                type: any,
                default: ((ctx: Context) => any) | any;
            }
        })
        // Help users to convert it to their struct
        public async parse<T>(content: string, ctx: Context): T;
    }
}