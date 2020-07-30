import { attr, observable, DOM } from "@microsoft/fast-element";
import { Tabs } from "../tabs";
import {
    keyCodeSpace,
    keyCodeEnter,
    wrapInBounds,
    limit,
    KeyCodes,
} from "@microsoft/fast-web-utilities";
import { applyMixins } from "../utilities";
import { ARIAGlobalStatesAndProperties } from "../patterns";

/**
 * An Carousel Custom HTML Element.
 * Implements the {@link https://www.w3.org/TR/wai-aria-1.1/#carousel | ARIA carousel }.
 *
 * @public
 */
export class Carousel extends Tabs {
    /**
     * Determines if the element should start rotation or not on page load.
     * @public
     * @defaultValue - true
     * @remarks
     * HTML Attribute: autoplay
     */
    @attr({ mode: "fromView" })
    public autoplay: boolean = true;

    /**
     * Determines if the element should loop slides or not.
     * @public
     * @defaultValue - true
     * @remarks
     * HTML Attribute: loop
     */
    @attr({ mode: "fromView" })
    public loop: boolean = true;

    /**
     * The state of the slides rotating or not.
     * @public
     * @defaultValue - false
     * @remarks
     * HTML Attribute: paused
     */
    @attr({ mode: "boolean" })
    public paused: boolean = false;
    private pausedChanged(): void {
        if (!this.paused) {
            this.focused = false;
            this.notabfocus = true;
            this.startAutoPlay();
        } else {
            this.notabfocus = false;
            this.stopAutoPlay();
        }
        if (this.change) {
            this.change();
        }
    }

    /**
     * Determines if the pattern being used is the basic or tabbed pattern per ARIA spec. Tabbed pattern is the default used.
     * See {@link https://w3c.github.io/aria-practices/#wai-aria-roles-states-and-properties-4} for more details.
     * @public
     * @defaultValue - false
     * @remarks
     * HTML Attribute: basic-pattern
     */
    @attr({ attribute: "basic-pattern", mode: "boolean" })
    public basicPattern: boolean = false;

    /**
     * Determines the interval for autoplay in miliseconds.
     * @public
     * @defaultValue - 6000
     * @remarks
     * HTML Attribute: autoplay-interval
     */
    @attr({ attribute: "autoplay-interval" })
    public autoplayInterval: number = 6000;

    /**
     * The id of the active slide.
     * @public
     * @remarks
     * HTML Attribute: active-slide-id
     */
    @attr({ attribute: "active-slide-id" })
    public activeSlideId: string;
    private activeSlideIdChanged(): void {
        this.activeSlideIndex = this.slideIds.indexOf(this.activeSlideId);
    }

    /**
     * The id of the element labeling the carousel.
     * @public
     * @remarks
     * HTML Attribute: aria-labelledby
     */
    @attr({ attribute: "aria-labelledby" })
    public arialabelledby: string;

    /**
     * The label surfaced to assistive technologies.
     *
     * @public
     * @remarks
     * HTML Attribute: aria-label
     */
    @attr({ attribute: "aria-label" })
    public arialabel: string;

    /**
     * The aria-label to be passed to the next button
     *
     * @public
     * @defaultValue - next slide
     * @remarks
     * HTML Attribute: next-button-aria-label
     */
    @attr({ attribute: "next-button-aria-label", mode: "fromView" })
    public nextButtonAriaLabel: string = "next slide";

    /**
     * The aria-label to be passed to the previous button
     *
     * @public
     * @defaultValue - previous slide
     * @remarks
     * HTML Attribute: previous-button-aria-label
     */
    @attr({ attribute: "previous-button-aria-label", mode: "fromView" })
    public previousButtonAriaLabel: string = "previous slide;";

    /**
     * Whether or not to focus the tab on change
     * @public
     * @remarks
     * HTML Attribute: notabfocus
     */
    @observable
    public notabfocus: boolean = true;

    /**
     * @internal
     */
    @observable
    public focused: boolean = false;
    private focusedChanged() {
        this.notabfocus = !this.focused;
    }

    /**
     * @internal
     */
    public setComponent(): void {
        this.activeid = this.tabIds[this.activeTabIndex] as string;
        this.change();
        this.setTabs();
        this.handleActiveIndicatorPosition();
        this.setTabPanels();
        if (!this.notabfocus) {
            this.focusTab();
        }
        this.change();
    }

    /**
     * @internal
     */
    public activeindicator = false;

    /**
     * @internal
     */
    @observable
    public activeSlideIndex: number = 0;

    /**
     * @internal
     */
    public basicContent: HTMLDivElement;
    /**
     * @internal
     */
    public previousFlipperDefault: HTMLElement;

    /**
     * @internal
     */
    public previousFlipperSlottedItem: HTMLElement[];

    /**
     * @internal
     */
    public nextFlipperDefault: HTMLElement;

    /**
     * @internal
     */
    public nextFlipperSlottedItem: HTMLElement[];

