'use strict';

var Player = require('./Player');
var Bullet = require('./Bullet');
var Collectible = require('./Collectible');
var underscore = require('underscore');

class GameStateUpdate {
    constructor(sequenceNumber, player, otherplayers, bullets, collectibles, serverTime) {
        this.sequenceNumber = sequenceNumber;
        this.player = null;
        this.otherPlayers = {};
        this.bullets = {};
        this.collectibles = {};
        this.serverTime = serverTime;

        if (player !== null && player !== undefined) { //if player is deleted, it will generally be undefined.
            this.player = player.getUpdateProperties(false, false); //not liteVersion, not fullUpdate (only modified)
        }

        let fillWithUpdateProperties = function(updates, gameObjects, GameObjectType, liteVersion = false, fullUpdate = false) {
            for (let id in gameObjects) {
                let gameObject = gameObjects[id];
                if (gameObject instanceof GameObjectType) {
                    updates[id] = gameObject.getUpdateProperties(liteVersion, fullUpdate);
                }
            }
        }

        fillWithUpdateProperties(this.otherPlayers, otherplayers, Player, true, true); //liteVersion, fullVersion
        fillWithUpdateProperties(this.bullets, bullets, Bullet);
        fillWithUpdateProperties(this.collectibles, collectibles, Collectible);
        if (player !== null && player !== undefined){
            delete this.otherPlayers[player.id];
        }
        // console.log(otherplayers[player.id]!==undefined);
    }
}

module.exports = GameStateUpdate;
