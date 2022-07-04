export interface CustomResponse<T> {
  data: Array<T>;
  error: string | null;
}
