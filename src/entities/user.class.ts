export class User implements IUser {
  private _id: number | undefined
  private _first_name: string
  private _last_name: string
  private _enabled: boolean
  private _created_at: string | undefined

  constructor({
    id,
    first_name,
    last_name,
    enabled,
    created_at,
  }: {
    id?: number
    first_name: string
    last_name: string
    enabled: boolean
    created_at?: string | undefined
  }) {
    this._id = id
    this._first_name = first_name
    this._last_name = last_name
    this._enabled = enabled
    this._created_at = created_at
  }

  get id(): number | undefined {
    return this._id
  }

  set id(value: number) {
    this._id = value
  }

  get first_name() {
    return this._first_name
  }

  set first_name(value: string) {
    this._first_name = value
  }

  get last_name() {
    return this._last_name
  }

  set last_name(value: string) {
    this._last_name = value
  }

  get enabled() {
    return this._enabled
  }

  set enabled(value: boolean) {
    this._enabled = value
  }

  get created_at() {
    return this._created_at ?? ''
  }

  set created_at(value: string) {
    this._created_at = value
  }

  get fullName() {
    return `${this._last_name} ${this._first_name}`
  }
}
