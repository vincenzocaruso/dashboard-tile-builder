import { TileMenuItemProps } from 'models';

export interface TileMenuControlProps {
    items: TileMenuItemProps[];
    ref: React.ForwardedRef<unknown>;
    className: string;
}


export function TileMenuControl({}: TileMenuControlProps) {
    return <div>TileMenuControl</div>;
}