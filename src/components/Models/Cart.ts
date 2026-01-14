import { EventEmitter } from '../base/Events';
import { IProduct } from '../../types';

export class Cart {
    private items: IProduct[] = [];
    private events: EventEmitter;

    constructor(events: EventEmitter) {
        this.events = events;
    }

    // Добавить товар в корзину
    addToCart(item: IProduct): void {
        this.items.push(item);
        this.events.emit('cart:changed');
    }

    // Удалить товар из корзины
    removeFromCart(id: string): void {
        this.items = this.items.filter(item => item.id !== id);
        this.events.emit('cart:changed');
    }

    // Очистить корзину
    emptyCart(): void {
        this.items = [];
        this.events.emit('cart:changed');
    }

    // Получить список товаров
    getItems(): IProduct[] {
        return [...this.items];
    }

    // Получить сумму корзины
    getCartSum(): number {
        return this.items.reduce((sum, item) => sum + (item.price || 0), 0);
    }

    // Получить количество товаров
    getCartCount(): number {
        return this.items.length;
    }

    // Проверить наличие товара
    hasItem(id: string): boolean {
        return this.items.some(item => item.id === id);
    }

    // Получить ID товаров (для отправки заказа)
    getItemIds(): string[] {
        return this.items.map(item => item.id);
    }
}