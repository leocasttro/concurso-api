export class Result<T, E = Error> {
  private constructor(
    public readonly isSuccess: boolean,
    public readonly error?: E,
    private readonly data?: T,
  ) {}

  static success<T>(data: T): Result<T> {
    return new Result<T>(true, undefined, data);
  }

  static failure<E = Error>(error: E): Result<never, E> {
    return new Result<never, E>(false, error);
  }

  get value(): T {
    if (!this.isSuccess || this.data === undefined) {
      throw new Error('Cannot get value from failed Result.');
    }

    return this.data;
  }

  get isFailure(): boolean {
    return !this.isSuccess;
  }
}
