import { Typography, Button, Box } from '@mui/material';
import { Link } from 'react-router-dom';

const ServerError = () => {
  return (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      minHeight="80vh"
      textAlign="center"
    >
      <Typography variant="h1" gutterBottom>
        500
      </Typography>
      <Typography variant="h4" gutterBottom>
        Server Error
      </Typography>
      <Typography variant="body1" paragraph>
        Something went wrong on our end. Please try again later.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        component={Link}
        to="/dashboard"
        sx={{ mt: 3 }}
      >
        Go to Dashboard
      </Button>
    </Box>
  );
};

export default ServerError;
