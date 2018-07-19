export interface IRoute {
  [key: string]: any,
  _orgPath: string,
  config?: {
    pre?: any,
    [key: string]: { [key: string]: any }
  }
}