    /**
     * @internal
     */
    public rotationControlDefault: HTMLElement;

    /**
     * @internal
     */
    public rotationControlContainer: HTMLElement;

    /**
     * @internal
     */
    public rotationControlItem: HTMLElement[];

    /**
     * @internal
     */
    public tablistRef: HTMLElement;

    /**
     * @internal
     */
    public tabPanelsContainerRef: HTMLElement;

    /**
     * @internal
     */
    @observable
    public items: HTMLElement[];
    private itemsChanged(): void {
        if (this.items.length && this.basicPattern) {
            this.generateSlideIds();

            // if activeSlideId attribute was set by implementation then we need to sync the activeSlideIndex for incrementing to work
            if (this.activeSlideId) {
                this.activeSlideIndex = this.slideIds.indexOf(this.activeSlideId);
            } else {
                this.activeSlideId = this.slideIds[this.activeSlideIndex] as string;
            }

            this.items.forEach((item: HTMLElement, index: number) => {
                if (index === this.activeSlideIndex) {
                    item.classList.add("active-slide");
                    item.removeAttribute("hidden");
                } else {
                    item.setAttribute("hidden", "");
                }
                if (
                    !item.getAttribute("aria-label") ||
                    !item.getAttribute("aria-labelledby")
                ) {
                    item.setAttribute(
                        "aria-label",
                        `${index + 1} of ${this.items.length}`
                    );
                }

                if (!item.getAttribute("id")) {
                    item.setAttribute("id", `slide-${index + 1}`);
                }

                item.classList.add("slide");
                // per ARIA spec role=group and roledescription=slide must be on the slide container for basicPattern (not tabbed) implementation
                item.setAttribute("role", "group");
                item.setAttribute("aria-roledescription", "slide");

                return item;
            });
        }
    }

    public handleFlipperClick(direction: 1 | -1, e: Event): void {
        this.incrementSlide(direction);
    }

    public handleFlipperKeypress = (direction: 1 | -1, e: KeyboardEvent): void => {
        switch (e.keyCode) {
            case keyCodeSpace:
                if (
                    e.target !== this.nextFlipperDefault &&
                    e.target !== this.previousFlipperDefault
                ) {
                    break;
                }
            case keyCodeEnter:
                this.paused = true;
                this.incrementSlide(direction);
                break;
        }
    };

    public handleDefaultFlipperKeypress = (direction: 1 | -1, e: KeyboardEvent): void => {
        switch (e.keyCode) {
            case keyCodeSpace:
                this.paused = true;
                this.incrementSlide(direction);
                break;
        }
    };

    /**
     * @internal
     */
    public change = (): void => {
        // reference to carousel is passed for the author to get access to the paused, activeSlideId, and other states.
        this.$emit("change", this);
    };

    /**
     * @internal
     */
    public adjust(adjustment: number): void {
        this.prevActiveTabIndex = this.activeTabIndex;
        if (this.loop) {
            this.activeTabIndex = wrapInBounds(
                0,
                this.tabs.length - 1,
                this.activeTabIndex + adjustment
            );
        } else {
            this.activeTabIndex = limit(
                0,
                this.tabs.length - 1,
                this.activeTabIndex + adjustment
            );
        }
        this.setComponent();
    }

    private slideIds: string[] = [];
    private autoplayTimer: number | void;
    private pausedTimeout: number | void;
    private firstFocus: boolean = true;
    private startTime: number = 0;
    private stopTime: number = 0;

    private incrementSlide = (direction: 1 | -1): void => {
        const tempLength: number = this.basicPattern
            ? this.items.length
            : this.tabs.length;
        const tempIndex: number = this.basicPattern
            ? this.activeSlideIndex
            : this.activeTabIndex;
        this.focused = false;
        let adjustment: number = 0;

        if (this.basicPattern) {
            if (this.loop) {
                adjustment = wrapInBounds(0, tempLength - 1, tempIndex + direction);
            } else {
                adjustment = limit(0, tempLength - 1, tempIndex + direction);
            }
            this.activeSlideId = this.slideIds[adjustment];
            this.itemsChanged();
        } else {
            this.adjust(direction);
            this.focused = true;
        }

        this.change();
    };

    private autoplayNextItem = (): void => {
        this.startTime = Date.now();
        this.incrementSlide(1);
    };

    private generateSlideIds(): void {
        this.slideIds = [];
        this.slideIds = this.items.map((item: HTMLElement, index: number) => {
            return item.getAttribute("id")
                ? (item.getAttribute("id") as string)
                : `slide-${index + 1}`;
        });
    }

    private togglePlay(): void {
        this.paused = !this.paused;
    }

    private startAutoPlay(): void {
        if (!this.paused) {
            this.stopAutoPlay();
            this.startTime = Date.now();
            this.autoplayTimer = window.setInterval(
                this.autoplayNextItem,
                this.autoplayInterval
            );
        }
    }

