export const CSV_DELIMITER = ';'
export const SUB_WEIGHT_DELIMITER = '~'

export const CalcTypeOptions: { value: CalcType; label: string }[] = [
  { value: 'LOSS', label: 'Процент остатка' },
  { value: 'RESIDUE', label: 'Процент потерь' },
]

export const RepeatabilityTypeOptions: { value: RepeatabilityType; label: string }[] = [
  { value: 'absolute', label: 'Абсолютно' },
  { value: 'relative', label: 'Относительно среднего' },
]
