(() => {
	"use strict";
	//=============================================================================
	// Game_Temp
	//=============================================================================
	const _Game_Temp_initialize = Game_Temp.prototype.initialize;
	Game_Temp.prototype.initialize = function() {
		_Game_Temp_initialize.apply(this, arguments);
		this._lastItemOfWindowEventItem = null;
	};

	//=============================================================================
	// Window_EventItem
	//=============================================================================
	const _Window_EventItem_start = Window_EventItem.prototype.start;
	Window_EventItem.prototype.start = function() {
		_Window_EventItem_start.apply(this, arguments);
		const lastIndex = this._data.indexOf($gameTemp._lastItemOfWindowEventItem);
		if (lastIndex >= 0) {
			this.select(lastIndex);
		}
	};

	const _Window_EventItem_onOk = Window_EventItem.prototype.onOk;
	Window_EventItem.prototype.onOk = function() {
		_Window_EventItem_onOk.apply(this, arguments);
		$gameTemp._lastItemOfWindowEventItem = this.item();
	};

})();