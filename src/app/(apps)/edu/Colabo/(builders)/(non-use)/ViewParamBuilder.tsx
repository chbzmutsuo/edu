// 'use client'

// import {ViewParamBuilderProps} from '@cm/components/DataLogic/TFs/PropAdjustor/types/propAdjustor-types'

// export class ViewParamBuilder {
//   // static getViewParamBuilderConfigs = (props: ViewParamBuilderProps) => {
//   //   const {dataModelName} = props
//   //   const configs = {
//   //     slide: {
//   //       tableProps: {
//   //         enableSorting: true,
//   //         enableFiltering: true,
//   //         enablePagination: true,
//   //         pageSize: 20,
//   //       },
//   //       formProps: {
//   //         layout: 'vertical',
//   //         submitButtonText: 'スライドを保存',
//   //         cancelButtonText: 'キャンセル',
//   //       },
//   //     },
//   //     slideBlock: {
//   //       tableProps: {
//   //         enableSorting: true,
//   //         enableDragDrop: true,
//   //         pageSize: 50,
//   //       },
//   //       formProps: {
//   //         layout: 'vertical',
//   //         submitButtonText: 'ブロックを保存',
//   //         sections: [
//   //           {
//   //             title: '基本設定',
//   //             fields: ['blockType', 'content', 'imageUrl', 'linkUrl'],
//   //           },
//   //           {
//   //             title: 'スタイル設定',
//   //             fields: ['alignment', 'verticalAlign', 'textColor', 'backgroundColor', 'fontWeight', 'textDecoration'],
//   //           },
//   //           {
//   //             title: 'クイズ設定',
//   //             fields: ['isCorrectAnswer'],
//   //             condition: formData => ['quiz_question', 'choice_option'].includes(formData.blockType),
//   //           },
//   //         ],
//   //       },
//   //     },
//   //     slideResponse: {
//   //       tableProps: {
//   //         enableSorting: true,
//   //         enableFiltering: true,
//   //         enableExport: true,
//   //         pageSize: 50,
//   //       },
//   //       readOnly: true,
//   //     },
//   //     game: {
//   //       tableProps: {
//   //         enableSorting: true,
//   //         enableFiltering: true,
//   //         pageSize: 10,
//   //       },
//   //       formProps: {
//   //         layout: 'vertical',
//   //         submitButtonText: '授業を作成',
//   //         sections: [
//   //           {
//   //             title: '基本情報',
//   //             fields: ['name', 'date', 'subjectNameMasterId'],
//   //           },
//   //           {
//   //             title: '学習内容',
//   //             fields: ['learningContent', 'task', 'nthTime'],
//   //           },
//   //           {
//   //             title: '担当者',
//   //             fields: ['teacherId'],
//   //           },
//   //         ],
//   //       },
//   //     },
//   //   }
//   //   return configs[dataModelName] || {}
//   // }
// }
