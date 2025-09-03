export interface EtcRecord {
  id: number
  fromDate: Date
  fromTime: string
  toDate: Date
  toTime: string
  fromIc: string
  toIc: string
  fee: number
  originalFee?: number | null
  discountAmount?: number | null
  tbmVehicleId: number
  isGrouped: boolean
  tbmEtcMeisaiId?: number | null
  TbmEtcMeisai?: any
  isGroupDetail?: boolean
  groupIndex?: number
}

export interface GroupHeader {
  isGroupHeader: boolean
  meisaiId: number
  fromDate: Date
  fromTime: string
  toDate: Date
  toTime: string
  fromIc: string
  toIc: string
  fee: number
  records: EtcRecord[]
  groupIndex: number
  tbmDriveScheduleId?: number | null
  TbmDriveSchedule?: any
}

export type TableRecord = EtcRecord | GroupHeader

export interface FormData {
  tbmVehicleId: number
  month: Date
  csvData: string
}
