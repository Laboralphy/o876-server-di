import {
    DurationParts,
    renderDate,
    renderDuration,
    RenderDurationOptions,
} from '../../libs/date-renderer';

export class TimeVanilla {
    now() {
        return Date.now();
    }

    renderDate(ts: number, format: string = 'ymd'): string {
        return renderDate(new Date(ts), format);
    }

    renderDuration(nDuration: number, options?: RenderDurationOptions) {
        return renderDuration(nDuration, options);
    }

    convertToMilliseconds({
        days = 0,
        hours = 0,
        minutes = 0,
        seconds = 0,
        milliseconds = 0,
    }: DurationParts = {}): number {
        return (
            days * 24 * 60 * 60 * 1000 +
            hours * 60 * 60 * 1000 +
            minutes * 60 * 1000 +
            seconds * 1000 +
            milliseconds
        );
    }
}
