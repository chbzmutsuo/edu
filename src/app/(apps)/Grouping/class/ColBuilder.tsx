'use client'

import {Grouping, ClassRoom} from '@app/(apps)/Grouping/class/Grouping'

import {colType, columnGetterType} from '@cm/types/types'

import {formatDate} from '@cm/class/Days/date-utils/formatters'
import MemberViwer from '@cm/components/List/MemberViwer'
import {Fields} from '@cm/class/Fields/Fields'
import {addQuerySentence} from '@cm/lib/methods/urls'
import {doStandardPrisma} from '@cm/lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

import {arrToLines} from '@cm/components/utils/texts/MarkdownDisplay'
import {Button} from '@cm/components/styles/common-components/Button'

export class ColBuilder {
  static learningRoleMaster = (props: columnGetterType) => {
    const session = props.useGlobalProps.session

    const data: colType[] = [
      {id: 'teacherId', label: '教員', form: {defaultValue: session?.id, disabled: true}, forSelect: {}},
      {id: 'name', label: '役割名', form: {register: {required: '必須です'}}},
      {id: 'color', label: '色', form: {}, type: `color`},
      {id: 'maxCount', label: '最大', form: {}, type: `number`, td: {style: {width: 40}}},
    ]
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }
  static learningRoleMasterOnGame = (props: columnGetterType) => {
    const session = props.useGlobalProps.session

    const data = new Fields([
      {id: 'name', label: '役割名', form: {register: {required: '必須です'}}},
      {id: 'color', label: '色', form: {}, type: `color`},
      {id: 'maxCount', label: '最大', form: {}, type: `number`, td: {style: {width: 40}}},
    ]).customAttributes(({col}) => ({td: {...col.td, withLabel: false}}))
    return data.transposeColumns()
  }

