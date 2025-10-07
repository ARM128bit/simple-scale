import { reactive } from 'vue'
import Parallel from './parallel.abstract'

export default class ResidueParallel extends Parallel {
  constructor(method: IMethod, laborant: IUser) {
    super(method, laborant)
    if (method.const_weight_rule) {
      this._sub_weightings = reactive(
        new Set([
          {
            weight: null,
            weighted_at: '',
          },
          {
            weight: null,
            weighted_at: '',
          },
        ]),
      )
    }
  }

  // Процент остатка
  calcResult() {
    if (this._crucible_weight && this._final_weight && this._sample_weight) {
      this._result = Number(
        (((this._final_weight - this._crucible_weight) / this._sample_weight) * 100).toPrecision(2),
      )
    }
  }
}
