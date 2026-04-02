import { Card, CardContent, Typography, Stack, Box } from "@mui/material";
import { ArrowUpward, ArrowDownward } from "@mui/icons-material";

interface StatsCardProps {
  title: string;
  value: string;
  change: string;
  icon?: React.ReactNode;
}

const StatsCard = ({ title, value, change, icon }: StatsCardProps) => {
  const isPositive = change.startsWith("+");

  return (
    <Card
      sx={{
        height: "100%",
        borderRadius: 2,
        transition: "transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out",
        "&:hover": {
          transform: "translateY(-2px)",
          boxShadow: "0 8px 25px rgba(0,0,0,0.1)",
        },
      }}
    >
      <CardContent sx={{ p: 3 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          mb={2}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {title}
          </Typography>
          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                backgroundColor: "rgba(46, 125, 50, 0.1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {icon}
            </Box>
          )}
        </Stack>

        <Typography variant="h4" fontWeight={700} mb={1}>
          {value}
        </Typography>

        <Stack direction="row" alignItems="center" spacing={0.5}>
          {isPositive ? (
            <ArrowUpward color="success" fontSize="small" />
          ) : (
            <ArrowDownward color="error" fontSize="small" />
          )}
          <Typography
            variant="body2"
            color={isPositive ? "success.main" : "error.main"}
            fontWeight={600}
          >
            {change}
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
};

export default StatsCard;
