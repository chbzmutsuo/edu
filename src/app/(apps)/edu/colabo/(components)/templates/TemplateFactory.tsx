'use client'

import {NormalTemplate} from './NormalTemplate'
import {PsychologyTemplate} from './PsychologyTemplate'
import {ChoiceQuizTemplate} from './ChoiceQuizTemplate'
import {FreeTextQuizTemplate} from './FreeTextQuizTemplate'
import {SummaryTemplate} from './SummaryTemplate'

export const TemplateFactory = {
  getTemplate: (templateType, props) => {
    switch (templateType) {
      case 'normal':
        return <NormalTemplate {...props} />
      case 'psychology':
        return <PsychologyTemplate {...props} />
      case 'choice_quiz':
        return <ChoiceQuizTemplate {...props} />
      case 'free_text_quiz':
        return <FreeTextQuizTemplate {...props} />
      case 'summary_survey':
        return <SummaryTemplate {...props} />
      default:
        return <NormalTemplate {...props} />
    }
  },

  getTemplateConfig: (templateType) => {
    const configs = {
      normal: {
        name: 'ノーマル',
        description: '基本的なスライド表示',
        allowedBlocks: ['text', 'image', 'link'],
        features: ['display']
      },
      psychology: {
        name: '心理アンケート',
        description: '生徒の心理状態を調査',
        allowedBlocks: ['text', 'image'],
        features: ['survey', 'grouping']
      },
      choice_quiz: {
        name: '選択クイズ',
        description: '選択肢から回答を選ぶクイズ',
        allowedBlocks: ['text', 'image', 'quiz_question', 'choice_option'],
        features: ['quiz', 'analytics']
      },
      free_text_quiz: {
        name: '自由記述クイズ',
        description: '自由にテキストで回答',
        allowedBlocks: ['text', 'image', 'quiz_question'],
        features: ['quiz', 'text_response']
      },
      summary_survey: {
        name: 'まとめアンケート',
        description: '授業のまとめアンケート',
        allowedBlocks: ['text', 'image'],
        features: ['survey', 'ranking']
      }
    }
    
    return configs[templateType] || configs.normal
  },

  createDefaultBlocks: (templateType) => {
    switch (templateType) {
      case 'psychology':
        return [
          {
            blockType: 'text',
            content: '# 心理アンケート\n\n以下の質問に答えてください。',
            alignment: 'center',
            sortOrder: 0
          }
        ]
      case 'choice_quiz':
        return [
          {
            blockType: 'quiz_question',
            content: '問題文をここに入力してください',
            alignment: 'left',
            sortOrder: 0
          },
          {
            blockType: 'choice_option',
            content: '選択肢1',
            alignment: 'left',
            isCorrectAnswer: true,
            sortOrder: 1
          },
          {
            blockType: 'choice_option',
            content: '選択肢2',
            alignment: 'left',
            isCorrectAnswer: false,
            sortOrder: 2
          }
        ]
      case 'free_text_quiz':
        return [
          {
            blockType: 'quiz_question',
            content: '質問をここに入力してください',
            alignment: 'left',
            sortOrder: 0
          }
        ]
      case 'summary_survey':
        return [
          {
            blockType: 'text',
            content: '# 授業の振り返り\n\n今日の授業について感想を聞かせてください。',
            alignment: 'center',
            sortOrder: 0
          }
        ]
      default: // normal
        return [
          {
            blockType: 'text',
            content: '# 新しいスライド\n\nこちらにコンテンツを追加してください。',
            alignment: 'center',
            sortOrder: 0
          }
        ]
    }
  }
}