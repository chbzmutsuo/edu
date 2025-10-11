import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export class Tmp {
  static const = {
    optionConfigs: {
      studentOptionsConfig: {
        where: {membershipName: '生徒'},
      },
    },
    userTypes: [
      {value: 'コーチ', color: '#90BCE4'},
      {value: '生徒', color: '#A7C853'},
    ],
  }

  static task = {
    admin: {},
  }
}
