function p(d: number, n: number): string {
    return d.toString().padStart(n, '0');
}

function renderDateYMD(date: Date): string {
    return [p(date.getFullYear(), 4), p(date.getMonth() + 1, 2), p(date.getDate(), 2)].join('-');
}

function renderDateDMY(date: Date): string {
    return [p(date.getDate(), 2), p(date.getMonth() + 1, 2), p(date.getFullYear(), 4)].join('-');
}

function renderTimeHMS(date: Date): string {
    return [p(date.getHours(), 2), p(date.getMinutes(), 2), p(date.getSeconds(), 2)].join(':');
}

function renderTimeHM(date: Date): string {
    return [p(date.getHours(), 2), p(date.getMinutes(), 2)].join(':');
}

export type RenderDurationOptions = {
    year?: string;
    years?: string;
    month?: string;
    months?: string;
    day?: string;
    days?: string;
    hour?: string;
    hours?: string;
    minute?: string;
    minutes?: string;
    second?: string;
    seconds?: string;
    now?: string;
    space?: string;
};

export function renderDuration(nDuration: number, options: RenderDurationOptions = {}): string {
    const {
        year = 'y',
        years = 'y',
        month = 'm',
        months = 'm',
        day = 'd',
        days = 'd',
        hour = 'h',
        hours = 'h',
        minute = 'min',
        minutes = 'min',
        second = 's',
        seconds = 's',
        now = 'now',
        space = '',
    } = options;

    const y = Math.floor(nDuration / (365.2422 * 24 * 3600 * 1000));
    nDuration -= y * 365.2422 * 24 * 3600 * 1000;

    const m = Math.floor(nDuration / (30.43685 * 24 * 3600 * 1000));
    nDuration -= m * 30.43685 * 24 * 3600 * 1000;

    const d = Math.floor(nDuration / (24 * 3600 * 1000));
    nDuration -= d * 24 * 3600 * 1000;

    const h = Math.floor(nDuration / (3600 * 1000));
    nDuration -= h * 3600 * 1000;

    const min = Math.floor(nDuration / (60 * 1000));
    nDuration -= min * 60 * 1000;

    const s = Math.floor(nDuration / 1000) % 60;

    const aValues = [
        { type: 'y', value: y, rank: 0 },
        { type: 'm', value: m, rank: 1 },
        { type: 'd', value: d, rank: 2 },
        { type: 'h', value: h, rank: 3 },
        { type: 'min', value: min, rank: 4 },
        { type: 's', value: s, rank: 5 },
    ];

    const aMask = aValues.filter((v) => v.value > 0).slice(0, 2);
    if (aMask.length > 1) {
        if (aMask[0].value > 1) {
            aMask.pop();
        } else if (Math.abs(aMask[1].rank - aMask[0].rank) > 1) {
            aMask.pop();
        }
    }
    const plural = (n: number, sing: string, plur: string): string =>
        n + space + (n > 1 ? plur : sing);

    const sOutput = aMask
        .map(({ type, value }) => {
            switch (type) {
                case 'y': {
                    return plural(value, year, years);
                }
                case 'm': {
                    return plural(value, month, months);
                }
                case 'd': {
                    return plural(value, day, days);
                }
                case 'h': {
                    return plural(value, hour, hours);
                }
                case 'min': {
                    return plural(value, minute, minutes);
                }
                case 's': {
                    return plural(value, second, seconds);
                }
            }
        })
        .join(' ');
    return sOutput === '' ? now : sOutput;
}

export function renderDate(date: Date, format = 'ymd'): string {
    return format
        .split(' ')
        .map((s) => {
            switch (s.toLowerCase()) {
                case 'dur': {
                    return renderDuration(Math.abs(Date.now() - date.getTime()));
                }
                case 'ymd': {
                    return renderDateYMD(date);
                }
                case 'dmy': {
                    return renderDateDMY(date);
                }
                case 'hm': {
                    return renderTimeHM(date);
                }
                case 'hms': {
                    return renderTimeHMS(date);
                }
                case 'ymd hm': {
                    return renderDateYMD(date) + ' ' + renderTimeHM(date);
                }
                case 'ymd hms': {
                    return renderDateYMD(date) + ' ' + renderTimeHMS(date);
                }
                default: {
                    return s;
                }
            }
        })
        .join(' ');
}
