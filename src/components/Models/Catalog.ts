import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Catalog {
    protected items: IProduct[] = [];
    protected preview: IProduct | null = null;

    constructor(protected events: IEvents) {}

    setItems(items: IProduct[]): void {
        this.items = items;
        this.events.emit('catalog:changed');
    }

    getItems(): IProduct[] {
        return this.items;
    }

    getItemById(id: string): IProduct {
        const item = this.items.find(item => item.id === id);
        if (!item) {
            throw new Error(`Товар по id ${id} не найден`);
        }
        return item;
    }

    setPreview(item: IProduct | null): void {
        this.preview = item;
        if (item) {
            this.events.emit('preview:changed', item);
        }
    }

    getPreview(): IProduct | null {
        return this.preview;
    }
}