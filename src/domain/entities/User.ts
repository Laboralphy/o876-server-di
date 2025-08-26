import { Role } from '../enums/Role';

interface UserProps {
    id: string;
    name: string;
    password: string;
    email: string;
    dateCreation: number;
    dateLastUsed: number;
    roles: Role[];
    ban: string;
}

export class User {
    private _id: string;
    private _name: string;
    private _password: string;
    private _email: string;
    private _dateCreation: number;
    private _dateLastUsed: number;
    private _roles: Role[];
    private _ban: string;

    constructor(props: UserProps) {
        this._id = props.id;
        this._name = props.name;
        this._email = props.email;
        this._password = props.password;
        this._dateCreation = props.dateCreation;
        this._dateLastUsed = props.dateLastUsed;
        this._roles = props.roles;
        this._ban = props.ban;
    }

    get id(): string {
        return this._id;
    }

    set id(value: string) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get password(): string {
        return this._password;
    }

    set password(value: string) {
        this._password = value;
    }

    get email(): string {
        return this._email;
    }

    set email(value: string) {
        this._email = value;
    }

    get dateCreation(): number {
        return this._dateCreation;
    }

    set dateCreation(value: number) {
        this._dateCreation = value;
    }

    get dateLastUsed(): number {
        return this._dateLastUsed;
    }

    set dateLastUsed(value: number) {
        this._dateLastUsed = value;
    }

    get roles(): Role[] {
        return this._roles;
    }

    addRole(role: Role) {
        if (!this._roles.includes(role)) {
            this._roles.push(role);
        }
    }

    removeRole(role: Role) {
        if (this._roles.includes(role)) {
            this._roles.splice(this._roles.indexOf(role), 1);
        }
    }

    set roles(value: Role[]) {
        this._roles = value;
    }

    get ban(): string {
        return this._ban;
    }

    set ban(value: string) {
        this._ban = value;
    }
}
