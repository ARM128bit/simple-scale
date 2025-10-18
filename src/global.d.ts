import type { QTableColumn } from 'quasar'

declare global {
  interface Window {
    settings: {
      getMethods: () => Promise<unknown>
      setMethods: (payload: unknown) => Promise<unknown>
      getUsers: () => Promise<unknown>
      setUsers: (payload: unknown) => Promise<unknown>
      getSettings: () => Promise<string>
      setSettings: (payload: string) => Promise<boolean>
      getScales: () => Promise<unknown>
      setScales: (payload: unknown) => Promise<unknown>
    }
    serialPort: {
      initSerialPort: (payload: unknown) => Promise<unknown>
      listenSerialPort: (callback: (data: string) => void) => Promise<unknown>
      successfulOpenSerialPort: (callback: (data: boolean) => void) => Promise<unknown>
      closeSerialPort: () => Promise<boolean>
    }
    worksheet: {
      openWorksheet: () => Promise<{ data: string; path: string }>
      saveWorksheet: (payload: unknown) => Promise<string>
    }
    export: {
      exportToFile: (payload: { username: string; method: string; data: string }) => Promise<void>
    }
  }

  /**
   * LOSS - процент потерь
   * RESIDUE - процент остатка, доведение до постоянного веса
   */
  type CalcType = 'LOSS' | 'RESIDUE'

  type RepeatabilityType = 'absolute' | 'relative'

  interface IRepeatabilityRuleForm {
    id?: number
    code?: IMethod['code']
    start?: number
    end?: number
    type: RepeatabilityType
    value?: number
  }

  type IRepeatabilityRule = Required<IRepeatabilityRuleForm>

  interface IMethodForm {
    code: string
    name: string
    calc_type: CalcType
    repeatability_rules: IRepeatabilityRuleForm[]
    enabled: boolean
    const_weight_rule: string
    created_at?: string
  }

  interface IMethod {
    code: string
    name: string
    calc_type: CalcType
    repeatability_rules: IRepeatabilityRule[]
    enabled: boolean
    const_weight_rule: string
    created_at?: string
  }

  interface IUser {
    id?: number
    first_name: string
    last_name: string
    readonly fullName: string
    enabled: boolean
    created_at?: string
  }

  interface IScale {
    code: string
    name: string
    regex: string | null
    serial_no?: string
    enabled: boolean
  }

  interface IExportSetting {
    url: string | null
    folder_path: string | null
    data_template: string | null
    extension: string | null
    worksheet_folder_path: string | null
  }

  interface IWorksheetColumn extends QTableColumn {
    required?: boolean
    visible?: boolean
  }

  interface ISettingColumn {
    name: string
    visible: boolean
  }

  interface IWorksheetSetting {
    worksheet_columns: IWorksheetColumn[]
  }

  interface ISerialPort {
    path: string
    baudrate: number
    databits: number
    stopbit: number
    pairly: 'odd' | 'even'
    termination_code: string
  }

  type ISetting = { export: IExportSetting } & IWorksheetSetting & { serial_port: ISerialPort }
  type IConfigSetting = { export: IExportSetting } & { worksheet_columns: ISettingColumn[] } & {
    serial_port: ISerialPort
  }

  interface ISubWeighting {
    weight: string | null
    weighted_at: Date | null
  }

  interface IParallel {
    lab_id: string
    method: IMethod
    crucible_id: string
    crucible_weight: string | null
    sample_weight: string | null
    final_weight: string | null
    readonly result: number | null
    sub_weightings?: ISubWeighting[]
    laborant: string
    passed_repeatability: 'passed' | 'not-passed' | undefined
    exported_at: Date | null
    calcResult: () => void
  }
}

export {}
