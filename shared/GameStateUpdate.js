'use strict';

var Player = require('./Player');
var Bullet = require('./Bullet');
var Collectible = require('./Collectible');

class GameStateUpdate {
    constructor(sequenceNumber, player, otherplayers, bullets, collectibles, serverTime) {
        this.sequenceNumber = sequenceNumber;
        this.player = null;
        this.otherPlayers = {};
        this.bullets = {};
        this.collectibles = {};
        this.serverTime = serverTime;

        if (player !== null) {
            this.player = player.getUpdateProperties(false);
        }

        let fillWithUpdateProperties = function(updates, gameObjects, GameObjectType, liteVersion = false) {
            for (let id in gameObjects) {
                let gameObject = gameObjects[id];
                if (gameObject instanceof GameObjectType) {
                    updates[id] = gameObject.getUpdateProperties(liteVersion);
                }
            }
        }

        fillWithUpdateProperties(this.otherPlayers, otherplayers, Player, true);
        fillWithUpdateProperties(this.bullets, bullets, Bullet);
        fillWithUpdateProperties(this.collectibles, collectibles, Collectible);
    }
}

module.exports = GameStateUpdate;
