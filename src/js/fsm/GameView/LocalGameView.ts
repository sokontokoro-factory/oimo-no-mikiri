import StateMachine from "../../../framework/StateMachine";
import { addEvents, dispatchEvent, removeEvents } from "../../../framework/EventUtils";
import ViewContainer from "../../../framework/ViewContainer";

import GameView, { EnterParams, Events, InnerStates } from "./GameView";

import ReadyState from "./internal/ReadyState";
import ResultState, { EnterParams as ResultStateEnterParams } from "./internal/ResultState";
import {
    default as MultiPlayOverState,
    EnterParams as MultiPlayOverStateEnterParams
} from "./internal/OverState/MultiPlayOverState";
import {
    default as MultiPlayActionState,
    EnterParams as MultiPlayActionStateEnterParams
} from "./internal/ActionState/MultiPlayActionState";
import {
    default as SinglePlayOverState,
    EnterParams as SinglePlayOverStateEnterParams
} from "./internal/OverState/SinglePlayOverState";
import {
    default as SinglePlayActionState,
    EnterParams as SinglePlayActionStateEnterParams
} from "./internal/ActionState/SinglePlayActionState";

import Actor from "../../models/Actor";
import { isSingleMode } from "../../models/Game";
import { BattleEvents } from "../../models/Battle";
import { GameEvents } from "../../models/online/OnlineGame";

class LocalGameView extends GameView {
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
            [InnerStates.ACTION]: isSingleMode(this.game.mode) ?
                new SinglePlayActionState(this) :
                new MultiPlayActionState(this),
            [InnerStates.RESULT]: new ResultState(this),
            [InnerStates.OVER]: isSingleMode(this.game.mode) ?
                new SinglePlayOverState(this) :
                new MultiPlayOverState(this)
        });

        addEvents({
            [Events.REQUEST_READY]: this._onRequestedReady,
            [Events.IS_READY]: this._onReady,
            [Events.ATTACK]: this.onAttacked,
            [Events.FIXED_RESULT]: this._onFixedResult,
            [Events.RESTART_GAME]: this._onRequestedRestart,
        });

        this.game.on(GameEvents.ROUND_PROCEED, () => {
            dispatchEvent(Events.REQUEST_READY);
        });

        this.game.start();
    }

    /**
     * @override
     */
    onExit(): void {
        super.onExit();

        removeEvents([
            Events.REQUEST_READY,
            Events.IS_READY,
            Events.ATTACK,
            Events.FIXED_RESULT,
            Events.RESTART_GAME,
        ])
    }

    /**
     *
     * @private
     */
    private _onRequestedReady = () => {
        if (this.game.isFixed()) {
            dispatchEvent(Events.FIXED_RESULT);
            return;
        }

        // is retry battle by false-start?
        if (this.game.currentBattle.isFixed()) {
            this.game.next();
        }

        console.log(`On requested ready. Round${this.game.currentRound}`);

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

        if (isSingleMode(this.game.mode)) {
            const autoOpponentAttackInterval = this.game.npcAttackIntervalMillis;

            this.to<SinglePlayActionStateEnterParams>(InnerStates.ACTION, {
                signalTime,
                isFalseStarted,
                autoOpponentAttackInterval,
            });
        } else {
            const battleLeft = this.game.battleLeft;
            const wins = {
                onePlayer: this.game.getWins(Actor.PLAYER),
                twoPlayer: this.game.getWins(Actor.OPPONENT),
            };

            this.to<MultiPlayActionStateEnterParams>(InnerStates.ACTION, {
                signalTime,
                isFalseStarted,
                battleLeft,
                wins,
            });
        }
    };

    protected onAttacked = (e: CustomEvent) => {
        const {attacker, attackTime} = e.detail;

        this.game.currentBattle.on(BattleEvents.SUCCEED_ATTACK, (winner) => {
            this.to<ResultStateEnterParams>(InnerStates.RESULT, {
                winner
            });

            this.game.currentBattle.off(BattleEvents.SUCCEED_ATTACK);
            this.game.currentBattle.off(BattleEvents.FALSE_STARTED);
            this.game.currentBattle.off(BattleEvents.DRAW);
        });
        this.game.currentBattle.on(BattleEvents.FALSE_STARTED, (winner) => {
            this.to<ResultStateEnterParams>(InnerStates.RESULT, {
                winner,
                falseStarter: attacker
            });

            this.game.currentBattle.off(BattleEvents.SUCCEED_ATTACK);
            this.game.currentBattle.off(BattleEvents.FALSE_STARTED);
            this.game.currentBattle.off(BattleEvents.DRAW);
        });
        this.game.currentBattle.on(BattleEvents.DRAW, () => {
            this.to<ResultStateEnterParams>(InnerStates.RESULT);

            this.game.currentBattle.off(BattleEvents.SUCCEED_ATTACK);
            this.game.currentBattle.off(BattleEvents.FALSE_STARTED);
            this.game.currentBattle.off(BattleEvents.DRAW);
        });

        this.game.currentBattle.attack(attacker, attackTime);
    };

    /**
     *
     * @private
     */
    private _onFixedResult = () => {
        const {
            bestTime,
            winner,
            mode,
            straightWins,
        } = this.game;

        console.log(`Fixed the game! player win: ${this.game.getWins(Actor.PLAYER)}, opponent wins: ${this.game.getWins(Actor.OPPONENT)}.`);

        if (isSingleMode(this.game.mode)) {
            this.to<SinglePlayOverStateEnterParams>(InnerStates.OVER, {
                winner,
                bestTime,
                mode,
                straightWins
            });
        } else {
            this.to<MultiPlayOverStateEnterParams>(InnerStates.OVER, {
                winner,
                bestTime,
                mode,
                onePlayerWins: this.game.getWins(Actor.PLAYER),
                twoPlayerWins: this.game.getWins(Actor.OPPONENT),
            });
        }
    };

    private _onRequestedRestart = () => {
        this.game.start();
        dispatchEvent(Events.REQUEST_READY);
    };
}


export default LocalGameView;