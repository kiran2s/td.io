module.exports = {
    DEGREES_90: Math.PI/2,
    DEGREES_180: Math.PI,
    DEGREES_270: 3*Math.PI/2,
    DEGREES_360: 2*Math.PI,
    WORLD_WIDTH: 4000,
    WORLD_HEIGHT: 4000,
    DEFAULT_HEIGHT: 576,
    DEFAULT_WIDTH: 1024,
    DEFAULT_ASPECT: 16/9,
    DEFAULT_SCALE: 1,


    areObjectsSame: function(o1, o2) {
        return JSON.stringify(o1) === JSON.stringify(o2);
    },

    clone: function(obj) {
	    if (null == obj || "object" != typeof obj) return obj;
	    var copy = obj.constructor();
	    for (var attr in obj) {
	        if (obj.hasOwnProperty(attr)) copy[attr] = this.clone(obj[attr]);
	    }
	    return copy;
	}
};
