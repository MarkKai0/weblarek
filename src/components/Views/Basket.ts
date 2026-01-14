import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IBasketData } from '../../types';

export class Basket extends Component<IBasketData> {
    protected listElement: HTMLElement;
    protected totalElement: HTMLElement;
    protected buttonElement: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.listElement = ensureElement<HTMLElement>('.basket__list', this.container);
        this.totalElement = ensureElement<HTMLElement>('.basket__price', this.container);
        this.buttonElement = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.buttonElement.addEventListener('click', () => {
            this.events.emit('order:start');
        });
        this.items = [];
    }

    set items(items: HTMLElement[]) {
        this.listElement.replaceChildren(...items);
        this.buttonElement.disabled = items.length === 0;
    }


    set total(value: number) {
        this.totalElement.textContent = `${value} синапсов`;
    }
}