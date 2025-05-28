import {Fields} from '@class/Fields/Fields'
import useBasicFormProps from '@cm/hooks/useBasicForm/useBasicFormProps'

import {Button} from '@components/styles/common-components/Button'
import {Absolute} from '@components/styles/common-components/common-components'
import useGlobal from '@hooks/globalHooks/useGlobal'
import {toast} from 'react-toastify'

const LoginForm = ({stores, currentStore, setcurrentStore}) => {
  const {toggleLoad, router} = useGlobal()

  const {BasicForm, latestFormData} = useBasicFormProps({
    columns: Fields.transposeColumns([
      {
        id: `storeName`,
        label: `店舗名`,
        type: ``,
        form: {},
        forSelect: {
          optionsOrOptionFetcher: stores.map(store => store.storeName),
        },
      },
      {id: `password`, label: `パスワード`, type: `password`, form: {}},
    ]),
  })
  const onSubmit = async data => {
    const theStore = stores.find(store => {
      return String(store.storeName) === String(data.storeName) && String(store.password) === String(data.password)
    })
    if (theStore) {
      toggleLoad(async () => {
        toast.success(`ログインしました`)
        await setcurrentStore(prev => theStore)
      })
      router.refresh()
    } else {
      toast.error(`IDまたはパスワードが違います`)
    }
  }

  return (
    <Absolute>
      <BasicForm onSubmit={onSubmit} latestFormData={latestFormData}>
        <Button>ログイン</Button>
      </BasicForm>
    </Absolute>
  )
}

export default LoginForm
