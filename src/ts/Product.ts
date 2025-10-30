export interface Product {
  id: string;
  name: string;
  price: number;
  parcelamento: [number, number];
  color: string;
  image: string;
  size: Array<string>;
  date: string;
  available: boolean;
}

export interface Database {
  products: Product[];
}
