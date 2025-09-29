import { RenderDurationOptions } from '../../../libs/date-renderer';

export interface ITime {
    now(): number;
    renderDuration(nDuration: number, options?: RenderDurationOptions): string;
}
