/** @jsx h */ /* Note: Set the JSX pragma to the wrapped version of createElement */
import h from "@microsoft/site-utilities/dist/web-components/pragma";
import React from "react";
import {
    fastToolingColorPicker,
    fastToolingCSSLayout,
} from "@microsoft/fast-tooling/dist/esm/web-components";
import {
    fastButton,
    fastSelect,
    fastSlider,
    fastSliderLabel,
    fastSwitch,
    fastTab,
    fastTabPanel,
    fastTabs,
    fastTextField,
} from "@microsoft/fast-components";
import { fastToolingHTMLRenderLayerInlineEdit } from "@microsoft/fast-tooling/dist/esm/web-components/html-render-layer-inline-edit/html-render-layer-inline-edit";
import { fastToolingHTMLRender } from "@microsoft/fast-tooling/dist/esm/web-components/html-render";
import { fastToolingHTMLRenderLayerNavigation } from "@microsoft/fast-tooling/dist/esm/web-components/html-render-layer-navigation";
import { Select } from "@microsoft/fast-foundation";
import { componentCategories, downChevron, upChevron } from "@microsoft/site-utilities";
import { MessageSystem } from "@microsoft/fast-tooling";
import {
    ControlConfig,
    ModularForm,
    StandardControlPlugin,
} from "@microsoft/fast-tooling-react";

import CSSControl from "@microsoft/fast-tooling-react/dist/form/custom-controls/control.css";
import { CSSPropertiesDictionary } from "@microsoft/fast-tooling/dist/esm/data-utilities/mapping.mdn-data";
import { ControlContext } from "@microsoft/fast-tooling-react/dist/form/templates/types";
import { XOR } from "@microsoft/fast-tooling/dist/dts/data-utilities/type.utilities";
import { CSSStandardControlPlugin } from "@microsoft/fast-tooling-react/dist/form/custom-controls/css";
import { cssLayoutCssProperties } from "@microsoft/fast-tooling/dist/esm/web-components/css-layout";
import { CSSControlConfig } from "@microsoft/fast-tooling-react/dist/form/custom-controls/css/css.template.control.standard.props";
import { DesignSystem } from "@microsoft/fast-foundation";
import { FormId } from "../creator.props";
import { properties as CSSProperties } from "../css-data";
import { defaultDevices, Device } from "./devices";

/**
 * Ensure tree-shaking doesn't remove these components from the bundle
 */
DesignSystem.getOrCreate().register(
    fastButton(),
    fastSelect(),
    fastSlider(),
    fastSliderLabel(),
    fastTabs(),
    fastTab(),
    fastSwitch(),
    fastTabPanel(),
    fastTextField(),
    fastToolingColorPicker({ prefix: "fast-tooling" }),
    fastToolingHTMLRender({ prefix: "fast-tooling" }),
    fastToolingHTMLRenderLayerNavigation({ prefix: "fast-tooling" }),
    fastToolingCSSLayout({ prefix: "fast-tooling" }),
    fastToolingHTMLRenderLayerInlineEdit({ prefix: "fast-tooling" })
);

export function renderDevToolToggle(selected: boolean, onToggleCallback: () => void) {
    return (
        <fast-button
            events={{
                click: (e: React.ChangeEvent) => {
                    onToggleCallback();
                },
            }}
            class={"dev-tools-trigger"}
        >
            {selected ? downChevron() : upChevron()}
        </fast-button>
    );
}

function renderDeviceOptions(): React.ReactNode {
    return defaultDevices.map((deviceOption: Device) => {
        return (
            <fast-option
                key={deviceOption.id}
                value={deviceOption.id}
                style={{ height: "auto" }}
            >
                {deviceOption.displayName}
            </fast-option>
        );
    });
}

export function renderDeviceSelect(
    selectedDeviceId: string,
    onChangeCallback: (deviceId: string) => void,
    disable: boolean
): React.ReactNode {
    return (
        <fast-select
            selectedIndex={selectedDeviceId}
            events={{
                change: (e: React.ChangeEvent): void => {
                    onChangeCallback((e.target as Select).value);
                },
            }}
            disabled={disable ? true : null}
        >
            {renderDeviceOptions()}
        </fast-select>
    );
}

function getColorPickerControl(
    id: string,
    updateHandler: (updatedData: { [key: string]: unknown }) => void
): StandardControlPlugin {
    return new StandardControlPlugin({
        id,
        context: ControlContext.fill,
        control: (config: ControlConfig): React.ReactNode => {
            return (
                <fast-tooling-color-picker
                    value={config.value || config.default}
                    events={{
                        change: (e: React.ChangeEvent<HTMLInputElement>): void => {
                            updateHandler({
                                [config.dataLocation]: e.target.value,
                            });
                        },
                    }}
                ></fast-tooling-color-picker>
            );
        },
    });
}

export function getColorPickerControls(
    updateHandler: (updatedData: { [key: string]: unknown }) => void
): StandardControlPlugin[] {
    return [
        getColorPickerControl("fill-color", updateHandler),
        getColorPickerControl("accent-base-color", updateHandler),
    ];
}

function getSliderLabels(positions: number[]): React.ReactNode {
    const positionLength = positions.length - 1;

    return positions.map((position: number, index: number) => {
        const displayNumber: XOR<void, number> =
            positions.length > 10 && index !== 0 && index !== positionLength
                ? undefined
                : position;
        return (
            <fast-slider-label key={position} position={position}>
                {displayNumber}
            </fast-slider-label>
        );
    });
}

