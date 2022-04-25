import React, {useState, useEffect, useMemo} from 'react'
import {useRouter, useRouterState} from 'part:@sanity/base/router'
import S from '@sanity/base/structure-builder'
import * as rune from '@sanity/structure/lib'
import {Table} from './table/Table'
import {PublishIcon, EditIcon} from '@sanity/icons'
import sanityClient from 'part:@sanity/base/client'
import {Card, Stack, Select, Text, Checkbox, Badge} from '@sanity/ui'
import {format} from 'date-fns'
import {types} from 'config:table-view'
import {IntentLink} from 'part:@sanity/base/router'
import {DocumentTypeSelector} from "./table/DocumentTypeSelector"

const client = sanityClient.withConfig({
  apiVersion: '2022-01-01',
})

export const TableTool = () => {
  const router = useRouter()
  const {documentType} = useRouterState()
  const [data, setData] = useState<any[]>([])

  //const options = S.documentTypeListItems().map((list) => list.spec.schemaType.name)
  const options = Object.keys(types)
  const fields = types[documentType]

  const columns = useMemo(() => {
    if (!fields) return

    const sorts = (name) => ({
      boolean: (a, b) => {
        const aa = a.original[name]
        const bb = b.original[name]
        if (bb === null) return 1
        if (aa === null) return -1
        const map = {true: 1, false: 0}
        return map[aa] - map[bb]
      },
      datetime: (a, b, id, desc) => {
        const dateA = new Date(a.original[name])
        const dateB = new Date(b.original[name])
        return dateA.getTime() - dateB.getTime()
      },
    })

    return [
      ...fields.map((f) => ({
        Header: f.title || f.name,
        fieldType: f.type,
        sortType: sorts(f.name)[f.type] || 'alphanumeric',
        accessor: (row) => {
          const value = row[f.name]
          if (typeof value === 'undefined' || value === null) return
          switch (f.type) {
            case 'slug':
              return row[f.name]?.current
            case 'datetime':
              return format(new Date(row[f.name]), f.format || 'Pp')
            case 'boolean':
              return <Checkbox checked={row[f.name] === true} disabled />
            case 'portableText':
              if (value.length > 100) {
                return [value.substring(0, 100), '...'].join('')
              }
              return value
            case 'image':
              return <img src={value + `?h=${50}&auto=format`} height={50} />
            default:
              return String(value)
          }
        },
      })),
      {
        id: 'actions',
        Cell: ({row}) => {
          const {_id} = row.original
          return (
            <IntentLink intent="edit" params={{type: documentType, id: _id}}>
              Edit
            </IntentLink>
          )
        },
      },
    ]
  }, [fields])

  const fieldToProjection = (field) => {
    switch (field.type) {
      case 'portableText':
        return `"${field.name}": pt::text(${field.name})`
      case 'image':
        return `"${field.name}": ${field.name}.asset->url`
      default:
        return `"${field.name}": ${field.name}`
    }
  }

  useEffect(() => {
    setData([])
    if (!fields) return
    client
      .fetch(`* [_type == $type && _id in path('drafts.*')] {_id}`, {
        type: documentType,
      })
      .then((drafts) => {
        const query = `* [_type == $type && !(_id in $ids)] {
           _id,
          _type,
          ${fields.map(fieldToProjection).join(',')}
        }`

        console.log(query)

        return client.fetch(query, {
          type: documentType,
          ids: drafts.map((d) => d._id.split('.')[1]),
        })
      })
      .then(setData)
  }, [fields])

  if (!documentType || !fields) {
    if (documentType && !fields) return null
    router.navigate({
      documentType: options[0],
    })
    return null
  }

  const updateData = (rowIndex, columnId, value) => {
    console.log('hey', rowIndex, columnId, value)
    return
    setData((old) =>
      old.map((row, index) => {
        if (index === rowIndex) {
          return {
            ...old[rowIndex],
            [columnId]: value,
          }
        }
        return row
      })
    )
  }

  const selectType = (documentType: string) => {
    router.navigate({
      documentType,
    })
  }

  return (
    <Card padding={4}>
      <Table columns={columns} data={data} documentTypes={options} selectType={selectType} currentType={documentType}/>
    </Card>
  )
}
