'use client'

import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static tbmOperationGroup: ViewParamBuilderProps = props => {
    return {
      myForm: {
        create: {
          executeUpdate: async props => {
            // const data = {...props.latestFormData}
            return {
              success: true,
              message: '保存しました',
              result: {},
            }
          },
        },
      },
    }
  }
}
