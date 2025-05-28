'use client'

import {upsertLearningRoleMaster, upsertSchoolWithSubjects} from '@app/(apps)/Grouping/class/defaultUpsertMethods'
import {ViewParamBuilderProps} from '@components/DataLogic/TFs/PropAdjustor/usePropAdjustorProps'

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
