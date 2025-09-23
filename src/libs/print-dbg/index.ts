import { renderDuration } from '../date-renderer';

const TIME_SEPARATOR = '—';

/**
 * mimics debug module, but with no risk of being compromised
 * @param sNamespace
 */
export function printDbg(sNamespace: string) {
    let nLastTime = Date.now();
    return (sMsg: string, ...args: (string | number | boolean | null | undefined)[]) => {
        const nTime = Date.now() - nLastTime;
        nLastTime = Date.now();
        let sTime = '';
        if (nTime >= 1000 && nTime < 10000) {
            sTime = renderDuration(nTime) + ' ' + (nTime % 1000).toString() + ' ms';
        } else {
            sTime = nTime.toString() + ' ms';
        }
        console.log(`${sNamespace}: ${sMsg} ${TIME_SEPARATOR} ${sTime}`, ...args);
    };
}
