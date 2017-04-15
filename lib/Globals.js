module.exports = {
    DEGREES_90: Math.PI/2,
    DEGREES_270: 3*Math.PI/2,
    DEGREES_360: 2*Math.PI,
    
    canvas: document.getElementById('canvas'),
    
    areObjectsSame: function(o1, o2) {
        return JSON.stringify(o1) === JSON.stringify(o2);
    }
};
