export default class Subscription {
  private _open = true

  unsubscribe (): void {
    this._open = false
  }

  add (callback: (...args: any) => any): any {
    return (...args: any) => this._open && callback(...args)
  }

  get closed(): boolean {
    return !this._open
  }
}
