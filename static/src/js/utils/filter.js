/**
 * Filter an array or an object.
 *
 * @module utils/filter
 * @author Anders Gissel <anders.gissel@akqa.com>
 *
 * @example <caption>Filtering an array:</caption>
 * import filter from "./utils/filter";
 *
 * const inputArray = [1,2,3,4,5];
 * const filteredArray = filter(inputArray, value => value % 2);
 * // Returns [1, 3, 5]
 *
 *
 * @example <caption>Filtering an object:</caption>
 * import filter from "./utils/filter";
 *
 * const inputObject = { a: 1, b: 2, c: 3, d: 4, e: 5 };
 * const filteredObject = filter(inputObject, (value, key) => value % 2 || key === "d");
 * // Returns { a: 1, c: 3, d: 4, e: 5 }
 */


import forEach from './forEach';


/**
 *
 * @param {Array|object|NodeList} collection - Collection to filter. Can be an array or an object.
 * @param {function} predicateFunction - Predicate function. Must return a truthy value for filter to include option.
 * @returns {Array|Object} An object of the same type as the input collection, containing all entries that pass the predicate function.
 */
export function filter(collection, predicateFunction) {

    if (Array.isArray(collection)) {
        return collection.filter(predicateFunction);
    } else if (typeof collection === "object") {

        const filteredObject = {};
        forEach(collection, (value, key) => {
            if (Boolean(predicateFunction(value, key)) === true) {
                filteredObject[key] = value;
            }
        });

        return filteredObject;

    }

    return collection;

}

export default filter;
