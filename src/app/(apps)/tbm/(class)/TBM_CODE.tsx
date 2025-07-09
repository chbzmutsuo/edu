import {Code, codeItemCore, codeObjectArgs} from '@class/Code'

export class TBM_CODE extends Code {
  static VEHICLE: {MAINTANANCE_RECORD_TYPE: codeObjectArgs} = {
    MAINTANANCE_RECORD_TYPE: {
      '01': {label: `3ヶ月点検`, color: `red`},
      '02': {label: `車検`, color: `red`},
      '03': {label: `一般修理`, color: `red`},
      '04': {label: `プレート変更`, color: `red`},
    },
  }

  static ROUTE: {KBN: codeObjectArgs} = {
    KBN: {
      '01': {label: `規定（地域内）`, color: `green`},
      '02': {label: `規定（地域間）`, color: `green`},
      '03': {label: `臨時（地域内）`, color: `red`},
      '04': {label: `臨時（地域間）`, color: `red`},
      '05': {label: `増設（地域内）`, color: `blue`},
      '06': {label: `増設（地域間）`, color: `blue`},
      '07': {label: `航空`, color: `orange`},
      '08': {label: `一般`, color: `gray`},
      '09': {label: `リネン`, color: `gray`},
      '10': {label: `折り込み`, color: `gray`},
      '11': {label: `LPG`, color: `gray`},
      '12': {label: `その他`, color: `gray`},
    },
  }
  static USER: {TYPE: codeObjectArgs} = {
    TYPE: {
      '01': {label: `一般`, color: ``},
      '02': {label: `委託用`, color: `red`},
    },
  }
}
