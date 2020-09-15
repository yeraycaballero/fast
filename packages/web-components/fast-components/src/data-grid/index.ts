import { customElement } from "@microsoft/fast-element";
import {
    DataGrid,
    DataGridTemplate as gridTemplate,
} from "@microsoft/fast-foundation";
import { DataGridStyles as gridStyles } from "./data-grid.styles";
/**
 * The FAST Data Grid Element.
 *
 * @public
 * @remarks
 * HTML Element: \<fast-data-grid\>
 */
@customElement({
    name: "fast-data-grid",
    template: gridTemplate,
    styles: gridStyles,
})
export class FASTDataGrid extends DataGrid {}

/**
 * Styles for DataGrid
 * @public
 */
export const DataGridStyles = gridStyles;
