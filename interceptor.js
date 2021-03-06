'use strict';

const $r = require('rethinkdb');
const log = require('./logger').singleton();

module.exports = function () {

    const args = Array.prototype.slice.call(arguments);

    const [functionName, callback, tableName] = args;
    const params = args.slice(3);

    let query = $r.table(tableName);

    if ( this.before[functionName] && this.before[functionName].hasOwnProperty('length') ) {

        const functions = this.before[functionName];
        log(`call before function "${functionName}" on table "${tableName}"`);

        for (const fn of functions) {
            query = fn.apply(this,[query].concat(params));
        }
    }

    query = callback
        .apply(this, [query].concat(params));

    if ( this.after[functionName] && this.after[functionName].hasOwnProperty('length') ) {

        const functions = this.after[functionName];
        log(`call after function "${functionName}" on table "${tableName}"`);

        for (const fn of functions) {
            query = fn.apply(this,[query].concat(params));
        }
    }

    return this.conn.then( (c) => {

        return query.run(c);
    });
};
