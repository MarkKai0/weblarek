import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IFormState } from '../../types';

export class Form<T> extends Component<T & IFormState> {
    protected submitButton: HTMLButtonElement;
    protected errorsElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLFormElement) {
        super(container);

        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.container);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.container);

        this.container.addEventListener('submit', (e) => {
            e.preventDefault();
            this.events.emit(`${this.container.getAttribute('name')}:submit`);
        });

        this.container.addEventListener('input', (e) => {
            const target = e.target as HTMLInputElement;
            const field = target.name;
            const value = target.value;
            this.events.emit(`${this.container.getAttribute('name')}.${field}:change`, { field, value });
        });
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }

    set errors(value: string) {
        this.errorsElement.textContent = value;
    }

    render(data: Partial<T & IFormState>): HTMLElement {
        const { valid, errors, ...inputs } = data as IFormState & Record<string, unknown>;
        super.render({ valid, errors } as Partial<T & IFormState>);
        Object.assign(this, inputs);
        return this.container;
    }
}