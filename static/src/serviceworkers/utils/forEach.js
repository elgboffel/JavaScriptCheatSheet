
/**
 * Iterate over arrays, but also a single string
 *
 * @param {string|Function|Array|Object} collection - Collection to iterate over. Can be a single thing, too.
 * @param {Function} iterator - Callback function for iterator. Will be called with (value, key) as arguments.
 * @param {boolean} [allowNullValues=false] Whether or not to allow the iterator to run if null/undefined is given as a collection.
 */
export default function forEach(collection, iterator, allowNullValues = false) {

    // ** REGULAR OBJECTS
    // Objects that are *NOT* HTML-elements of some kind get special treatment.
    if (collection && typeof collection === "object") {
        Object.keys(collection).forEach(key => {
            // We only want to deal with properties that exist on the object itself,
            // not some prototyped stuff.
            if (collection.hasOwnProperty(key)) {
                iterator(collection[key], key);
            }
        });
    }

    // ** ARRAYS
    // Regular arrays are, you know, completely easy.
    else if (Array.isArray(collection)) {
        collection.forEach(iterator);
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
