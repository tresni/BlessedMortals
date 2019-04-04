// jshint esversion:6, node:true
"use strict";

let request = require('request-promise');

class BlessedMortal {
    constructor(url, build) {
        this.url = url;
        this.build = build || 1052;
        this.jar = request.jar();
    }

    login(username, password) {
        return request.post(this.url + '/arequest/login', {
            json: true,
            jar: this.jar,
            form: {
                type: 'login',
                alias: username,
                password: password
            }
        }).then(result => {
            if (result[0] != 'server:login_success') {
                throw result[0];
            }
            return result[1];
        });
    }

    init() {
        return request.post(this.url + '/mrequest/init_account', {
            json: true,
            jar: this.jar,
            form: {
                type: 'init_account'
            }
        }).then(function (result) {
            if (result[0] != 'server:init_account') {
                throw 'unable to init account';
            }
            else {
                this.accountId = result[1].userId;
                return result[1];
            }
        }.bind(this));
    }

    getCollection() {
        return request.post(this.url + '/collection', {
            json: true,
            jar: this.jar,
            form: {
                type: 'get_collection',
            }
        });
    }

    _order(game, order, age) {
        return request.post(this.url + '/grequest/order', {
            json: true,
            jar: this.jar,
            form: {
                type: 'order',
                order: order,
                age: age,
                game_number: game,
                build_number: this.build
            }
        }).then(result => {
            if (result.event == 'order:error') {
                throw result.report;
            }
            else
                return result.report;
        });
    }

    universeReport(game) {
        return this._order(game, 'full_universe_report', 0)
            .catch(e => {
                throw "Invalid Universe Report";
            });
    }

    togglePauseGame(game, age) {
        return this._order(game, 'toggle_pause_game', age)
            .catch(e => {
                throw "Invalid Pause Game";
            });
    }

    // With "send_feedback" this returns an "full_universe_turn"
    // Single player appears to use "send_feedback"
    // Multi-player does not
    jumpGameHours(game, age, hours = 6, command = "send_feedback") {
        hours = parseInt(hours);
        if (hours > 0 || hours > 12) {
            hours = 6;
        }
        return this._order(game, `next_turn,+${hours}`, age)
            .catch(e => {
                throw "Invalid Jump Game";
            });
    }

    // returns full_universe_buy_place
    buyPlace(game, age, place) {
        return this._order(game, `buy_place,${place},send_feedback`, age);
    }

    // Targets & Path is an underscore seperated list of hexes
    // Targets is the specific targeted hexes, Path is the list of hexes
    // that must be travesered to reach target
    // move_hero,311,95,107_95
    // move_hero,232,139_129_118,139_129_118,
    // returns full_universe_delta
    moveHero(game, age, hero, targets, path) {
        return this._order(game, `move_hero,${hero},${targets},${path},`, age);
    }

    // returns order:ok
    stopHero(game, age, hero) {
        return this._order(game, `stop_hero,${hero}`);
    }

    // returns full_universe_delta
    trainMilitia(game, age, settlement) {
        return this._order(game, `train_militia,${settlement}`, age);
    }

    // returns full_universe_delta
    doPower(game, age, unit, target) {
        return this._order(game, `do_power,${unit},${target},send_feedback`, age);
    }

    // All units in the same place as this unit will become an army
    // returns full_universe_delta
    gatherAll(game, age, unit) {
        return this._order(game, `gather_all,${unit}`, age);
    }

    // merge all units of this unit type into a single unit
    // returns full_universe_delta
    mergeAll(game, age, unit) {
        return this._order(game, `merge_all,${unit}`, age);
    }

    mergeUnits(game, age, target, merge) {
        //merge_units,237,358
        return this._order(game, `merge_units,${target},${merge}`, age);
    }

    // Remove this unit from an army
    releaseUnit(game, age, unit) {
        return this._order(game, `release_unit,${unit}`, age);
    }

    // returns full_universe_delta
    deployDrawnUnit(game, age, unit, hex) {
        return this._order(game, `deploy_drawn_unit,${unit},${hex},send_feedback`, age);
    }

    // Player purchasing a card
    // returns full_universe
    volunteerToCollection(game, age, unit) {
        return this._order(game, `volunteer_to_collection,+${unit}`, age);
    }

    // returns order:ok
    buyMana(game, age, valour) {
        return this._order(game, `buy_mana,${valour}`, age);
    }

    // returns order:ok
    buyGold(game, age, valour) {
        return this._order(game, `buy_gold,${valour}`, age);
    }

    get accountId() {
        return this._accountId;
    }

    set accountId(accountId) {
        this._accountId = accountId;
    }
}

module.exports = BlessedMortal;
