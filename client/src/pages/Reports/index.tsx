import {
  Box,
  Typography,
  Paper,
  Stack,
  Chip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  Skeleton,
  Fade,
  useTheme,
} from "@mui/material";
import { Grid } from "@mui/material";
import {
  TrendingUp,
  AttachMoney,
  ShoppingCart,
  BarChart,
  PieChartOutline,
  LocalPharmacy,
  CalendarToday,
} from "@mui/icons-material";
import AnalyticsService from "../../service/AnalyticsService";
import { format, startOfMonth, endOfDay } from "date-fns";
import { useState, useEffect } from "react";

const ReportsPage = () => {
  const theme = useTheme();
  const [revenueData, setRevenueData] = useState<{
    total?: Record<string, any>;
    branches?: any[];
  }>({ total: {}, branches: [] });
  const [topProducts, setTopProducts] = useState([]);
  const [categoryBreakdown, setCategoryBreakdown] = useState([]);
  const [branchPerformance, setBranchPerformance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get current month date range
  const getDateRange = () => {
    const startDate = startOfMonth(new Date());
    const endDate = endOfDay(new Date());

    return {
      start_date: startDate.toISOString(),
      end_date: endDate.toISOString(),
    };
  };

  // Fetch analytics data
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const dateRange = getDateRange();

      // Fetch all data in parallel
      const [revenueRes, productsRes, categoriesRes] = await Promise.all([
        AnalyticsService.getRevenue(dateRange),
        AnalyticsService.getTopProducts(dateRange),
        AnalyticsService.getTopCategories(dateRange),
      ]);

      // Handle possible null responses with defaults
      setRevenueData(revenueRes?.data || { total: {}, branches: [] });
      setTopProducts(productsRes?.data || []);
      setCategoryBreakdown(categoriesRes?.data || []);

      // Transform branch data
      const branches = (revenueRes?.data?.branches || []).map((branch) => {
        const revenue = branch.branch_revenue || 0;
        const target = Math.round(revenue * 1.3);
        const percentage =
          target > 0 ? Math.min(100, Math.round((revenue / target) * 100)) : 0;

        return {
          name: branch.branch_name || "Unknown Branch",
          sales: branch.total_sales || 0,
          revenue: revenue,
          target: target,
          percentage: percentage,
        };
      });

      setBranchPerformance(branches);
    } catch (err) {
      console.error("Analytics fetch error:", err);
      setError("Failed to load data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  // Format currency
  const formatCurrency = (amount) => {
    const value = typeof amount === "number" ? amount : 0;
    return `ብር ${value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  // Get date range display text
  const getDateRangeText = () => {
    const start = startOfMonth(new Date());
    const end = new Date();

    return `${format(start, "MMM dd")} - ${format(end, "MMM dd, yyyy")}`;
  };

  // Loading skeleton for metrics
  const MetricSkeleton = () => (
    <Skeleton
      variant="rounded"
      width="100%"
      height={120}
      sx={{ borderRadius: 3 }}
    />
  );

  // Loading skeleton for cards
  const CardSkeleton = ({ height }) => (
    <Skeleton
      variant="rounded"
      width="100%"
      height={height}
      sx={{ borderRadius: 3 }}
    />
  );

  // Gradient colors for metrics
  const metricGradients = [
    "linear-gradient(135deg, #2E7D32 0%, #4CAF50 100%)",
    "linear-gradient(135deg, #1976D2 0%, #42A5F5 100%)",
  ];

  // Category colors
  const categoryColors = [
    theme.palette.primary.main,
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.error.main,
    theme.palette.info.main,
  ];

  // Calculate overall revenue percentage safely
  const totalRevenue = (revenueData?.total as any)?.branch_revenue || 0;
  const totalTarget = Math.round(totalRevenue * 1.3);
  const totalPercentage =
    totalTarget > 0
      ? Math.min(100, Math.round((totalRevenue / totalTarget) * 100))
      : 0;

  return (
    <Box sx={{ p: 3 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={4}
        gap={2}
      >
        <Box>
          <Typography
            variant="h4"
            fontWeight={800}
            color="text.primary"
            mb={0.5}
          >
            Pharmacy Analytics Dashboard
          </Typography>
          <Stack direction="row" alignItems="center" gap={1}>
            <LocalPharmacy color="primary" />
            <Typography variant="body1" color="text.secondary">
              Comprehensive insights into your pharmacy performance
            </Typography>
          </Stack>
        </Box>

        <FormControl size="small" sx={{ minWidth: 180 }}>
          <InputLabel>Reporting Period</InputLabel>
          <Select
            value="current_month"
            label="Reporting Period"
            sx={{ borderRadius: 2 }}
          >
            <MenuItem value="current_month">Current Month</MenuItem>
          </Select>
        </FormControl>
      </Stack>

      {/* Date Range Indicator */}
      <Box mb={4}>
        <Chip
          label={`Current Month: ${getDateRangeText()}`}
          icon={<CalendarToday fontSize="small" />}
          sx={{
            backgroundColor: theme.palette.background.paper,
            border: `1px solid ${theme.palette.divider}`,
            fontWeight: 500,
            px: 1,
            py: 1.5,
          }}
        />
      </Box>

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[0, 1].map((index) => (
          <Grid size={{ xs: 12, sm: 6, md: 6 }} key={index}>
            {loading ? (
              <MetricSkeleton />
            ) : (
              <Fade in={!loading} timeout={500}>
                <Paper
                  sx={{
                    p: 3,
                    borderRadius: 3,
                    background: metricGradients[index],
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: theme.shadows[4],
                    transition: "transform 0.3s ease, box-shadow 0.3s ease",
                    "&:hover": {
                      transform: "translateY(-5px)",
                      boxShadow: theme.shadows[8],
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: -50,
                      right: -50,
                      width: 120,
                      height: 120,
                      background: "rgba(255,255,255,0.1)",
                      borderRadius: "50%",
                    },
                    "&::after": {
                      content: '""',
                      position: "absolute",
                      bottom: -30,
                      left: -30,
                      width: 80,
                      height: 80,
                      background: "rgba(255,255,255,0.05)",
                      borderRadius: "50%",
                    },
                  }}
                >
                  <Stack
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                  >
                    <Box position="relative" zIndex={1}>
                      <Typography variant="h4" fontWeight={800}>
                        {index === 0 && formatCurrency(totalRevenue)}
                        {index === 1 && (revenueData?.total?.total_sales || 0)}
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ opacity: 0.9, mt: 0.5 }}
                      >
                        {index === 0 && "Total Revenue"}
                        {index === 1 && "Total Sales"}
                      </Typography>
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={0.5}
                        mt={1}
                      >
                        <TrendingUp fontSize="small" />
                        <Typography variant="caption">
                          Current month performance
                        </Typography>
                      </Stack>
                    </Box>
                    <Box position="relative" zIndex={1}>
                      {index === 0 && (
                        <AttachMoney sx={{ fontSize: 40, opacity: 0.8 }} />
                      )}
                      {index === 1 && (
                        <ShoppingCart sx={{ fontSize: 40, opacity: 0.8 }} />
                      )}
                    </Box>
                  </Stack>
                </Paper>
              </Fade>
            )}
          </Grid>
        ))}
      </Grid>

      {/* Branch Performance Overview */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          background: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          boxShadow: theme.shadows[2],
        }}
      >
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          mb={3}
        >
          <Typography variant="h5" fontWeight={700}>
            Branch Performance Overview
          </Typography>
          <Chip
            label="Sales Targets"
            variant="outlined"
            size="small"
            sx={{ fontWeight: 500 }}
          />
        </Stack>

        {loading ? (
          <Grid container spacing={3}>
            {[0, 1].map((index) => (
              <Grid size={{ xs: 12, sm: 6 }} key={index}>
                <CardSkeleton height={120} />
              </Grid>
            ))}
          </Grid>
        ) : (
          <Fade in={!loading} timeout={600}>
            <Grid container spacing={3}>
              {branchPerformance.map((branch, index) => (
                <Grid size={{ xs: 12, sm: 6 }} key={index}>
                  <Box
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      backgroundColor: theme.palette.background.default,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: "all 0.3s ease",
                      "&:hover": {
                        transform: "translateY(-5px)",
                        boxShadow: theme.shadows[4],
                        borderColor: theme.palette.primary.main,
                      },
                    }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      mb={2}
                    >
                      <Typography
                        variant="subtitle1"
                        fontWeight={600}
                        noWrap
                        sx={{ maxWidth: "70%" }}
                      >
                        {branch.name}
                      </Typography>
                      <Typography
                        variant="h6"
                        fontWeight={800}
                        color={
                          branch.percentage >= 90
                            ? "success.main"
                            : branch.percentage >= 80
                            ? "warning.main"
                            : "error.main"
                        }
                      >
                        {branch.percentage}%
                      </Typography>
                    </Stack>
                    <LinearProgress
                      variant="determinate"
                      value={branch.percentage}
                      color={
                        branch.percentage >= 90
                          ? "success"
                          : branch.percentage >= 80
                          ? "warning"
                          : "error"
                      }
                      sx={{
                        height: 10,
                        borderRadius: 5,
                        backgroundColor: theme.palette.grey[200],
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 5,
                        },
                      }}
                    />
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      mt={1.5}
                    >
                      <Typography variant="caption" color="text.secondary">
                        {formatCurrency(branch.revenue)}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Target: {formatCurrency(branch.target)}
                      </Typography>
                    </Stack>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Fade>
        )}
      </Paper>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Top Products Card */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 3,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={700}>
                Top Selling Products
              </Typography>
              <Chip
                label={`Showing ${Math.min(5, topProducts.length)} items`}
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Stack>

            {loading ? (
              <CardSkeleton height={300} />
            ) : (
              <Fade in={!loading} timeout={700}>
                <Box sx={{ flex: 1 }}>
                  <Stack spacing={2}>
                    {topProducts.slice(0, 5).map((product, index) => {
                      const maxSold = topProducts[0]?.total_sold || 1;
                      const percentage = product.total_sold
                        ? Math.min(100, (product.total_sold / maxSold) * 100)
                        : 0;

                      return (
                        <Box
                          key={index}
                          sx={{
                            p: 2,
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.default,
                            border: `1px solid ${theme.palette.divider}`,
                            transition: "all 0.2s ease",
                            "&:hover": {
                              transform: "translateX(5px)",
                              borderColor: theme.palette.primary.main,
                            },
                          }}
                        >
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                          >
                            <Stack>
                              <Typography fontWeight={700}>
                                {product.medicine_name || "Unknown Product"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                ID:{" "}
                                {product.medicine_id
                                  ? product.medicine_id.substring(0, 8)
                                  : "N/A"}
                              </Typography>
                            </Stack>
                            <Chip
                              label={`${product.total_sold || 0} sold`}
                              color="primary"
                              size="small"
                              sx={{ fontWeight: 700 }}
                            />
                          </Stack>
                          <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                              mt: 1,
                              height: 6,
                              borderRadius: 3,
                              backgroundColor: theme.palette.grey[200],
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 3,
                                background: `linear-gradient(90deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                              },
                            }}
                          />
                        </Box>
                      );
                    })}
                  </Stack>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        {/* Category Breakdown Card */}
       <Grid size={{ xs: 12, md: 5 }}>
          <Paper
            sx={{
              p: 3,
              height: "100%",
              borderRadius: 3,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={3}
            >
              <Typography variant="h6" fontWeight={700}>
                Sales by Category
              </Typography>
              <Chip
                icon={<PieChartOutline fontSize="small" />}
                label="Breakdown"
                size="small"
                sx={{ fontWeight: 500 }}
              />
            </Stack>

            {loading ? (
              <CardSkeleton height={300} />
            ) : (
              <Fade in={!loading} timeout={800}>
                <Box sx={{ flex: 1 }}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          height: 200,
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {categoryBreakdown.length > 0 ? (
                          <Box
                            sx={{
                              width: 160,
                              height: 160,
                              borderRadius: "50%",
                              background:
                                "conic-gradient(" +
                                categoryBreakdown
                                  .map(
                                    (cat, i) =>
                                      `${categoryColors[i]} ${
                                        i === 0
                                          ? 0
                                          : categoryBreakdown
                                              .slice(0, i)
                                              .reduce(
                                                (acc, curr) =>
                                                  acc + (curr.percentage || 0),
                                                0
                                              )
                                      }% ` +
                                      `${categoryColors[i]} ${categoryBreakdown
                                        .slice(0, i + 1)
                                        .reduce(
                                          (acc, curr) =>
                                            acc + (curr.percentage || 0),
                                          0
                                        )}%`
                                  )
                                  .join(", ") +
                                ")",
                              boxShadow: theme.shadows[1],
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              border: `8px solid ${theme.palette.background.default}`,
                            }}
                          >
                            <Box
                              sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                backgroundColor:
                                  theme.palette.background.default,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                border: `4px solid ${theme.palette.background.paper}`,
                              }}
                            >
                              <Typography variant="h6" fontWeight={700}>
                                {categoryBreakdown.reduce(
                                  (acc, curr) => acc + (curr.percentage || 0),
                                  0
                                )}
                                %
                              </Typography>
                            </Box>
                          </Box>
                        ) : (
                          <Typography variant="body1" color="text.secondary">
                            No category data available
                          </Typography>
                        )}
                      </Box>
                    </Grid>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Stack spacing={2} mt={{ xs: 2, md: 0 }}>
                        {categoryBreakdown.length > 0 ? (
                          categoryBreakdown.map((item, index) => (
                            <Box key={index}>
                              <Stack
                                direction="row"
                                justifyContent="space-between"
                                alignItems="center"
                                mb={0.5}
                              >
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  gap={1}
                                >
                                  <Box
                                    sx={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: "50%",
                                      backgroundColor: categoryColors[index],
                                    }}
                                  />
                                  <Typography variant="body2" fontWeight={600}>
                                    {item.category || "Unknown"}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" fontWeight={700}>
                                  {item.percentage || 0}%
                                </Typography>
                              </Stack>
                              <LinearProgress
                                variant="determinate"
                                value={item.percentage || 0}
                                sx={{
                                  height: 8,
                                  borderRadius: 4,
                                  backgroundColor: theme.palette.grey[200],
                                  "& .MuiLinearProgress-bar": {
                                    backgroundColor: categoryColors[index],
                                    borderRadius: 4,
                                  },
                                }}
                              />
                            </Box>
                          ))
                        ) : (
                          <Typography variant="body2" color="text.secondary">
                            No category data available
                          </Typography>
                        )}
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>

        {/* Revenue Performance Card */}
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              background: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Typography variant="h6" fontWeight={700} mb={3}>
              Revenue Performance
            </Typography>

            {loading ? (
              <CardSkeleton height={200} />
            ) : (
              <Fade in={!loading} timeout={800}>
                <Box>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          Overall Revenue
                        </Typography>
                        <Box textAlign="center" mb={2}>
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            color="primary"
                          >
                            {totalPercentage}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            of target achieved
                          </Typography>
                        </Box>
                        <LinearProgress
                          variant="determinate"
                          value={totalPercentage}
                          color="primary"
                          sx={{
                            height: 10,
                            borderRadius: 5,
                            mb: 1,
                          }}
                        />
                        <Stack direction="row" justifyContent="space-between">
                          <Typography variant="body2">
                            Achieved: {formatCurrency(totalRevenue)}
                          </Typography>
                          <Typography variant="body2">
                            Target: {formatCurrency(totalTarget)}
                          </Typography>
                        </Stack>
                      </Paper>
                    </Grid>

                    <Grid size={{ xs: 12, md: 6 }}>
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          background: theme.palette.background.default,
                          border: `1px solid ${theme.palette.divider}`,
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600} mb={2}>
                          Sales Distribution
                        </Typography>
                        <Box textAlign="center">
                          <Typography
                            variant="h4"
                            fontWeight={800}
                            color="secondary"
                          >
                            {revenueData?.total?.total_sales || 0}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            Total Transactions
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  </Grid>
                </Box>
              </Fade>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ReportsPage;
