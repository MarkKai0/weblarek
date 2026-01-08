import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { Form } from './Form';
import { IFormOrderData } from '../../types';

export class FormOrder extends Form<IFormOrderData> {
    protected cardButton: HTMLButtonElement;
    protected cashButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLFormElement) {
        super(events, container);

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.container);

        this.cardButton.addEventListener('click', () => {
            this.events.emit('order:payment', { payment: 'card' });
        });

        this.cashButton.addEventListener('click', () => {
            this.events.emit('order:payment', { payment: 'cash' });
        });
    }

    set payment(value: string) {
        this.cardButton.classList.toggle('button_alt-active', value === 'card');
        this.cashButton.classList.toggle('button_alt-active', value === 'cash');
    }

    set address(value: string) {
        this.addressInput.value = value;
    }
}