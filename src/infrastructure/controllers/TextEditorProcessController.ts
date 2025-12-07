import { ClientCradle } from '../../boot/container';
import { SendClientMessage } from '../../application/use-cases/clients/SendClientMessage';
import { CLIENT_STATES } from '../../domain/enums/client-states';

interface SubProcessController<T> {
    reset(): void;
    processInput(message: string): Promise<void>;
    get done(): boolean;
    get data(): T;
}

type TextEditorProcessStruct = {
    lines: string[];
};

export class TextEditorProcessController implements SubProcessController<TextEditorProcessStruct> {
    private readonly lines: string[];
    private readonly maxLineCount: number;
    private readonly maxCharacterCount: number;
    private readonly sendMessage: SendClientMessage;
    private readonly communicationLayer;
    private readonly idClient: string;
    private previousState: CLIENT_STATES = CLIENT_STATES.NONE;

    constructor(cradle: ClientCradle) {
        const sc = cradle.serverConfig;
        this.maxLineCount = sc.getVariables().textEditorMaxLineCount;
        this.maxCharacterCount = sc.getVariables().textEditorMaxCharacterCount;
        this.lines = [];
        this.sendMessage = cradle.sendClientMessage;
        this.idClient = cradle.idClient;
        this.communicationLayer = cradle.communicationLayer;
    }

    getCharacterCount(): number {
        return this.lines.reduce((acc, line) => acc + line.length + 1, 0);
    }

    getLineCount(): number {
        return this.lines.length;
    }

    /**
     * Return the number of remaining character
     * A text editor will not allow to hold more than the specified value defined in server config
     */
    getRemainingCharacters(): number {
        return this.getCharacterCount();
    }

    /**
     * Return the number of remaining lines
     */
    getRemainingLines(): number {
        return this.maxLineCount - this.getLineCount();
    }

    /**
     * Adds a new line in the text editor
     * Returns false if the line could not be appended because of limitations
     * @param line
     * @return boolean
     */
    addLine(line: string): boolean {
        if (line.length > this.getRemainingCharacters()) {
            this.lines.push(line.substring(0, this.getRemainingCharacters()));
            return false;
        }
        if (this.getRemainingLines() <= 0) {
            return false;
        }
        this.lines.push(line);
        return true;
    }

    async reset(): Promise<void> {
        const cs = this.communicationLayer.getClientSession(this.idClient);
        this.previousState = cs.state;
        this.lines.splice(0, this.lines.length);
    }

    async processInput(message: string): Promise<void> {
        if (!this.addLine(message)) {
            await this.sendMessage.execute(this.idClient, 'textEditor.exceedCapacity', {
                lines: this.maxLineCount,
                chars: this.maxCharacterCount,
            });
        }
        if (this.done) {
            const cs = this.communicationLayer.getClientSession(this.idClient);
            cs.state = this.previousState;
        }
    }

    /**
     * Return true if the last contains a single period sign
     */
    get done() {
        return this.lines.length > 0 ? this.lines[this.lines.length - 1].trim() == '.' : false;
    }

    /**
     * Return the lines entered during text editor mode
     */
    get data(): TextEditorProcessStruct {
        return {
            lines: this.lines,
        };
    }
}
