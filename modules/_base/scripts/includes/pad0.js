/**
 * pads zero at the beginning of the specified number
 * this function is used for displaying numbers.
 * @param n {number} input number
 * @param size {number} final size of output string
 * @returns {string} output string with starting padded zeros
 */
function pad0(n, size) {
    return n.toString().padStart(size, '0');
}

module.exports = pad0;
