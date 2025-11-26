'use client';

import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import { useMemo, useState } from 'react';
import Link from 'next/link';

import { useOrdersQuery } from '../../hooks/panel/useOrdersQuery';

export default function PanelDashboardPage() {
  const [today] = useState(() => new Date().toISOString().slice(0, 10));
  const { data: todayData } = useOrdersQuery({ dateFrom: today, dateTo: today, pageSize: 50 });
  const { data: allData } = useOrdersQuery({ pageSize: 50 });
  const { data: recentOrdersData } = useOrdersQuery({ dateFrom: today, dateTo: today, pageSize: 5 });

  const todayCount = useMemo(() => todayData?.meta?.total ?? 0, [todayData]);
  const totalCount = useMemo(() => allData?.meta?.total ?? 0, [allData]);
  
  const statusCounts = useMemo(() => {
    if (!allData?.data) return {};
    
    return allData.data.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [allData]);

  const recentOrders = useMemo(() => {
    return recentOrdersData?.data || [];
  }, [recentOrdersData]);

  return (
    <Stack spacing={4}>
      {/* Header */}
      <Paper elevation={2} sx={{ p: 3 }}>
        <Stack spacing={1}>
          <Typography variant="h4" fontWeight="bold">
            📊 Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Przegląd rezerwacji i statystyk
          </Typography>
        </Stack>
      </Paper>

      {/* Statistics Cards */}
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'primary.light',
                  color: 'primary.contrastText'
                }}>
                  📅
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="primary">
                    {todayCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Dzisiejsze rezerwacje
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button 
                size="small" 
                component={Link} 
                href={`/panel/rezerwacje?dateFrom=${today}&dateTo=${today}`}
              >
                Zobacz wszystkie
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'success.light',
                  color: 'success.contrastText'
                }}>
                  📋
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="success.main">
                    {totalCount}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Wszystkie rezerwacje
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/panel/rezerwacje">
                Zobacz wszystkie
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'warning.light',
                  color: 'warning.contrastText'
                }}>
                  ⏳
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="warning.main">
                    {statusCounts.PENDING_PAYMENT || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Oczekujące na płatność
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/panel/rezerwacje?status=PENDING_PAYMENT">
                Zobacz
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card elevation={2} sx={{ height: '100%' }}>
            <CardContent>
              <Stack direction="row" alignItems="center" spacing={2}>
                <Box sx={{ 
                  p: 2, 
                  borderRadius: 2, 
                  backgroundColor: 'info.light',
                  color: 'info.contrastText'
                }}>
                  ✅
                </Box>
                <Box>
                  <Typography variant="h4" fontWeight="bold" color="info.main">
                    {statusCounts.PAID || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Opłacone
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
            <CardActions>
              <Button size="small" component={Link} href="/panel/rezerwacje?status=PAID">
                Zobacz
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>

      {/* Recent Orders */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" color="primary">
              📝 Ostatnie rezerwacje
            </Typography>
            <Button 
              variant="outlined" 
              component={Link} 
              href={`/panel/rezerwacje?dateFrom=${today}&dateTo=${today}`}
            >
              Zobacz wszystkie
            </Button>
          </Stack>
          
          {recentOrders.length === 0 ? (
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
              Brak rezerwacji
            </Typography>
          ) : (
            <Grid container spacing={2}>
              {recentOrders.map((order) => (
                <Grid item xs={12} sm={6} md={4} key={order.id}>
                  <Card variant="outlined" sx={{ height: '100%' }}>
                    <CardContent>
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {order.customerName}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.orderNumber || order.id}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {order.customerEmail}
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip 
                            label={order.status} 
                            size="small" 
                            color={
                              order.status === 'PAID' ? 'success' :
                              order.status === 'PENDING_PAYMENT' ? 'warning' :
                              order.status === 'CANCELLED' ? 'error' : 'default'
                            }
                          />
                          <Typography variant="body2" fontWeight="bold">
                            {((order.totalAmount || 0) / 100).toFixed(2)} PLN
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                    <CardActions>
                      <Button size="small" component={Link} href={`/panel/rezerwacje/${order.id}`}>
                        Szczegóły
                      </Button>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Stack>
      </Paper>

      {/* Quick Actions */}
      <Paper elevation={1} sx={{ p: 3 }}>
        <Stack spacing={3}>
          <Typography variant="h6" color="primary">
            ⚡ Szybkie akcje
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="contained" 
                fullWidth 
                component={Link} 
                href="/panel/rezerwacje/nowa"
                sx={{ py: 2 }}
              >
                ➕ Nowa rezerwacja
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                component={Link} 
                href="/panel/rezerwacje"
                sx={{ py: 2 }}
              >
                📋 Wszystkie rezerwacje
              </Button>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Button 
                variant="outlined" 
                fullWidth 
                component={Link} 
                href="/panel/uzytkownicy"
                sx={{ py: 2 }}
              >
                👥 Użytkownicy
              </Button>
            </Grid>
          </Grid>
        </Stack>
      </Paper>
    </Stack>
  );
}
