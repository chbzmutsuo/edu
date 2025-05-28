import {DriveSchedule} from '@app/(apps)/tbm/(class)/DriveSchedule'
import {TbmBase, User} from '@prisma/client'

export class ScheduleCell {
  ScheduleCell

  constructor(
    ScheduleCell: DriveSchedule & {
      User: User
      TbmBase: TbmBase
    }
  ) {
    this.ScheduleCell = ScheduleCell
  }
}
