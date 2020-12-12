// needs to be adapted to your project
const { stylelintToCheckstyle } = require('../dist/formatter');

module.exports = function (results) {
    return stylelintToCheckstyle(results, {
        prettyPrint: true,
    });
};
