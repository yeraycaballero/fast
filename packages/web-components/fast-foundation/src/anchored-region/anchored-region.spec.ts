import { expect } from "chai";
import { AnchoredRegion, AnchoredRegionTemplate as template } from "./index";
import { fixture } from "../fixture";
import { DOM, customElement, html } from "@microsoft/fast-element";

@customElement({
    name: "fast-anchored-region",
    template,
})
class FASTAnchoredRegion extends AnchoredRegion {}

async function setup() {

    const { element, connect, disconnect } = await fixture(html<HTMLDivElement>`
                <div id="viewport" style="width: 1000px; height: 1000px;">
                    <button id="anchor" style="width: 100px; height: 100px;">anchor</button>
                    <fast-anchored-region
                        viewport="viewport"
                        anchor="anchor"
                        id="region"
                    >
                        <div id="contents" style="width: 100px; height: 100px;">
                    </fast-anchored-region>
                </div>
            `);
    return { element, connect, disconnect };
}

describe("Anchored Region", () => {
    it("should not assign anchor and viewport elements by id", async () => {
        const { element, connect, disconnect } = await setup();
        const region: FASTAnchoredRegion = element.querySelector("fast-anchored-region") as FASTAnchoredRegion;

        await connect();
        await DOM.nextUpdate();

        expect(region.anchorElement?.id).to.equal("anchor");
        expect(region.viewportElement?.id).to.equal("viewport");

        await disconnect();
    });

    it("should be sized to match content by default", async () => {
        const { element, connect, disconnect } = await setup();
        const region: FASTAnchoredRegion = element.querySelector("fast-anchored-region") as FASTAnchoredRegion;
        const contents: HTMLElement = element.querySelector("#contents") as HTMLElement;

        await connect();
        await DOM.nextUpdate();

        expect(region.clientHeight).to.equal(contents.clientHeight);
        expect(region.clientWidth).to.equal(contents.clientWidth);

        await disconnect();
    });

    it("should be sized to match anchor when specified by scaling mode", async () => {
        const { element, connect, disconnect } = await setup();
        const region: FASTAnchoredRegion = element.querySelector("fast-anchored-region") as FASTAnchoredRegion;
        const anchor: HTMLElement = element.querySelector("#anchor") as HTMLElement;

        region.horizontalScaling="anchor";
        region.verticalScaling="anchor";

        await connect();
        await DOM.nextUpdate();

        expect(region.clientHeight).to.equal(anchor.clientHeight);
        expect(region.clientHeight).to.equal(anchor.clientHeight);
        expect(region.clientWidth).to.equal(anchor.clientWidth);

        await disconnect();
    });

    it("should be sized to match available space when specified by scaling mode", async () => {
        const { element, connect, disconnect } = await setup();
        const region: FASTAnchoredRegion = element.querySelector("fast-anchored-region") as FASTAnchoredRegion;

        region.horizontalScaling="fill";
        region.verticalScaling="fill";

        await connect();
        await DOM.nextUpdate();

        expect(region.clientHeight).to.equal(element.clientHeight);
        expect(region.clientWidth).to.equal(element.clientWidth);

        await disconnect();
    });
});
