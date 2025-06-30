import {Code} from '@class/Code'
import {stockConfig_name, stockConfig_type} from 'src/non-common/EsCollection/(stock)/getStockConfig'

export class STOCK_CODE extends Code {
  static COLOR = {
    '01': {label: `上昇`, color: `#FF0033`},
    '02': {label: `下降`, color: `#003399`},
  }

  static STOCK_CONFIG: {
    TYPE: {[key: string]: {label: stockConfig_type}}
    NAME: {[key: string]: {label: stockConfig_name}}
  } = {
    TYPE: {
      '01': {label: `上昇`},
      '02': {label: `下降`},
      '03': {label: `クラッシュ`},
    },
    NAME: {
      '01': {label: `期間(日)`},
      '02': {label: `閾値(%)`},
    },
  }
}
