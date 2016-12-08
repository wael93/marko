var expect = require('chai').expect;

module.exports = function(helpers) {
    var widget = helpers.mount(require('./index'), {});
    var label = widget.getEl('label');
    var forElId = label.getAttribute('for');
    var inputEl = document.getElementById(forElId);

    expect(!!forElId).to.equal(true);
    expect(inputEl.value).to.equal('test');
    expect(label.getAttribute('for-ref')).to.equal(null);
};