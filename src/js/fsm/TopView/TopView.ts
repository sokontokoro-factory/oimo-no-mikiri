import ViewContainer from "../../../framework/ViewContainer";
import StateMachine from "../../../framework/StateMachine";
import Deliverable from "../../../framework/Deliverable";
import {dispatchEvent, addEvents, removeEvents} from "../../../framework/EventUtils";

import TitleState from "./internal/TitleState";
import MenuState from "./internal/MenuState";

import {Events as AppEvents} from '../ApplicationState';
import HowToPlayState from "./internal/HowToPlayState";

export enum Events {
    TAP_TITLE = 'GameView@TAP_TITLE',
    REQUEST_BACK_TO_MENU = 'GameView@REQUEST_BACK_TO_MENU',
    REQUEST_HOW_TO_PLAY = 'GameView@REQUEST_HOW_TO_PLAY',
    FIXED_PLAY_MODE = 'GameView@FIXED_PLAY_MODE',
}

class TopViewState extends ViewContainer {
    public static TAG = TopViewState.name;

    private _topStateMachine: StateMachine<ViewContainer>;

    /**
     * @override
     */
    update(elapsedTime: number): void {
        super.update(elapsedTime);

        this._topStateMachine.update(elapsedTime);
    }

    /**
     * @override
     */
    onEnter(params: Deliverable): void {
        super.onEnter(params);

        this._topStateMachine = new StateMachine({
            [TitleState.TAG]: new TitleState(),
            [MenuState.TAG]: new MenuState(),
            [HowToPlayState.TAG]: new HowToPlayState(),
        });

        this._topStateMachine.init(TitleState.TAG);
        this.applicationLayer.addChild(this._topStateMachine.current);

        addEvents({
            [Events.TAP_TITLE]: this._handleTapTitleEvent,
            [Events.REQUEST_BACK_TO_MENU]: this._handleRequestBackMenuEvent,
            [Events.REQUEST_HOW_TO_PLAY]: this._handleRequestHowToPlayEvent,
            [Events.FIXED_PLAY_MODE]: this._handleFixedPlayModeEvent,
        });
    }

    /**
     * @override
     */
    onExit(): void {
        super.onExit();

        removeEvents([
            Events.TAP_TITLE,
            Events.REQUEST_BACK_TO_MENU,
            Events.REQUEST_HOW_TO_PLAY,
            Events.FIXED_PLAY_MODE,
        ])
    }

    /**
     *
     * @private
     */
    private _handleTapTitleEvent = () => {
        this._topStateMachine.change(MenuState.TAG);
        this.applicationLayer.removeChildren();
        this.applicationLayer.addChild(this._topStateMachine.current);
    };

    /**
     *
     * @private
     */
    private _handleRequestHowToPlayEvent = () => {
        this._topStateMachine.change(HowToPlayState.TAG);
        this.applicationLayer.removeChildren();
        this.applicationLayer.addChild(this._topStateMachine.current);
    };

    /**
     *
     * @private
     */
    private _handleRequestBackMenuEvent = () => {
        this._topStateMachine.change(MenuState.TAG);
        this.applicationLayer.removeChildren();
        this.applicationLayer.addChild(this._topStateMachine.current);
    };

    /**
     *
     * @private
     */
    private _handleFixedPlayModeEvent = (e: CustomEvent) => {
        console.log("Fixed play mode: ", e.detail.mode);
        dispatchEvent(AppEvents.REQUESTED_GAME_START, {mode: e.detail.mode});
    };
}

export default TopViewState;
