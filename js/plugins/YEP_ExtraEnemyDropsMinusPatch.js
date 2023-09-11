(function() {
    'use strict';

    DropManager.makeConditionalDropItems = function() {
        var length = this._data.length;
        if (length <= 0) return;
        for (var i = 0; i < length; ++i) {
            var data = this._data[i];
            var item = data[0];
            var conditions = data[1];
            var rate = this.getConditionalRate(conditions);
            if (Math.random() < rate) {
                this._drops.push(item);
            }
            var index = this._drops.indexOf(item);
            if (rate < 0 && index >= 0 && Math.random() < Math.abs(rate)) {
                this._drops.splice(index, 1);
            }
        }
    };
})();
