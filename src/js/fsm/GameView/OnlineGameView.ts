import StateMachine from "../../../framework/StateMachine";
import ViewContainer from "../../../framework/ViewContainer";
import { addEvents, dispatchEvent } from "../../../framework/EventUtils";

import GameView, { EnterParams, Events, InnerStates } from "./GameView";
import ReadyState from "./internal/ReadyState";
import ResultState, { EnterParams as ResultStateEnterParams } from "./internal/ResultState";
import OnlineActionState, { EnterParams as ActionEnterParams } from "./internal/ActionState/OnlineActionState";
import OnlineOverState, { EnterParams as OnlineEnterParams } from "./internal/OverState/OnlineOverState";

import { GameEvents } from "../../models/online/OnlineGame";
import Actor from "../../models/Actor";
import { BattleEvents } from "../../models/Battle";

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
        });

        this.game.once(GameEvents.ROUND_PROCEED, this._onRequestedReady);

        this.game.start();
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

    protected onAttacked = (e: CustomEvent) => {
        const {attacker, attackTime} = e.detail;

        const offEvents = () =>{
            this.game.currentBattle.off(BattleEvents.SUCCEED_ATTACK);
            this.game.currentBattle.off(BattleEvents.FALSE_STARTED);
            this.game.currentBattle.off(BattleEvents.DRAW);
        };

        this.game.currentBattle.on(BattleEvents.SUCCEED_ATTACK, (winner) => {
            offEvents();
            this.to<ResultStateEnterParams>(InnerStates.RESULT, {winner});
        });
        this.game.currentBattle.on(BattleEvents.FALSE_STARTED, (winner) => {
            offEvents();
            this.to<ResultStateEnterParams>(InnerStates.RESULT, {winner, falseStarter: attacker});
        });
        this.game.currentBattle.on(BattleEvents.DRAW, () => {
            offEvents();
            this.to<ResultStateEnterParams>(InnerStates.RESULT);
        });

        this.game.currentBattle.attack(attacker, attackTime);
    };

    private onResultFixed = () => {
        const {
            bestTime,
            winner,
            mode,
            straightWins,
        } = this.game;

        console.log(`Fixed the game! player win: ${this.game.getWins(Actor.PLAYER)}, opponent wins: ${this.game.getWins(Actor.OPPONENT)}.`);

        this.to<OnlineEnterParams>(InnerStates.OVER, {
            winner,
            bestTime,
            mode,
            onePlayerWins: this.game.getWins(Actor.PLAYER),
            twoPlayerWins: this.game.getWins(Actor.OPPONENT),
        });

        this.game.once(GameEvents.ROUND_PROCEED, this._onRequestedReady);
    };

    private onRestartRequested = () => {
        this.game.start();
    };
}

export default OnlineGameView;