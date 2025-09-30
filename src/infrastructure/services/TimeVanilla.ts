import { renderDate, renderDuration, RenderDurationOptions } from '../../libs/date-renderer';

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
}
