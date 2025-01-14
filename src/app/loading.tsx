import { Container, Skeleton, Stack, Paper, Box } from '@mui/material';

export default function Loading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Title skeleton */}
      <Skeleton variant="text" width={300} height={60} sx={{ mb: 4 }} />

      {/* Filter controls skeleton */}
      <Stack direction="row" spacing={2} sx={{ mb: 4 }}>
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} variant="rectangular" width={200} height={56} />
        ))}
      </Stack>

      {/* Table skeleton */}
      <Paper elevation={2} sx={{ borderRadius: 2, overflow: 'hidden' }}>
        {/* Table header skeleton */}
        <Box sx={{ 
          p: 2, 
          background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
          display: 'flex',
          gap: 2
        }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton 
              key={i} 
              variant="text" 
              width={i === 3 ? 300 : 150} 
              sx={{ bgcolor: 'rgba(255,255,255,0.1)' }} 
            />
          ))}
        </Box>

        {/* Table rows skeleton */}
        {[...Array(5)].map((_, rowIndex) => (
          <Box key={rowIndex} sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid rgba(0,0,0,0.1)' }}>
            {[...Array(6)].map((_, colIndex) => (
              <Skeleton 
                key={colIndex} 
                variant="text" 
                width={colIndex === 3 ? 300 : 150} 
              />
            ))}
          </Box>
        ))}
      </Paper>

      {/* Pagination skeleton */}
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Skeleton variant="rectangular" width={300} height={36} />
      </Box>
    </Container>
  );
} 