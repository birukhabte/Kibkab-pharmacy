declare module '@components/shared/DataTable' {
  import { ComponentType } from 'react'
  import { DataGridProps, GridColDef } from '@mui/x-data-grid'

  interface CustomDataGridProps extends DataGridProps {
    columns: GridColDef[]
    rows: any[]
  }

  const DataTable: ComponentType<CustomDataGridProps>
  export default DataTable
}