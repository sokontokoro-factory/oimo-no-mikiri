import State from "./State";
import Deliverable from "./Deliverable";

/**
 * Function type to convert {@link Deliverable} instance provided from {@link State#onExit}.
 */
export type DeliverableConverter = (source?: Deliverable) => Deliverable;

/**
 * Handle {@code State}.
 *
 * @class
 */
class StateMachine {
    private _currentState: State;
    private _states: Map<String, State> = new Map();

    constructor(states: { [key: string]: State }) {
        Object.keys(states).forEach((key) => {
            this._states.set(key, states[key]);
        });
    }

    public update(elapsedTime: number): void {
        this._currentState.update(elapsedTime);
    }

    public init(firstStateTag, params?: Deliverable): void {
        this._currentState = this._states.get(firstStateTag);
        this._currentState.onEnter(params);
    }

    /**
     * Change state.
     * If it has {@param converter}, converted {@link Deliverable} provided from {@link State#onExit} is set as args of {@State#onEnter}.
     *
     * @param {string} stateTag
     * @param {DeliverableConverter} converter
     */
    public change(stateTag: string, converter?: DeliverableConverter): State {
        const nextState = this._states.get(stateTag);

        // Check provide state is defined.
        if (!nextState) {
            throw new Error('Provided tag is not supported on the state machine.');
        }

        // Make state exit, if there is previous state.
        const delivered = this._currentState && this._currentState.onExit() || {};

        // Set next state and make new state enter.
        this._currentState = nextState;
        this._currentState.onEnter(converter ?
            converter(delivered) :
            delivered
        );

        return this._currentState;
    }
}

export default StateMachine;
