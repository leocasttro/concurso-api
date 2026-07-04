export abstract class BaseEntity<TId = string> {
  protected constructor(
    public readonly id: TId,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt?: Date,
  ) {}

  equals(entity?: BaseEntity<TId>): boolean {
    if (!entity) {
      return false;
    }

    return this.id === entity.id;
  }
}
