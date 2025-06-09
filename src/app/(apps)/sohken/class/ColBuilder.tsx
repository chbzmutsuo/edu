'use client'

import {userForSelect} from '@app/(apps)/sohken/class/sohken-constants'

import {Fields} from '@cm/class/Fields/Fields'

import {colType} from '@cm/types/types'

import {columnGetterType} from '@cm/types/types'
import {defaultRegister} from '@class/builders/ColBuilderVariables'
import {Button} from '@components/styles/common-components/Button'
import {handleUpdateSchedule} from '@app/(apps)/sohken/(parts)/Tasks/handleUpdateSchedule'
import {Days} from '@class/Days/Days'
import {formatDate} from '@class/Days/date-utils/formatters'
import {toUtc} from '@class/Days/date-utils/calculations'
import useSWR from 'swr'

import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {useGenbaDayBasicEditor} from '@app/(apps)/sohken/hooks/useGenbaDayBasicEditor'
import GenbaDaySummary from '@app/(apps)/sohken/(parts)/genbaDay/GenbaDaySummary/GenbaDaySummary'
import {SOHKEN_CONST} from '@app/(apps)/sohken/(constants)/SOHKEN_CONST'
import useDoStandardPrisma from '@hooks/useDoStandardPrisma'
import {IconBtn} from '@components/styles/common-components/IconBtn'
import {isDev} from '@lib/methods/common'

const register = {required: `必須です`}
export class ColBuilder {
  static tmp = (props: columnGetterType) => {
    let data: colType[] = []
    data = []
    return Fields.transposeColumns(data)
  }
  static forcedWorkDay = (props: columnGetterType) => {
    return new Fields([{id: 'date', label: '日付', type: 'date', form: {...defaultRegister}}]).transposeColumns()
  }
  static DayRemarksFile = (props: columnGetterType) => {
    return Fields.transposeColumns([
      {
        id: 'name',
        label: 'ファイル名',
        td: {style: {minWidth: 300}},
        form: {...defaultRegister},
      },
      {
        id: 'url',
        label: 'ファイルURL',
        type: `file`,

        td: {style: {minWidth: 160, height: 120}},
        form: {
          ...defaultRegister,
          file: {
            backetKey: `dayRemarksFile`,
            accept: {
              'image/jpeg': [`.jpg`, `.jpeg`],
              'image/png': [`.png`],
              'application/pdf': [`.pdf`],
            },
          },
        },
      },
    ])
  }
  static prefCity = (props: columnGetterType) => {
    return Fields.transposeColumns([
      {id: 'pref', label: '都道府県', form: {...defaultRegister}},
      {id: 'city', label: '市区町村', form: {...defaultRegister}},
    ])
  }
  static genbaTask = (props: columnGetterType) => {
    const {toggleLoad, router} = props.useGlobalProps

    return new Fields([
      ...new Fields([
        {id: 'name', label: 'タスク名', form: {...defaultRegister}, td: {style: {width: 200}}},
        {
          id: 'color',
          label: '色',
          type: `color`,
          form: {},
          format: (value, row) => {
            const color = row[`color`]
            return (
              <IconBtn color={color}>
                <div className={` text-gray-700`}>-</div>
              </IconBtn>
            )
          },
          td: {style: {minWidth: 40}},
        },
      ]).aggregateOnSingleTd().plain,
      ...new Fields([
        {
          id: 'from',
          label: 'いつから',
          type: `date`,
          form: {...defaultRegister},

          format: (value, row) => {
            return formatDate(row[`from`], `short`)
          },
        },
        {
          id: 'to',
          label: 'いつまで',
          type: `date`,
          form: {},

          format: (value, row) => {
            if (Days.validate.isSameDate(row[`from`], row[`to`])) {
              return '〃'
            } else if (row[`to`]) {
              return formatDate(row[`to`], `short`)
            } else {
              return `未指定`
            }
          },
        },
      ]).aggregateOnSingleTd().plain,
      ...new Fields([
        {
          id: 'remarks',
          label: '連絡',
          type: `textarea`,
          form: {style: {minWidth: 240}},
        },
        {
          id: 'subTask',
          label: 'その他',
          type: `textarea`,
          form: {style: {minWidth: 240}},
        },
      ]).aggregateOnSingleTd().plain,

      ...new Fields([
        {id: 'requiredNinku', label: '必要人工', type: `float`, form: {...defaultRegister}},
        {
          id: `updateBtn`,
          label: `反映`,
          form: {hidden: true},
          format: (value, row, col) => {
            const genbaTask = row

            return (
              <>
                <Button
                  onClick={async () => {
                    toggleLoad(async () => await handleUpdateSchedule({genbaTask}), {refresh: true, mutate: true})
                  }}
                >
                  反映
                </Button>
              </>
            )
          },
        },
      ]).aggregateOnSingleTd().plain,

      // {
      //   id: 'status',
      //   label: '状況',
      //   type: `float`,
      //   form: {hidden: true},
      //   forSelect: {
      //     optionsOrOptionFetcher: [
      //       {value: '未完了', color: 'red'},
      //       {value: '完了', color: 'green'},
      //     ],
      //   },
      // },
    ]).transposeColumns()
  }

