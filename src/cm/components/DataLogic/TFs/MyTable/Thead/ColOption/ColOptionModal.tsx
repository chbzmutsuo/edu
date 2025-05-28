import {Fields} from 'src/cm/class/Fields/Fields'
import {SearchQuery, searchQueryKey, Sub} from 'src/cm/components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/search-methods'
import {confirmSearch} from 'src/cm/components/DataLogic/TFs/MyTable/TableHandler/SearchHandler/SearchHandler'
import {Button} from 'src/cm/components/styles/common-components/Button'
import BasicModal from 'src/cm/components/utils/modal/BasicModal'
import useBasicFormProps from 'src/cm/hooks/useBasicForm/useBasicFormProps'
import useGlobal from 'src/cm/hooks/globalHooks/useGlobal'

import React from 'react'
import {atomTypes, useJotaiByKey} from '@hooks/useJotai'

export default function ColOptionModal() {
  const [colConfigModal, setcolConfigModal] = useJotaiByKey<atomTypes[`colConfigModal`]>(`colConfigModal`, null)
  const {col, dataModelName} = colConfigModal ?? {}
  const {query, addQuery} = useGlobal()

  return (
    <BasicModal
      {...{
        alertOnClose: false,
        open: colConfigModal,
        handleClose: () => setcolConfigModal(null),
      }}
    >
      {col?.search && <SearchForm {...{dataModelName, col, query, addQuery}} />}
    </BasicModal>
  )
}

const SearchForm = ({dataModelName, col, query, addQuery}) => {
  const {SP, toggleLoad} = useGlobal()
  const columns = Sub.makeSearchColumns({columns: new Fields([col ?? {}]).transposeColumns(), dataModelName, SP})
  const currentSearchedQuerys = SearchQuery.getSearchDefaultObject({dataModelName, query})
  const FormHook = useBasicFormProps({columns, formData: currentSearchedQuerys})
  const {MainColObject, SearchColObject} = Sub.makeMainColsAndSearchCols({columns})

  return (
    <div>
      <FormHook.BasicForm
        latestFormData={FormHook.latestFormData}
        onSubmit={data => {
          confirmSearch({
            toggleLoad,
            allData: data,
            MainColObject,
            SearchColObject,
            dataModelName,
            addQuery,
            searchQueryKey,
            SearchQuery,
          })
        }}
      >
        <Button>検索</Button>
      </FormHook.BasicForm>
    </div>
  )
}
