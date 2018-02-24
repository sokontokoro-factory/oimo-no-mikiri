import { database, auth } from "firebase";

import Mode from "../Mode";
import Game from "../Game";
import Battle from "../Battle";
import Actor from "../Actor";
import OnlineBattle from "./OnlineBattle";

export enum GameEvents {
    CREATED = "game_created",
    MEMBER_JOINED = "member_joined",
    FULFILLED_MEMBERS = "fulfilled_members",
    MEMBER_LEFT = "member_left",
    ROUND_PROCEED = "round_proceed",
}

class OnlineGame extends Game {
    private _id: string;
    private _memberIds: string[];
    private _gameRef: database.Reference;

    constructor(id: string) {
        super(Mode.MULTI_ONLINE);
        this._id = id;
        this._memberIds = [];
        this._battles = new Map();

        this._gameRef = database().ref(`/games/${this._id}`);
        this._gameRef.child("members").on("value", this.onMemberUpdated);
        this._gameRef.child("currentRound").on("value", this.onCurrentRoundUpdated);
    }

    /************************************************************************************
     * Static methods
     */
    public static async create() {
        const gameId = database().ref().child("games").push().key;

        await database().ref(`games/${gameId}`).set({
            createdAt: database.ServerValue.TIMESTAMP,
        });

        return new OnlineGame(gameId);
    }

    /************************************************************************************
     * Accessor
     */

    /**
     *
     * @return {string}
     */
    public get id(): string {
        return this._id;
    }

    /**
     *
     * @return {string[]}
     */
    public get memberIds(): string[] {
        return this._memberIds;
    }

    public get npcAttackIntervalMillis(): number {
        throw new Error("Not implemented");
    }

    /************************************************************************************
     * Status change methods
     */

    public async join() {
        const {uid} = auth().currentUser;

        const {snapshot} = await this.transaction((current) => {
            if (!current) {
                return current;
            }

            if (!current.members || Object.keys(current.members).length < 2) {
                current.members = Object.assign({}, current.members, {
                    [uid]: true
                });
            }
            return current;
        }, "join_game");

        const currentGame = snapshot.val();

        if (!currentGame) {
            throw new Error("Provided game is not exist.");
        }

        const currentMemberIds = Object.keys(currentGame.members);
        const isJoinSucceed = currentMemberIds.some(id => id === uid);

        if (isJoinSucceed) {
            await this._gameRef.child(`members/${uid}`).onDisconnect().set(null);
        } else {
            throw new Error("Provided game's members are already fulfilled.");
        }
    }


    public async start(): Promise<void> {
        this._battles = new Map();

        return this.processRound(1);
    }

    public async next(): Promise<void> {
        if (this.currentRound >= this.roundSize) {
            console.error('Round of the game is already fulfilled.');
            return;
        }

        const nextRound = this.currentRound + 1;

        return this.processRound(nextRound);
    }

    isFixed(): boolean {
        const requiredWins = Math.ceil(this.roundSize / 2);
        return this.getWins(Actor.PLAYER) >= requiredWins
            || this.getWins(Actor.OPPONENT) >= requiredWins;
    }


    /************************************************************************************
     * Callback methods
     */

    /**
     *
     * @param {firebase.database.DataSnapshot} snapshot
     */
    protected onMemberUpdated = (snapshot: database.DataSnapshot) => {
        if (!snapshot.exists()) {
            return;
        }

        const {uid} = auth().currentUser;
        if (!snapshot.hasChild(uid)) {
            console.error("Updated member list dose not have own ID.");
            return;
        }

        if (3 <= snapshot.numChildren()) {
            console.error("invalid member length!");
            return;
        }

        if (this.memberIds.length === 2 && snapshot.numChildren() < 2) {
            console.log("Member was left.");
            this.dispatch(GameEvents.MEMBER_LEFT);
            return;
        }

        this._memberIds = Object.keys(snapshot.val());

        if (this._memberIds.length == 2) {
            console.log(`Game members are fulfilled.`);
            this.dispatch(GameEvents.FULFILLED_MEMBERS);
        }
    };

    protected onCurrentRoundUpdated = async (snapshot: database.DataSnapshot) => {
        if (!snapshot.exists()) {
            return;
        }

        const prevRound = this._currentRound;
        const nextRound = snapshot.val();
        const nextBattle = new OnlineBattle({
            gameId: this._id,
            round: nextRound,
            playerId: auth().currentUser.uid,
            opponentId: this._memberIds.find((id) => id !== auth().currentUser.uid)
        });

        if (nextRound === 1) {
            this._battles.clear();
        }

        this._battles.set(nextRound, nextBattle);
        this._currentRound = nextRound;

        await nextBattle.start();

        console.log(`Proceed to next round. Round${prevRound} -> Round${nextRound}`);
        this.dispatch(GameEvents.ROUND_PROCEED, {nextRound});
    };

    /************************************************************************************
     * Private methods
     */

    /**
     *
     * @param {number} nextRound
     */
    private processRound = async (nextRound: number): Promise<void> => {

        const prevRound = this._currentRound;
        const nextBattle = new OnlineBattle({
            gameId: this._id,
            round: nextRound,
            playerId: auth().currentUser.uid,
            opponentId: this._memberIds.find((id) => id !== auth().currentUser.uid)
        });

        await this.processCurrentRoundInTransactional(nextRound);
    };

    /**
     *
     * @param {number} nextRound
     * @return {Promise<{committed: boolean; snapshot: firebase.database.DataSnapshot}>}
     */
    private processCurrentRoundInTransactional = (nextRound: number) => {
        const now = database.ServerValue.TIMESTAMP;

        return this.transaction((current) => {
            if (current && current.currentRound !== nextRound) {
                current.currentRound = nextRound;
                current.updatedAt = now;
            }
            return current;
        }, "process_round");
    };


    /**
     *
     *
     * @param {(current: any) => any} transactionUpdate
     * @param {string} tag
     * @return {Promise<{committed: boolean; snapshot: firebase.database.DataSnapshot}>}
     */
    private async transaction(transactionUpdate: (current: any) => any, tag?: string): Promise<{ committed: boolean, snapshot: database.DataSnapshot }> {
        console.log(`Start transaction. TAG: ${tag}`);
        const {committed, snapshot} = await this._gameRef.transaction(transactionUpdate);
        console.log(`End transaction. TAG: ${tag}, committed: ${committed}`, snapshot.val());

        return {committed, snapshot}
    }
}

export default OnlineGame;