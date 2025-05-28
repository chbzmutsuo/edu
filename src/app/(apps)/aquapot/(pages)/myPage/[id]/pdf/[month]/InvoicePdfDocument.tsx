'use client'

import {Page, View, Document, Text} from '@react-pdf/renderer'

import React from 'react'

import {ReactPdfStyles, Table, Td, Tr} from '@hooks/usePdfGenerator'

export default function InvoicePdfDocument({saleRecordOnThisMonth}) {
  const tableStyle = {
    // height: 800,
    margin: `auto`,
    width: 560,
    border: `2px solid black`,
    borderRightWidth: `1px`,
    borderBottomWidth: `1px`,
    borderCollapse: `collapse`,
    fontSize: 7,
  }

  const records = saleRecordOnThisMonth.map((record, rowIdx) => {
    return {
      csvTableRow: [
        {
          label: `商品名`,
          cellValue: record?.AqProduct?.name,
          style: {width: `20%`},
        },
      ],
    }
  })

  return (
    <Document style={ReactPdfStyles.document}>
      <Page style={{padding: 20}} size="A4" orientation="portrait">
        <View>
          <Table {...{style: tableStyle}}>
            <Tr>
              {records[0].csvTableRow.map((cell, rowIdx) => {
                return (
                  <Td
                    key={rowIdx}
                    {...{
                      style: {...cell.style, backgroundColor: `#dedede`},
                    }}
                  >
                    <Text>{cell.label}</Text>
                  </Td>
                )
              })}
            </Tr>

            {records.map((record, rowIdx) => {
              const {csvTableRow} = record

              return (
                <Tr key={rowIdx}>
                  {csvTableRow.map((cell, rowIdx) => {
                    const {cellValue} = cell

                    return (
                      <Td
                        key={rowIdx}
                        {...{
                          style: {...cell.style},
                        }}
                      >
                        <Text>{cellValue}</Text>
                      </Td>
                    )
                  })}
                </Tr>
              )
            })}
          </Table>
        </View>
      </Page>
    </Document>
  )
}
