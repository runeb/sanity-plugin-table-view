const fieldValue = (row, name) => {
  const fieldType = type.fields.find((f) => f.name === name)

  switch (fieldType.type.jsonType) {
    case 'string':
      return row[name]
    case 'boolean':
      return row[name] ? row[name].toString() : ''
    case 'array':
      if (isPT(fieldType)) {
        return plainText(row[name])
      }
      return (row[name] || [])
        .map((e) => {
          if (typeof e === 'object') return e._type
          return e
        })
        .join(', ')
    case 'object':
      if (fieldType.type.name === 'slug') return row[name]?.current
      return 'object'
    default:
      console.log('name', name)
      return `Todo ${fieldType.type.jsonType}`
  }
}


useEffect(() => {
  setType(Schema.get(documentType))
}, [documentType])

const plainText = (portableText) => {
  return (
    (portableText || [])
      .filter((o) => o._type === 'block')
      .map((block) => {
        return block.children[0].text
      })
      .join(' ')
      .substring(0, 50) + '…'
  )
}

const isPT = (fieldType) => {
  return (
    fieldType.type.jsonType == 'array' &&
    fieldType.type.of.length === 1 &&
    fieldType.type.of[0].name === 'block'
  )
}

const canBeRendered = (fieldType) => {
  return isPT(fieldType) || ['string', 'boolean', 'number', 'text'].includes(fieldType.type.name)
}