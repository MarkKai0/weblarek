export type ApiPostMethods = 'POST' | 'PUT' | 'DELETE';

export interface IApi {
    get<T extends object>(uri: string): Promise<T>;
    post<T extends object>(uri: string, data: object, method?: ApiPostMethods): Promise<T>;
}

export interface IProduct {
    id: string;
    description: string;
    image: string;
    title: string;
    category: string;
    price: number | null;
} 

export type TPayment = 'cash' | 'card' | '';

export interface IBuyer {
  payment: TPayment;
  email: string;
  phone: string;
  address: string;
}

export interface IProductList {
  total: number;
  items: IProduct[];
}

export interface IOrder extends IBuyer {
    total: number,
    items: string[]
} 

export interface IOrderResult {
  id: string;
  total: number;
}

export interface IBasketData {
  items: HTMLElement[];
  total: number;
}

export interface IGalleryData {
    catalog: HTMLElement[];
}

export interface IHeader {
    counter: number;
}

export interface ICardActions {
  onClick?: () => void;
}

export interface ICard {
  id: string;
  title: string;
  price: number | null;
}

export type TCardBasket = Pick<IProduct, 'id' | 'title' | 'price'> & {
  index: number;
};

export type TCardCatalog = Pick<IProduct, 'id' | 'title' | 'price' | 'image' | 'category'>;

export type TCardPreview = Pick<IProduct, 'id' | 'title' | 'price' | 'image' | 'category' | 'description'> & {
    buttonText: string;
    buttonDisabled: boolean;
};

export interface IFormState {
    valid: boolean;
    errors: string;
}

export interface IFormContactsData {
    email: string;
    phone: string;
}

export interface IFormDeliveryData {
    address: string;
}

export interface IFormOrderData {
    payment: string;
    address: string;
}

export interface IModalData {
    content: HTMLElement;
}

export interface ISuccessData {
    total: number;
}

export interface ISuccessActions {
    onClick: () => void;
}  