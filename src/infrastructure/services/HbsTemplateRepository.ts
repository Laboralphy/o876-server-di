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
} from '../../libs/ansi-256/renderer';
import Handlebars from 'handlebars';
import { parseCSVLine } from '../../libs/parse-csv';
import { TableRenderer } from '../../libs/table-renderer';
import { ICellString } from '../../libs/table-renderer/ICellString';

class StylizedString implements ICellString {
    private readonly _length;

    constructor(private readonly _text: string) {
        this._length = this.getLengthWithoutANSI(this._text);
    }

    getLengthWithoutANSI(str: string): number {
        // Expression régulière pour supprimer tous les codes ANSI
        const ansiRegex = /\x1b\[[0-9;]*m/g;
        // Supprime les codes ANSI et retourne la longueur de la chaîne nettoyée
        return str.replace(ansiRegex, '').length;
    }

    get isStylized(): boolean {
        return this._text.indexOf('\x1b[') >= 0;
    }

    toString() {
        return this._text;
    }

    get length() {
        return this._length;
    }
}

export class HbsTemplateRepository implements ITemplateRepository {
    private readonly stringRepository: IStringRepository;
    private readonly registry: Map<string, HandlebarsTemplateDelegate> = new Map();
    constructor(cradle: Cradle) {
        this.stringRepository = cradle.stringRepository;
    }

    init(): void {
        handlebars.registerHelper('t', (key: string, options: HelperOptions) => {
            return this.stringRepository.render(key, { ...options.data.root, ...options.hash });
        });
        handlebars.registerHelper('color', (fg: string, bg: string | HelperOptions) => {
            const sFG = fg == '' ? ANSI_RESET_FG : fgcolor(fg);
            const sBG = typeof bg === 'string' ? (bg == '' ? ANSI_RESET_BG : bgcolor(bg)) : '';
            return sFG + sBG;
        });
        Handlebars.registerHelper('table', (options: HelperOptions): string => {
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
            return tr.render(aTable).join('\n');
        });
    }

    defineTemplate(key: string, templateContent: string): void {
        const oTemplate = handlebars.compile(templateContent, { noEscape: true });
        this.registry.set(key, oTemplate);
    }

    render(key: string, parameters?: JsonObject): string | undefined {
        const template = this.registry.get(key);
        if (template) {
            return template(parameters) + ANSI_RESET;
        } else {
            return undefined;
        }
    }
}
