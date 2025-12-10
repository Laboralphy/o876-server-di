/**
 * @var include {function(id: string)}
 * @var context {IClientContext}
 * @var parameters {string[]}
 */

const { inc1 } = include('includes/inc1');

async function main() {
    inc1();
}

module.exports = main(context, parameters);
