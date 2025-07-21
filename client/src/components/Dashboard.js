import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Paper,
  Grid,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  IconButton,
  Box,
  Chip,
  Alert,
  CircularProgress
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Dashboard as DashboardIcon
} from '@mui/icons-material';
import { DataGrid } from '@mui/x-data-grid';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ total: 0, today: 0, byLevel: [] });
  const [pagination, setPagination] = useState({
    page: 0,
    pageSize: 25,
    total: 0
  });

  // Sample columns - adjust based on your actual data structure
  const columns = [
    { field: 'id', headerName: 'ID', width: 90 },
    { field: 'timestamp', headerName: 'Timestamp', width: 180, type: 'dateTime' },
    { field: 'level', headerName: 'Level', width: 120, 
      renderCell: (params) => (
        <Chip 
          label={params.value} 
          color={
            params.value === 'ERROR' ? 'error' : 
            params.value === 'WARN' ? 'warning' : 
            params.value === 'INFO' ? 'info' : 'default'
          }
          size="small"
        />
      )
    },
    { field: 'message', headerName: 'Message', width: 400, flex: 1 },
    { field: 'source', headerName: 'Source', width: 150 },
  ];

  const fetchData = async (page = 0, pageSize = 25, search = '') => {
    setLoading(true);
    setError(null);
    
    try {
      const endpoint = search 
        ? `${API_BASE_URL}/data/search?q=${encodeURIComponent(search)}&page=${page + 1}&limit=${pageSize}`
        : `${API_BASE_URL}/data?page=${page + 1}&limit=${pageSize}`;
      
      const response = await axios.get(endpoint);
      
      if (search) {
        setData(response.data.data || []);
        setPagination(prev => ({ ...prev, total: response.data.data?.length || 0 }));
      } else {
        setData(response.data.data || []);
        setPagination({
          page,
          pageSize,
          total: response.data.pagination?.total || 0
        });
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch data');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/data/stats`);
      setStats(response.data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSearch = () => {
    setPagination(prev => ({ ...prev, page: 0 }));
    fetchData(0, pagination.pageSize, searchTerm);
  };

  const handleRefresh = () => {
    setSearchTerm('');
    setPagination(prev => ({ ...prev, page: 0 }));
    fetchData(0, pagination.pageSize);
    fetchStats();
  };

  const handlePaginationChange = (newPagination) => {
    setPagination(newPagination);
    fetchData(newPagination.page, newPagination.pageSize, searchTerm);
  };

  useEffect(() => {
    fetchData();
    fetchStats();
  }, []);

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 2 }} />
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            LogViewer Dashboard
          </Typography>
        </Toolbar>
      </AppBar>

      <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {/* Statistics Cards */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Records
                </Typography>
                <Typography variant="h4">
                  {stats.total?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Today's Records
                </Typography>
                <Typography variant="h4">
                  {stats.today?.toLocaleString() || 0}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={6}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Records by Level
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                  {stats.byLevel?.map((item, index) => (
                    <Chip 
                      key={index}
                      label={`${item.level}: ${item.count}`}
                      color={
                        item.level === 'ERROR' ? 'error' : 
                        item.level === 'WARN' ? 'warning' : 
                        item.level === 'INFO' ? 'info' : 'default'
                      }
                    />
                  )) || <Typography variant="body2">No data</Typography>}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search and Controls */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={8}>
              <TextField
                fullWidth
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={handleSearch} disabled={loading}>
                        <SearchIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <IconButton onClick={handleRefresh} disabled={loading}>
                <RefreshIcon />
              </IconButton>
              <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                Refresh Data
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Data Grid */}
        <Paper sx={{ height: 600, width: '100%' }}>
          <DataGrid
            rows={data}
            columns={columns}
            loading={loading}
            pagination
            paginationMode="server"
            rowCount={pagination.total}
            page={pagination.page}
            pageSize={pagination.pageSize}
            onPageChange={(newPage) => handlePaginationChange({ ...pagination, page: newPage })}
            onPageSizeChange={(newPageSize) => handlePaginationChange({ ...pagination, pageSize: newPageSize, page: 0 })}
            rowsPerPageOptions={[10, 25, 50, 100]}
            disableSelectionOnClick
            sx={{
              '& .MuiDataGrid-cell': {
                fontSize: '0.875rem',
              },
              '& .MuiDataGrid-columnHeaders': {
                backgroundColor: 'rgba(0, 0, 0, 0.04)',
              },
            }}
          />
        </Paper>

        {loading && (
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'center', 
              alignItems: 'center',
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            <CircularProgress />
          </Box>
        )}
      </Container>
    </Box>
  );
};

export default Dashboard;
