import clsx from 'clsx';
import * as React from 'react';
import GridLayout from 'react-grid-layout';
import { TileBuilderProperties, TileProperties, TileSize, TileVisualization } from './models';
import { TileContainer, TileContainerProps } from './tileContainer';
import produce from 'immer';
import Tiles from './tiles';
import * as style from '.tileBuilder.module.scss';
import { Keys } from 'keyboardKeys';

interface State {
    actionsexpanded: number;
}

// TODO: Create Functional Component with Hooks
export class TileBuilder extends React.Component<TileBuilderProperties, State> {

    private tileBuilderConfiguration: ReactGridLayout.ReactGridLayoutProps;

    private gridLayoutContentRef: React.RefObject<ReactGridLayout> = React.createRef();
    private onLayoutChange = (newLayout: ReactGridLayout.Layout[]): void => {
        // create the reduced layout to give back to the consumer to be able to save it without any changes 
        const newTiles: TileProperties[] = produce(this.props.tiles, (draft: TileProperties[]) => {
            for (let idx = 0; idx < newLayout.length; idx++) {
                const tile = newLayout[idx];
                draft[idx].layout = {
                    i: tile.i,
                    x: tile.x || 0,
                    y: tile.y || 0,
                    h: tile.h || 1,
                    w: tile.w || 1,
                    minW: tile.minW || 1,
                    minH: tile.minH || 1,
                    maxW: tile.maxW || Infinity,
                    maxH: tile.maxH || Infinity
                };
            }
        });

        if (this.props.onChange) {
            this.props.onChange(newTiles);
        }
    }

    private onClickHandler = (e: React.SyntheticEvent) => {
        if (!!e && !!e.target) {
            const target = (e.target as HTMLSpanElement).attributes['data-key'];
            if (target) {
                e.stopPropagation();
                this.setState({ actionsexpanded: target.value });
            } else {
                this.setState({ actionsexpanded: -1 });
            }
        }
    }

    private selectSize = (size: TileSize, id) => {
        const newTiles: TileProperties[] = produce(this.props.tiles, (draft: TileProperties[]) => {
            const tileDraft = draft[id];
            tileDraft.layout.h = size.h;
            tileDraft.layout.w = size.w;
        });

        if (this.props.onChange) {
            this.props.onChange(newTiles);
        }
    }

    private onTileMove = (direction: Keys, id: number) => {
        const newTiles: TileProperties[] = produce(this.props.tiles, (draft: TileProperties[]) => {
            const tileDraft = draft[id];
            switch (direction) {
                case Keys.ArrowDown:
                    ++tileDraft.layout.y;
                    break;
                case Keys.ArrowRight:
                    ++tileDraft.layout.x;
                    break;
                case Keys.ArrowUp:
                    // avoid to go below the x = 0
                    tileDraft.layout.y = Math.max(0, tileDraft.layout.y - 1);
                    break;
                case Keys.ArrowLeft:
                    tileDraft.layout.x = Math.max(0, tileDraft.layout.x - 1);
                    break;
            }
        });

        if (this.props.onChange) {
            this.props.onChange(newTiles);
        }
    }

    constructor(props: TileBuilderProperties) {
        super(props);
        // get the injected props;
        const { configuration: injectedConfig, configuration: { editable, cols, defaultTileDimension, containerPadding, className, disabled } } = this.props;

        // set the default state
        this.state = {
            actionsexpanded: -1
        };
        // create the default props
        const padding = containerPadding || 20;
        const defaultConfiguration = {
            className: undefined,
            cols: 12,
            rowHeight: 200,
            width: 2520,
            margin: [padding, padding],
            containerPadding: [padding, padding],
            onResizeStart: undefined,
            onResize: undefined,
            onResizeStop: undefined,
            onDragStart: undefined,
            onDrag: undefined,
            onDragStop: undefined,
            isDraggable: true,
            isResizable: true,
            preventCollision: false,
            compactType: 'vertical',
            useCSSTransforms: true,
        };

        // set the width of TileBuilder based on the cols * defaultTileDimension + margin
        const width = cols * defaultTileDimension + ((cols + 1) * padding);
        const configuration: Partial<ReactGridLayout.ReactGridLayoutProps> = {
            isDraggable: editable && !disabled,
            isResizable: editable && !disabled,
            width,
            rowHeight: defaultTileDimension,
            onLayoutChange: this.onLayoutChange,
            className
        };
        this.tileBuilderConfiguration = Object.assign({}, defaultConfiguration, injectedConfig, configuration);
    }

    render() {
        const {
            tiles: tileProps,
            tileStates,
            render,
            onTileDelete,
            onTileEdit,
            onSelectVisualization,
            configuration: {
                editable,
                className,
                disabled
            }
        } = this.props;

        // React Grid Layout prop
        let layout: ReactGridLayout.Layout[] = [];

        // Tile Properties
        const tilesElement: JSX.Element[] = [];

        for (let tileId = 0; tileId < tileProps.length; tileId++) {
            const tileProperties = tileProps[tileId];
            const tileState = tileStates && tileStates[tileId];

            // needed to preserve the layout of all the tiles and pass to the GridLayout as first level property
            // support the case where the dashboard is generated automatically
            // device first scenario and import DCM creating a default dashboard

            let tileLayout: ReactGridLayout.Layout = fallBackLayout(tileId);
            if (tileProperties.layout && tileProperties.layout.w) {
                tileLayout = tileProperties.layout;
            }
            // adding the tile id = index at this level because we are not saving the index as tile id, 
            // we are relying on the index of the array of tile 
            // the onLayoutChange function won't be affected by the id management
            layout.push({ ...tileLayout, i: tileId.toString() });

            const isTileConfigurable = !!Tiles[tileProperties.type] && !!Tiles[tileProperties.type].panelConfiguration;

            const props: TileContainerProps = {
                key: tileId,
                id: tileId,
                selectSize: this.selectSize,
                actionsexpanded: this.state.actionsexpanded === tileId,
                actionexplandedhandler: this.onClickHandler,
                props: tileProperties,
                state: tileState,
                render,
                editable,
                isTileConfigurable,
                availableSize: tileProperties.availableSize,
                onTileDelete,
                onTileEdit,
                onTileMove: this.onTileMove,
                onSelectVisualization,
                availableVisualization: getAvailableVisualization(tileProperties),
                disabled
            };
            tilesElement.push(<TileContainer {...props} />);
        }

        return (
            <div className={clsx(style['tile-builder'], style['grid-layout-container'], className)} onClick={this.onClickHandler} >
                <GridLayout ref={this.gridLayoutContentRef} {...this.tileBuilderConfiguration} className={clsx('grid-layout-content', className)} layout={layout}>
                    {tilesElement}
                </GridLayout>
            </div>
        );
    }
}

const fallBackLayout = (i): ReactGridLayout.Layout => {
    return {
        i,
        x: 0,
        y: 0,
        h: 1,
        w: 1
    };
};

export function getAvailableVisualization({}: TileProperties): TileVisualization[] {
    const availableViz: TileVisualization[] = [];
    // TODO: add logic
    return availableViz;
}