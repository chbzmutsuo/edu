import BasicModal from 'src/cm/components/utils/modal/BasicModal'
import React from 'react'

import {myFormDefault} from 'src/cm/constants/defaults'
import {cl} from 'src/cm/lib/methods/common'

import {SearchQuery, searchQueryKey} from '@components/DataLogic/TFs/MyTable/components/SearchHandler/search-methods'

import {Button} from '@components/styles/common-components/Button'

import {confirmSearch} from '@components/DataLogic/TFs/MyTable/components/SearchHandler/SearchHandler'

export const Main = ({
  SearchBasicForm,
  SP,
  ResetBtnMemo,
  modalOpen,
  setmodalOpen,
  toggleLoad,
  addQuery,
  dataModelName,
  MainColObject,
  SearchColObject,
}) => {
  return (
    <div>
      <BasicModal alertOnClose={false} open={modalOpen} handleClose={e => setmodalOpen(false)}>
        <main className={`relative  `} style={{...myFormDefault?.style, maxWidth: 900, padding: 0, maxHeight: '70vh'}}>
          <div>
            <SearchBasicForm
              {...{
                className: `max-h-[60vh]  overflow-auto relative p-2`,
                onSubmit: data => {
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
                  setmodalOpen(false)
                },

                wrapperClass: cl('col-stack gap-3'),

                ControlOptions: {
                  controlWrapperClassBuilder: ({col}) => {
                    const searchTypeCol = SearchColObject[col.id]
                    let className = ``
                    if (SP && searchTypeCol) {
                      className = cl(className, `mb-8`)
                    }
                    return className
                  },
                },
              }}
            >
              <div className={`row-stack sticky bottom-0 z-50  my-0! w-full justify-end  gap-4    p-3  `}>
                {ResetBtnMemo}
                <Button color={`primary`}>確定</Button>
              </div>
            </SearchBasicForm>
          </div>
        </main>
      </BasicModal>
    </div>
  )
}
