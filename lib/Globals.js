module.exports = {
    DEGREES_90: Math.PI/2,
    DEGREES_180: Math.PI,
    DEGREES_270: 3*Math.PI/2,
    DEGREES_360: 2*Math.PI,
    WORLD_WIDTH: 4000,
    WORLD_HEIGHT: 4000,
    
    areObjectsSame: function(o1, o2) {
        return JSON.stringify(o1) === JSON.stringify(o2);
    }
};
