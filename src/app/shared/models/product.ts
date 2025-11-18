export class Product {
    name: string;
    price: number;
    image: string;
    id: string;
    category: string|undefined;
    vegetarian: boolean|undefined;

    constructor(name: string,
        price: number,
        image: string,
        id?: string) {
            this.name = name;
            this.price = price;
            this.image = image;
            this.id = id!;
        }
}