import { expect } from "chai";
import { AnchoredRegion, AnchoredRegionTemplate as template } from "./index";
import { fixture } from "../fixture";
import { DOM, customElement } from "@microsoft/fast-element";

@customElement({
    name: "fast-anchored-region",
    template,
})
class FASTAnchoredRegion extends AnchoredRegion {}

async function setup() {
    const { element, connect, disconnect } = await fixture<FASTAnchoredRegion>("fast-anchored-region");

    return { element, connect, disconnect };
}

describe("Anchored Region", () => {
    // it("should set both the background-color and fill on the control as an inline style when `fill` and `color` are provided", async () => {
    //     const { element, connect, disconnect } = await setup();
    //     const fill: string = "foo";
    //     const color: string = "bar";

    //     element.fill = fill;
    //     element.color = color;

    //     await connect();

    //     expect(
    //         element.shadowRoot?.querySelector(".control")?.getAttribute("style")
    //     ).to.equal(`${expectedColor(color)} ${expectedFill(fill)}`);

    //     await disconnect();
    // });
});
