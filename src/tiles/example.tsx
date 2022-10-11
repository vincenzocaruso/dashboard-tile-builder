import * as React from 'react';
import { ConfigurationProperties, RenderProperties, TileProperties, TileSize, BaseTile } from '../models';
import clsx from 'clsx';
import * as style from './example.module.scss';
import { TileMenuItemProps } from 'models';


export interface RenderState {
    // render state to render the tile
    content: {
        value: number;
    };
}

function getDefaultConfiguration(): Partial<TileProperties> {
    return {
        title: ''
    };
}

const panelConfiguration: React.ComponentType<ConfigurationProperties<TileProperties>> = React.memo(function PanelConfiguration() {
    return null;
});

function getTileActions(): TileMenuItemProps[] {
    return [{
        icon: 'devices2',
        label: 'action 1',
        onClick: () => { alert('action 1'); }
    }, {
        icon: 'wifi',
        label: 'action 2',
        onClick: () => { alert('action 2'); }
    }, {
        icon: 'internetSharing',
        label: 'action 3',
        disabled: true,
        onClick: () => { alert('action 3'); }
    }];
}

function getAvailableSizes(): TileSize[] {
    return [{ h: 2, w: 2 }];
}

const render: React.ComponentType<RenderProperties<TileProperties>> = React.memo(function Render({ props }): React.ReactElement {
    return <div className={clsx(style.content)}>
        {props.title}
    </div>;
});


const example: BaseTile<TileProperties> = {
    getDefaultConfiguration,
    panelConfiguration,
    getTileActions,
    getAvailableSizes,
    render
};

export default example;