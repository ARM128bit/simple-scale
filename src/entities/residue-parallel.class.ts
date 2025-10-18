import { reactive } from 'vue'
import Parallel from './parallel.abstract'

export default class ResidueParallel extends Parallel {
  constructor({
    method,
    laborant,
    lab_id,
    crucible_id,
    crucible_weight,
    sample_weight,
    final_weight,
    result,
    exported_at,
    sub_weightings,
  }: {
    method: IMethod
    laborant: IUser
    lab_id?: string
    crucible_id?: string
    crucible_weight?: string
    sample_weight?: string
    final_weight?: string
    result?: number
    exported_at?: Date
    sub_weightings?: ISubWeighting[]
  }) {
    super({
      method,
      laborant,
      lab_id,
      crucible_id,
      crucible_weight,
      sample_weight,
      final_weight,
      result,
      exported_at,
    })
    if (method.const_weight_rule) {
      this._sub_weightings = reactive(
        new Set(
          sub_weightings
            ? sub_weightings
            : [
                {
                  weight: null,
                  weighted_at: '',
                },
                {
                  weight: null,
                  weighted_at: '',
                },
              ],
        ),
      )
    }
  }

  // Процент остатка
  calcResult() {
    if (this._crucible_weight && this._final_weight && this._sample_weight) {
      const crucible_weight = Number(this._crucible_weight.replace(',', '.'))
      const final_weight = Number(this._final_weight.replace(',', '.'))
      const sample_weight = Number(this._sample_weight.replace(',', '.'))
      this._result = Number(
        (((final_weight - crucible_weight) / sample_weight) * 100).toPrecision(2),
      )
    }
  }
}
