import {
    default as OverState,
    EnterParams as AbstractEnterParams
} from "./OverState";

import TweetButton from "../../../../texture/sprite/button/TweetButton";
import StraightWins from "../../../../texture/containers/GameResultPaper/StraightWins";

import {postPlayLog, tweetGameResult} from "../../../../helper/network";
import {Action, Category, trackEvent} from "../../../../helper/tracker";

export interface EnterParams extends AbstractEnterParams {
    straightWins: number;
}


class SinglePlayOverState extends OverState {
    private _straightWins: StraightWins;
    private _tweetButton: TweetButton;

    protected get straightWins(): StraightWins {
        return this._straightWins;
    }

    protected get tweetButton(): TweetButton {
        return this._tweetButton;
    }

    onEnter(params: EnterParams): void {
        super.onEnter(params);

        this._straightWins = new StraightWins(params.straightWins);
        this._straightWins.position.set(0, -1 * this.resultPaper.height * 0.3);

        this._tweetButton = new TweetButton();
        this._tweetButton.position.set(this.viewWidth * 0.15, this.viewHeight * 0.2);
        this._tweetButton.setOnClickListener(() => this._onClickTweetButton(bestTime, straightWins));

        this.resultPaper.addChild(
            this.straightWins,
        );

        this.backGroundLayer.addChild(
            this.background,
        );

        this.applicationLayer.addChild(
            this.restartButton,
            this.backToTopButton,
            this.gameOverLogo,
            this.tweetButton,
            this.resultPaper,
        );

        const {
            bestTime,
            straightWins,
            mode
        } = params;

        // logging result.
        postPlayLog(bestTime, mode, straightWins);

        // track result
        this._trackAchievementToGa(bestTime, straightWins, mode);
    }

    private _trackAchievementToGa = (bestTime, straightWins, mode) => {
        trackEvent(
            Category.ACHIEVEMENT,
            `${straightWins}-straight-wins`,
            mode,
            bestTime);
    }

    private _onClickTweetButton = (bestTime: number, wins: number) => {
        trackEvent(
            Category.BUTTON,
            Action.TAP,
            "result_tweet");

        tweetGameResult(bestTime, wins);
    };
}

export default SinglePlayOverState;
