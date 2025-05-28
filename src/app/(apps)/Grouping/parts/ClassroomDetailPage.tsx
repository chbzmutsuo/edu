import {ColBuilder} from '@app/(apps)/Grouping/class/ColBuilder'

import MyForm from '@components/DataLogic/TFs/MyForm/MyForm'
import ChildCreator from '@cm/components/DataLogic/RTs/ChildCreator/ChildCreator'

import BasicTabs from '@cm/components/utils/tabs/BasicTabs'
import {HREF} from '@cm/lib/methods/urls'
import {DetailPagePropType} from '@cm/types/types'

const ClassroomDetailPage = (props: DetailPagePropType) => {
  const {formData: ClassRoom, useGlobalProps} = props
  const {query} = useGlobalProps
  const hasData = !!ClassRoom?.id

  return (
    <div className={`mx-auto w-fit`}>
      <BasicTabs
        {...{
          id: 'ClassroomDetailPage',
          TabComponentArray: [
            {
              label: '基本情報',
              component: (
                <div>
                  <MyForm
                    {...{
                      ...props,
                    }}
                  />
                </div>
              ),
            },

            {
              exclusiveTo: hasData,
              label: 'クラス',
              component: (
                <div>
                  <ChildCreator
                    {...{
                      ParentData: ClassRoom ?? {},
                      models: {
                        parent: `classroom`,
                        children: 'student',
                      },
                      useGlobalProps: props.useGlobalProps,
                      columns: ColBuilder.student({
                        useGlobalProps: props.useGlobalProps,
                        ColBuilderExtraProps: {
                          classroom: ClassRoom,
                        },
                      }),
                      additional: {
                        include: {
                          Classroom: {},
                        },
                        payload: {
                          schoolId: useGlobalProps.accessScopes().getGroupieScopes().schoolId,
                        },
                      },
                      editType: {
                        type: 'page',
                        pathnameBuilder: ({record, pathname, rootPath}) => HREF(`/${rootPath}/student`, {}, query),
                      },
                    }}
                  />
                </div>
              ),
            },
          ],
        }}
      />
    </div>
  )
}

export default ClassroomDetailPage
