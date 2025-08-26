interface BanProps {
    id: string;
    dateBegin: number;
    dateEnd: number;
    forever: boolean;
    reason: string;
    bannedBy: string;
}

export class Ban {
    private _id: string;
    private _dateBegin: number;
    private _dateEnd: number;
    private _forever: boolean;
    private _reason: string;
    private _bannedBy: string;

    constructor(props: BanProps) {
        this._id = props.id;
        this._dateBegin = props.dateBegin;
        this._dateEnd = props.dateEnd;
        this._forever = props.forever;
        this._reason = props.reason;
        this._bannedBy = props.bannedBy;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get dateBegin(): number {
        return this._dateBegin;
    }

    set dateBegin(value: number) {
        this._dateBegin = value;
    }

    get dateEnd(): number {
        return this._dateEnd;
    }

    set dateEnd(value: number) {
        this._dateEnd = value;
    }

    get forever(): boolean {
        return this._forever;
    }

    set forever(value: boolean) {
        this._forever = value;
    }

    get reason(): string {
        return this._reason;
    }

    set reason(value: string) {
        this._reason = value;
    }

    get bannedBy(): string {
        return this._bannedBy;
    }

    set bannedBy(value: string) {
        this._bannedBy = value;
    }
}
