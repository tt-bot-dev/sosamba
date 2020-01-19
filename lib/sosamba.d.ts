declare module "sosamba" {
    import {
        Client as ErisClient,
        Collection,
        ClientOptions,
        Message,
        Guild,
        TextChannel,
        User,
        Member,
        AnyGuildChannel,
        MessageContent,
        MessageFile,
        GuildChannel
    } from "eris";
    import { Writable } from "stream";
    type StopReason = 0 | 1 | 2 | 3;
    type Prefix = string | string[];
    type Asyncable<T> = T | Promise<T>;
    type PrefixFunc = (ctx: Context, client?: Client) => Asyncable<Prefix>;
    interface LogOptions {
        level?: string[]
    }

    var Eris: typeof import("eris")
    export class Serializers {
        static GlobalUser: typeof GlobalUser;
        static Member: typeof Member;
        static User: typeof User;
        static Guild: typeof Guild;
        static GuildChannel: typeof GuildChannel;
    }

    class I18N {
        constructor(bot: Client);
        public addLanguages(path: string): Promise<void>
        public getTranslation(term: string, lang: string, ...args: any): Promise<string>;
    }

    type SosambaClientOptions = ClientOptions & {
        log: LogOptions;
        prefix: Prefix | PrefixFunc;
        provideCommand: (ctx: Context, command: string) => Asyncable<Command>;
    };

    export class Client extends ErisClient {
        constructor(token: string, options?: SosambaClientOptions);
        public options: SosambaClientOptions;

        public loadCommands(path?: string): Promise<void>;
        public loadEvents(path?: string): Promise<void>;
        public log: Logger;
        public commands: Collection<Command>;
        public events: Collection<Event>;
        public reactionMenus: Collection<ReactionMenu>;
        public getPrefix(ctx: Context): Promise<Prefix>;
        public hasBotPermission(channel: AnyGuildChannel, permission: string): boolean;
        public messageListeners: Collection<MessageListener>;
        public messageAwaiter: MessageAwaiter;
        public i18n: I18N;
    }

    export class MessageListener {
        public constructor(sosamba: Client, name?: string);
        public sosamba: Client;
        public name: string;
        public id: string;
        public prerequisites(ctx: Context): Asyncable<boolean>;
        public run(ctx: Context): Asyncable<void>;
    }

    type MessageListenerFilter = (ctx: Context) => Asyncable<boolean>;
    class MessageAwaiter extends MessageListener {
        public listeners: Map<string, {
            filter: MessageListenerFilter;
            rs<T>(obj: T): Promise<T>;
            timeout: NodeJS.Timeout;
        }>;
        public waitForMessage(ctx: Context, filter?: MessageListenerFilter, timeout?: number): Promise<Context>;
        public askYesNo(ctx: Context, returnMessage?: boolean): Promise<boolean|{
            response: boolean;
            context: Context;
        }>;
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
        public constructor(sosamba: Client, fileName: string, filePath: string, options: { once: boolean, name: string });
        public prerequisites(...args: any[]): Asyncable<boolean>;
        public run(...args: any[]): Asyncable<void>;
    }

    export class ParsingError extends Error {
        public constructor(message: string, ignore?: boolean);
        public ignore: boolean;
    }

    export class Command extends SosambaBase {
        public constructor(sosamba: Client, fileName: string, filePath: string, options: {
            name: string,
            args?: string,
            argParser?: ArgumentParser,
            description?: string,
            displayInHelp?: boolean,
            aliases?: string[];
        })
        public name: string;
        public args?: string;
        public argParser?: ArgumentParser;
        public description?: string;
        public displayInHelp: boolean;
        public aliases: string[];
        public run(ctx: Context, args: any): Asyncable<void>;
    }

    export class ArgumentParser {
        public constructor(client: Client);
        public sosamba: Client;
        parse(content: string, ctx?: Context): any;
        provideUsageString(detailed?: boolean): string;
    }

    export class Context {
        public constructor(sosamba: Client, msg: Message);
        public sosamba: Client;
        public guild: Guild;
        public channel: TextChannel;
        public author: User;
        public member: Member;
        public message: Message;
        public msg: Message;
        public send(content: MessageContent, file?: MessageFile): Promise<Message>;
        public registerReactionMenu(menu: ReactionMenu): Promise<void>;
        public waitForMessage(filter?: MessageListenerFilter, timeout?: number): Promise<Context>;
        public askYesNo(returnMessage?: boolean): Promise<boolean|{
            response: boolean;
            context: Context;
        }>;
    }
    export class Logger extends console.Console {
        constructor(options: { stdout?: Writable[], stderr?: Writable[], ignoreErrors: boolean, level: string[], name: string[] })
    }

    export function constructQuery<T extends { id: string | number }>(ctx: Context, collection: Collection<T> | T[], predicate: (query: string) => (item: T) => boolean, itemName: string, displayAs?: (item: T) => string): T;
    export class GlobalUser extends User {
        static [Symbol.hasInstance](user: any): boolean;
    }
    export class ReactionMenu {
        public constructor(ctx: Context, msg: Message);
        public sosamba: Client;
        public user: string;
        public callbacks: {
            [key: string]: (menu: ReactionMenu) => Asyncable<void>;
        };
        public ctx: Context;
        public context: Context;
        public message: Message;
        public id: string;
        public timeout: number | boolean;
        public canRunCallback(emoji: string): Asyncable<boolean>;
        public prepareEmoji(): Asyncable<void>;
        public stopCallback(reason: StopReason): Asyncable<void>;
    }

    interface SimpleArgumentParserOptions {
        filterEmptyArguments?: boolean;
        allowQuotedString?: boolean;
        separator?: string;
    }

    interface ArgumentOptions {
        type: any | any[],
        default?: ((ctx: Context) => any) | any;
        name?: string;
        rest?: boolean;
        description?: string;
    }


    interface SerializedArgumentParserOptions {
        args: ArgumentOptions[];
    }

    export class SerializedArgumentParser extends SimpleArgumentParser {
        public constructor(sosamba: Client, options: SerializedArgumentParserOptions & SimpleArgumentParserOptions);
        public parse(content: string, ctx: Context): any[];
        public static None: symbol;
    }
    export class SimpleArgumentParser extends ArgumentParser {
        public constructor(sosamba: Client, options: SimpleArgumentParserOptions);
        public parse(content: string, ctx: Context): string[];
    }

    export class SwitchArgumentParser extends SerializedArgumentParser {
        public constructor(sosamba: Client, args: {
            [key: string]: ArgumentOptions
        })
        // Help users to convert it to their struct
        public parse(content: string, ctx: Context): any[];
    }

    interface Extensible {
        Context: typeof Context;
    }
    export class Structures {
        public static get<T extends keyof Extensible>(structure: T): Extensible[T];
        public static get(structure: string): Function;
        public static extend<T extends keyof Extensible, N extends Extensible[T]>(structure: string, extender: (cls: Extensible[T]) => N): void;
        public static extends<T extends Function>(structure: string, extender: (cls: typeof Function) => T): void;
    }
}