import { useEffect, useState } from 'react';
import { CircularProgress, Table, TableBody, TableCell, TableContainer, TableHead, TablePagination, TableRow } from '@mui/material';

export default function LazyTable({ route, dummydata, columns, defaultPageSize, rowsPerPageOptions, hasParams=false }) {
  const [data, setData] = useState(dummydata ?? []);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1); // 1 indexed
  const [pageSize, setPageSize] = useState(defaultPageSize ?? 10);

  route = hasParams ? route + "&" : route + "?";

  useEffect(() => {
    if (dummydata) return;
    setLoading(true);
    fetch(`${route}page=${page}&page_size=${pageSize}`)
      .then(res => res.json())
      .then(resJson => {
        console.log(resJson);
        setData(resJson);
        setLoading(false);
  })
  .catch(err => {
    console.error(err);
    setLoading(false);
  });
  }, [route, page, pageSize]);

  const handleChangePage = (e, newPage) => {
    if (newPage < page || data.length === pageSize) {
      setPage(newPage + 1);
    }
  }

  const handleChangePageSize = (e) => {
    const newPageSize = e.target.value;

    setPageSize(newPageSize);
    setPage(1);
  }

  const defaultRenderCell = (col, row) => {
    return <div>{row[col.field]}</div>;
  }

  return (
    <TableContainer>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
          <CircularProgress />
        </div>
      ) : (
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => <TableCell key={col.headerName}>{col.headerName}</TableCell>)}
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map((row, idx) =>
            <TableRow key={idx}>
              {
                columns.map(col =>
                  <TableCell key={col.headerName}>
                    {col.renderCell ? col.renderCell(row) : defaultRenderCell(col, row)}
                  </TableCell>
                )
              }
            </TableRow>
          )}
        </TableBody>
        <TablePagination
          rowsPerPageOptions={rowsPerPageOptions ?? [5, 10, 25]}
          count={-1}
          rowsPerPage={pageSize}
          page={page - 1}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangePageSize}
        />
      </Table>
    )}
    </TableContainer>
  )
}