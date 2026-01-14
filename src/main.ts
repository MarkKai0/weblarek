import './scss/styles.scss';

import { Api } from './components/base/Api';
import { EventEmitter } from './components/base/Events';

import { AppAPI } from './components/Communications/App';

import { Catalog } from './components/Models/Catalog';
import { Cart } from './components/Models/Cart';
import { Customer } from './components/Models/Customer';

import { Header } from './components/Views/Header';
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

const success = new Success(cloneTemplate(successTemplate), {
    onClick: () => modal.close()
});

events.on('order:update', () => {
    const buyer = customerModel.getData();
    const errors = customerModel.validateUser();

    // Для формы заказа (только payment и address)
    const orderErrors: Record<string, string> = {};
    if (errors.payment) orderErrors.payment = errors.payment;
    if (errors.address) orderErrors.address = errors.address;

    orderForm.payment = buyer.payment;
    orderForm.address = buyer.address;
    orderForm.valid = !orderErrors.payment && !orderErrors.address;
    orderForm.errors = Object.values(orderErrors).join('. ');

    // Для формы контактов (только email и phone)
    const contactErrors: Record<string, string> = {};
    if (errors.email) contactErrors.email = errors.email;
    if (errors.phone) contactErrors.phone = errors.phone;

    contactsForm.email = buyer.email;
    contactsForm.phone = buyer.phone;
    contactsForm.valid = !contactErrors.email && !contactErrors.phone;
    contactsForm.errors = Object.values(contactErrors).join('. ');
});



//Cоздаем один раз
const card = new CardPreview(cloneTemplate(cardPreviewTemplate), {
    onClick: () => {
        const item = productsModel.getPreview();
        if (item) {
            events.emit('card:toggle', item);
        }
    }
});

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

    const items = cartModel.getItems().map((item, index) => {
        const card = new CardBasket(cloneTemplate(cardBasketTemplate), {
            onClick: () => events.emit('basket:remove', item)
        });
        return card.render({
            ...item,
            index: index + 1
        });
    });

    basket.render({
        items,
        total: cartModel.getCartSum()
    });
});

// Выбор карточки для просмотра
events.on('preview:changed', (item: IProduct) => {
    if (!item) return;

    const inCart = cartModel.hasItem(item.id);

    modal.render({
        content: card.render({
            ...item,
            image: CDN_URL + item.image,
            buttonText: inCart ? 'Удалить из корзины' : 'В корзину',
            buttonDisabled: item.price === null
        })
    });
});

events.on('card:select', (item: IProduct) => {
    productsModel.setPreview(item);
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
    modal.render({
        content: basket.render()
    });
});

// Логика удаления товара из корзины
events.on('basket:remove', (item: IProduct) => {
    cartModel.removeFromCart(item.id);
});


// Начало оформления заказа
events.on('order:start', () => {
    modal.render({
        content: orderForm.render({})
    });
});


// Выбор способа оплаты
events.on('order:payment', ({ payment }: { payment: string }) => {
    customerModel.setField('payment', payment);
});

// Изменение адреса
events.on('order.address:change', ({ value }: { value: string }) => {
    customerModel.setField('address', value);
});

// Переход к форме контактов
events.on('order:submit', () => {
    modal.render({
        content: contactsForm.render({})
    });
});


// Изменение email
events.on('contacts.email:change', ({ value }: { value: string }) => {
    customerModel.setField('email', value);
});

// Изменение телефона
events.on('contacts.phone:change', ({ value }: { value: string }) => {
    customerModel.setField('phone', value);
});

// Отправка заказа
events.on('contacts:submit', () => {
    const orderData: IOrder = {
        ...customerModel.getData(),
        total: cartModel.getCartSum(),
        items: cartModel.getItemIds()
    };

    larekApi.postOrder(orderData)
        .then((result) => {
            modal.render({
                content: success.render({ total: result.total })
            });

            cartModel.emptyCart();
            customerModel.removeData();
        })
        .catch((err) => console.error(err));
});

// Загрузка списка товаров
larekApi
    .getProductList()
    .then((data) => {
        productsModel.setItems(data.items);
    })
    .catch((err) => console.error(err));
