export class Price {
  private readonly value: number;

  private constructor(value: number) {
    this.value = value;
  }

  static create(price: number): Price {
    if (price < 0) {
      throw new Error('Price cannot be negative');
    }
    return new Price(price);
  }

  getValue(): number {
    return this.value;
  }
}
