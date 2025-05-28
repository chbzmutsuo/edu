import {ChildCreatorProps} from 'src/cm/components/DataLogic/RTs/ChildCreator/ChildCreator'
import TableForm from 'src/cm/components/DataLogic/TFs/PropAdjustor/TableForm'

import {ClientPropsType2} from 'src/cm/components/DataLogic/TFs/PropAdjustor/PropAdjustor'
import React from 'react'

export default function NewChildCreator(props: ClientPropsType2 & ChildCreatorProps) {
  if (!props.ParentData?.id) {
    return props?.NoDatawhenParentIsUndefined?.() ?? <></>
  }
  return <TableForm {...props} />
}
