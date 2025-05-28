'use client'

import TeacherDetailPage from '@app/(apps)/Grouping/parts/TeacherDetailPage'

import {Fields} from '@cm/class/Fields/Fields'
import GlobalIdSelector from '@cm/components/GlobalIdSelector/GlobalIdSelector'
import {DetailPagePropType} from '@cm/types/types'

import ClassroomDetailPage from '@app/(apps)/Grouping/parts/ClassroomDetailPage'
import StudentDetailById from '@app/(apps)/Grouping/components/Grouping/student/StudentDetailById'
import Accordion from '@cm/components/utils/Accordions/Accordion'
import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'

import GameDetailPage from '@app/(apps)/Grouping/parts/GameDetailPage'
import {C_Stack} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'

export class PageBuilder {
  static school = {
    form: (props: DetailPagePropType) => {
      const {session, query} = props.useGlobalProps
      const {formData = {}} = props
      return (
        <C_Stack className={`gap-8 `}>
          <Accordion {...{label: `学校基本情報`, defaultOpen: true}}>
            <MyForm {...props} />
          </Accordion>
        </C_Stack>
      )
    },
  }
  static game = {
    // top: () => <RoomMarkDown />,
    form: (props: DetailPagePropType) => <GameDetailPage {...props} />,
  }
  // static room = {
  //   form: (props: DetailPagePropType) => <RoomDetailPage {...props} />,
  //   top: () => <RoomMarkDown />,
  // }

  static teacher = {
    form: TeacherDetailPage,
  }
  static classroom = {
    form: ClassroomDetailPage,
  }

  static student = {
    form: StudentDetailById,
  }

  static getGlobalIdSelector = ({useGlobalProps}) => {
    return () => {
      const {accessScopes} = useGlobal()
      const scopes = accessScopes()
      const {admin} = scopes
      const schoolId = scopes.getGroupieScopes().schoolId

      if (!admin) {
        return <></>
      }

      const columns = Fields.transposeColumns([
        {label: '学校', id: 'g_schoolId', forSelect: {}, form: {}},
        {
          label: '教員',
          id: 'g_teacherId',
          form: {},
          forSelect: {
            config: {
              modelName: `teacher`,
              where: {schoolId: schoolId},
            },
          },
        },
        {label: 'テスト', id: 'g_dev', forSelect: {optionsOrOptionFetcher: ['ON', 'OFF']}},
      ])

      return (
        <GlobalIdSelector
          {...{
            useGlobalProps,
            columns,
          }}
        />
      )
    }
  }
}
