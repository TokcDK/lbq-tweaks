/*:
 * @plugindesc Replaces the allocating .filter() versions of eventsXy,
 * eventsXyNt and tileEventsXy with plain loops over the sparse _events array.
 * @author Senior MV Expert
 *
 * @help
 * eventsXy() / eventsXyNt() are called from isCollidedWithEvents() on every
 * movement check of every character, and from startMapEvent() on every action
 * button press. The vanilla implementation goes through events(), which
 * allocates a filtered copy of the sparse _events array, and then calls
 * .filter() with a closure on it: two arrays plus a closure object per call,
 * plus a full walk of the map's events.
 *
 * This plugin walks this._events directly and skips the holes left by
 * EventReSpawn's `delete this._events[id]`. Same result, one array, no closure.
 *
 * Load order: after SA_CoreSpeedImprovement (which also replaces events() and
 * eventsXyNt) and before EaseEventLoad, whose opt1 spatial index is O(1) and
 * strictly better than this - if that plugin is ever enabled it must win.
 */
(function() {
    'use strict';

    Game_Map.prototype.eventsXy = function(x, y) {
        var events = this._events;
        var result = [];
        for (var i = 0, len = events.length; i < len; i++) {
            var event = events[i];
            if (event && event.pos(x, y)) result.push(event);
        }
        return result;
    };

    Game_Map.prototype.eventsXyNt = function(x, y) {
        var events = this._events;
        var result = [];
        for (var i = 0, len = events.length; i < len; i++) {
            var event = events[i];
            if (event && event.posNt(x, y)) result.push(event);
        }
        return result;
    };

    // this.tileEvents is the pre-filtered isTile() list, rebuilt on map refresh.
    Game_Map.prototype.tileEventsXy = function(x, y) {
        var events = this.tileEvents;
        var result = [];
        if (!events) return result;
        for (var i = 0, len = events.length; i < len; i++) {
            var event = events[i];
            if (event && event.posNt(x, y)) result.push(event);
        }
        return result;
    };
})();
