import { IBuyer, TPayment } from '../../types';
import { IEvents } from '../base/Events';

export class Customer {
    private payment: TPayment = '';
    private email: string = '';
    private phone: string = '';
    private address: string = '';

    constructor(protected events: IEvents) {}

    setField(field: keyof IBuyer, value: string): void {
    (this as Record<string, unknown>)[field] = value;
    this.events.emit('order:update');
    }


    getData(): IBuyer {
        return {
            payment: this.payment,
            email: this.email,
            phone: this.phone,
            address: this.address
        };
    }

    removeData(): void {
        this.payment = '';
        this.email = '';
        this.phone = '';
        this.address = '';
        this.events.emit('order:update');
    }

    // Единая валидация всех полей
    validateUser(): { [key: string]: string } {
        const errors: { [key: string]: string } = {};

        if (!this.payment) {
            errors.payment = 'Выберите способ оплаты';
        }
        if (!this.email) {
            errors.email = 'Укажите email';
        }
        if (!this.phone) {
            errors.phone = 'Укажите телефон';
        }
        if (!this.address) {
            errors.address = 'Укажите адрес доставки';
        }

        return errors;
    }

    // Проверка, валидны ли данные
    isValid(): boolean {
        return Object.keys(this.validateUser()).length === 0;
    }
}