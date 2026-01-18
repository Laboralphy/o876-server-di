// Type definitions for telnet2
// Project: https://github.com/chjj/node-telnet2
// Definitions by: Raphaël Marandet (based on source code)

import { EventEmitter } from 'events';
import { Stream } from 'stream';
import { Socket } from 'net';

declare namespace Telnet {
    interface TelnetOptions {
        host?: string;
        port?: number;
        socket?: Socket;
        input?: Socket;
        output?: Socket;
        server?: Server;
        tty?: boolean;
        convertLF?: boolean;
        debug?: boolean;
    }

    interface Command {
        command: string;
        option: string;
        iacCode: number;
        iacName: string;
        commandCode: number;
        commandName: string;
        optionCode: number;
        optionName: string;
        data: Buffer;
        values?: any[];
        cols?: number;
        columns?: number;
        width?: number;
        rows?: number;
        height?: number;
        name?: string;
        value?: string;
        type?: 'system' | 'user';
    }

    interface Client extends Stream {
        (options: TelnetOptions): Client;
        input: Socket;
        output: Socket;
        socket: Socket;
        server: Server;
        env: Record<string, string>;
        terminal: string;
        options: TelnetOptions;
        columns: number;
        rows: number;
        isTTY: boolean;
        isRaw: boolean;
        remoteAddress?: string;

        open(): void;
        debug(...args: any[]): void;
        parse(data: Buffer): void;
        echo(cmd: Command): number;
        status(cmd: Command): number;
        linemode(cmd: Command): number;
        transmit_binary(cmd: Command): number;
        authentication(cmd: Command): number;
        terminal_speed(cmd: Command): number;
        remote_flow_control(cmd: Command): number;
        x_display_location(cmd: Command): number;
        suppress_go_ahead(cmd: Command): number;
        naws(cmd: Command): number;
        window_size(cmd: Command): number;
        new_environ(cmd: Command): number;
        environment_variables(cmd: Command): number;
        terminal_type(cmd: Command): number;
        _setRawMode(mode: boolean): void;
        setRawMode: (mode: boolean) => void;
        write(b: Buffer | string): boolean;
        end(): void;
        destroy(): void;
        destroySoon(): void;
        pause(): void;
        resume(): void;

        readonly readable: boolean;
        readonly writable: boolean;
        readonly destroyed: boolean;

        do: Record<string, () => void>;
        dont: Record<string, () => void>;
        will: Record<string, () => void>;
        wont: Record<string, () => void>;

        on(event: 'connect', listener: () => void): this;
        on(event: 'data', listener: (data: Buffer) => void): this;
        on(event: 'error', listener: (err: Error) => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'end', listener: () => void): this;
        on(event: 'drain', listener: () => void): this;
        on(event: 'command', listener: (cmd: Command) => void): this;
        on(event: 'echo', listener: (cmd: Command) => void): this;
        on(event: 'status', listener: (cmd: Command) => void): this;
        on(event: 'linemode', listener: (cmd: Command) => void): this;
        on(event: 'transmit binary', listener: (cmd: Command) => void): this;
        on(event: 'authentication', listener: (cmd: Command) => void): this;
        on(event: 'terminal speed', listener: (cmd: Command) => void): this;
        on(event: 'remote flow control', listener: (cmd: Command) => void): this;
        on(event: 'x display location', listener: (cmd: Command) => void): this;
        on(event: 'suppress go ahead', listener: (cmd: Command) => void): this;
        on(event: 'window size', listener: (cmd: Command) => void): this;
        on(event: 'naws', listener: (cmd: Command) => void): this;
        on(event: 'size', listener: (width: number, height: number) => void): this;
        on(event: 'environment variables', listener: (cmd: Command) => void): this;
        on(event: 'new environ', listener: (cmd: Command) => void): this;
        on(
            event: 'env',
            listener: (name: string, value: string, type: 'system' | 'user') => void
        ): this;
        on(event: 'terminal type', listener: (cmd: Command) => void): this;
        on(event: 'term', listener: (name: string) => void): this;
        on(event: 'resize', listener: () => void): this;
        on(event: 'debug', listener: (msg: string) => void): this;
    }

    interface Server extends EventEmitter {
        (options?: TelnetOptions, callback?: (client: Client) => void): Server;
        server: import('net').Server;
        listen(port: number, host?: string, callback?: () => void): this;
        listen(path: string, callback?: () => void): this;
        listen(handle: any, callback?: () => void): this;
        close(callback?: () => void): this;
        address(): { port: number; family: string; address: string };
        getConnections(callback: (error: Error | null, count: number) => void): void;
        ref(): this;
        unref(): this;

        on(event: 'connection', listener: (client: Client) => void): this;
        on(event: 'client', listener: (client: Client) => void): this;
        on(event: 'error', listener: (err: Error) => void): this;
        on(event: 'listening', listener: () => void): this;
        on(event: 'close', listener: () => void): this;
        on(event: 'debug', listener: (msg: string) => void): this;
    }

    const COMMANDS: Record<string, number>;
    const COMMAND_NAMES: Record<number, string>;
    const OPTIONS: Record<string, number>;
    const OPTION_NAMES: Record<number, string>;
    const SUB: Record<string, number>;
}

declare function Telnet(options: Telnet.TelnetOptions): Telnet.Client;
declare function Telnet(
    options?: Telnet.TelnetOptions,
    callback?: (client: Telnet.Client) => void
): Telnet.Server;

declare namespace Telnet {
    export const Client: typeof Telnet.Client;
    export const Server: typeof Telnet.Server;
    export const createClient: typeof Telnet.Client;
    export const createServer: typeof Telnet.Server;
    export { COMMANDS, COMMAND_NAMES, OPTIONS, OPTION_NAMES, SUB };
}

export = Telnet;
