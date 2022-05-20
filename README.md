# sanity-plugin-table-view

A tabular view of your documents

## Installation

```
sanity install table-view
```

## Configuration

The plugin can be configured through `<your-studio-folder>/config/table-view.json`. You may add the document types and which fields you want shown in columns. You may use deep paths to values, and also array notation. See example.

### datetime
Datetime fields can also be formatted with a date-fns format string.

### portableText
portableText is a special type, as it will plain-text your portable text fields for display in a column.

Example config:

```json
{
  "types": {
    "article": [
      {"title": "Updated", "name": "_updatedAt", "type": "datetime", "format": "MMMM"},
      {"name": "hidden", "type": "boolean"},
      {"name": "slug", "type": "slug"},
      {"name": "title", "type": "string"},
      {"name": "body", "type": "portableText"}
    ],
    "story": [
      {"name": "title", "type": "string"},
      {"name": "nodes[0].title"},
      {"name": "someValues.title", "type": "string"},
      {"title": "image", "name": "someValues.image", "type": "image"}
    ],
    "post": [
      {"title": "Created", "name": "_createdAt", "type": "datetime"},
      {"title": "Updated", "name": "_updatedAt", "type": "datetime"},
      {"name": "title"},
      {"title": "authors", "name": "authors[]->name"}
    ]
  }
}
```

## License

MIT © Rune Botten
See LICENSE