"use client";

import { Container, Typography, Button, Box } from '@mui/material';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <Container maxWidth="lg">
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          textAlign: 'center',
          gap: 4,
        }}
      >
        <Typography
          variant="h2"
          component="h1"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Welcome to Solace Health
        </Typography>
        
        <Typography variant="h5" color="text.secondary" paragraph>
          Connect with healthcare advocates who understand your needs
        </Typography>

        <Button
          variant="contained"
          size="large"
          onClick={() => router.push('/advocates')}
          sx={{
            mt: 2,
            px: 4,
            py: 1.5,
            borderRadius: 2,
            background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
            boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
            '&:hover': {
              background: 'linear-gradient(45deg, #FE6B8B 20%, #FF8E53 80%)',
              transform: 'scale(1.05)',
              transition: 'transform 0.2s',
            },
          }}
        >
          Find Healthcare Advocates
        </Button>
      </Box>
    </Container>
  );
}