  static genbaDaySoukenCar = (props: columnGetterType) => {
    const data: colType[] = [
      {
        id: 'genbaId',
        label: '現場',
        td: {hidden: true},
        form: {register, disabled: true, defaultValue: props?.ColBuilderExtraProps?.genbaId},
        forSelect: {},
      },
      {id: 'sohkenCarId', label: '車両', form: {register}, forSelect: {}},
    ]
    return Fields.transposeColumns(data)
  }
  static genbaDayShift = (props: columnGetterType) => {
    const timeInputProps = {
      datalist: new Array(24 * 4).fill(0).map((_, i) => {
        const hours = Math.floor(i / 4)
        const minutes = (i % 4) * 15
        return {value: `${String(hours).padStart(2, `0`)}:${String(minutes).padStart(2, `0`)}`}
      }),
      step: 60 * 15,
    }
    const data: colType[] = [
      {
        id: 'genbaId',
        label: '現場',
        td: {hidden: true},
        form: {register, disabled: true, defaultValue: props?.ColBuilderExtraProps?.genbaId},
        forSelect: {},
      },
      {id: 'userId', label: '担当者', form: {register}, forSelect: userForSelect},
      {
        id: 'from',
        label: 'いつから',
        form: {},
        type: 'time',
        inputProps: timeInputProps,
      },
      {
        id: 'to',
        label: 'いつまで',
        form: {},
        type: `time`,
        inputProps: timeInputProps,
      },
      {
        id: 'important',
        label: '強調',
        form: {},
        type: `boolean`,
      },
    ]
    return Fields.transposeColumns(data)
  }
  static genbaDay = (props: columnGetterType) => {
    const {session, query} = props.useGlobalProps
    const GenbaDayBasicEditor_HK = useGenbaDayBasicEditor()
    const {data: allShiftBetweenDays = []} = useSWR(`/`, async () => {
      const queryFrom = query.from ? toUtc(query.from) : null
      const queryTo = query.to ? toUtc(query.to) : null
      const whereQuery =
        queryFrom && queryTo
          ? {
              date: {gte: queryFrom, lte: queryTo},
            }
          : queryFrom
            ? {
                date: {gte: queryFrom, lt: Days.day.add(queryFrom, 1)},
              }
            : {}

      const {result} = await doStandardPrisma(`genbaDayShift`, `findMany`, {
        include: {GenbaDay: {}},
        where: {
          GenbaDay: {
            date: queryFrom ? {gte: queryFrom, lt: Days.day.add(queryFrom, 1)} : undefined,
          },
        },
      })
      return result
    })

    const UseRecordsReturn = props.ColBuilderExtraProps?.UseRecordsReturn

    const data = new Fields([
      ...new Fields([
        {
          id: 'date',
          label: '日付',
          form: {
            register,
            disabled: props => !!props?.record?.id,
          },
          type: 'date',
        },
        {
          id: 'genbaId',
          label: '現場',
          form: {
            register,
            defaultValue: props?.ColBuilderExtraProps?.genbaId,
            disabled: props => !!props?.record?.id,
          },
          forSelect: {
            config: {
              modelName: `genba`,
              select: {
                zip: `text`,
              },
              nameChanger: op => {
                const name = [op.name, op.zip].filter(Boolean).join(`\n`)

                return {...op, name}
              },
            },
          },
        },
        {id: 'remarks', label: '連絡事項・備考', form: {}, type: `textarea`},
        {id: 'subTask', label: 'その他', form: {}, type: `textarea`},
      ])
        .aggregateOnSingleTd()
        .customAttributes(({col}) => ({td: {hidden: true}})).plain,

      {
        id: `summary`,
        label: ``,
        td: {
          getRowColor: (value, row, col) => {
            const shift = row.GenbaDayShift
            const isMyShift = query[`myPage`] === `true` || shift?.some(s => s.userId === session?.id)
            return isMyShift ? 'rgba(255, 235, 170, 0.664)' : ''
          },
        },
        format: (value, row, col) => {
          // const [holidays, setholidays] = useState<any[] | null>(null)
          const {data: holidays = []} = useDoStandardPrisma(`sohkenGoogleCalendar`, `findMany`, {
            where: {calendarId: `ja.japanese#holiday@group.v.calendar.google.com`},
          })

          // if (chechIsHoliday({holidays, date: row.date})) {
          //   return <Center className={`text-gray-500`}>---日・祝---</Center>
          // }

          return (
            <div>
              <GenbaDaySummary
                {...{
                  holidays,
                  GenbaDayBasicEditor_HK,
                  allShiftBetweenDays,
                  records: UseRecordsReturn?.records,
                  GenbaDay: row,
                  editable: true,
                }}
              />
            </div>
          )
        },
      },
    ]).transposeColumns()
    return data
  }

