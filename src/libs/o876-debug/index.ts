export function debug(ns: string) {
    return (sText: string, ...args: (number | string | boolean | null | undefined)[]) => {
        console.log(ns + ' - ' + sText, ...args);
    };
}
