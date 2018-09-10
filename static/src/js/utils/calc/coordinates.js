/**
 * Tools for calculating with coordinates.
 *
 * @module utils/calc/coordinate
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 */


import {degreesToRadians} from "./radians";


/**
 * Get distance between two coordinates
 *
 * @param {Number[]} from - From coordinates [x, y]
 * @param {Number[]} to - To coordinates [x, y]
 * @returns {Number} The distance between the two coordinates.
 */
export function getDistance(from, to) {
    return Math.sqrt(Math.pow(to[0] - from[0], 2) + Math.pow(to[1] - from[1], 2));
}


/**
 * Get distance between two coordinates on a sphere using the Haversine Distance Formula.
 *
 * This function takes coordinates given in latitudes and longitudes as both arrays and objects.
 *
 * @param {Number[]|{latitude: Number, longitude: Number}} from - From coordinates [x, y] or {latitude: x, longitude: y}
 * @param {Number[]|{latitude: Number, longitude: Number}} to - To coordinates [x, y] or {latitude: x, longitude: y}
 * @param {Number} diameter - The diameter of the sphere.
 * @returns {Number} The distance between the two coordinates.
 */
export function getDistanceOnSphere(from, to, diameter) {
    const fromLatitude = typeof from.latitude === 'number' ? from.latitude : from[0];
    const fromLongitude = typeof from.longitude === 'number' ? from.longitude : from[1];
    const toLatitude = typeof to.latitude === 'number' ? to.latitude : to[0];
    const toLongitude = typeof to.longitude === 'number' ? to.longitude : to[1];

    const dLat = degreesToRadians(toLatitude - fromLatitude);
    const dLon = degreesToRadians(toLongitude - fromLongitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(degreesToRadians(fromLatitude)) *
        Math.cos(degreesToRadians(toLatitude)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    return diameter * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}


/**
 * Get distance between two coordinates on Earth in kilometers using the Haversine Distance Formula.
 *
 * This function takes coordinates given in latitudes and longitudes as both arrays and objects (compatible with Google Maps).
 *
 * @param {Number[]|{latitude: Number, longitude: Number}} from - From coordinates [x, y] or {latitude: x, longitude: y}
 * @param {Number[]|{latitude: Number, longitude: Number}} to - To coordinates [x, y] or {latitude: x, longitude: y}
 * @returns {Number} The distance between the two coordinates in kilometers.
 */
export function getDistanceOnEarth(from, to) {
    return getDistanceOnSphere(from, to, 12742);
}


/**
 * Get the slope of a line (also called the gradient)
 * The slope of a line is a number that measures its "steepness", usually denoted by the letter m.
 *
 * @param {Number[]} from - From coordinate [x, y]
 * @param {Number[]} to - To coordinate [x, y]
 * @returns {Number} The slope
 */
export function getSlope(from, to) {
    return (to[1] - from[1]) / (to[0] - from[0]);
}
