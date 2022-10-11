import * as React from 'react';

export interface TileBuilderConfiguration {
    className: string | undefined;
    cols: number;
    defaultTileDimension: number;
    editable: boolean;
    containerPadding?: number;
    disabled?: boolean;
}

export type TileState = any;

export interface TileProperties {
    type: string;
    config: any;
    layout: {
        i: string;
        x: number;
        y: number;
        h: number;
        w: number;
        minW?: number;
        maxW?: number;
        minH?: number;
        maxH?: number;
    };
    id?: string;
    title?: string;
    dataSources?: any[];
    isExpanded?: boolean;
    actionexplandedhandler?: (e: React.SyntheticEvent<Element, Event>) => void;
    availableSize?: TileSize[];
}

// TODO: add documentation
export interface TileBuilderProperties {
    tiles: TileProperties[];
    tileStates?: TileState[];
    configuration: TileBuilderConfiguration;
    render: (tileProps: TileProperties, tileState: TileState, isEditable: boolean) => React.ReactNode;
    onChange?: (tiles: TileProperties[]) => any;
    onTileEdit?: (index: number) => void;
    onTileDelete?: (index: number) => void;
    onSelectVisualization?: (visualization: string, index: number) => void;
}

export interface TileSize { h: number; w: number; }
export interface TileSizeLimits { minH?: number; maxH?: number; minW?: number; maxW?: number; }
export interface TileVisualization { value: string; displayName: string; }

export interface ConfigurationProperties<T> {
    isDashboardDirty: boolean;
    onApply: (tile: TileProperties, actions: () => {}) => void;
    onClose: () => void;
    config: T;
    context?: any;
}

export interface RenderProperties<T> {
    props: T;
    state: TileState;
    isEditable: boolean;
}


export interface BaseTile<T> {
    /**
    * @param props: TileProperties,
    * @param state: TileState,
    * @param isEditable: boolean
    * returns the React Element to render
    */
    render: React.ComponentType<RenderProperties<T>>;
    /**
    *  @param isDashboardDirty: boolean,
    *  @param onApply: (tile: TileProperties, actions: FormikActions<TileProperties>) => void,
    *  @param onClose: () => void,
    *  @param config: any,
    *  @param context: any
    * get the fields needed to create the configuration panel for a tile
    */
    panelConfiguration?: React.ComponentType<ConfigurationProperties<T>>;
    /**
     * get the default properties needed to render a tile
     * @param datasource: any[],
     */
    getDefaultConfiguration: (datasource?: any[]) => Partial<TileProperties>;
    /**
     * @param tileType: string
     * @param props: TileProperties,
     * based on the tile properties return if the tile is available to be rendered and get the label 
     */
    isTileAvailable?: (tileType: string, props: TileProperties) => string | undefined;
    /**
     * it return a list of actions to render based on the context
     */
    getTileActions?: () => TileMenuItemProps[];
    /**
     * returns the available sizes of a specific tile
     */
    getAvailableSizes?: () => TileSize[];
    /**
     * returns the default size of a specific tile
     */
    getDefaultSize?: () => Partial<ReactGridLayout.Layout>;
    /**
     * returns the size limits for a specific tile
     */
    getSizeLimits?: () => TileSizeLimits;
}


export interface TileMenuItemProps { }