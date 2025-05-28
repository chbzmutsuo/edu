import {createUpdate} from '@lib/methods/createUpdate'
import {doStandardPrisma} from '@lib/server-actions/common-server-actions/doStandardPrisma/doStandardPrisma'

export const upsertSchoolWithSubjects = async ({latestFormData}) => {
  const {name} = latestFormData
  const res = await doStandardPrisma(`school`, `upsert`, {
    where: {
      id: latestFormData?.id ?? 0,
    },
    ...createUpdate({name}),
  })

  if (latestFormData?.id === 0) {
    const defaultSubjects = [
      {name: '国語', color: '#D40173'},
      {name: '算数', color: '#0081CF'},
      {name: '理科', color: '#11C403'},
      {name: '社会', color: '#FE9B00'},
      {name: '体育', color: '#1C2D75'},
      {name: '外国語', color: '#9C1CB4'},
      {name: '道徳', color: '#E4A0B5'},
    ]

    const res2 = await doStandardPrisma(`school`, `update`, {
      where: {id: res.result.id},
      data: {
        SubjectNameMaster: {
          createMany: {
            data: defaultSubjects.map((subject, index) => {
              return {
                ...subject,
              }
            }),
          },
        },
      },
    })
  }

  return res
}
export const upsertLearningRoleMaster = async ({latestFormData, schoolId}) => {
  const {name, email, password, type} = latestFormData

  const res = await doStandardPrisma(`teacher`, `upsert`, {
    where: {id: latestFormData?.id ?? 0},
    ...createUpdate({
      name,
      schoolId,
      email,
      password,
      type,
    }),
  })

  if (latestFormData?.id === 0) {
    // const defaultupsertLearningRoleMaster = [
    //   {name: `司会`, color: '#FF7E79'},
    //   {name: `質問`, color: '#EFB93B'},
    //   {name: `発表`, color: '#7FB93B'},
    // ]
    // const res2 = await doStandardPrisma(`teacher`, `update`, {
    //   where: {id: res.result.id},
    //   LearningRoleMaster: {
    //     createMany: {
    //       data: defaultupsertLearningRoleMaster.map((subject, index) => {
    //         return {
    //           ...subject,
    //         }
    //       }),
    //     },
    //   },
    // })
  }

  return res
}
