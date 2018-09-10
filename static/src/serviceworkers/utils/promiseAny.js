/**
 * Resolve when any of the provided promises resolve
 *
 * @param {Promise[]} suppliedPromises - Array of promises
 * @returns {Promise}
 */
export default function promiseAny(suppliedPromises) {

    return new Promise((resolve, reject) => {

        // Make sure promises are all promises
        const promises = suppliedPromises.map(p => Promise.resolve(p));

        // Resolve this promise as soon as one resolves
        promises.forEach(p => p.then(resolve));

        // Reject if all promises reject
        promises.reduce((a, b) => a.catch(() => b))
            .catch(() => reject(Error("All failed")));
    });

}
