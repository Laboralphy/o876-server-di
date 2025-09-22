import { renderDuration, RenderDurationOptions } from '../../libs/date-renderer';

export class TimeVanilla {
    now() {
        return Date.now();
    }

    renderDuration(nDuration: number, options: RenderDurationOptions = {}) {
        return renderDuration(nDuration, options);
    }
}
