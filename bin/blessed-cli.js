#! /usr/bin/env node
// jshint esversion:6
"use strict";

const BlessedMortal = require('../.');
const commander = require('commander');
const conf = new (require('conf'))();

commander
    .version('0.0.1')
    .option('-u, --username <username>', 'Blight of the Immortals username', conf.get('username'))
    .option('-p, --password <password>', 'Blight of the Immortals password', conf.get('password'))
    .option('--url [url]', 'Base URL for Blight of the Immortals', 'https://blight.ironhelmet.com/')
    .option('--pause', 'Pause the game')
    .option('-v, --verbose', 'Verbose output');

commander.parse(process.argv);
commander.pause = commander.pause || false;

function debug(...args) {
    if (commander.verbose)
        console.log(...args);
}
function info(...args) {
    console.log(...args);
}

function error(...args) {
    console.error(...args);
}

let bm = new BlessedMortal(commander.url);
let resultCode = 0;
bm.login(commander.username, commander.password)
    .catch(() => {
        throw 'Bad Username/Password';
    })
    .then(() => bm.init())
    .then(results => results.games)
    .filter(game => commander.args.includes(game.number))
    .map(game => {
        let pauseString = commander.pause ? 'pause' : 'unpause';
        return bm.universeReport(game.number)
            .then(status => {
                if (commander.pause != status.paused) {
                    debug(`${status.config.name} (#${game.number}) needs to ${pauseString}`);
                    return bm.togglePauseGame(game.number, status.age)
                        .then(status => {
                            if (status.paused == commander.pause) {
                                debug(`Successfully ${pauseString}d ${status.config.name} (#${game.number})`);
                                return true;
                            }
                            else {
                                throw `Did not ${pauseString} ${status.config.name} (#${game.number})`;
                            }
                        });
                }
                else {
                    debug(`${status.config.name} (#{${game.number}}) is already ${pauseString}d`);
                    return true;
                }
            });
    })
    .catch(e => {
        error(e);
        process.exit(1);
    })
    .finally(() => process.exit(0));
