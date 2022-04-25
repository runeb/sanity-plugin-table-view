import React from 'react'
import styled from 'styled-components'
import {useTable, useSortBy, useRowSelect, usePagination, useGlobalFilter} from 'react-table'
import {Checkbox, Grid, Box, Select, Stack, Inline, Text, TextInput, Button} from '@sanity/ui'
import {
  ArrowLeftIcon,
  ArrowRightIcon,
  ChevronRightIcon,
  ChevronLeftIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@sanity/icons'

import {GlobalFilter} from './GlobalFilter'
import {DocumentTypeSelector} from './DocumentTypeSelector'

const Styles = styled.div`
  table {
    width: 100%;
    table-layout: fixed;
    border-spacing: 0;
    border: 1px solid black;

    tr {
      :last-child {
        td {
          border-bottom: 0;
        }
      }
    }

    th,
    td {
      :first-child {
        width: 25px;
      }
      .image {
        height: 75px;
        text-align: center;
      }
      padding: 5px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      border-bottom: 1px solid black;
      border-right: 1px solid black;
      :last-child {
        border-right: 0;
        width: 50px;
      }
    }
  }
`

// Define a default UI for filtering
function DefaultColumnFilter(props) {
  const {filterValue, preFilteredRows, setFilter} = props.column
  const count = (preFilteredRows || []).length

  return (
    <input
      value={filterValue || ''}
      onChange={(e) => {
        setFilter(e.target.value || undefined) // Set undefined to remove the filter entirely
      }}
      placeholder={`Search ${count} records...`}
    />
  )
}

const IndeterminateCheckbox = React.forwardRef<HTMLInputElement>(
  ({indeterminate, ...rest}, ref) => {
    const defaultRef = React.useRef<HTMLInputElement>()
    const resolvedRef = ref || defaultRef

    React.useEffect(() => {
      resolvedRef.current.indeterminate = indeterminate
    }, [resolvedRef, indeterminate])

    return (
      <>
        <Checkbox ref={resolvedRef} {...rest} />
      </>
    )
  }
)

type TableProps = {
  columns: any[]
  data: any[]
  documentTypes: string[]
  currentType: string
  selectType: (documentType: string) => void
}

export const Table = (props: TableProps) => {
  const {columns, data} = props
  // Create an editable cell renderer
  const EditableCell = ({
    value: initialValue,
    row: {index},
    column: {id},
    updateData, // This is a custom function that we supplied to our table instance
  }) => {
    // We need to keep and update the state of the cell normally
    const [value, setValue] = React.useState(initialValue)

    const onChange = (e) => {
      setValue(e.target.value)
    }

    // We'll only update the external data when the input is blurred
    const onBlur = () => {
      updateData(index, id, value)
    }

    // If the initialValue is changed external, sync it up with our state
    React.useEffect(() => {
      setValue(initialValue)
    }, [initialValue])

    return <input value={value} onChange={onChange} onBlur={onBlur} />
  }

  const [skipPageReset, setSkipPageReset] = React.useState(false)

  // Use the state and functions returned from useTable to build your UI
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    selectedFlatRows,
    page,
    canPreviousPage,
    canNextPage,
    visibleColumns,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
    setPageSize,
    preGlobalFilteredRows,
    setGlobalFilter,
    state: {pageIndex, pageSize, selectedRowIds, globalFilter},
  } = useTable(
    {
      columns,
      data,
      initialState: {
        pageIndex: 0,
        pageSize: 10,
        sortBy: [
          {
            id: '_updatedAt',
            desc: true,
          },
        ],
      },
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        // Let's make a column for selection
        {
          id: 'selection',
          // The header can use the table's getToggleAllRowsSelectedProps method
          // to render a checkbox
          Header: ({getToggleAllRowsSelectedProps}) => (
            <IndeterminateCheckbox {...getToggleAllRowsSelectedProps()} />
          ),
          // The cell can use the individual row's getToggleRowSelectedProps method
          // to the render a checkbox
          Cell: ({row}) => <IndeterminateCheckbox {...row.getToggleRowSelectedProps()} />,
        },
        ...columns,
      ])
    }
  )

  const selectedStubs = selectedFlatRows.map((row) => {
    return {
      _id: row.original._id,
      _type: row.original._type,
    }
  })

  // Render the UI for your table
  return (
    <Styles>
      <Stack space={2}>
        <Inline space={2}>
          <DocumentTypeSelector
            selectType={props.selectType}
            options={props.documentTypes}
            documentType={props.currentType}
          />
          <Inline space={2} style={{textAlign: 'center'}}>
            <Button
              text="<<"
              alt="First page"
              onClick={() => gotoPage(0)}
              disabled={!canPreviousPage}
            ></Button>
            <Button text="<" onClick={() => previousPage()} disabled={!canPreviousPage}></Button>
            <Button text=">" onClick={() => nextPage()} disabled={!canNextPage}></Button>
            <Button
              text=">>"
              onClick={() => gotoPage(pageCount - 1)}
              disabled={!canNextPage}
            ></Button>
            <Text>
              Page{' '}
              <strong>
                {pageIndex + 1} of {pageOptions.length}
              </strong>{' '}
            </Text>
            <TextInput
              placeholder="Go to page"
              type="number"
              defaultValue={pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0
                gotoPage(page)
              }}
            />
            <Select
              value={pageSize}
              fontSize={[2]}
              onChange={(e) => {
                setPageSize(Number(e.target.value))
              }}
            >
              {[10, 20, 30, 40, 50].map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  Show {pageSize}
                </option>
              ))}
            </Select>
          </Inline>
          <Box style={{textAlign: 'right'}}>
            <Text>Selected {selectedFlatRows.length} documents</Text>
          </Box>
        </Inline>
        <table {...getTableProps()}>
          <thead>
            <tr>
              <th
                colSpan={visibleColumns.length}
                style={{
                  textAlign: 'left',
                }}
              >
                <GlobalFilter
                  preGlobalFilteredRows={preGlobalFilteredRows}
                  globalFilter={globalFilter}
                  setGlobalFilter={setGlobalFilter}
                />
              </th>
            </tr>
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => {
                  // Add the sorting props to control sorting. For this example
                  // we can add them into the header props
                  return (
                    <th {...column.getHeaderProps(column.getSortByToggleProps())}>
                      <Stack>
                        <Inline>
                          {column.render('Header')}
                          {/* Add a sort direction indicator */}
                          <span>
                            {column.isSorted ? (
                              column.isSortedDesc ? (
                                <ChevronDownIcon />
                              ) : (
                                <ChevronUpIcon />
                              )
                            ) : (
                              ''
                            )}
                          </span>
                        </Inline>
                      </Stack>
                    </th>
                  )
                })}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              prepareRow(row)
              return (
                <tr {...row.getRowProps()}>
                  {row.cells.map((cell) => {
                    return (
                      <td className={cell.column.fieldType} {...cell.getCellProps()}>
                        {cell.render('Cell')}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </Stack>
    </Styles>
  )
}
