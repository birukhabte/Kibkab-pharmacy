import { 
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  Autocomplete,
  InputAdornment,
  styled,
  useTheme
} from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

type DrugFormData = {
  name: string;
  brand: string;
  category: string;
  description: string; // Now required
};

const categories = [
  'Antibiotic',
  'Pain Relief',
  'Antihistamine',
  'Antacid',
  'Vitamin',
  'Other'
];

// Styled components for enhanced UI
const SuccessButton = styled(Button)(({ theme }) => ({
  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
  fontWeight: 600,
  letterSpacing: '0.5px',
  boxShadow: theme.shadows[3],
  '&:hover': {
    boxShadow: theme.shadows[6],
    transform: 'translateY(-2px)'
  },
  transition: 'all 0.3s ease'
}));

const DrugForm = ({ 
  open, 
  onClose,
  onSubmit
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: DrugFormData) => void;
}) => {
  const theme = useTheme();
  const { 
    register, 
    handleSubmit, 
    reset,
    control,
    formState: { errors, isValid } 
  } = useForm<DrugFormData>({
    mode: 'onChange',
    defaultValues: {
      name: '',
      brand: '',
      category: '',
      description: ''
    }
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  const submitHandler = (data: DrugFormData) => {
    onSubmit(data);
    reset();
  };

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="sm" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 3,
          background: theme.palette.background.paper,
          backgroundImage: 'linear-gradient(rgba(255, 255, 255, 0.05), rgba(255, 255, 255, 0.05))'
        }
      }}
    >
      <DialogTitle 
        variant="h5" 
        sx={{ 
          fontWeight: 700, 
          bgcolor: theme.palette.primary.main,
          color: theme.palette.common.white,
          borderTopLeftRadius: 'inherit',
          borderTopRightRadius: 'inherit',
          py: 2
        }}
      >
        Add New Medicine
      </DialogTitle>
      
      <form onSubmit={handleSubmit(submitHandler)}>
        <DialogContent sx={{ py: 3 }}>
          <Stack spacing={3}>
            <TextField
              label="Medicine Name"
              fullWidth
              variant="outlined"
              autoFocus
              {...register('name', { 
                required: 'Medicine name is required',
                minLength: { value: 3, message: 'Name must be at least 3 characters' }
              })}
              error={!!errors.name}
              helperText={errors.name?.message}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <CheckCircleOutlineIcon 
                      color={errors.name ? 'error' : isValid ? 'success' : 'disabled'} 
                    />
                  </InputAdornment>
                )
              }}
            />

            <TextField
              label="Brand"
              fullWidth
              {...register('brand', { 
                required: 'Brand is required',
                minLength: { value: 2, message: 'Brand must be at least 2 characters' }
              })}
              error={!!errors.brand}
              helperText={errors.brand?.message}
            />

            <Controller
              name="category"
              control={control}
              rules={{ required: 'Category is required' }}
              render={({ field: { onChange, value, ref } }) => (
                <Autocomplete
                  freeSolo
                  options={categories}
                  value={value}
                  onChange={(_, newValue) => onChange(newValue)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Category"
                      inputRef={ref}
                      error={!!errors.category}
                      helperText={errors.category?.message}
                      placeholder="Select or enter category"
                    />
                  )}
                />
              )}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              {...register('description', {
                required: 'Description is required',
                minLength: { value: 5, message: 'Description must be at least 5 characters' }
              })}
              error={!!errors.description}
              helperText={errors.description?.message}
            />
          </Stack>
        </DialogContent>

        <DialogActions sx={{ p: 3, borderTop: `1px solid ${theme.palette.divider}` }}>
          <Button 
            onClick={handleClose} 
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1
            }}
          >
            Cancel
          </Button>
          <SuccessButton 
            type="submit" 
            variant="contained"
            disabled={!isValid}
            sx={{ 
              borderRadius: 2,
              px: 3,
              py: 1,
              minWidth: 140
            }}
          >
            Save Medicine
          </SuccessButton>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default DrugForm;
