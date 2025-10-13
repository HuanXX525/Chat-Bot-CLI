function getRandomInt(min, max) {
    /**
     * Returns a random integer between min (inclusive) and max (exclusive).
     * @param {number} min The minimum value (inclusive)
     * @param {number} max The maximum value (exclusive)
     * @returns {number} A random integer between min and max
     */
	min = Math.ceil(min);
	max = Math.floor(max);
	return Math.floor(Math.random() * (max - min)) + min; // 不含max
}

export {getRandomInt};