function getSliderControl(
    id: string,
    updateHandler: (updatedData: { [key: string]: unknown }) => void,
    min: number,
    max: number,
    step: number = 1,
    defaultValue?: number
): StandardControlPlugin {
    return new StandardControlPlugin({
        id,
        context: ControlContext.fill,
        control: (config: ControlConfig): React.ReactNode => {
            const positions: number[] = new Array((max - min) / step + 1)
                .fill(0)
                .map((number: number, index: number): number => {
                    return min + step * index;
                });

            return (
                <fast-slider
                    value={config.value || defaultValue}
                    min={min}
                    max={max}
                    step={step}
                    events={{
                        change: (e: React.ChangeEvent<HTMLInputElement>): void => {
                            updateHandler({
                                [config.dataLocation]: parseFloat(e.target.value),
                            });
                        },
                    }}
                >
                    {getSliderLabels(positions)}
                </fast-slider>
            );
        },
    });
}

export function getSliderControls(
    updateHandler: (updatedData: { [key: string]: unknown }) => void
): StandardControlPlugin[] {
    return [
        getSliderControl("base-layer-luminance", updateHandler, 0, 1, 0.1, 1),
        getSliderControl("control-corner-radius", updateHandler, 0, 22, 1, 3),
        getSliderControl("stroke-width", updateHandler, 0, 12, 1, 1),
        getSliderControl("focus-stroke-width", updateHandler, 0, 12, 1, 2),
        getSliderControl("disabled-opacity", updateHandler, 0, 1, 0.1, 0.3),
    ];
}

function getCSSControls(): StandardControlPlugin {
    return new StandardControlPlugin({
        id: "style",
        context: ControlContext.fill,
        control: (controlConfig: ControlConfig): React.ReactNode => {
            return (
                <CSSControl
                    key={`${controlConfig.dictionaryId}::${controlConfig.dataLocation}`}
                    css={(CSSProperties as unknown) as CSSPropertiesDictionary}
                    cssControls={[
                        new CSSStandardControlPlugin({
                            id: "layout",
                            propertyNames: cssLayoutCssProperties,
                            control: (config: CSSControlConfig) => {
                                return (
                                    <CSSLayout
                                        key={`${controlConfig.dictionaryId}::${controlConfig.dataLocation}`}
                                        webComponentKey={`${controlConfig.dictionaryId}::${controlConfig.dataLocation}`}
                                        value={config.css}
                                        onChange={config.onChange}
                                    />
                                );
                            },
                        }),
                    ]}
                    {...controlConfig}
                />
            );
        },
    });
}

export function renderFormTabs(
    activeId: any,
    fastMessageSystem: MessageSystem,
    fastDesignMessageSystem: MessageSystem,
    linkedDataControl: StandardControlPlugin,
    handleFormVisibility: (formId: any) => void,
    handleDesignSystemChange: (updatedData: { [key: string]: unknown }) => void
): React.ReactNode {
    const formStyleOverride: string = `
        fast-tab-panel > div { width: 100%; }
    `;

    return (
        <fast-tabs
            activeId={activeId}
            events={{
                change: (e: React.ChangeEvent<HTMLElement>) => {
                    if ((e as any).detail) {
                        handleFormVisibility((e as any).detail.id);
                    }
                },
            }}
        >
            <fast-tab id={FormId.component}>Components</fast-tab>
            <fast-tab id={FormId.designSystem}>Design Tokens</fast-tab>
            <fast-tab-panel id={FormId.component + "Panel"}>
                <style>{formStyleOverride}</style>
                <ModularForm
                    key={FormId.component}
                    messageSystem={fastMessageSystem}
                    controls={[linkedDataControl, getCSSControls()]}
                    categories={componentCategories}
                />
            </fast-tab-panel>
            <fast-tab-panel id={FormId.designSystem + "Panel"}>
                <style>{formStyleOverride}</style>
                <ModularForm
                    key={FormId.designSystem}
                    messageSystem={fastDesignMessageSystem}
                    controls={[
                        linkedDataControl,
                        ...getSliderControls(handleDesignSystemChange),
                        ...getColorPickerControls(handleDesignSystemChange),
                        getCSSControls(),
                    ]}
                    categories={componentCategories}
                />
            </fast-tab-panel>
        </fast-tabs>
    );
}

export interface CSSLayoutProps {
    onChange: (config: { [key: string]: string }) => void;
    webComponentKey: string;
    value: { [key: string]: string };
}

export class CSSLayout extends React.Component<CSSLayoutProps, {}> {
    public layoutRef: React.RefObject<any>;

    private setLayoutRef = el => {
        this.layoutRef = el;

        if (this.layoutRef) {
            (this.layoutRef as any).onChange = e => {
                this.props.onChange(e);
            };
        }
    };

    render() {
        const newValue: string = Object.entries(this.props.value)
            .map(([key, value]: [string, string]) => {
                return `${key}: ${value};`;
            })
            .reduce((prevValue, currValue) => {
                return prevValue + " " + currValue;
            }, "");

        return (
            <fast-tooling-css-layout
                value={newValue}
                key={this.props.webComponentKey}
                ref={this.setLayoutRef}
            ></fast-tooling-css-layout>
        );
    }
}

export class HTMLRenderReact extends React.Component {
    public renderRef: React.RefObject<HTMLDivElement>;

    private setRenderRef = el => {
        this.renderRef = el;
    };

    render() {
        return (
            <fast-tooling-html-render ref={this.setRenderRef}>
                <fast-tooling-html-render-layer-navigation role="htmlrenderlayer"></fast-tooling-html-render-layer-navigation>
                <fast-tooling-html-render-layer-inline-edit role="htmlrenderlayer"></fast-tooling-html-render-layer-inline-edit>
            </fast-tooling-html-render>
        );
    }
}
