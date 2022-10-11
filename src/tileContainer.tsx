import clsx from 'clsx';
import { Keys } from 'keyboardKeys';
import * as React from 'react';
import { useInView } from 'react-intersection-observer';
import { TileMenuControl } from 'tileMenuControl';
import { TileMenuItemProps, TileProperties, TileSize, TileState, TileVisualization } from './models';
import * as style from './tileBuilder.module.scss';

const SizesPopupMenuWidth = 75;
const VizualizationPopupMenuWidth = 150;

export interface TileContainerProps {
    id: number;
    key: number;
    availableSize?: TileSize[];
    selectSize?: (size: TileSize, id) => void;
    actionsexpanded?: boolean;
    actionexplandedhandler?: React.EventHandler<any>;
    onTileMove: (direction: Keys, index: number) => void;
    onTileEdit: (index: number) => void;
    onTileDelete: (index: number) => void;
    onSelectVisualization?: (viz: string, id) => void;
    availableVisualization?: TileVisualization[];
    isTileConfigurable?: boolean;
    props: TileProperties;
    state: TileState;
    render: (tileProps: TileProperties, tileState: any, isEditable: boolean) => React.ReactNode;
    className?: string;
    editable?: boolean;
    children?: React.ReactNode;
    disabled?: boolean;
}

export const TileContainer = React.memo((tileProperties: TileContainerProps) => {
    const [focus, setFocus] = React.useState(false);
    const { ref, inView } = useInView({
        threshold: 0,
    });
    const {
        id,
        key,
        props,
        state,
        children,
        className,
        availableSize,
        selectSize,
        actionexplandedhandler,
        actionsexpanded,
        render,
        editable,
        isTileConfigurable,
        onTileDelete,
        onTileEdit,
        onTileMove,
        availableVisualization,
        onSelectVisualization,
        disabled,
        ...gridItemProps
    } = tileProperties;

    const isEditShown = props.config && isTileConfigurable;

    const builderActionRef: React.RefObject<HTMLDivElement> = React.createRef();

    const handleFocus = React.useCallback(() => { setFocus(true); }, []);

    const handleBlur: any = React.useCallback((e) => {
        if (builderActionRef.current && !builderActionRef.current.contains(e.relatedTarget as Node)) {
            setFocus(false);
        }
    }, [builderActionRef]);


    return <div
        ref={ref}
        {...gridItemProps}
        className={clsx(className, { expanded: actionsexpanded }, { focused: focus })}
        tabIndex={editable ? 1 : undefined}
        onFocus={handleFocus}
        onBlur={handleBlur}
        aria-roledescription={editable? 'editable tile' : 'tile'}
    >
        {inView && editable && <BuilderActionItem
            ref={builderActionRef}
            index={id}
            availableSize={availableSize}
            onSelectSize={selectSize}
            onTileEdit={isEditShown && onTileEdit}
            onTileDelete={onTileDelete}
            availableVisualization={availableVisualization}
            onSelectVisualization={onSelectVisualization}
            disabled={disabled}
        />}
        {inView && <div key='tile-container' className={clsx(style['tile-container'])}>
            {render(props, state, editable)}
            {children}
        </div>}
        <span key={'extra-padding-right'} className={clsx(style['extra-padding-right'])}></span>
        <span key={'extra-padding-bottom'} className={clsx(style['extra-padding-bottom'])}></span>
    </div >;
});

interface BuilderActionItemProps {
    index: number;
    onTileEdit: (index: number) => void;
    onTileDelete: (index: number) => void;
    availableSize: TileSize[];
    onSelectSize: (size: TileSize, id) => void;
    availableVisualization?: TileVisualization[];
    onSelectVisualization?: (visualization: string, id) => void;
    disabled: boolean;
}

const BuilderActionItem = React.forwardRef((props: BuilderActionItemProps, ref) => {
    const { index, availableSize, onTileDelete, onTileEdit, onSelectSize, onSelectVisualization, availableVisualization, disabled } = props;

    const { sizesList, sizesMap } = React.useMemo<{ sizesList: any[], sizesMap: Map<string, TileSize> }>(() => {
        const sizesMap = new Map<string, TileSize>();
        const sizesList = availableSize
            ? availableSize.map((x: TileSize) => {
                const value = `${x.w}:${x.h}`;
                sizesMap.set(value, x);

                return {
                    value,
                    displayName: `${x.w} x ${x.h}`,
                    title: `${x.w} x ${x.h}`
                };
            })
            : [];

        return { sizesList, sizesMap };
    }, [availableSize]);

    const vizListProps = React.useMemo<any[]>(() => availableVisualization
        ? availableVisualization.map(({ value, displayName }) => ({
            value,
            displayName,
            title: displayName
        }))
        : []
        , [availableVisualization]);

    const handleSelectSize = React.useCallback((sizeValue: string) => {
        if (onSelectSize) {
            onSelectSize(sizesMap.get(sizeValue), index);
        }
    }, [index, onSelectSize, sizesMap]);

    const handleSelectVizualization = React.useCallback((viz: string) => {
        if (onSelectVisualization) {
            onSelectVisualization(viz, index);
        }
    }, [index, onSelectVisualization]);

    const menuItems: TileMenuItemProps[] = React.useMemo(() => {
        const items: TileMenuItemProps[] = [];

        if (onTileEdit) {
            items.push({
                type: 'button',
                key: 'edit',
                icon: 'settings',
                onClick: () => onTileEdit(index),
                title: 'Configure',
                disabled: disabled
            });
        }

        if (onTileDelete) {
            items.push({
                type: 'button',
                key: 'delete',
                icon: 'chromeClose',
                onClick: () => onTileDelete(index),
                title: 'Delete',
                disabled: disabled
            });
        }

        if (sizesList && sizesList.length) {
            items.unshift({
                id: `availableSize${index}`,
                key: `availableSize${index}`,
                type: 'inlinePopup',
                icon: 'resizeMouseMediumMirrored',
                title: 'AvailableSize',
                panelList: sizesList,
                onItemSelect: handleSelectSize,
                panelWidth: SizesPopupMenuWidth,
                disabled: disabled
            });
        }
        if (availableVisualization && availableVisualization.length) {
            items.unshift({
                id: `changeViz${index}`,
                key: `changeViz${index}`,
                type: 'inlinePopup',
                icon: 'design',
                title: 'ChangeVisualization',
                panelList: vizListProps,
                onItemSelect: handleSelectVizualization,
                panelWidth: VizualizationPopupMenuWidth,
                disabled: disabled
            });
        }

        return items;
    }, [onTileEdit, onTileDelete, sizesList, availableVisualization, disabled, index, handleSelectSize, vizListProps, handleSelectVizualization]);

    return <TileMenuControl ref={ref} className={clsx(style['action-bar'])} items={menuItems} />;
});
