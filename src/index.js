import {TableTool} from "./TableTool"
import {route} from 'part:@sanity/base/router'

export default {
  title: 'Table',
  name: 'table-view',
  router: route('/:documentType'),
  //icon: CalendarIcon,
  component: TableTool
}