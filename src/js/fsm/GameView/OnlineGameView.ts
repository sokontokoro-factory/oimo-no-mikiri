import StateMachine from "../../../framework/StateMachine";
import ViewContainer from "../../../framework/ViewContainer";
import { addEvents, dispatchEvent } from "../../../framework/EventUtils";
import Deliverable from "../../../framework/Deliverable";

import GameView, { EnterParams, Events, InnerStates } from "./GameView";
import ReadyState from "./internal/ReadyState";
import ResultState from "./internal/ResultState";
import OnlineActionState, { EnterParams as ActionEnterParams } from "./internal/ActionState/OnlineActionState";
import OnlineOverState, { EnterParams as OnlineEnterParams } from "./internal/OverState/OnlineOverState";

import { GameEvents, default as OnlineGame } from "../../models/online/OnlineGame";
import Actor from "../../models/Actor";
import { Events as AppEvents } from "../ApplicationState";

import { Action, Category, trackEvent } from "../../helper/tracker";
import { play } from "../../helper/MusicPlayer";
import {
    closeModal,
    openMemberLeftModal,
    openRestartConfirmModal,
    openWaitingRestartModal
} from "../../helper/modals";

import { Ids as SoundIds } from "../../resources/sound";

class OnlineGameView extends GameView {
    private _gameStateMachine: StateMachine<ViewContainer>;

    /**
     *
     * @return {StateMachine<ViewContainer>}
     * @override
     */
    protected get gameStateMachine(): StateMachine<ViewContainer> {
        return this._gameStateMachine;
    }

    onEnter(params: EnterParams): void {
        super.onEnter(params);

        this._gameStateMachine = new StateMachine({
            [InnerStates.READY]: new ReadyState(this),
            [InnerStates.ACTION]: new OnlineActionState(this),
            [InnerStates.RESULT]: new ResultState(this),
            [InnerStates.OVER]: new OnlineOverState(this)
        });
        addEvents({
            [Events.REQUEST_READY]: this._onRequestedReady,
            [Events.IS_READY]: this._onReady,
            [Events.ATTACK]: this.onAttacked,
            [Events.FIXED_RESULT]: this.onResultFixed,
            [Events.RESTART_GAME]: this.onRestartRequested,
            [Events.BACK_TO_TOP]: this.onBackToTopRequested,
        });

        this.game.on(GameEvents.MEMBER_LEFT, () => {
            // Left myself?
            const ownId = (<OnlineGame>this.game).ownId;
            if (!(<OnlineGame>this.game).members.has(ownId)) {
                return;
            }

            openMemberLeftModal();

            setTimeout(() => {
                closeModal();

                dispatchEvent(AppEvents.REQUESTED_BACK_TO_TOP);
            }, 2000);
        });

        this.game.once(GameEvents.ROUND_PROCEED, () => {
            this._onRequestedReady();
        });

        this.game.start();
    }

    /**
     * @override
     */
    onExit(): void | Deliverable {
        super.onExit();

        this.game.release();
    }

    /**
     *
     * @private
     */
    private _onRequestedReady = async () => {
        if (this.game.isFixed()) {
            dispatchEvent(Events.FIXED_RESULT);
            return;
        }

        // is retry battle by false-start?
        if (this.game.currentBattle.isFixed()) {
            await this.game.next();
        }

        this.to(InnerStates.READY);
    };

    /**
     *
     * @private
     */
    private _onReady = () => {
        const signalTime = this.game.currentBattle.signalTime;
        const isFalseStarted = {
            player: this.game.currentBattle.isFalseStarted(Actor.PLAYER),
            opponent: this.game.currentBattle.isFalseStarted(Actor.OPPONENT),
        };

        const battleLeft = this.game.battleLeft;
        const wins = {
            onePlayer: this.game.getWins(Actor.PLAYER),
            twoPlayer: this.game.getWins(Actor.OPPONENT),
        };

        this.to<ActionEnterParams>(InnerStates.ACTION, {
            signalTime,
            isFalseStarted,
            battleLeft,
            wins,
        });
    };

    private onResultFixed = async () => {
        const {
            bestTime,
            winner,
            mode,
        } = this.game;
        const onePlayerWins = this.game.getWins(Actor.PLAYER);
        const twoPlayerWins = this.game.getWins(Actor.OPPONENT);

        console.log(`Fixed the game! player win: ${onePlayerWins}, opponent wins: ${twoPlayerWins}.`);

        this.game.once(GameEvents.REQUESTED_START, async (requestedUserId) => {
            if ((<OnlineGame>this.game).ownId === requestedUserId) {
                // Ignore own request.
                return;
            }

            const result = await openRestartConfirmModal();

            if (result.value) {
                this.game.once(GameEvents.IS_READY, () => {
                    closeModal();
                    setTimeout(() => this.game.start(), 0);
                });

                this.game.once(GameEvents.ROUND_PROCEED, () => {
                    this._onRequestedReady();
                });

                (<OnlineGame>this.game).requestReady();
            } else {
                this.onBackToTopRequested();
            }
        });

        this.to<OnlineEnterParams>(InnerStates.OVER, {
            winner,
            bestTime,
            mode,
            onePlayerWins,
            twoPlayerWins,
        });
    };

    // TODO: check another side's event trigger state.
    private onRestartRequested = async () => {
        openWaitingRestartModal();

        this.game.once(GameEvents.IS_READY, () => {
            closeModal();
            setTimeout(() => this.game.start(), 0);
        });

        this.game.once(GameEvents.ROUND_PROCEED, () => {
            this._onRequestedReady();
        });

        (<OnlineGame>this.game).requestReady();
    };

    private onBackToTopRequested = () => {
        (<OnlineGame>this.game).leave();

        dispatchEvent(AppEvents.REQUESTED_BACK_TO_TOP);

        play(SoundIds.SOUND_CANCEL);

        trackEvent(
            Category.BUTTON,
            Action.TAP,
            "back_to_menu");
    };
}

export default OnlineGameView;
