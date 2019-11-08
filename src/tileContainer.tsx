import { Implementation } from '@azure-iot/service-error';
import * as classnames from 'classnames/bind';
import * as React from 'react';
import InView from 'react-intersection-observer';
import { Keys } from 'shared/keyboardKeys';
import { ErrorBoundary } from '../errorBoundary';
import { useTranslation } from '../stores/i18n';
import { TabOrder } from '../tabOrder';
import { TileMenuControl, TileMenuItemProps, TileMenuItemType } from '../TileMenuControl';
import ErrorTile from '../tiles/errorTile';
import { TileProperties, TileSize, TileState, TileVisualization } from './models';
import { Authorization } from 'shared/stores';
import { EnumValue } from 'shared/form';

const cx = classnames.bind(require('./tileBuilder.module.scss'));

const isEdge = IS_CLIENT && !!(window as any).StyleMedia;
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
    const { t } = useTranslation();
    const [focus, setFocus] = React.useState(false);

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

    const keyDown = React.useCallback((ev: React.KeyboardEvent<HTMLElement>) => {
        // check if the key is ↔️ or ↕️
        if ([Keys.ArrowLeft, Keys.ArrowUp, Keys.ArrowRight, Keys.ArrowDown].includes(ev.keyCode) &&
            // move a tile only if the focus is on the tile.
            // this avoid to move the tile if you doing some resize
            ev.target['nodeName'] === 'SECTION') {
            onTileMove(ev.keyCode, id);
        }
    }, [id, onTileMove]);

    return <InView >
        {({ inView, ref }) => (
            <section
                ref={ref}
                {...gridItemProps}
                className={cx(className, { expanded: actionsexpanded }, { focused: focus })}
                tabIndex={editable ? TabOrder.KeyboardTabStop : undefined}
                onFocus={handleFocus}
                onBlur={handleBlur}
                onKeyDown={editable ? keyDown : undefined}
                aria-roledescription={editable && t('Core.MovableItemWithArrowKeys')}
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
                    {/* Disable tile content virtualization in Edge since EventSource polyfill can brick the browser */}
                    {(inView || isEdge) && <div key='tile-container' className={cx('tile-container')}>
                        <ErrorBoundary render={err => renderError(err, props)}>
                            {render(props, state, editable)}
                            {children}
                        </ErrorBoundary>
                    </div>}
                <span key={'extra-padding-right'} className={cx('extra-padding-right')}></span>
                <span key={'extra-padding-bottom'} className={cx('extra-padding-bottom')}></span>
            </section >
        )}
    </InView>;
});

interface BuilderActionItemProps {
    isPermitted?: Authorization.IsPermitted;
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
    const { t } = useTranslation();
    const { index, availableSize, onTileDelete, onTileEdit, onSelectSize, onSelectVisualization, availableVisualization, disabled } = props;

    const { sizesList, sizesMap } = React.useMemo<{ sizesList: EnumValue[], sizesMap: Map<string, TileSize>}>(() => {
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

            return {sizesList, sizesMap};
    }, [availableSize]);

    const vizListProps = React.useMemo<EnumValue[]>(() => availableVisualization
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
                type: TileMenuItemType.ActionTriggerButton,
                key: 'edit',
                icon: 'settings',
                onClick: () => onTileEdit(index),
                title: t('Core.Configure'),
                disabled: disabled
            });
        }

        if (onTileDelete) {
            items.push({
                type: TileMenuItemType.ActionTriggerButton,
                key: 'delete',
                icon: 'chromeClose',
                onClick: () => onTileDelete(index),
                title: t('Core.Delete'),
                disabled: disabled
            });
        }

        if (sizesList && sizesList.length) {
            items.unshift({
                id: `availableSize${index}`,
                key: `availableSize${index}`,
                type: TileMenuItemType.InlinePopup,
                icon: 'resizeMouseMediumMirrored',
                title: t('DeviceDefinitions.Dashboard.AvailableSize'),
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
                type: TileMenuItemType.InlinePopup,
                icon: 'design',
                title: t('Core.ChangeVisualization'),
                panelList: vizListProps,
                onItemSelect: handleSelectVizualization,
                panelWidth: VizualizationPopupMenuWidth,
                disabled: disabled
            });
        }

        return items;
    }, [onTileEdit, onTileDelete, sizesList, availableVisualization, t, disabled, index, handleSelectSize, vizListProps, handleSelectVizualization]);

    return <TileMenuControl ref={ref} className={cx('action-bar')} items={menuItems} />;
});

function renderError(props: TileProperties, err: Implementation<any>) {
    const { title, layout, type } = props;
    return (
        <ErrorTile.render isEditable={null} state={null} props={{
            config: {
                errorViewProps: err
            },
            title,
            layout,
            type,
        }} />
    );
}
