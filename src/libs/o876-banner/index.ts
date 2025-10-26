import { BrailleBanner } from './BrailleBanner';

function main(argv: string[]) {
    const sComment = argv[0];
    const bComment = sComment == '#' || sComment == '//';
    const sText = bComment ? argv.slice(1) : argv;
    const sBanner = BrailleBanner.renderString(sText.join(' '));
    if (bComment) {
        sBanner.split('\n').forEach((s) => {
            console.log(sComment + ' ' + s);
        });
    } else {
        console.log(sBanner);
    }
}

main(process.argv.slice(2));
