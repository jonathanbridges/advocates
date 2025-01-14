"use client";

import { Container, Typography, Button, Box } from '@mui/material';
import { useEffect } from 'react';
import ErrorIcon from '@mui/icons-material/Error';
import RefreshIcon from '@mui/icons-material/Refresh';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <Container maxWidth="sm">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '60vh',
          textAlign: 'center',
          gap: 3,
        }}
      >
        <ErrorIcon color="error" sx={{ fontSize: 64 }} />
        
        <Typography variant="h4" component="h1" gutterBottom>
          Something went wrong!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph>
          {error.message || 'An unexpected error occurred. Please try again.'}
        </Typography>

        <Button
          variant="contained"
          onClick={reset}
          startIcon={<RefreshIcon />}
          sx={{
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            color: 'white',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FE6B8B 20%, #FF8E53 80%)',
            },
          }}
        >
          Try again
        </Button>
      </Box>
    </Container>
  );
}