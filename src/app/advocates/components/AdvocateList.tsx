'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { AdvocatesResponse } from '../../api/advocates/types';
import { validateAndParseFilters } from '../../api/advocates/validation';
import { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Container,
  TextField,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Grid,
  Typography,
  Pagination,
  InputAdornment,
  Skeleton,
  Stack,
  Button,
} from '@mui/material';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import { useTransition } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';

interface Props {
  initialData: AdvocatesResponse;
}

// Helper function to format phone numbers
const formatPhoneNumber = (phoneNumber: number): string => {
  // Convert to string and pad with zeros if needed
  const numStr = phoneNumber.toString().padStart(10, '0');
  
  // Format as (XXX) XXX-XXXX
  return `(${numStr.slice(0, 3)}) ${numStr.slice(3, 6)}-${numStr.slice(6)}`;
};

// Create a separate component for the specialties display
const SpecialtiesCell = ({ specialties }: { specialties: string[] }) => {
  const [expanded, setExpanded] = useState(false);
  const initialDisplay = 2;
  
  const displayedSpecialties = expanded ? specialties : specialties.slice(0, initialDisplay);
  const remainingCount = specialties.length - initialDisplay;

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, alignItems: 'center' }}>
      {displayedSpecialties.map((specialty) => (
        <Chip
          key={specialty}
          label={specialty}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ maxWidth: '200px' }}
        />
      ))}
      {!expanded && remainingCount > 0 && (
        <Chip
          label={`+${remainingCount} more`}
          size="small"
          onClick={() => setExpanded(true)}
          onDelete={() => setExpanded(true)}
          deleteIcon={<ExpandMoreIcon />}
          sx={{ cursor: 'pointer' }}
        />
      )}
      {expanded && specialties.length > initialDisplay && (
        <Chip
          label="Show less"
          size="small"
          onClick={() => setExpanded(false)}
          onDelete={() => setExpanded(false)}
          deleteIcon={<ExpandLessIcon />}
          sx={{ cursor: 'pointer' }}
        />
      )}
    </Box>
  );
};

