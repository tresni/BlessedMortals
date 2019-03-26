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
        }).then(result => {
            if (result[0] != 'server:init_account') {
                throw 'unable to init account';
            }
            else {
                this.accountId = result[1].userId;
                return result[1];
            }
        }.bind(this));
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

    get accountId() {
        return this._accountId;
    }

    set accountId(accountId) {
        this._accountId = accountId;
    }
}

module.exports = BlessedMortal;
