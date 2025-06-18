import {MarkDownDisplay} from '@components/utils/texts/MarkdownDisplay'

const RoomMarkDown = () => {
  const introductionMD = `
  # ルームとは
  ルームとは、「同じ授業を受ける児童・生徒の単位」のこと。

  一つまたは複数のクラスにまたがって児童・生徒を招待することができます。

  「1年A組」、「2年A組と2年B組の出席番号が奇数の児童・生徒」、「特定の委員会やクラブ活動の単位」など自由に編成できます


  ---
  ## 利用手順
  1. まずはルームを作成しましょう。
  2. ルームを選択して、ルーム内にプロジェクト（一授業の単位）を作成しましょう。
  3. プロジェクトを選択すると、授業を開始できます。
    `

  return (
    <section className={`t-paper  mx-auto w-[695px]`}>
      <div className={` text-sm`}>
        <MarkDownDisplay>{introductionMD}</MarkDownDisplay>
      </div>
    </section>
  )
}

export default RoomMarkDown
