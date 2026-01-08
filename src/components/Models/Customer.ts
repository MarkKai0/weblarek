import { IBuyer, TPayment } from '../../types';
import { IEvents } from '../base/Events';

export class Customer implements IBuyer {
    payment: TPayment = '';
    email: string = '';
    phone: string = '';
    address: string = '';

    constructor(protected events: IEvents) {}

    setField(field: keyof IBuyer, value: string): void {
        (this as Record<string, unknown>)[field] = value;
        this.events.emit('customer:changed');
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
    }

    validateOrder(): string | null {
        if (!this.payment) {
            return 'Выберите способ оплаты';
        }
        if (!this.address) {
            return 'Укажите адрес доставки';
        }
        return null;
    }

    validateContacts(): string | null {
        if (!this.email) {
            return 'Укажите email';
        }
        if (!this.phone) {
            return 'Укажите телефон';
        }
        return null;
    }
}