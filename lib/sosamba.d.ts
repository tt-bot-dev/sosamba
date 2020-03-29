/**
 * A Discord framework :)
 * @module
 */
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
    /**
     * Reasons for stopping the reaction menu
     */
    enum StopReason {
        /**
         * The user manually clicked the stop button
         */
        MANUAL_EXIT = 0,
        /**
         * The menu timed out
         */
        TIMEOUT = 1,
        /**
         * Permissions to add reactions were denied
         */
        CANNOT_ADD_REACTIONS = 2,
        /**
         * The message containing the menu was deleted
         */
        MESSAGE_DELETE = 3,
        /**
         * The bot is shutting down
         */
        SHUTDOWN = 4
    }
    /**
     * Prefix(es) used in order to invoke commands
     */
    type Prefix = string | string[];

    /**
     * Either the value or a promise resolving to the value
     * @typeparam T The value
     */
    type Asyncable<T> = T | Promise<T>;

    /**
     * The function used to get the prefix
     */
    type PrefixFunc =
    /**
     * @param ctx The command context
     * @param client The client
     * @return The prefixes to use 
     */ (ctx: Context,
        client?: Client) => Asyncable<Prefix>;
    /**
     * Logging options
     */
    interface LogOptions {
        /**
         * Logging levels
         */
        level?: string[]
    }

    const Eris: typeof import("eris");
    /**
     * Sosamba serializers
     */
    export class Serializers {
        static GlobalUser: typeof GlobalUser;
        static Member: typeof Member;
        static User: typeof User;
        static Guild: typeof Guild;
        static GuildChannel: typeof GuildChannel;
    }

    /**
     * Provides language strings to Sosamba
     */
    class I18N {
        /**
         * Constructs the i18n instance
         * @param bot The client
         */
        constructor(bot: Client);
        /**
         * Adds languages
         * @param path Path to the language folder
         */
        public addLanguages(path: string): Promise<void>
        /**
         * Gets a translated string
         * @param term The term name
         * @param lang The language
         * @param args Additional parameters for the term
         */
        public getTranslation(term: string, lang: string, ...args: any): Promise<string>;
    }

    /**
     * Client options for Sosamba
     */
    interface SosambaClientOptions extends ClientOptions {
        /**
         * Logging options
         */
        log?: LogOptions;
        /**
         * The command prefix
         */
        prefix: Prefix | PrefixFunc;
        /**
         * Provide a command in case it cannot be found
         */
        provideCommand?: 
        /**
         * @param ctx The context
         * @param command The command name
         */
        (ctx: Context, command: string) => Asyncable<Command>;
    }

    /**
     * Main entry point for Sosamba
     */
    export class Client extends ErisClient {
        /**
         * Creates a client
         * @param token Discord bot token
         * @param options The client options you'd like to use
         */
        constructor(token: string, options?: SosambaClientOptions);
        /**
         * The client options
         */
        public options: SosambaClientOptions;

        /**
         * Connects to Discord's gateway
         * @param loadCommandsAndEvents Whether to load any commands/events or not (including Sosamba's internal ones)
         */
        public connect(loadCommandsAndEvents?: boolean): Promise<void>;

        /**
         * Loads the commands
         * @param path The path to the command files
         */
        public loadCommands(path?: string): Promise<void>;
        /**
         * Loads the events
         * @param path The path to the event files
         */
        public loadEvents(path?: string): Promise<void>;
        /**
         * The client log
         */
        public log: Logger;
        /**
         * A collection holding the commands
         */
        public commands: Collection<Command>;
        /**
         * A collection holding the events
         */
        public events: Collection<Event>;
        /**
         * A collection holding the active reaction menus
         */
        public reactionMenus: Collection<ReactionMenu>;
        /**
         * Gets the prefix for a context
         * @param ctx The context
         * @return The prefixes to use
         */
        public getPrefix(ctx: Context): Promise<Prefix>;
        /**
         * Checks if the bot has the permissions in a channel
         * @param channel The channel to check the permissions in
         * @param permission The permission to check
         */
        public hasBotPermission(channel: AnyGuildChannel, permission: string): boolean;
        /**
         * A collection of message listeners
         */
        public messageListeners: Collection<MessageListener>;
        /**
         * An utility message awaiter
         */
        public messageAwaiter: MessageAwaiter;
        /**
         * An i18n module
         */
        public i18n: I18N;
    }

    /**
     * A facility for listening to messages
     */
    export class MessageListener {
        /**
         * Constructs a message listener
         * @param sosamba The client
         * @param name The message listener name
         * @param allowEdit Controls whether the listener should be triggered on message edits
         */
        public constructor(sosamba: Client, name?: string, allowEdit?: boolean);
        /**
         * The client
         */
        public sosamba: Client;
        /**
         * The listener name
         */
        public name: string;
        /**
         * The listener name
         */
        public id: string;
        /**
         * The requirements to run this message listener
         * @param ctx The context
         * @returns `false` blocks the message listener from executing. `true` allows it to execute.
         */
        public prerequisites(ctx: Context): Asyncable<boolean>;
        /**
         * Runs the message listener
         * @param ctx The context
         */
        public run(ctx: Context): Asyncable<void>;
    }

    /**
     * The filter for a message listener
     */
    type MessageListenerFilter = 
    /** 
     * @param ctx The context
     * @return `true` to consider the message valid, `false` to consider it invalid
     */
    (ctx: Context) => Asyncable<boolean>;
    /**
     * An utility message awaiter
     */
    class MessageAwaiter extends MessageListener {
        /**
         * A map of listeners
         */
        public listeners: Map<string, {
            filter: MessageListenerFilter;
            rs<T>(obj: T): Promise<T>;
            timeout: NodeJS.Timeout;
        }>;
        /**
         * Waits for a message
         * @param ctx The context
         * @param filter The message filter
         * @param timeout The timeout of awaiting the message
         */
        public waitForMessage(ctx: Context, filter?: MessageListenerFilter, timeout?: number): Promise<Context>;
        /**
         * Asks for a `y`, `yes`, `n` or `no` response with a 10 second timeout
         * @param ctx The context
         * @param returnMessage Whether to return the context as well
         */
        public askYesNo(ctx: Context, returnMessage?: boolean): Promise<boolean | {
            response: boolean;
            context: Context;
        }>;
    }
    /**
     * The base of all Sosamba structures
     */
    class SosambaBase {
        /**
         * Constructs a base class
         * @param sosamba The client
         * @param fileName The file name of the loaded module
         * @param filePath The file path of the loaded module
         */
        public constructor(sosamba: Client, fileName?: string, filePath?: string);
        /**
         * The client
         */
        public sosamba: Client;
        /**
         * The file name of this module
         */
        public file: string;
        /**
         * The path to this module
         */
        public path: string;
        /**
         * The ID of the module
         */
        public id: string;
        /**
         * The logger of the module
         */
        public log: Logger;

        /**
         * Mounts the module
         */
        public mount(): void;
        /**
         * Unmounts the module
         */
        public unmount(): void;
    }

    /**
     * Handles events coming from Discord
     */
    export class Event extends SosambaBase {
        /**
         * Constructs the event structure
         * @param sosamba The client
         * @param fileName The file name of the loaded module
         * @param filePath The file path of the loaded module
         * @param options The event options
         */
        public constructor(sosamba: Client, fileName: string, filePath: string, options: { once: boolean, name: string });
        /**
         * Checks whether the requirements needed to run this event are met
         * @param args The event arguments
         * @return `false` to block the event from running, `true` otherwise.
         */
        public prerequisites(...args: any[]): Asyncable<boolean>;
        /**
         * Runs the event
         * @param args The event arguments
         */
        public run(...args: any[]): Asyncable<void>;
    }

    /**
     * An error when parsing the arguments
     */
    export class ParsingError extends Error {
        /**
         * Constructs a ParsingError
         * @param message The error message
         * @param ignore Whether to ignore the error or not
         */
        public constructor(message: string, ignore?: boolean);
        /**
         * Whether to ignore the error or not
         */
        public ignore: boolean;
    }

    /**
     * A bot command
     */
    export class Command extends SosambaBase {
        /**
         * Constructs a command
         * @param sosamba The client
         * @param fileName The file name of the loaded module
         * @param filePath The file path of the loaded module
         * @param options The options of a command
         */
        public constructor(sosamba: Client, fileName: string, filePath: string, options: {
            /**
             * The command name
             */
            name: string,
            /**
             * The command argument string
             */
            args?: string,
            /**
             * The command argument parser
             */
            argParser?: ArgumentParser,
            /**
             * The command description
             */
            description?: string,
            /**
             * Whether to display the command in the default help command or not
             */
            displayInHelp?: boolean,
            /**
             * Aliases for this command
             */
            aliases?: string[];
        })
        /**
        * The command name
        */
        public name: string;
        /**
         * The command argument string
         */
        public args?: string;
        /**
         * The command argument parser
         */
        public argParser?: ArgumentParser;
        /**
         * The command description
         */
        public description?: string;
        /**
         * Whether to display the command in the default help command or not
         */
        public displayInHelp: boolean;
        /**
         * Aliases for this command
         */
        public aliases: string[];

        /**
         * Checks whether the user has the permissions to run this command
         * @param ctx The context
         * @returns `false` to prevent running the command, `true` otherwise.
         */
        public permissionCheck(ctx: Context): Asyncable<boolean>
        /**
         * Runs this command
         * @param ctx The context
         * @param args The command arguments
         */
        public run(ctx: Context, args: any): Asyncable<void>;
    }

    /**
     * Parses the arguments
     */
    export class ArgumentParser {
        /**
         * Constructs an argument parser
         * @param client The client
         */
        public constructor(client: Client);
        /**
         * The client
         */
        public sosamba: Client;
        /**
         * Parses the arguments
         * @param content The string to parse
         * @param ctx The context
         * @returns The parsed arguments
         */
        parse(content: string, ctx?: Context): any;
        /**
         * Provides an usage string;
         * @param detailed Whether the usage string should be detailed or not
         */
        provideUsageString(detailed?: boolean): string;
    }

    /**
     * The command context
     */
    export class Context {
        /**
         * Constructs the command context
         * @param sosamba The client
         * @param msg The message tied with this context
         */
        public constructor(sosamba: Client, msg: Message);
        /**
         * The client
         */
        public sosamba: Client;
        /**
         * The guild this context was made in
         */
        public guild: Guild;
        /**
         * The channel this context was made in
         */
        public channel: TextChannel;
        /**
         * The author of this context
         */
        public author: User;
        /**
         * A member instance of the author of this context
         */
        public member: Member;
        /**
         * The message tied with this context
         */
        public message: Message;
        /**
         * The message tied with this context
         */
        public msg: Message;
        /**
         * Sends a message and edits it if it was already sent
         * @param content The message content
         * @param file The file(s) to send
         */
        public send(content: MessageContent, file?: MessageFile): Promise<Message>;
        /**
         * Registers a reaction menu for this context
         * @param menu The reaction menu to register
         */
        public registerReactionMenu(menu: ReactionMenu): Promise<void>;
        /**
         * A shortcut for {@link MessageAwaiter.waitForMessage}
         * @param filter The message filter
         * @param timeout The timeout
         */
        public waitForMessage(filter?: MessageListenerFilter, timeout?: number): Promise<Context>;

        /**
         * A shortcut for {@link MessageAwaiter.askYesNo}
         * @param returnMessage Whether to return the context as well
         */
        public askYesNo(returnMessage?: boolean): Promise<boolean | {
            response: boolean;
            context: Context;
        }>;
    }
    /**
     * A logging facility
     */
    export class Logger extends console.Console { }

    /**
     * Constructs a reaction menu-based query menu
     * @typeparam T The type of the items in the collection
     * @param ctx The context
     * @param collection The collection to query the items from
     * @param predicate A function to check whether the item matches the query
     * @param itemName The query
     * @param displayAs A function to display the item in the menu
     */
    export function constructQuery<T extends { id: string | number }>(ctx: Context, collection: Collection<T> | T[],
        predicate: 
        /** @param query The query */ (query: string) => 
        /** @param item The item */
        (item: T) => boolean,
        itemName: string, displayAs?: 
        /** @param item The item */ (item: T) => string): T;
    /**
     * A helper class to query for the users in the bot's cache instead of the guild members
     */
    export class GlobalUser extends User {
        /** @ignore */
        static [Symbol.hasInstance](user: any): boolean;
    }
    /**
     * A reaction menu
     */
    export class ReactionMenu {
        /**
         * Constructs a reaction menu
         * @param ctx The context
         * @param msg A message made by the bot
         */
        public constructor(ctx: Context, msg: Message);
        /**
         * The client
         */
        public sosamba: Client;
        /**
         * The ID of the user who initiated the menu
         */
        public user: string;
        /**
         * Reaction menu callbacks
         */
        public callbacks: {
            /**
             * Runs the action for the reaction
             */
            [key: string]: 
            /**
             * @param menu The menu itself
             */ 
            (menu: ReactionMenu) => Asyncable<void>;
        };

        /**
         * The context tied with this reaction menu
         */
        public ctx: Context;
        /**
         * The context tied with this reaction menu
         */
        public context: Context;
        /**
         * The bot's message tied with this reaction menu
         */
        public message: Message;
        /**
         * The ID of bot's message
         */
        public id: string;
        /**
         * The reaction menu timeout. `false` if none
         */
        public timeout: number | boolean;
        /**
         * Controls whether to run the callback or not
         * @param emoji The emoji
         * @return Whether to run the reaction menu callback or not
         */
        public canRunCallback(emoji: string): Asyncable<boolean>;
        /**
         * Adds the emoji for the menu
         */
        public prepareEmoji(): Asyncable<void>;
        /**
         * Stops the menu
         * @param reason The reason why the menu stopped
         */
        public stopCallback(reason: StopReason): Asyncable<void>;
    }

    /**
     * Options for a [[SimpleArgumentParser]]
     */
    interface SimpleArgumentParserOptions {
        /**
         * Whether to filter empty arguments or not
         */
        filterEmptyArguments?: boolean;
        /**
         * Whether to parse strings using quotes as a single string
         */
        allowQuotedString?: boolean;
        /**
         * The separator
         */
        separator?: string;
    }

    /**
     * Options for arguments of [[SwitchArgumentParser]] or [[SerializedArgumentParser]]
     */
    interface ArgumentOptions {
        /**
         * The type of the argument:
         * - Native JS types: String, Number, BigInt, Boolean
         * - Eris types: User, Member, Guild, GuildChannel, Role
         * - Sosamba types: [[GlobalUser]], [[Integer]]
         * - a function accepting two parameters and returning [[Asyncable]]<any>:
         * ```ts
         * (val: string, ctx: Context) => Asyncable<any>
         * ```
         * 
         * When an array is used, the parser will try to parse the first type and continue looking through other types if it fails.
         */
        type: any | any[],
        /**
         * The default value for an argument that is one of the types in the type property
         */
        default?: ((ctx: Context) => any) | any;
        /**
         * The argument name
         */
        name?: string;
        /**
         * Whether the argument applies to the rest of the string. The argument must be last. [[SerializedArgumentParser]] only
         */
        rest?: boolean;
        /**
         * Whether the argument applies to the rest of the string, however, the string will be split by the separator into multiple elements. The argument must be last. [[SerializedArgumentParser]] only
         */
        restSplit?: boolean;
        /**
         * Description of the argument
         */
        description?: string;
    }

    /**
     * A serializer for non-floating point numbers
     */
    class Integer { }

    /**
     * Options for a [[SerializedArgumentParser]]
     */
    interface SerializedArgumentParserOptions {
        /**
         * The arguments
         */
        args: ArgumentOptions[];
    }

    /**
     * Like [[SimpleArgumentParser]], but serializes the data into the respective data types
     */
    export class SerializedArgumentParser extends SimpleArgumentParser {
        /**
         * Constructs a serialized argument parser
         * @param sosamba The client
         * @param options The options of the parser
         */
        public constructor(sosamba: Client, options: SerializedArgumentParserOptions & SimpleArgumentParserOptions);
        /**
         * Parses the arguments and serializes them
         * @param content The string to parse
         * @param ctx The context
         * @returns An array of serialized arguments
         */
        public parse(content: string, ctx: Context): any[];
        /**
         * When used as a default value for an argument, the default will be `null`
         */
        public static None: symbol;
    }

    /**
     * A simple argument parser
     */
    export class SimpleArgumentParser extends ArgumentParser {
        /**
         * Constructs a simple argument parser
         * @param sosamba The client
         * @param options The options of the parser
         */
        public constructor(sosamba: Client, options: SimpleArgumentParserOptions);
        /**
         * Parses the string
         * @param content The string to parse
         * @param ctx The context
         * @returns An array of strings containing the parsed arguments
         */
        public parse(content: string, ctx: Context): string[];
    }

    /**
     * An argument parser that uses switches in format of `key:value`
     */
    export class SwitchArgumentParser extends SerializedArgumentParser {
        /**
         * Constructs a switch argument parser
         * @param sosamba The client
         * @param args The arguments, where the key is an argument name
         */
        public constructor(sosamba: Client, args: {
            [key: string]: ArgumentOptions
        })
        /**
         * Parses the arguments and serializes them
         * @param content The string to parse
         * @param ctx The context
         * @returns An array of serialized arguments
         */
        public parse(content: string, ctx: Context): any[];
    }

    /**
     * The structures that are extensible
     */
    interface Extensible {
        Context: typeof Context;
    }

    /**
     * Allows users to extend Sosamba's native structures
     */
    export class Structures {
        /**
         * Gets a structure
         * @param structure The structure name
         * @typeparam T The class you'd like to use
         * @example 
         * ```ts
         * import { Structures, Context } from "sosamba";
         * const ctxClass = Structures.get<Context>("Context");
         * ```
         */
        public static get<T extends keyof Extensible>(structure: T): Extensible[T];
        /**
         * Gets a structure in case the structure isn't defined in the TypeScript definition file
         * @param structure The structure name
         */
        public static get(structure: string): Function;
        /**
         * Extends a structure
         * @param structure The name of the structure you'd like to extend
         * @param extender The function that takes the old class as the parameter and returns the new class
         * @typeparam T The class you'd like to replace
         * @typeparam N The subclass of T you'd like to replace T with
         */
        public static extend<T extends keyof Extensible, N extends Extensible[T]>(structure: string, extender:
            /** @param cls The extensible class */ (cls: Extensible[T]) => N): void;
        /**
         * Extends a structure in case the structure isn't defined in the TypeScript definition file
         * @param structure The name of the structure you'd like to extend
         * @param extender The function that takes the old class as the parameter and returns the new class
         * @typeparam T The subclass of the structure you'd like to replace the structure with
         */
        public static extend<T extends Function>(structure: string, extender: /** @param cls The extensible class */ (cls: typeof Function) => T): void;
    }
}