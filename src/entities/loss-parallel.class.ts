import Parallel from './parallel.abstract'

export default class LossParallel extends Parallel {
  // Процент потерь
  calcResult() {
    if (this._crucible_weight && this._final_weight && this._sample_weight) {
      const crucible_weight = Number(this._crucible_weight.replace(',', '.'))
      const final_weight = Number(this._final_weight.replace(',', '.'))
      const sample_weight = Number(this._sample_weight.replace(',', '.'))
      this._result = Number(
        (((crucible_weight + sample_weight - final_weight) / sample_weight) * 100).toPrecision(5),
      )
    }
  }
}
