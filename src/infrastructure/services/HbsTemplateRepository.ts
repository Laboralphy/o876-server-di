import { ITemplateRepository } from '../../application/ports/services/ITemplateRepository';
import { JsonObject } from '../../domain/types/JsonStruct';
import { IStringRepository } from '../../application/ports/services/IStringRepository';
import { Cradle } from '../../boot/container';
import handlebars, { HelperOptions } from 'handlebars';
import {
    fgcolor,
    bgcolor,
    ANSI_RESET_BG,
    ANSI_RESET_FG,
    ANSI_RESET,
    ANSI_UNDERLINE,
    ANSI_UNDERLINE_OFF,
    ANSI_BOLD,
    ANSI_STRIKE,
    ANSI_BOLD_OFF,
    ANSI_STRIKE_OFF,
    ANSI_ITALIC,
    ANSI_ITALIC_OFF,
    ANSI_INVERSE,
    ANSI_INVERSE_OFF,
} from '../../libs/ansi-256/renderer';
import Handlebars from 'handlebars';
import { parseCSVLine } from '../../libs/parse-csv';
import { TableRenderer } from '../../libs/table-renderer';
import { ICellString } from '../../libs/table-renderer/ICellString';
import stringWidth from 'string-width';
import { ITime } from '../../application/ports/services/ITime';

export class StylizedString implements ICellString {
    private readonly _length;

    constructor(private readonly _text: string) {
        this._length = this.getLengthWithoutANSI(this._text);
    }

    getLengthWithoutANSI(str: string): number {
        // This will match all ANSI patterns
        const ansiRegex = /\x1b\[[0-9;]*m/g;
        // Removes all ANSI tags and return string length
        return str.replace(ansiRegex, '').length;
    }

    isThereAnyUnicodeChar() {
        for (let i = 0, l = this._text.length; i < l; i++) {
            if (this._text.charCodeAt(i) > 127) {
                return true;
            }
        }
        return false;
    }

    get isStylized(): boolean {
        return this._text.indexOf('\x1b[') >= 0 || this.isThereAnyUnicodeChar();
    }

    toString() {
        return this._text;
    }

    get length() {
        return this._length;
    }

    get rawLength() {
        return this._text.length;
    }
}

export class HbsTemplateRepository implements ITemplateRepository {
    private readonly stringRepository: IStringRepository;
    private readonly time: ITime;
    private readonly registry: Map<string, HandlebarsTemplateDelegate> = new Map();
    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
        this.time = cradle.time;
    }

    init(): void {
        const stringRepository = this.stringRepository;
        const time = this.time;
        handlebars.registerHelper('t', function (key: string, options: HelperOptions) {
            return stringRepository.render(key, { ...options.data.root, ...options.hash });
        });
        handlebars.registerHelper('date', function (ts: string, format: string | HelperOptions) {
            console.log();
            if (typeof format !== 'string') {
                format = 'ymd hm';
            }
            return time.renderDate(parseInt(ts), format);
        });
        handlebars.registerHelper('underline', function (this: unknown, options: HelperOptions) {
            const content = options.fn(this);
            return new Handlebars.SafeString(ANSI_UNDERLINE + content + ANSI_UNDERLINE_OFF);
        });
        handlebars.registerHelper('bold', function (this: unknown, options: HelperOptions) {
            const content = options.fn(this);
            return new Handlebars.SafeString(ANSI_BOLD + content + ANSI_RESET);
        });
        handlebars.registerHelper('strike', function (this: unknown, options: HelperOptions) {
            const content = options.fn(this);
            return new Handlebars.SafeString(ANSI_STRIKE + content + ANSI_STRIKE_OFF);
        });
        handlebars.registerHelper('italic', function (this: unknown, options: HelperOptions) {
            const content = options.fn(this);
            return new Handlebars.SafeString(ANSI_ITALIC + content + ANSI_ITALIC_OFF);
        });
        handlebars.registerHelper('reverse', function (this: unknown, options: HelperOptions) {
            const content = options.fn(this);
            return new Handlebars.SafeString(ANSI_INVERSE + content + ANSI_INVERSE_OFF);
        });
        handlebars.registerHelper('color', function (fg: string, bg: string | HelperOptions) {
            const sFG = fg == '' ? ANSI_RESET_FG : fgcolor(fg);
            const sBG = typeof bg === 'string' ? (bg == '' ? ANSI_RESET_BG : bgcolor(bg)) : '';
            return new Handlebars.SafeString(sFG + sBG);
        });
        Handlebars.registerHelper('table', function (this: unknown, options: HelperOptions) {
            const sText = options.fn(this);
            const aTable = sText
                .trim()
                .split('\n')
                .map((s) =>
                    parseCSVLine(s.trim()).map((s) => {
                        const ic = new StylizedString(s);
                        return ic.isStylized ? ic : s;
                    })
                );
            const tr = new TableRenderer();
            return new Handlebars.SafeString(tr.render(aTable).join('\n'));
        });
        Handlebars.registerHelper('line', function (this: unknown, options: HelperOptions) {
            // Get inside block content
            const content = options.fn(this);
            // Trims all \n and space
            const lines = content.split('\n');
            const trimmedLines = lines.map((line) => line.trim());
            // Filters out empty lines
            const result = trimmedLines.filter((line) => line).join(' ');
            return new Handlebars.SafeString(result + '\n');
        });
    }

    defineTemplate(key: string, templateContent: string): void {
        const oTemplate = handlebars.compile(templateContent, { noEscape: true });
        this.registry.set(key, oTemplate);
    }

    render(key: string, parameters?: JsonObject): string | undefined {
        const template = this.registry.get(key);
        if (template) {
            return template(parameters).trim() + ANSI_RESET;
        } else {
            return undefined;
        }
    }
}
