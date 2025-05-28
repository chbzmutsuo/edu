import {NestHandler} from '@class/NestHandler'

export default function useEditForm({PageBuilderGetter, PageBuilder, dataModelName}) {
  PageBuilderGetter = PageBuilderGetter ?? {class: PageBuilder, getter: `${dataModelName}.form`}

  // if (PageBuilderGetter) {
  const {getter} = PageBuilderGetter
  const EditForm = NestHandler.GetNestedValue(getter, PageBuilderGetter['class'])
  return EditForm

  // }
}
