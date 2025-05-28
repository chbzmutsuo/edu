import {Fields} from '@cm/class/Fields/Fields'

import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'
import {Button} from '@components/styles/common-components/Button'
import useGlobal from '@hooks/globalHooks/useGlobal'
import useIdbModel from '@hooks/useIdbModel'

import {toast} from 'react-toastify'

const LoginForm = ({users}) => {
  const {toggleLoad, router} = useGlobal()
  const {data: user, updateModel} = useIdbModel({key: `user`, defaultValue: null})

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: Fields.transposeColumns([
      {id: `id`, label: `ID`, type: ``, form: {}},
      {id: `password`, label: `パスワード`, type: `password`, form: {}},
    ]),
  })
  const onSubmit = async data => {
    const theUser = users.find(user => {
      return String(user.id) === String(data.id) && String(user.password) === String(data.password)
    })
    if (theUser) {
      toggleLoad(async () => {
        toast.success(`ログインしました`)
        await updateModel(prev => theUser)
      })
      router.refresh()
    } else {
      toast.error(`IDまたはパスワードが違います`)
    }
  }

  return (
    <>
      <BasicForm latestFormData={latestFormData} onSubmit={onSubmit}>
        <Button>ログイン</Button>
      </BasicForm>
    </>
  )
}

export default LoginForm
