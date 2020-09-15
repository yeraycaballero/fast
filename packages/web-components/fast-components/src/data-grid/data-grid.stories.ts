import { FASTDesignSystemProvider } from "../design-system-provider";
import { STORY_RENDERED } from "@storybook/core-events";
import addons from "@storybook/addons";
import DataGridTemplate from "./fixtures/base.html";
import { html } from "@microsoft/fast-element";
import {
    DataGrid
} from "@microsoft/fast-foundation";
import { FASTDataGrid } from "./";

// Prevent tree-shaking
FASTDataGrid;
FASTDesignSystemProvider;

addons.getChannel().addListener(STORY_RENDERED, (name: string) => {
    if (name.toLowerCase().startsWith("data-grid")) {
        const defaultGrid: DataGrid | null = document.getElementById(
            "defaultGrid"
        ) as DataGrid;
        if (defaultGrid !== null) {
            defaultGrid.rowsData = dataRows;
        }

        const incrementButton: HTMLButtonElement | null = document.getElementById(
            "incrementbtn"
        ) as HTMLButtonElement;
        if (incrementButton !== null) {
            incrementButton.onclick = incrementAge;
        }
    }
});

export default {
    title: "Data grid",
};

function incrementAge(): void {
    dataGridRow1["age"] = dataGridRow1["age"] + 1;
    dataRows.shift();
    dataRows.unshift({ ...dataGridRow1 });
}

let dataGridRow1: object = { name: "bob", age: 21 };
const dataGridRow2: object = { name: "rob", age: 22 };
const dataGridRow3: object = { name: "bobby", age: 23 };

const dataRows: object[] = [dataGridRow1, dataGridRow2, dataGridRow3];

export const base = () => DataGridTemplate;
