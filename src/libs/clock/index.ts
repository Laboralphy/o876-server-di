type TimeOutFunction = () => unknown;

class TimeOutTask {
    private _hasHandler: boolean = false;
    private _id: NodeJS.Timeout | undefined = undefined;

    constructor(
        private readonly _function: TimeOutFunction,
        private readonly _delay: number
    ) {
        this.start();
    }

    /**
     * Clear time out associated with task
     */
    clear() {
        if (this._hasHandler && this._id !== undefined) {
            clearTimeout(this._id);
            this._hasHandler = false;
        }
    }

    /**
     * Stats a regular timeout
     */
    start() {
        this.clear();
        this._id = setTimeout(() => {
            this._function();
        }, this._delay);
    }
}

export class Clock {
    private readonly _timeOutTaskRegistry = new Map<string, TimeOutTask>();

    constructor() {}

    /**
     * Declares a new restartable timeout handler, with a specific identifier
     * this identifier is used to restart timeout if needed, with the restart method.
     *
     * @param id {string} timeout identifier
     * @param f {TimeOutFunction} function to call back when delay is expired
     * @param delay {number} delay in milliseconds
     */
    setTimeout(id: string, f: TimeOutFunction, delay: number) {
        this._timeOutTaskRegistry.set(
            id,
            new TimeOutTask(() => {
                try {
                    f();
                } catch (e) {
                    console.error(`Error in timeout handler %s`, id);
                    console.error(e);
                } finally {
                    this._timeOutTaskRegistry.delete(id);
                }
            }, delay)
        );
    }

    cancel(id: string) {
        const task = this._timeOutTaskRegistry.get(id);
        if (task) {
            task.clear();
            this._timeOutTaskRegistry.delete(id);
            return true;
        } else {
            return false;
        }
    }

    /**
     * This will reset the delay associated with a specific task.
     * @param id the id of the task whose delay must be reset
     */
    restart(id: string) {
        const task = this._timeOutTaskRegistry.get(id);
        if (task) {
            task.start();
            return true;
        } else {
            return false;
        }
    }
}