export default function AdvocateList({ initialData }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [searchValue, setSearchValue] = useState(searchParams.get('search') || '');
  const [experienceValue, setExperienceValue] = useState(searchParams.get('minExperience') || '');
  const [isTyping, setIsTyping] = useState(false);

  // Check if any filters are active
  const hasActiveFilters = searchValue || 
    searchParams.get('specialty') || 
    searchParams.get('city') || 
    searchParams.get('degree') || 
    searchParams.get('minExperience');

  // Update local values when URL changes
  useEffect(() => {
    setSearchValue(searchParams.get('search') || '');
    setExperienceValue(searchParams.get('minExperience') || '');
    setIsTyping(false);
  }, [searchParams]);

  // Helper function to create URLSearchParams from the Next.js searchParams
  const createURLSearchParams = () => {
    const params = new URLSearchParams();
    searchParams.forEach((value, key) => {
      params.append(key, value);
    });
    return params;
  };

  const debouncedUpdateFilters = useDebouncedCallback((updates: Record<string, string | string[] | undefined>) => {
    startTransition(() => {
      const currentParams = createURLSearchParams();
      const currentFilters = validateAndParseFilters(currentParams);
      const newFilters = { ...currentFilters, ...updates };

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(newFilters)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    });
  }, 300);

  // Immediate update for select fields
  const updateFilters = (updates: Record<string, string | string[] | undefined>) => {
    startTransition(() => {
      const currentParams = createURLSearchParams();
      const currentFilters = validateAndParseFilters(currentParams);
      const newFilters = { ...currentFilters, ...updates };

      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(newFilters)) {
        if (value === undefined || value === null) continue;
        if (Array.isArray(value)) {
          value.forEach(v => params.append(key, String(v)));
        } else {
          params.set(key, String(value));
        }
      }

      router.push(`${pathname}?${params.toString()}`);
    });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchValue(value);
    setIsTyping(true);
    debouncedUpdateFilters({ search: value || undefined });
  };

  const handleExperienceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setExperienceValue(value);
    setIsTyping(true);
    debouncedUpdateFilters({ 
      minExperience: value ? String(Math.max(0, parseInt(value))) : undefined 
    });
  };

  const handleClearFilters = () => {
    setSearchValue('');
    setExperienceValue('');
    setIsTyping(false);
    router.push(pathname);
  };

  const totalPages = Math.ceil(initialData.pagination.total / initialData.pagination.limit);

  // Loading skeleton for table rows
  const TableRowSkeleton = () => (
    <TableRow>
      <TableCell><Skeleton animation="wave" /></TableCell>
      <TableCell><Skeleton animation="wave" /></TableCell>
      <TableCell><Skeleton animation="wave" /></TableCell>
      <TableCell>
        <Stack direction="row" spacing={1}>
          <Skeleton animation="wave" width={60} height={24} />
          <Skeleton animation="wave" width={60} height={24} />
        </Stack>
      </TableCell>
      <TableCell><Skeleton animation="wave" /></TableCell>
      <TableCell><Skeleton animation="wave" /></TableCell>
    </TableRow>
  );

  // No results placeholder
  const NoResults = () => (
    <TableRow>
      <TableCell colSpan={6} sx={{ border: 0 }}>
        <Box sx={{ 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          py: 8,
          color: 'text.secondary'
        }}>
          <SearchOffIcon sx={{ fontSize: 48, mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No advocates found
          </Typography>
          <Typography variant="body2">
            Try adjusting your search or filters
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {/* Title */}
        <Box 
          sx={{ 
            display: 'flex', 
            alignItems: 'center',
            cursor: 'pointer',
            width: 'fit-content',
            mb: 4,
            '&:hover': {
              opacity: 0.8
            }
          }}
          onClick={() => router.push('/')}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 'bold',
              background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              display: 'flex',
              alignItems: 'center',
              gap: 1
            }}
          >
            ← Healthcare Advocates
          </Typography>
        </Box>

        {/* Search and Filter Controls */}
        <Box>
          <Grid container spacing={2} sx={{ mb: hasActiveFilters ? 2 : 0 }}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="Search by name or specialty"
                placeholder="Enter provider name or specialty"
                variant="outlined"
                onChange={handleSearchChange}
                value={searchValue}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Specialty"
                value={searchParams.get('specialty') || ''}
                onChange={(e) => updateFilters({ specialty: e.target.value || undefined })}
              >
                <MenuItem value="">All Specialties</MenuItem>
                {initialData.filters.available.specialties.map((specialty) => (
                  <MenuItem key={specialty} value={specialty}>
                    {specialty}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="City"
                value={searchParams.get('city') || ''}
                onChange={(e) => updateFilters({ city: e.target.value || undefined })}
              >
                <MenuItem value="">All Cities</MenuItem>
                {initialData.filters.available.cities.map((city) => (
                  <MenuItem key={city} value={city}>
                    {city}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                select
                fullWidth
                label="Degree"
                value={searchParams.get('degree') || ''}
                onChange={(e) => updateFilters({ degree: e.target.value || undefined })}
              >
                <MenuItem value="">All Degrees</MenuItem>
                {initialData.filters.available.degrees.map((degree) => (
                  <MenuItem key={degree} value={degree}>
                    {degree}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={2}>
              <TextField
                type="number"
                fullWidth
                label="Min Experience"
                variant="outlined"
                InputProps={{
                  endAdornment: <InputAdornment position="end">yrs</InputAdornment>,
                  inputProps: { min: 0 }
                }}
                InputLabelProps={{
                  shrink: true,
                }}
                placeholder="0"
                value={experienceValue}
                onChange={handleExperienceChange}
              />
            </Grid>
          </Grid>
          {hasActiveFilters && (
            <Button
              startIcon={<FilterAltOffIcon />}
              onClick={handleClearFilters}
              sx={{ 
                mt: 1,
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                color: 'white',
                boxShadow: '0 3px 5px 2px rgba(255, 105, 135, .3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FE6B8B 20%, #FF8E53 80%)',
                  transform: 'scale(1.02)',
                  transition: 'transform 0.2s'
                }
              }}
            >
              Clear Filters
            </Button>
          )}
        </Box>

        {/* Advocates Table */}
        <TableContainer 
          component={Paper} 
          elevation={2}
          sx={{
            borderRadius: 2,
            overflow: 'auto',
            maxWidth: '100%',
            '&::-webkit-scrollbar': {
              height: 10
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: 'rgba(0,0,0,0.1)'
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: 'rgba(0,0,0,0.2)',
              borderRadius: 5
            }
          }}
        >
          <Table size="small" sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow sx={{ 
                background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
              }}>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Name</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>City</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Degree</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold', minWidth: '300px' }}>Specialties</TableCell>
                <TableCell align="right" sx={{ color: 'white', fontWeight: 'bold' }}>Experience</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Contact</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(isPending || isTyping) ? (
                // Show loading skeleton during transitions or typing
                [...Array(5)].map((_, index) => (
                  <TableRowSkeleton key={index} />
                ))
              ) : initialData.data.length === 0 ? (
                <NoResults />
              ) : (
                initialData.data.map((advocate) => (
                  <TableRow 
                    key={advocate.id}
                    hover
                    sx={{ 
                      '& td': { py: 1 },
                      '&:hover': { backgroundColor: 'action.hover' }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2">
                        {advocate.firstName} {advocate.lastName}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {advocate.city}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {advocate.degree}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <SpecialtiesCell specialties={advocate.specialties} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="body2">
                        {advocate.yearsOfExperience} yrs
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {formatPhoneNumber(advocate.phoneNumber)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination
            count={totalPages}
            page={initialData.pagination.page}
            onChange={(_, page) => updateFilters({ page: String(page) })}
            color="primary"
            showFirstButton
            showLastButton
            sx={{
              '& .MuiPaginationItem-root': {
                '&.Mui-selected': {
                  background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
                  color: 'white',
                  '&:hover': {
                    background: 'linear-gradient(45deg, #FE6B8B 20%, #FF8E53 80%)',
                  }
                }
              }
            }}
          />
        </Box>
      </Box>
    </Container>
  );
} 