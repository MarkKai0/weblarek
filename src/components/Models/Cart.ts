import { IProduct } from '../../types';
import { IEvents } from '../base/Events';

export class Cart {
    protected items: IProduct[] = [];

    constructor(protected events: IEvents) {}

    addToCart(item: IProduct): void {
        this.items.push(item);
        this.events.emit('cart:changed');
    }

    removeFromCart(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
        this.events.emit('cart:changed');
    }

    emptyCart(): void {
        this.items = [];
        this.events.emit('cart:changed');
    }

    getItems(): IProduct[] {
        return this.items;
    }

    hasItem(id: string): boolean {
        return this.items.some(item => item.id === id);
    }

    getCartSum(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    getCartCount(): number {
        return this.items.length;
    }

    getItemIds(): string[] {
        return this.items.map(item => item.id);
    }
}