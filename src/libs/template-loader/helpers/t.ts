import handlebars from 'handlebars';
import i18n from 'i18next';

export function initHelper() {
    handlebars.registerHelper('t', function (key: string, options: any) {
        return i18n.t(key, { ...options.data.root, ...options.hash });
    });
}
