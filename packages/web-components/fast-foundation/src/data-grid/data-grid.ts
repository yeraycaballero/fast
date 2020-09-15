import {
    attr,
    FASTElement,
    html,
    RepeatBehavior,
    RepeatDirective,
    observable,
    ViewTemplate,
} from "@microsoft/fast-element";

const defaultRowItemTemplate = html`
    <div style="height: 40px; width: 100px">
    "${x => x['age']}"
    </div>
`;

/**
 * A Data Grid Custom HTML Element.
 *
 * @public
 */
export class DataGrid extends FASTElement {
    /**
     * The data being displayed in the grid
     *
     * @public
     */
    @observable
    public rowsData: object[] = [];

    private rowItemTemplate: ViewTemplate = defaultRowItemTemplate;
    private rowsRepeatBehavior?: RepeatBehavior;
    private rowsPlaceholder?: Node;

    constructor() {
        super();
    }

    /**
     * @internal
     */
    public connectedCallback(): void {
        super.connectedCallback();

        this.rowsPlaceholder = document.createComment("");
        this.appendChild(this.rowsPlaceholder);

        this.rowsRepeatBehavior = new RepeatDirective(
            x => x.rowsData,
            x => x.rowItemTemplate,
            { positioning: true }
        ).createBehavior(this.rowsPlaceholder);

        this.$fastController.addBehaviors([this.rowsRepeatBehavior!]);
    }
}
