import {aquapotEasySearchBuilder} from 'src/non-common/EsCollection/aquapotEasySearchBuilder'
import {sohkenEasySearchBuilder} from 'src/non-common/EsCollection/sohkenEasySearchBuilder'
import {stockEs} from 'src/non-common/EsCollection/(stock)/stockEs'
import {tbmEasySearchBuilder} from 'src/non-common/EsCollection/tbmEasySearchBuilder'

export const EasySearchBuilderCollection = {
  aquapot: aquapotEasySearchBuilder,
  sohken: sohkenEasySearchBuilder,
  tbm: tbmEasySearchBuilder,
  stock: stockEs,
}
