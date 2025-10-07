import type { Reactive } from 'vue'

export default abstract class Parallel implements IParallel {
  abstract calcResult(): void
  protected _lab_id: string = ''
  protected _method: IMethod
  protected _crucible_id: string = ''
  protected _crucible_weight: string | null = null
  protected _sample_weight: string | null = null
  protected _final_weight: string | null = null
  protected _result: number | null = null
  protected _sub_weightings?: Reactive<Set<ISubWeighting>>
  protected _laborant: IUser
  protected _exported_at: Date | null = null
  protected _passed_repeatability: 'passed' | 'not-passed' | undefined

  constructor(method: IMethod, laborant: IUser) {
    this._method = method
    this._laborant = laborant
  }

  get lab_id() {
    return this._lab_id
  }

  set lab_id(val: string) {
    this._lab_id = val
  }

  get method() {
    return this._method
  }

  set method(val: IMethod) {
    this._method = val
  }

  get crucible_id() {
    return this._crucible_id
  }

  set crucible_id(val: string) {
    this._crucible_id = val
  }

  get crucible_weight(): string | null {
    return this._crucible_weight?.toString() ?? null
  }

  set crucible_weight(val: string) {
    this._crucible_weight = val
  }

  get sample_weight(): string | null {
    return this._sample_weight?.toString() ?? null
  }

  set sample_weight(val: string) {
    this._sample_weight = val
  }

  get final_weight(): string | null {
    return this._final_weight?.toString() ?? null
  }

  set final_weight(val: string) {
    this._final_weight = val
  }

  get result() {
    return this._result
  }

  get sub_weightings() {
    if (!this._sub_weightings) return
    return [...this._sub_weightings.values()]
  }

  get laborant() {
    return this._laborant.fullName
  }

  get exported_at() {
    return this._exported_at
  }

  set exported_at(val) {
    this._exported_at = val ?? new Date()
  }

  get passed_repeatability() {
    return this._passed_repeatability
  }

  set passed_repeatability(val) {
    this._passed_repeatability = val
  }

  determineFinalWeightByConstWeightRule(): string | undefined {
    if (!this._sub_weightings || !this._method.const_weight_rule || !this._sample_weight) return
    const regex = /[-+]?\d+(\.\d+)/i
    const constWeightRule = this._method.const_weight_rule.match(regex)
    const regexPercentage = /%/i
    const percentageMatch = this._method.const_weight_rule.match(regexPercentage)

    if (!constWeightRule) return
    const constWeightRuleValue = Number(constWeightRule[0])
    const subWeightings = [...this._sub_weightings.values()]
    const lastWeight = Number(subWeightings[subWeightings.length - 1].weight) ?? 0
    const prevLastWeight = Number(subWeightings[subWeightings.length - 2].weight) ?? 0
    if (lastWeight > prevLastWeight) return (this.final_weight = prevLastWeight.toString())
    if (
      percentageMatch &&
      ((prevLastWeight - lastWeight) / Number(this._sample_weight)) * 100 <= constWeightRuleValue
    ) {
      return (this.final_weight = lastWeight.toString())
    }
    if (!percentageMatch && prevLastWeight - lastWeight <= constWeightRuleValue) {
      return (this.final_weight = lastWeight.toString())
    }
  }

  addSubWeighting() {
    if (!this._sub_weightings) return
    this._sub_weightings.add({
      weight: null,
      weighted_at: '',
    })
  }
}
