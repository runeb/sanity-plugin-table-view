import React from 'react'
import {Select} from '@sanity/ui'

type DocumentTypeSelectorProps = {
  selectType: (documentType: string) => void
  options: string[]
  documentType: string
}

export const DocumentTypeSelector = ({
  selectType,
  options,
  documentType,
}: DocumentTypeSelectorProps) => {
  return (
    <Select
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => {
        selectType(event.target.value)
      }}
      fontSize={[2]}
    >
      {options.map((o) => (
        <option selected={o === documentType}>{o}</option>
      ))}
    </Select>
  )
}
