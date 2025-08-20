// 'use client'

// import {useForm, UseFormReturn} from 'react-hook-form'
// import {useCallback} from 'react'
// import {ExpenseFormData} from '../types'

// import {DEFAULT_CONVERSATION_PURPOSES} from '../(constants)/conversation-purposes'

// // フォームの初期値
// const defaultValues: ExpenseFormData = {
//   date: '',
//   amount: 0,
//   counterparty: '',
//   participants: '',
//   conversationPurpose: [...DEFAULT_CONVERSATION_PURPOSES] as string[],
//   keywords: [],
//   conversationSummary: '',
//   summary: '',
//   insight: '',
//   autoTags: [],
//   status: '',
//   mfSubject: '', // 統合された科目フィールド
//   mfSubAccount: '',
//   mfTaxCategory: '課仕 10%', // デフォルト税区分
//   mfDepartment: '本社', // デフォルト部門
// }

// export const useExpenseForm = (initialData?: Partial<ExpenseFormData>) => {
//   // React Hook Formの初期化
//   const methods = useForm<ExpenseFormData>({
//     defaultValues: {
//       ...defaultValues,
//       ...initialData,
//     },
//   })

//   const {setValue, getValues, watch} = methods

//   // キーワード追加
//   const addKeyword = useCallback(
//     (keyword: string) => {
//       const currentKeywords = getValues('keywords') || []
//       if (keyword.trim() && !currentKeywords.includes(keyword.trim())) {
//         setValue('keywords', [...currentKeywords, keyword.trim()], {shouldDirty: true})
//       }
//     },
//     [getValues, setValue]
//   )

//   // キーワード削除
//   const removeKeyword = useCallback(
//     (index: number) => {
//       const currentKeywords = getValues('keywords') || []
//       setValue(
//         'keywords',
//         currentKeywords.filter((_, i) => i !== index),
//         {shouldDirty: true}
//       )
//     },
//     [getValues, setValue]
//   )

//   // 相手名追加
//   const addCounterparty = useCallback(
//     (name: string) => {
//       if (name.trim()) {
//         const currentValue = getValues('participants') || ''
//         const newValue = currentValue ? `${currentValue}, ${name.trim()}` : name.trim()
//         setValue('participants', newValue, {shouldDirty: true})
//       }
//     },
//     [getValues, setValue]
//   )

//   // 「その他複数名」を追加
//   const addMultipleOthers = useCallback(() => {
//     const currentValue = getValues('participants') || ''
//     const newValue = currentValue ? `${currentValue}, その他複数名` : 'その他複数名'
//     setValue('participants', newValue, {shouldDirty: true})
//   }, [getValues, setValue])

//   // 会話の目的変更
//   const updatePurpose = useCallback(
//     (purpose: string, checked: boolean) => {
//       const currentPurposes = getValues('conversationPurpose') || []
//       const newPurposes = checked ? [...currentPurposes, purpose] : currentPurposes.filter(p => p !== purpose)
//       setValue('conversationPurpose', newPurposes, {shouldDirty: true})
//     },
//     [getValues, setValue]
//   )

//   // 監視対象の値
//   const formValues = watch()

//   return {
//     methods,
//     addKeyword,
//     removeKeyword,

//     addCounterparty,
//     addMultipleOthers,
//     updatePurpose,
//     formValues,
//   }
// }

// export type ExpenseFormMethods = UseFormReturn<ExpenseFormData>
