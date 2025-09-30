interface EtcRecord {
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
  remark?: string
  cardNumber?: string
  carType?: string
}

interface GroupHeader {
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

type TableRecord = EtcRecord | GroupHeader

interface FormData {
  tbmVehicleId: number
  month: Date
  csvData: string
}

interface FileUploadFormData {
  tbmVehicleId: number
  month: Date
}