    private stopAutoPlay(): void {
        this.autoplayTimer = window.clearInterval(this.autoplayTimer as number);
    }

    private handleRotationMouseDown = (e: Event): void => {
        this.firstFocus = false;
        this.togglePlay();
    };

    public handleRotationKeyDown = (e: KeyboardEvent) => {
        switch (e.keyCode) {
            case keyCodeEnter:
            case keyCodeSpace:
                this.handleRotationMouseDown(e);
                break;
        }
    };

    private handleFocusIn = (e: FocusEvent): void => {
        // per ARIA spec we need to stop rotation whenever keyboard focus is brought to the carousel,
        // unless the user specifically requests it to start again.
        // If firstFocus is true then we are focusing in with the keyboard
        // and not the mousedown fired off of the rotation control so we can still pause.
        // This prevents toggle being fired twice if the rotation control click event is also
        // the first focus event on the carousel
        if (this.firstFocus) {
            if (this.autoplay) {
                this.paused = true;
            }
            this.firstFocus = false;
        }
    };

    private handleMouseOver = () => {
        if (!this.paused) {
            this.stopTime = Date.now();
            window.clearTimeout(this.pausedTimeout as number);
            this.stopAutoPlay();
        }
    };

    private handleMouseLeave = () => {
        if (!this.paused) {
            // timer for proper pause of rotation
            const timeDiff: number =
                this.autoplayInterval - (this.stopTime - this.startTime);
            if (timeDiff) {
                window.clearTimeout(this.pausedTimeout as number);
                window.clearInterval(this.autoplayTimer as number);
                this.pausedTimeout = setTimeout(() => {
                    this.autoplayNextItem();
                    this.startAutoPlay();
                }, timeDiff);
            }
        }
        this.focused = false;
    };

    public handleTabsKeypress = (e: KeyboardEvent): void => {
        // pause the carousel if the right, left, home, end keys are pressed in the case
        // of when autoplay has been restarted by the user and the focus is on the tabs
        switch (e.keyCode) {
            case KeyCodes.arrowLeft:
            case KeyCodes.arrowRight:
            case KeyCodes.home:
            case KeyCodes.end:
                this.paused = true;
                break;
        }
    };

    private handleTabsFocusIn = (e: FocusEvent): void => {
        this.focused = true;
        if (this.firstFocus) {
            this.paused = true;
        }
        this.firstFocus = false;
        e.stopPropagation();
    };

    private handleTabsFocusOut = (e: FocusEvent): void => {
        // if we focus out of tabs or any tabs children we need to ensure tabs doesn't steal focus
        this.focused = false;
        // if we focus outside of the carousel then first focus needs to be reset
        if (
            !this.contains(e.relatedTarget as Node) &&
            (e.relatedTarget as HTMLElement) !== this.rotationControlDefault
        ) {
            this.firstFocus = true;
        }
    };

    /**
     * @internal
     */
    public connectedCallback(): void {
        super.connectedCallback();
        if (this.autoplay) {
            this.startAutoPlay();
        } else {
            this.paused = true;
        }

        // per ARIA autoplay must pause when mouse is hovering over the carousel
        this.addEventListener("mouseover", this.handleMouseOver);
        this.addEventListener("mouseleave", this.handleMouseLeave);

        // per ARIA rotation must stop when keyboard focus enters the carousel
        // and not restart unless the user explicitly requests it to.
        this.addEventListener("focusin", this.handleFocusIn);

        // using mousedown as this fires before focusin so we can account for the
        // first click on the rotation control and the focus immediately following click.
        // This also requires the use of keydown since click is not used
        this.rotationControlContainer.addEventListener(
            "mousedown",
            this.handleRotationMouseDown
        );

        if (!this.basicPattern) {
            this.tablistRef.addEventListener("focusin", this.handleTabsFocusIn);
            this.tablistRef.addEventListener("focusout", this.handleTabsFocusOut);

            this.tabPanelsContainerRef.addEventListener("focusin", this.handleMouseOver);
            this.tabPanelsContainerRef.addEventListener(
                "focusout",
                this.handleMouseLeave
            );

            if (
                this.previousFlipperSlottedItem.length &&
                this.nextFlipperSlottedItem.length
            ) {
                // when tabbed the next and previous buttons should not be in the tab sequence
                DOM.queueUpdate(() => {
                    this.previousFlipperSlottedItem[0].setAttribute("tabindex", "-1");
                    this.nextFlipperSlottedItem[0].setAttribute("tabindex", "-1");
                });
            }
        } else {
            this.basicContent.addEventListener("focusin", this.handleMouseOver);
            this.basicContent.addEventListener("focusout", this.handleMouseLeave);
        }
    }

    /**
     * @internal
     */
    public disconnectedCallback(): void {
        super.disconnectedCallback();
        this.stopAutoPlay();
    }
}

export interface Carousel extends ARIAGlobalStatesAndProperties {}
applyMixins(Carousel, ARIAGlobalStatesAndProperties);
