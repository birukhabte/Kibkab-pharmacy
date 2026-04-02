import { DataGrid, DataGridProps, GridColDef } from "@mui/x-data-grid";
import { alpha } from "@mui/material/styles";
import { Box, Button, Stack, Typography, Tooltip } from "@mui/material";
import { styled } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  border: 0,
  borderRadius: "16px",
  backgroundColor: theme.palette.background.paper,
  boxShadow: "0 8px 32px rgba(0,0,0,0.08)",
  overflow: "auto",

  "& .MuiDataGrid-columnHeaders": {
    background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
    borderRadius: "16px 16px 0 0",
    borderBottom: `2px solid ${theme.palette.divider}`,
    minHeight: "64px !important",
    maxHeight: "64px !important",
    "& .MuiDataGrid-columnHeader": {
      borderRight: `1px solid ${theme.palette.divider}`,
      "&:last-child": {
        borderRight: "none",
      },
      "& .MuiDataGrid-columnHeaderTitle": {
        fontWeight: 700,
        fontSize: "0.875rem",
        color: theme.palette.text.primary,
      },
    },
  },

  "& .MuiDataGrid-cell": {
    borderRight: `1px solid ${theme.palette.divider}`,
    "&:last-child": {
      borderRight: "none",
    },
    padding: "16px 8px",
    fontSize: "0.875rem",
    whiteSpace: "normal !important",
    wordWrap: "break-word !important",
    display: "flex !important",
    alignItems: "center !important",
  },

  "& .MuiDataGrid-row": {
    minHeight: "80px !important",
    maxHeight: "none !important",
    transition: "all 0.2s ease-in-out",
    "&:hover": {
      backgroundColor: alpha(theme.palette.primary.main, 0.04),
      transform: "translateY(-1px)",
      boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    },
    "&:nth-of-type(even)": {
      backgroundColor: alpha(theme.palette.grey[50], 0.5),
    },
  },

  "& .MuiDataGrid-virtualScroller": {
    backgroundColor: theme.palette.background.paper,
    overflowX: "auto",
  },

  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar": {
    width: "8px",
    height: "8px",
  },
  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-track": {
    background: theme.palette.grey[100],
    borderRadius: "4px",
  },
  "& .MuiDataGrid-virtualScroller::-webkit-scrollbar-thumb": {
    background: theme.palette.grey[300],
    borderRadius: "4px",
    "&:hover": {
      background: theme.palette.grey[400],
    },
  },
}));

interface CustomDataGridProps extends DataGridProps {
  columns: GridColDef[];
  rows?: any[];
  data?: any[];
  minWidth?: number;
}

const DataTable = ({
  columns,
  rows,
  data,
  minWidth = 800,
  ...props
}: CustomDataGridProps) => {
  const tableData = data || rows || [];

  const enhancedColumns = columns.map((column) => ({
    ...column,
    renderCell: column.renderCell
      ? (params: any) => (
          <Tooltip title={params.value} arrow enterDelay={500}>
            <Box
              sx={{
                width: "100%",
                whiteSpace: "normal",
                wordWrap: "break-word",
                lineHeight: 1.5,
              }}
            >
              {column.renderCell(params)}
            </Box>
          </Tooltip>
        )
      : (params: any) => (
          <Tooltip title={params.value} arrow enterDelay={500}>
            <Typography noWrap sx={{ width: "100%" }}>
              {params.value}
            </Typography>
          </Tooltip>
        ),
    flex: column.flex || (column.width ? 0 : 1),
  }));

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minWidth: `${minWidth}px`,
        overflowX: "auto",
      }}
    >
      {/* Table Header */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          <Typography variant="h6" fontWeight={700} color="text.primary">
            Data Records
          </Typography>
          <Box
            sx={{
              px: 2,
              py: 0.5,
              borderRadius: 2,
              backgroundColor: "primary.50",
              color: "primary.main",
              fontSize: "0.875rem",
              fontWeight: 600,
            }}
          >
            {tableData.length} items
          </Box>
        </Stack>
      </Box>

      {/* Data Grid */}
      <Box
        sx={{
          px: 3,
          pb: 2,
          minWidth: `${minWidth}px`,
          height: "600px",
          overflow: "auto",
        }}
      >
        <StyledDataGrid
          columns={enhancedColumns}
          rows={tableData}
          getRowId={(row) => row.id}
          initialState={{
            pagination: { paginationModel: { pageSize: 10, page: 0 } },
          }}
          {...props}
        />
      </Box>
    </Box>
  );
};

export default DataTable;
