import ViewContainer from "../../../framework/ViewContainer";
import Deliverable from "../../../framework/Deliverable";

import SelectPlayerNumberBoard from "../../texture/containers/SelectPlayerNumberBoard";
import SelectLevelBoard from "../../texture/containers/SelectLevelBoard";

class MenuState extends ViewContainer {
    public static TAG = MenuState.name;

    private _selectPlayerNumberBoard: SelectPlayerNumberBoard;
    private _selectLevelBoard: SelectLevelBoard;

    /**
     * @override
     */
    onEnter(params: Deliverable): void {
        super.onEnter(params);

        this._selectPlayerNumberBoard = new SelectPlayerNumberBoard();
        this._selectPlayerNumberBoard.position.set(this.viewWidth * 0.5, this.viewHeight * 0.8);
        this._selectPlayerNumberBoard.setOnSelectOnePlayerListener(this._onSelectOnePlayer);
        this._selectPlayerNumberBoard.setOnSelectTwoPlayerListener(this._onSelectTwoPlayer);

        this._selectLevelBoard = new SelectLevelBoard();
        this._selectLevelBoard.position.set(this.viewWidth * 0.5, this.viewHeight * 0.8);
        this._selectLevelBoard.setOnSelectBeginnerListener(this._onSelectLevel);

        this.applicationLayer.addChild(
            this._selectPlayerNumberBoard,
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
    private _onSelectOnePlayer = () => {
        this.applicationLayer.removeChild(
            this._selectPlayerNumberBoard,
        );
        this.applicationLayer.addChild(
            this._selectLevelBoard,
        );
    };

    /**
     *
     * @private
     */
    private _onSelectTwoPlayer = () => {
        // TODO: implement.
    };

    /**
     *
     * @private
     */
    private _onSelectLevel = () => {
        console.log("select level")
    }

}

export default MenuState;