  static school = (props: columnGetterType) => {
    const data: colType[] = [
      {
        id: 'name',
        type: 'text',
        label: '学校名',
        form: {register: {required: '必須です'}},
      },
    ]
    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static student = (props: columnGetterType) => {
    const {
      ColBuilderExtraProps,
      useGlobalProps: {accessScopes},
    } = props
    const schoolId = accessScopes().getGroupieScopes().schoolId

    const data: colType[] = [
      {
        id: 'classroomId',
        label: 'クラス',
        forSelect: {
          config: {
            modelName: `classroom`,
            select: {name: false, grade: ``, class: ``},
            where: {schoolId},
            nameChanger: op => ({...op, name: new ClassRoom(op).className}),
          },
        },
        format: (value, row) => {
          return <>{new ClassRoom(row.Classroom).className}</>
        },
        form: {
          defaultValue: ColBuilderExtraProps?.classroom?.id,
        },
        search: {},
      },
      {
        id: 'attendanceNumber',
        label: '出席番号',
        type: 'number',
        form: {},
        search: {},
      },
      {
        id: 'name',
        label: '氏名',
        // type: 'text',
        form: {
          register: {required: '必須です'},
        },
        search: {},
      },
      {
        id: 'kana',
        type: 'text',
        label: 'かな',
        form: {},
        search: {},
      },
      {
        id: 'gender',

        label: '性別',
        forSelect: {optionsOrOptionFetcher: [`男`, `女`]},
        form: {},
        search: {},
      },

      {
        id: 'studentUnfitFellow',
        label: '要配慮指定',
        format: (value, row) => {
          const {id, UnfitFellow} = row
          const items = UnfitFellow?.map((u: any) => {
            const oponent = u.Student.find((s: any) => s.id !== id)
            return oponent?.name
          })

          return (
            <MemberViwer
              {...{
                style: {width: '100%'},
                items: items,
                itemStyle: {width: 80},
              }}
            />
          )
        },
      },
    ]

    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static teacher = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const {isSchoolLeader} = useGlobalProps.accessScopes().getGroupieScopes()

    const data: colType[] = [
      // {
      //   id: 'schoolId',
      //   label: '学校',
      //   forSelect: {},
      // },

      {
        id: 'name',
        label: '氏名',
        form: {
          register: {required: '必須です'},
          disabled: false,
        },
        sort: {},
        search: {},
      },
      {
        id: 'email',
        label: 'メールアドレス',

        form: {
          register: {required: '必須です'},
          disabled: false,
        },
        sort: {},
        search: {},
        type: 'email',
      },
      {
        id: 'password',
        label: 'パスワード',
        type: 'password',
        form: {register: {required: '必須です'}},
      },
      {
        id: 'type',
        label: '区分',
        forSelect: {optionsOrOptionFetcher: [{value: '責任者', color: '#B22222'}]},
        form: {
          register: {},
          disabled: !isSchoolLeader,
        },
        search: {},
        sort: {},
      },

      {
        id: 'classroom',
        label: '所属クラス',
        format: (value: any, row: any) => {
          return `${row?.TeacherClass?.length}`
        },
        affix: {label: '件'},
      },
    ]

    return Fields.transposeColumns(data, {
      ...props.transposeColumnsOptions,
      autoSplit: {form: 4},
    })
  }

  static classroom = (props: columnGetterType) => {
    const data: colType[] = [
      {
        id: 'grade',
        label: '学年',
        type: 'text',
        form: {register: {required: '必須です'}},
        affix: {label: '年'},
      },
      {
        id: 'class',
        label: '組',
        type: 'text',
        form: {register: {required: '必須です'}},
        affix: {label: '組'},
      },
      {
        id: 'teacher',
        label: '教員数',
        format: (value: any, row: any) => `${row?.TeacherClass?.length}`,
        affix: {label: '人'},
      },
      {
        id: 'students',
        label: '児童・生徒数',
        format: (value: any, row: any) => `${row?.Student?.length}`,
        affix: {label: '人'},
      },
    ]

    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static game = (props: columnGetterType) => {
    const {useGlobalProps} = props
    const {session, accessScopes, status, query, asPath, router, pathname, rootPath, addQuery} = useGlobalProps
    const scopes = accessScopes()
    const {schoolId, teacherId} = scopes.getGroupieScopes()

    const data: colType[] = [
      {
        id: 'date',
        label: '日時',
        type: 'date',
        form: {register: {required: '必須です'}, defaultValue: formatDate(new Date(), 'iso')},
      },
      {
        id: 'name',
        label: '授業名',
        form: {register: {required: '必須です'}},
      },

      {
        id: 'subjectNameMasterId',
        label: '教科',
        form: {register: {required: '必須です'}},
        forSelect: {
          config: {
            modelName: `subjectNameMaster`,
            where: {schoolId: schoolId},
          },
        },
      },
      {
        id: 'learningContent',
        label: '学習内容(改行区切り)',
        type: `textarea`,
        form: {style: {minWidth: 400}, register: {required: '必須です'}},
      },
      {
        id: 'task',
        label: '学習課題',
        type: `textarea`,
        form: {style: {minWidth: 400}, register: {required: '必須です'}},
        // td: {style: {width: 150}},
      },

      {
        id: 'teacherId',
        label: '担当者',
        form: {
          defaultValue: teacherId,
          register: {required: '必須です'},
          disabled: true,
        },
        forSelect: {
          config: {
            modelName: `teacher`,
            where: {
              id: session?.id,
              schoolId: schoolId,
            },
          },
        },
      },

      {
        id: 'nthTime',
        label: '時数',
        type: 'number',
        form: {},
      },
      {
        id: 'secretKey',
        label: '開始',

        td: {style: {width: 50}},
        format: (value: any, row: any) => {
          const newPath = `/${rootPath}/game/main/${row.secretKey}` + addQuerySentence({as: 'teacher'}, query)

          return (
            <Button
              className={`py-1.5 text-[.875rem]`}
              onClick={async e => {
                const {result: gameDetail} = await doStandardPrisma('game', 'findUnique', {
                  where: {id: row.id},
                  include: {
                    QuestionPrompt: {},
                    // Room: {
                    //   include: {
                    //     RoomStudent: {include: {Student: {}}},
                    //   },
                    // },
                  },
                })

                const Students = gameDetail.Room.RoomStudent.map((rs: any) => rs.Student).flat()
                const PromptLength = gameDetail.QuestionPrompt.length

                if (PromptLength === 0) {
                  if (
                    !confirm(
                      arrToLines([
                        `初回のゲーム開始時は、現在招待されている【${Students.length}】人の生徒に自動でアンケートが開始されます。`,
                        `ゲーム開始後に招待した参加者には、初回アンケートは実施できません。`,
                        `開始してよろしいですか？`,
                      ])
                    )
                  ) {
                    return
                  }
                }
                router.push(newPath)
              }}
            >
              開始
            </Button>
          )
        },
      },
    ]

    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }

  static answer = (props: columnGetterType) => {
    const data: colType[] = [
      ...Grouping.QUESTIONS.map((q, idx) => {
        return q.questions.map((question, idx) => {
          const col: colType = {
            id: `${question.type}${idx}`,
            label: question.label,
            type: 'review',
          }
          return col
        })
      }).flat(),
    ]

    return Fields.transposeColumns(data, {...props.transposeColumnsOptions})
  }
}
