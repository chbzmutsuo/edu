'use client'

import {upsertLearningRoleMaster, upsertSchoolWithSubjects} from '@app/(apps)/edu/class/defaultUpsertMethods'
import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

export class ViewParamBuilder {
  static school: ViewParamBuilderProps = props => {
    return {
      myForm: {
        create: {
          executeUpdate: async props => {
            return await upsertSchoolWithSubjects({latestFormData: props.latestFormData})
          },
        },
      },
    }
  }
  static teacher: ViewParamBuilderProps = props => {
    const {useGlobalProps} = props.ClientProps2
    const {schoolId} = useGlobalProps.accessScopes().getGroupieScopes()

    return {
      myForm: {
        create: {
          executeUpdate: async props => {
            return await upsertLearningRoleMaster({latestFormData: props.latestFormData, schoolId})
          },
        },
      },
    }
  }
}