  static genba = (props: columnGetterType) => {
    const data: colType[] = [
      ...new Fields([
        {
          id: 'name',
          label: '現場名',
          form: {register},
          search: {},
          format: (value, row) => {
            return (
              <div>
                {isDev && <span>({row?.GenbaDay?.length})</span>}
                <span>{value}</span>
              </div>
            )
          },
          td: {style: {minWidth: 150}},
        },
      ]).buildFormGroup({groupName: `基本情報`}).plain,

      ...new Fields([
        {
          id: 'construction',
          label: '建築',
          forSelect: {
            optionsOrOptionFetcher: SOHKEN_CONST.OPTIONS.CONSTRUCTION,
          },
          search: {},
        },
        {
          id: 'defaultStartTime',
          label: '基準開始時間',
          form: {},
          forSelect: {
            optionsOrOptionFetcher: [`通常`, `早出`, `遅出`, `15分遅出`, `30分遅出`, `45分遅出`, `60分遅出`],
          },
          search: {},
        },
        {
          id: 'warningString',
          label: '注意事項',
          form: {},
          type: `textarea`,
          td: {style: {minWidth: 240}},
        },
        {id: 'archived', label: '非表示', type: `boolean`, form: {}},
      ])
        // .setNormalTd()
        // .aggregateOnSingleTd()
        .buildFormGroup({groupName: `基本情報`}).plain,

      ...new Fields([
        {
          id: 'prefCityId',
          label: '都道府県/市区町村',
          form: {},
          forSelect: {
            config: {
              orderBy: [{sortOrder: `asc`}],
              select: {
                id: `number`,
                name: false,
                pref: `text`,
                city: `text`,
              },
              nameChanger: op => {
                return {...op, name: op ? [op.pref, op.city].filter(Boolean).join(` `) : ''}
              },
            },
          },
        },
        {id: 'addressLine1', label: '住所1', form: {}},
        {id: 'addressLine2', label: '住所2', form: {}},
        // {id: 'state', label: '都道府県', form: {}},
        // {id: 'city', label: '市区町村', form: {}},
      ])
        // .setNormalTd()
        // .aggregateOnSingleTd()
        .buildFormGroup({groupName: `住所`}).plain,

      ...new Fields([
        {id: 'houseHoldsCount1', label: '世帯数(1F)', type: `number`, form: {}},
        {id: 'houseHoldsCount2', label: '世帯数(2F)', type: `number`, form: {}},
        {id: 'houseHoldsCount3', label: '世帯数(3F)', type: `number`, form: {}},
        {id: 'houseHoldsCount4', label: '世帯数(4F)', type: `number`, form: {}},
      ]).buildFormGroup({groupName: `世帯数①`}).plain,
      ...new Fields([
        {id: 'houseHoldsCount5', label: '世帯数(5F)', type: `number`, form: {}},
        {id: 'houseHoldsCount6', label: '世帯数(6F)', type: `number`, form: {}},
        {id: 'houseHoldsCount7', label: '世帯数(7F)', type: `number`, form: {}},
      ]).buildFormGroup({groupName: `世帯数②`}).plain,

      // ...new Fields([]).setNormalTd().aggregateOnSingleTd().buildFormGroup({groupName: `住所`}).plain,
      // ...new Fields([]).setNormalTd().aggregateOnSingleTd().buildFormGroup({groupName: `世帯数1`}).plain,
      // ...new Fields([]).setNormalTd().aggregateOnSingleTd().buildFormGroup({groupName: `世帯数1`}).plain,
      // ...new Fields([]).setNormalTd().aggregateOnSingleTd().buildFormGroup({groupName: `世帯数2`}).plain,
      // ...new Fields([])
      //   .setNormalTd()
      //   .aggregateOnSingleTd()
      //   .buildFormGroup({groupName: `世帯数2`}).plain,
    ]
    return Fields.transposeColumns(data)
  }
  static user = (props: columnGetterType) => {
    const data: colType[] = [
      {id: 'name', label: '氏名', form: {}},
      {id: 'email', label: 'メールアドレス', form: {register}, type: 'email'},
      {id: 'password', label: 'パスワード', form: {}, type: 'password'},
      {
        id: 'role',
        label: '権限',
        form: {hidden: true},
        format: (val, user) => {
          return user.UserRole.map(r => r.RoleMaster.name).join(`, `)
        },
      },
    ]

    return new Fields(data).transposeColumns()
  }
  static sohkenCar = (props: columnGetterType) => {
    const data: colType[] = [
      {id: 'name', label: '車種', form: {register}},
      {id: 'plate', label: 'プレート', form: {}},
      // {
      //   id: 'userId',
      //   label: '基本使用者',
      //   form: {},
      //   forSelect: userForSelect,
      // },
    ]

    return Fields.transposeColumns(data)
  }
}
