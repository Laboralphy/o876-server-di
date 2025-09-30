import { Argv, Arguments } from 'yargs';
import { wfGet } from '../../tools/web-fetcher';
import { User } from '../../../../domain/entities/User';
import YAML from 'yaml';
import { Ban } from '../../../../domain/entities/Ban';

interface IUserShowArgs extends Arguments {
    name: string;
}

type Ban2StrResult = {
    dateBegin: Date;
    dateEnd: Date | null;
    forever: boolean;
    reason: string;
    bannedBy: string;
};

async function ban2str(ban: Ban | null): Promise<null | Ban2StrResult> {
    if (!ban) {
        return null;
    }
    let bannedBy = 'admin';
    if (ban.bannedBy) {
        try {
            const { data } = await wfGet('users/' + ban.bannedBy);
            const userBannedBy = data as User;
            bannedBy = userBannedBy.name;
        } catch {
            bannedBy = '[Unknown user]';
        }
    }
    const dateBegin = new Date(ban.tsBegin);
    const reason = ban.reason;
    const b: Ban2StrResult = {
        dateBegin,
        dateEnd: null,
        forever: true,
        reason,
        bannedBy,
    };
    if (!ban.forever) {
        b.forever = false;
        b.dateEnd = new Date(ban.tsEnd);
    }
    return b;
}

export function showCommand(yargs: Argv): Argv {
    return yargs.command<IUserShowArgs>(
        'show <name>',
        "Show a user's information",
        (yargs) =>
            yargs.positional('name', {
                type: 'string',
                describe: "User's name",
                demandOption: true,
            }),
        async (argv) => {
            const { data: userData } = await wfGet('users/name/' + argv.name);
            const { id: idUser } = userData as User;
            const { data: userFullData } = await wfGet('users/' + idUser);
            const ban = Ban as Ban;
            const oDisplayUser = {
                id: user.id,
                name: user.name,
                email: user.email,
                dateCreation: new Date(user.tsCreation),
                dateLastUsed: new Date(user.tsLastUsed),
                ban: ,
            };
            const yamlStr = YAML.stringify(oDisplayUser, {
                indent: 2, // Set indentation level (2 spaces by default)
            });
            console.log(yamlStr);
        }
    );
}
