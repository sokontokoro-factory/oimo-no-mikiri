import ViewContainer from "../../../framework/ViewContainer";
import Deliverable from "../../../framework/Deliverable";
import {dispatchEvent} from "../../../framework/EventUtils";

import {Events} from "../views/TopViewState";

import MenuBoard from "../../texture/containers/MenuBoard";
import SelectLevelBoard from "../../texture/containers/SelectLevelBoard";
import TopBackground from "../../texture/sprite/background/TopBackground";
import CreditContainer from "../../texture/containers/CreditContainer";

class MenuState extends ViewContainer {
    public static TAG = MenuState.name;

    private _background: TopBackground;

    private _menuBoard: MenuBoard;
    private _selectLevelBoard: SelectLevelBoard;
    private _creditContainer: CreditContainer;

    /**
     * @override
     */
    onEnter(params: Deliverable): void {
        super.onEnter(params);

        this._background = new TopBackground();
        this._background.position.set(this.viewWidth * 0.5, this.viewHeight * 0.5);

        this._menuBoard = new MenuBoard(this.viewHeight, this.viewHeight);
        this._menuBoard.position.set(this.viewWidth * 0.5, this.viewHeight * 0.5);
        this._menuBoard.setOnSelectGameStartListener(this._onSelectGameStart);
        this._menuBoard.setOnSelectHowToPlayListener(this._onSelectHowToPlay);
        this._menuBoard.setOnSelectCreditListener(this._onSelectCredit);

        this._selectLevelBoard = new SelectLevelBoard(this.viewHeight, this.viewHeight);
        this._selectLevelBoard.position.set(this.viewWidth * 0.5, this.viewHeight * 0.5);
        this._selectLevelBoard.setOnSelectLevelListener(this._onSelectLevel);

        this._creditContainer = new CreditContainer(this.viewHeight, this.viewHeight);
        this._creditContainer.position.set(this.viewWidth * 0.5, this.viewHeight * 0.5);
        this._creditContainer.setOnBackToMenuButtonClickListener(this._onBackToMenuClick);

        this.backGroundLayer.addChild(
            this._background
        );

        this.applicationLayer.addChild(
            this._menuBoard,
        )
    }

    /**
     * @override
     */
    onExit(): void {
        super.onExit();
    }

    /**
     *
     * @private
     */
    private _onSelectGameStart = () => {
        this.applicationLayer.removeChild(
            this._menuBoard,
        );
        this.applicationLayer.addChild(
            this._selectLevelBoard,
        );
    };

    /**
     *
     * @private
     */
    private _onSelectHowToPlay = () => {
        dispatchEvent(Events.REQUEST_HOW_TO_PLAY);
    };

    /**
     *
     * @private
     */
    private _onSelectCredit = () => {
        this.applicationLayer.removeChild(
            this._menuBoard,
        );
        this.applicationLayer.addChild(
            this._creditContainer,
        );
    };

    /**
     *
     * @private
     */
    private _onBackToMenuClick = () => {
        this.applicationLayer.removeChild(
            this._creditContainer,
        );
        this.applicationLayer.addChild(
            this._menuBoard,
        );
    };

    /**
     *
     * @private
     */
    private _onSelectLevel = (e, level: "beginner" | "novice" | "expert") => {
        console.log("selected level: ", level);
        dispatchEvent(Events.FIXED_PLAY_MODE, {mode: level});
    }

}

export default MenuState;
