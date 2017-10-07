import {loadTexture, loadFrames} from "../../../../framework/AssetLoader";

import Player from "./Player";
import PlayerCloseUp from "./PlayerCloseUp";

import {Ids} from '../../../resources/image';


const FRAMES = {
    WAIT: [0, 1],
    ATTACK: [2, 3],
    LOSE: [4, 5],
    WIN: [6, 7]
};

/**
 * @class
 */
class HanamaruCloseUp extends PlayerCloseUp {
    public constructor() {
        super(loadTexture(Ids.CHARACTER_HANAMARU_CLOSEUP));
    }
}

/**
 * @class
 */
class Hanamaru extends Player {
    public constructor() {
        const frames = loadFrames(Ids.CHARACTER_HANAMARU);
        const wait = FRAMES.WAIT.map((waitFrameIndex) => frames[waitFrameIndex]);
        const attack = FRAMES.ATTACK.map((attackFrameIndex) => frames[attackFrameIndex]);
        const win = FRAMES.WIN.map((winFrameIndex) => frames[winFrameIndex]);
        const lose = FRAMES.LOSE.map((loseFrameIndex) => frames[loseFrameIndex]);

        super(wait, attack, win, lose, new HanamaruCloseUp());
    }
}

export default Hanamaru;
