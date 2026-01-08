import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { ICard } from '../../types';

export class Card<T extends ICard = ICard> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected _id: string = '';

    constructor(container: HTMLElement) {
        super(container);

        this.titleElement = ensureElement<HTMLElement>('.card__title', this.container);
        this.priceElement = ensureElement<HTMLElement>('.card__price', this.container);
    }

    set id(value: string) {
        this._id = value;
    }

    get id(): string {
        return this._id;
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    get title(): string {
        return this.titleElement.textContent || '';
    }

    set price(value: number | null) {
        this.priceElement.textContent = value === null ? 'Бесценно' : `${value} синапсов`;
    }
}