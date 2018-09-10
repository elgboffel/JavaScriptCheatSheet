/**
 * **Iterate over just about any iterable object type** - primarily for node lists, arrays and objects, but will also
 * yield results for single elements such as elements (nodes), strings or numbers.
 *
 * @module utils/forEach
 * @author Anders Gissel <anders.gissel@akqa.com>
 *
 * @example <caption>Iterating through an array:</caption>
 * import forEach from './utils/forEach';
 * forEach([value1, value2, value3], (value, index) => {
 *     // Loop through the values in the array
 * });
 *
 *
 * @example <caption>Iterating through an object:</caption>
 * import forEach from './utils/forEach';
 * forEach({"key1": value1, "key2": value2}, (value, key) => {
 *     // Loop through the values in the object
 * });
 *
 *
 * @example <caption>Iterating through a DOM-collection:</caption>
 * import forEach from './utils/forEach';
 *
 * const collection = document.querySelectorAll("div");
 * forEach(collection, element => {
 *     // "element" is a reference to the current DOM-element.
 * });
 *
 */


/**
 *
 * @param {Node|NodeList|Window|Document|Array|object|*} collection - Collection to iterate over. Can be a single element, too.
 * @param {function} iterator - Callback function for iterator. Will be called with (value, key) as arguments.
 * @param {boolean} [allowNullValues=false] Whether or not to allow the iterator to run if null/undefined is given as a collection.
 */
export function forEach(collection, iterator, allowNullValues = false) {

    // ** NODE LISTS
    // If we're dealing with a node list (see document.querySelectorAll()), we'll iterate through
    // it the old fashioned way.
    if (collection instanceof NodeList) {
        for (let i = 0; i < collection.length; i += 1) {
            iterator(collection.item(i), i);
        }
    }


    // ** ITERATORS
    // If we have an iterator object we'll use the "for ... of" method of iterating through it.
    else if (collection && collection.constructor.name === 'Iterator') {
        let index = 0;
        for (const item of collection) {
            iterator(item, index);
            index += 1;
        }
    }


    // ** ARRAYS
    // Regular arrays are, you know, completely easy.
    else if (Array.isArray(collection)) {
        collection.forEach(iterator);
    }


    // ** REGULAR OBJECTS
    // Objects that are *NOT* HTML-elements of some kind get special treatment.
    else if (collection && typeof collection === "object" && !(collection instanceof Node || collection instanceof Window || collection instanceof Document)) {
        Object.keys(collection).forEach(key => {
            // We only want to deal with properties that exist on the object itself,
            // not some prototyped stuff.
            if (collection.hasOwnProperty(key)) {
                iterator(collection[key], key);
            }
        });
    }


    // ** SINGLE NODES OR ELEMENTS
    // Anything that doesn't fit in the cases above will be handled here. We'll just fire the iterator once with the
    // given collection argument, and 0 as the key, and hope that is enough for the use case.
    else {
        if (collection || allowNullValues) {
            iterator(collection, 0);
        }
    }
}

export default forEach;
