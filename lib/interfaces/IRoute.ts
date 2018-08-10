export interface IRoute {
  [key: string]: any,
  _orgPath?: string,
  _newPath?: string,
  config?: {
    [key: string]: { [key: string]: any },
    prefix?: any,
    pre?: any
  }
}
