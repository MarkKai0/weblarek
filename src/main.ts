import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

import { AppAPI } from './components/Communications/App';

import { Catalog } from './components/Models/Catalog';
import { Cart } from './components/Models/Cart';
import { Customer } from './components/Models/Customer';

import { Header } from './components/Views/Headers';
import { Gallery } from './components/Views/Gallery';
import { Modal } from './components/Views/Modal';
import { Basket } from './components/Views/Basket';
import { Success } from './components/Views/Success';
import { CardCatalog } from './components/Views/CardCatalog';
import { CardPreview } from './components/Views/CardPreview';
import { CardBasket } from './components/Views/CardBasket';
import { FormOrder } from './components/Views/FormOrder';
import { FormContacts } from './components/Views/FormContacts';

import { API_URL, CDN_URL } from './utils/constants';
import { cloneTemplate, ensureElement } from './utils/utils';

import { IProduct, IOrder } from './types';


const events = new EventEmitter();

events.onAll((event) => {
    console.log(event.eventName, event.data);
});

const api = new Api(API_URL);
const larekApi = new AppAPI(api);

// Компоненты
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const productsModel = new Catalog(events);
const cartModel = new Cart(events);
const customerModel = new Customer(events);

const headerElement = ensureElement<HTMLElement>('.header');
const galleryElement = ensureElement<HTMLElement>('.gallery');
const modalElement = ensureElement<HTMLElement>('#modal-container');

const header = new Header(events, headerElement);
const gallery = new Gallery(galleryElement);
const modal = new Modal(events, modalElement);

const basket = new Basket(events, cloneTemplate(basketTemplate));
const orderForm = new FormOrder(events, cloneTemplate(orderTemplate) as HTMLFormElement);
const contactsForm = new FormContacts(events, cloneTemplate(contactsTemplate) as HTMLFormElement);


// Визуализация списка товаров
events.on('catalog:changed', () => {
    const itemCards = productsModel.getItems().map((item) => {
        const card = new CardCatalog(cloneTemplate(cardCatalogTemplate), {
            onClick: () => events.emit('card:select', item)
        });
        return card.render({
            ...item,
            image: CDN_URL + item.image
        });
    });

    gallery.render({ catalog: itemCards });
});

// Изменение счетчика корзины
events.on('cart:changed', () => {
    header.render({ counter: cartModel.getCartCount() });
});

// Выбор карточки для просмотра
events.on('card:select', (item: IProduct) => {
    productsModel.setPreview(item);
});

// Открытие превью товара
events.on('preview:changed', (item: IProduct) => {
    if (!item) return;

    const inCart = cartModel.hasItem(item.id);
    const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
        onClick: () => events.emit('card:toggle', item)
    });

    modal.render({
        content: card.render({
            ...item,
            image: CDN_URL + item.image,
            buttonText: inCart ? 'Удалить из корзины' : 'В корзину',
            buttonDisabled: item.price === null
        })
    });
});

// Логика добавления/удаления товара
events.on('card:toggle', (item: IProduct) => {
    if (cartModel.hasItem(item.id)) {
        cartModel.removeFromCart(item.id);
    } else {
        cartModel.addToCart(item);
    }
    modal.close();
});

// Открытие корзины
events.on('basket:open', () => {
    const items = cartModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('basket:remove', item)
        });
        return card.render({
            ...item,
            index: index + 1
        });
    });

    modal.render({
        content: basket.render({
            items,
            total: cartModel.getCartSum()
        })
    });
});

// Логика удаления товара из корзины
events.on('basket:remove', (item: IProduct) => {
    cartModel.removeFromCart(item.id);
    events.emit('basket:open');
});

// Начало оформления заказа
events.on('order:start', () => {
    const error = customerModel.validateOrder();
    modal.render({
        content: orderForm.render({
            payment: customerModel.payment,
            address: customerModel.address,
            valid: !error,
            errors: error || ''
        })
    });
});

// Выбор способа оплаты
events.on('order:payment', ({ payment }: { payment: string }) => {
    customerModel.setField('payment', payment);
    orderForm.payment = payment;
    validateOrder();
});

// Изменение адреса
events.on('order.address:change', ({ value }: { value: string }) => {
    customerModel.setField('address', value);
    validateOrder();
});

function validateOrder() {
    const error = customerModel.validateOrder();
    orderForm.valid = !error;
    orderForm.errors = error || '';
}

// Переход к форме контактов
events.on('order:submit', () => {
    const error = customerModel.validateContacts();
    modal.render({
        content: contactsForm.render({
            email: customerModel.email,
            phone: customerModel.phone,
            valid: !error,
            errors: error || ''
        })
    });
});

// Изменение email
events.on('contacts.email:change', ({ value }: { value: string }) => {
    customerModel.setField('email', value);
    validateContacts();
});

// Изменение телефона
events.on('contacts.phone:change', ({ value }: { value: string }) => {
    customerModel.setField('phone', value);
    validateContacts();
});

function validateContacts() {
    const error = customerModel.validateContacts();
    contactsForm.valid = !error;
    contactsForm.errors = error || '';
}

// Отправка заказа
events.on('contacts:submit', () => {
    const orderData: IOrder = {
        ...customerModel.getData(),
        total: cartModel.getCartSum(),
        items: cartModel.getItemIds()
    };

    larekApi.postOrder(orderData)
        .then((result) => {
            const success = new Success(cloneTemplate(successTemplate), {
                onClick: () => modal.close()
            });

            modal.render({
                content: success.render({ total: result.total })
            });

            cartModel.emptyCart();
            customerModel.removeData();
        })
        .catch((err) => console.error(err));
});

// Логика модального окна
events.on('modal:open', () => {
    document.body.style.overflow = 'hidden';
});

events.on('modal:close', () => {
    document.body.style.overflow = '';
});

// Загрузка списка товаров
larekApi
    .getProductList()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((err) => console.error(err));