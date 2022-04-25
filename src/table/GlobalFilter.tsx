import React, {useState} from "react"
import {debounce} from "lodash"

const DELAY = 200

export const GlobalFilter = ({
  preGlobalFilteredRows,
  globalFilter,
  setGlobalFilter,
}) => {
  return (
    <input
      value={globalFilter || ""}
      onChange={e => setGlobalFilter(e.target.value)}
      placeholder={`Filter`}
    />
  )
}