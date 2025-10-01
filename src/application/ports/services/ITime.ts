import { DurationParts, RenderDurationOptions } from '../../../libs/date-renderer';

export interface ITime {
    now(): number;
    renderDate(ts: number, format: string): string;
    renderDuration(nDuration: number, options?: RenderDurationOptions): string;
    convertToMilliseconds(durationParts: DurationParts): number;
}
