'use strict';

var Player = require('./Player');
var Bullet = require('./Bullet');
var Collectible = require('./Collectible');

class GameStateUpdate {
    constructor(sequenceNumber, players, bullets, collectibles, serverTime) {
        this.sequenceNumber = sequenceNumber;
        this.players = {};
        this.bullets = {};
        this.collectibles = {};
        this.serverTime = serverTime;

        let fillWithUpdateProperties = function(updates, gameObjects, GameObjectType) {
            for (let id in gameObjects) {
                let gameObject = gameObjects[id];
                if (gameObject instanceof GameObjectType) {
                    updates[id] = gameObject.getUpdateProperties();
                }
            }
        }

        fillWithUpdateProperties(this.players, players, Player);
        fillWithUpdateProperties(this.bullets, bullets, Bullet);
        fillWithUpdateProperties(this.collectibles, collectibles, Collectible);
    }
}

module.exports = GameStateUpdate;
