'use client'
import React from 'react'
import {formatDate} from '@class/Days/date-utils/formatters'
import {R_Stack, C_Stack} from '@components/styles/common-components/common-components'
import {PlusCircleIcon, SquarePen, TruckIcon} from 'lucide-react'
import Link from 'next/link'
import {HREF} from '@lib/methods/urls'
import {createUpdate} from '@lib/methods/createUpdate'
import {TBM_STATUS} from '@app/(apps)/tbm/(constants)/TBM_STATUS'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'
import {twMerge} from 'tailwind-merge'
import {VehicleCl} from '@app/(apps)/tbm/(class)/VehicleCl'

// 作業ステータス選択コンポーネント
export const WorkStatusSelector = React.memo(
  ({userWorkStatus, user, date, fetchData}: {userWorkStatus: any; user: any; date: Date; fetchData: () => void}) => (
    <select
      value={userWorkStatus?.workStatus ?? ''}
      className="w-12 rounded-sm border border-gray-300 p-0.5"
      onChange={async e => {
        const unique_userId_date = {
          userId: user?.id ?? 0,
          date: date,
        }
        await doStandardPrisma(`userWorkStatus`, `upsert`, {
          where: {unique_userId_date},
          ...createUpdate({...unique_userId_date, workStatus: e.target.value}),
        })
        fetchData()
      }}
    >
      <option value="">-</option>
      <option value="稼働">稼</option>
      <option value="休み">休</option>
      <option value="有給">有</option>
    </select>
  )
)

// 配車追加ボタンコンポーネント
export const AddScheduleButton = React.memo(
  ({
    date,
    tbmBase,
    user,
    tbmRouteGroup,
    setModalOpen,
  }: {
    date: Date
    tbmBase: any
    user?: any
    tbmRouteGroup?: any
    setModalOpen: (props: any) => void
  }) => (
    <PlusCircleIcon
      className="onHover text-gray-500 h-4 w-4 hover:text-gray-700"
      onClick={() =>
        setModalOpen({
          date,
          tbmBase,
          user,
          tbmRouteGroup,
        })
      }
    />
  )
)

// ステータスボタンコンポーネント
export const StatusButtons = React.memo(({tbmDriveSchedule, fetchData}: {tbmDriveSchedule: any; fetchData: () => void}) => (
  <R_Stack className="justify-end gap-1">
    {Object.entries(TBM_STATUS).map(([key, value], i) => {
      const {label, color} = value as {label: string; color: string}
      const active = tbmDriveSchedule[key]

      return (
        <button
          key={i}
          className={twMerge(
            'px-2 py-0.5 text-[10px] rounded-sm border transition-opacity',
            !active && 'opacity-30',
            key === 'approved' && 'cursor-pointer hover:opacity-100',
            active ? 'bg-gray-100' : 'bg-white'
          )}
          style={{
            borderColor: color,
            color: active ? color : '#999',
          }}
          onClick={async () => {
            if (key === 'approved') {
              const isApproved = tbmDriveSchedule.approved
              const confirmed = tbmDriveSchedule.confirmed

              if (isApproved) {
                if (confirm('承認を取り消してよろしいですか？')) {
                  await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                    where: {id: tbmDriveSchedule.id},
                    data: {approved: false},
                  })
                  fetchData()
                }
              } else {
                if (!confirmed) {
                  if (confirm('ドライバーが確定処理を実施していません。強制承認をしてもよろしいですか？')) {
                    if (confirm('承認してよろしいですか？')) {
                      await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                        where: {id: tbmDriveSchedule.id},
                        data: {approved: true},
                      })
                      fetchData()
                    }
                  }
                } else {
                  if (confirm('承認してよろしいですか？')) {
                    await doStandardPrisma(`tbmDriveSchedule`, `update`, {
                      where: {id: tbmDriveSchedule.id},
                      data: {approved: true},
                    })
                    fetchData()
                  }
                }
              }
            } else {
              alert('「運行」、「締め」入力はドライバー画面から実施できます。')
            }
          }}
        >
          {label}
        </button>
      )
    })}
  </R_Stack>
))

// スケジュール詳細カードコンポーネント
export const ScheduleCard = React.memo(
  ({
    tbmDriveSchedule,
    user,
    date,
    setModalOpen,
    fetchData,
    query,
    tbmBase,
  }: {
    tbmDriveSchedule: any
    user?: any
    date: Date
    setModalOpen: (props: any) => void
    fetchData: () => void
    query: any
    tbmBase: any
  }) => {
    const {TbmRouteGroup, TbmVehicle, User} = tbmDriveSchedule

    return (
      <div className="border border-gray-300 rounded-sm p-1 bg-white hover:shadow-sm transition-shadow">
        <C_Stack className="gap-1">
          <section>
            <small className="text-gray-600">便:</small>
            {TbmRouteGroup.name}
          </section>

          <section>
            <small className="text-gray-600">車両No:</small> {new VehicleCl(TbmVehicle).shortName}
          </section>

          <section>
            <small className="text-gray-600">ドライバ:</small>
            {user?.name}
          </section>

          <R_Stack className="justify-between">
            <R_Stack>
              <SquarePen
                className="text-blue-main onHover h-3.5 w-3.5"
                onClick={() => {
                  setModalOpen({
                    tbmDriveSchedule,
                    user,
                    date,
                    tbmBase,
                  })
                }}
              />
              <Link target="_blank" href={HREF('/tbm/driveInput', {g_userId: User?.id, from: formatDate(date)}, query)}>
                <TruckIcon className="text-yellow-main w-4 h-4 hover:opacity-80" />
              </Link>
            </R_Stack>

            <StatusButtons tbmDriveSchedule={tbmDriveSchedule} fetchData={fetchData} />
          </R_Stack>
        </C_Stack>
      </div>
    )
  }
)
