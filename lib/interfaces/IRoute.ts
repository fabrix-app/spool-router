export interface IRoute {
  [key: string]: { [key: string]: any },
  config?: {
    pre?: any,
    [key: string]: { [key: string]: any }
  }
}
