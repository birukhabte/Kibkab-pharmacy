import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  Stack,
  Card,
  CardContent,
  Avatar,
  LinearProgress,
  Tooltip,
  Divider,
  useTheme,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  CreditCard as CreditCardIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  NotificationsActive as NotificationsActiveIcon,
} from "@mui/icons-material";
import { CommissionService } from "../../service/commissionService";

const COMMISSION_CHUNK = 15000;
const COMMISSION_PERCENT = 5;
const OVERDUE_DAYS = 30;

function daysSince(dateString?: string) {
  if (!dateString) return Infinity;
  const then = new Date(dateString);
  const now = new Date();
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24));
}

interface CommissionRecord {
  id: string;
  employee_id: string;
  employee_name: string;
  date: string;
  total_sold: number;
  percent: number;
  amount: number;
  paid: boolean;
}

const CommissionsPage = () => {
  const theme = useTheme();
  const [commissions, setCommissions] = useState<CommissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    commissionId: string | null;
  }>({ open: false, commissionId: null });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });
  const [pendingCommissions, setPendingCommissions] = useState(0);
  const [overdueCommissions, setOverdueCommissions] = useState(0);

  // Group commissions by employee
  const groupCommissionsByEmployee = () => {
    const grouped: Record<string, CommissionRecord[]> = {};
    
    commissions.forEach(commission => {
      if (!grouped[commission.employee_id]) {
        grouped[commission.employee_id] = [];
      }
      grouped[commission.employee_id].push(commission);
    });
    
    return grouped;
  };

  // Calculate pending and overdue commissions
  useEffect(() => {
    let pending = 0;
    let overdue = 0;
    
    commissions.forEach(commission => {
      if (!commission.paid) {
        pending++;
        if (daysSince(commission.date) > OVERDUE_DAYS) {
          overdue++;
        }
      }
    });
    
    setPendingCommissions(pending);
    setOverdueCommissions(overdue);
  }, [commissions]);

  // Fetch commissions from API
  useEffect(() => {
    const fetchCommissions = async () => {
      try {
        setLoading(true);
        const data = await CommissionService.getCommissions();
        setCommissions(data);
      } catch (error) {
        setSnackbar({
          open: true,
          message: "Failed to load commissions",
          severity: "error",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCommissions();
  }, []);

  // Handler for marking a commission as paid
  const handleMarkAsPaid = (commissionId: string) => {
    setConfirmDialog({ open: true, commissionId });
  };

  const handleConfirmMarkAsPaid = async () => {
    if (!confirmDialog.commissionId) return;
    
    try {
      await CommissionService.markCommissionAsPaid(confirmDialog.commissionId);
      
      setCommissions(prev => 
        prev.map(commission => 
          commission.id === confirmDialog.commissionId
            ? { ...commission, paid: true }
            : commission
        )
      );
      
      setSnackbar({
        open: true,
        message: "Commission marked as paid successfully!",
        severity: "success",
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: "Failed to mark commission as paid",
        severity: "error",
      });
    } finally {
      setConfirmDialog({ open: false, commissionId: null });
    }
  };

  // Get commission summary for an employee
  const getEmployeeSummary = (employeeCommissions: CommissionRecord[]) => {
    const totalEarned = employeeCommissions
      .filter(c => c.paid)
      .reduce((sum, c) => sum + c.amount, 0);
      
    const pendingPayment = employeeCommissions
      .filter(c => !c.paid)
      .reduce((sum, c) => sum + c.amount, 0);
      
    const hasOverdue = employeeCommissions.some(
      c => !c.paid && daysSince(c.date) > OVERDUE_DAYS
    );
    
    return { totalEarned, pendingPayment, hasOverdue };
  };

  const groupedCommissions = groupCommissionsByEmployee();

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: 1200, margin: "0 auto" }}>
      <Paper sx={{ p: 3, mb: 3, borderRadius: 4, boxShadow: theme.shadows[3] }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" fontWeight={700} gutterBottom>
              Employee Commissions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and manage commission payments for your team
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={2}>
            <Paper sx={{ p: 2, minWidth: 180, borderRadius: 3, bgcolor: "primary.light" }}>
              <Typography variant="subtitle2" color="primary.contrastText">
                Pending Commissions
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.contrastText">
                {pendingCommissions}
              </Typography>
            </Paper>
            
            <Paper sx={{ p: 2, minWidth: 180, borderRadius: 3, bgcolor: overdueCommissions > 0 ? "error.light" : "success.light" }}>
              <Typography variant="subtitle2" color="primary.contrastText">
                Overdue Commissions
              </Typography>
              <Typography variant="h5" fontWeight={700} color="primary.contrastText">
                {overdueCommissions}
              </Typography>
            </Paper>
          </Stack>
        </Stack>
        
        <Divider sx={{ my: 2 }} />
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
          Employees earn <strong>{COMMISSION_PERCENT}% commission</strong> for sales reaching 
          at least <strong>ETB {COMMISSION_CHUNK.toLocaleString()}</strong>. 
          Each segment represents a commission milestone.
        </Typography>
        
        <Stack spacing={3}>
          {Object.entries(groupedCommissions).map(([employeeId, employeeCommissions]) => {
            const summary = getEmployeeSummary(employeeCommissions);
            const employeeName = employeeCommissions[0]?.employee_name || "Unknown Employee";
            
            return (
              <Card
                key={employeeId}
                variant="outlined"
                sx={{ 
                  borderRadius: 3,
                  borderLeft: summary.hasOverdue
                    ? `4px solid ${theme.palette.error.main}`
                    : `4px solid ${theme.palette.success.main}`,
                  boxShadow: theme.shadows[1],
                  transition: "transform 0.3s",
                  "&:hover": {
                    transform: "translateY(-2px)",
                    boxShadow: theme.shadows[4],
                  }
                }}
              >
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={2} mb={2}>
                    <Avatar
                      sx={{ 
                        bgcolor: "primary.main", 
                        width: 56, 
                        height: 56,
                        fontSize: 24
                      }}
                    >
                      {employeeName.charAt(0)}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight={700}>
                        {employeeName}
                        {employeeCommissions.some(c => !c.paid) && (
                          <Tooltip title="Ready for commission payment">
                            <NotificationsActiveIcon 
                              color="warning" 
                              sx={{ 
                                ml: 1, 
                                verticalAlign: "middle",
                                animation: "pulse 1.5s infinite",
                                "@keyframes pulse": {
                                  "0%": { opacity: 1 },
                                  "50%": { opacity: 0.6 },
                                  "100%": { opacity: 1 },
                                }
                              }} 
                            />
                          </Tooltip>
                        )}
                      </Typography>
                    </Box>
                    <Box flexGrow={1} />
                    
                    <Stack alignItems="flex-end">
                      <Chip
                        label={`Earned: ETB ${summary.totalEarned.toLocaleString()}`}
                        color="success"
                        size="medium"
                        icon={<CheckCircleIcon />}
                        sx={{ fontWeight: 600 }}
                      />
                      {summary.pendingPayment > 0 && (
                        <Chip
                          label={`Pending: ETB ${summary.pendingPayment.toLocaleString()}`}
                          color={summary.hasOverdue ? "error" : "warning"}
                          size="medium"
                          icon={summary.hasOverdue ? <WarningIcon /> : <CreditCardIcon />}
                          sx={{ mt: 1, fontWeight: 600 }}
                        />
                      )}
                    </Stack>
                  </Stack>
                  
                  <Stack spacing={2} mt={3}>
                    {employeeCommissions.map((commission) => {
                      const daysSinceSale = daysSince(commission.date);
                      const isOverdue = !commission.paid && daysSinceSale > OVERDUE_DAYS;
                      
                      return (
                        <Box
                          key={commission.id}
                          sx={{ 
                            display: "flex", 
                            alignItems: "center", 
                            gap: 2,
                            p: 2,
                            borderRadius: 2,
                            bgcolor: commission.paid 
                              ? "success.light" 
                              : isOverdue
                                ? "error.light"
                                : "warning.light",
                            border: isOverdue 
                              ? `1px solid ${theme.palette.error.main}`
                              : "1px solid transparent"
                          }}
                        >
                          <Box sx={{ flex: 1 }}>
                            <LinearProgress
                              variant="determinate"
                              value={100}
                              color={
                                commission.paid
                                  ? "success"
                                  : isOverdue
                                    ? "error"
                                    : "warning"
                              }
                              sx={{
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: commission.paid 
                                  ? "success.100" 
                                  : isOverdue
                                    ? "error.100"
                                    : "warning.100",
                              }}
                            />
                          </Box>
                          
                          <Box sx={{ minWidth: 200, textAlign: "right" }}>
                            {commission.paid ? (
                              <Chip
                                label="Commission Paid"
                                color="success"
                                icon={<CheckCircleIcon />}
                                sx={{ fontWeight: 600 }}
                              />
                            ) : (
                              <>
                                <Chip
                                  label={isOverdue ? "OVERDUE PAYMENT" : "Ready to Pay"}
                                  color={isOverdue ? "error" : "warning"}
                                  icon={isOverdue ? <WarningIcon /> : <CreditCardIcon />}
                                  sx={{ 
                                    fontWeight: 700,
                                    mb: isOverdue ? 1 : 0
                                  }}
                                />
                                {isOverdue && (
                                  <Typography variant="caption" color="error" display="block">
                                    {daysSinceSale} days since sale
                                  </Typography>
                                )}
                              </>
                            )}
                          </Box>
                          
                          {!commission.paid && (
                            <Button
                              variant="contained"
                              color={isOverdue ? "error" : "success"}
                              size="medium"
                              onClick={() => handleMarkAsPaid(commission.id)}
                              sx={{ 
                                fontWeight: 700,
                                boxShadow: theme.shadows[2],
                                "&:hover": {
                                  boxShadow: theme.shadows[4],
                                }
                              }}
                            >
                              {isOverdue ? "Pay Now" : "Mark as Paid"}
                            </Button>
                          )}
                        </Box>
                      );
                    })}
                  </Stack>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      </Paper>
      
      {/* Confirmation Dialog */}
      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, commissionId: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ bgcolor: "primary.main", color: "white" }}>
          Confirm Commission Payment
        </DialogTitle>
        <DialogContent sx={{ py: 3 }}>
          <Stack direction="row" alignItems="center" spacing={2} mb={2}>
            <CreditCardIcon color="primary" sx={{ fontSize: 40 }} />
            <Typography variant="h6" fontWeight={600}>
              Are you sure you want to mark this commission as paid?
            </Typography>
          </Stack>
          <Typography>
            This will record a commission payment to the employee.
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setConfirmDialog({ open: false, commissionId: null })}
            variant="outlined"
            sx={{ fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmMarkAsPaid}
            variant="contained"
            color="success"
            sx={{ fontWeight: 600, boxShadow: theme.shadows[2] }}
          >
            Confirm Payment
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        ContentProps={{
          sx: {
            bgcolor: snackbar.severity === "success" 
              ? "success.main" 
              : snackbar.severity === "error"
                ? "error.main"
                : "info.main",
            fontWeight: 600,
            borderRadius: 3,
          }
        }}
      />
    </Box>
  );
};

export default CommissionsPage;
