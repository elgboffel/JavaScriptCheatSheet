/**
 * Create a timeout that can be paused and resumed.
 *
 * @module utils/Timer
 * @author Lars Munkholm <lars.munkholm@akqa.com>
 *
 * @example
 * // Create a timer that executes a function after 2 seconds
 * const timer = new Timer((a, b) => {
 *     window.console.log(`${a}, ${b}`);
 * }, 2000, "Hello", "friend");
 *
 * // Pause timer after 1 second
 * setTimeout(() => {
 *     timer.pause();
 *
 *     // And resume it after 3 seconds
 *     setTimeout(() => {
 *         timer.resume();
 *     }, 3000);
 * }, 1000);
 *
 * // After 5 seconds the function will output "Hello, friend" to the console.
 */
class Timer {

    /**
     * Create timer
     *
     * @param {function} callback - The function that will be executed.
     * @param {number} [milliseconds=0] - The number of milliseconds to wait before executing the code.
     * @param {...*} [params] - Additional parameters to pass to the function.
     *
     * @example
     * const timer = new Timer(() => {
     *     window.alert("Timer is done!");
     * }, 1000);
     */
    constructor(callback, milliseconds = 0, ...params) {
        this.callback = callback;
        this.remaining = milliseconds;
        this.params = params;

        this.resume();
    }

    /**
     * Pause timer
     */
    pause() {
        if (this.start) {
            window.clearTimeout(this.timerId);
            this.remaining -= new Date().getTime() - this.start;
        }
    }

    /**
     * Resume timer
     */
    resume() {
        this.start = new Date().getTime();
        window.clearTimeout(this.timerId);
        this.timerId = window.setTimeout(this.callback, this.remaining, ...this.params);
    }
}


export default Timer;
