import { Options } from 'material-table'

import theme from 'src/styles/theme'

/**
 * Default table options for dynamic MaterialTable instances.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const defaultTableOptions: Options<any> = {
  emptyRowsWhenPaging: false,
  pageSize: 25,
  showEmptyDataSourceMessage: false,
  showTitle: false,
  search: true,
  toolbar: true,
  searchFieldVariant: 'standard',
  searchFieldAlignment: 'left',
  pageSizeOptions: [],
  showFirstLastPageButtons: false,
  headerStyle: {
    fontWeight: theme.custom.fontWeights.monospaceBold,
  },
  rowStyle: {
    opacity: 0.8,
  },
}

/**
 * Create an Options object that can be passed to MaterialTable to create a static table with no toolbar or pagination.
 *
 * @param numRows the exact number of rows that the table should have.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function createStaticTableOptions(numRows: number): Options<any> {
  return {
    ...defaultTableOptions,
    pageSize: numRows,
    draggable: false,
    paging: false,
    sorting: false,
    toolbar: false,
  }
}
