import { Container, Box } from '@mui/material';
import AdvocateList from './components/AdvocateList';
import type { AdvocatesResponse } from '../api/advocates/types';
import { validateAndParseFilters } from '../api/advocates/validation';
import { headers } from 'next/headers';

async function getAdvocates(searchParams?: URLSearchParams): Promise<AdvocatesResponse> {
  const filters = validateAndParseFilters(searchParams || new URLSearchParams());
  const queryString = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined) {
      if (Array.isArray(value)) {
        value.forEach(v => queryString.append(key, String(v)));
      } else {
        queryString.set(key, String(value));
      }
    }
  });

  const headersList = headers();
  const host = headersList.get('host') || 'localhost:3000';
  const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';
  
  const url = `${protocol}://${host}/api/advocates${queryString.toString() ? `?${queryString.toString()}` : ''}`;
  
  const res = await fetch(url, {
    cache: 'no-store',
    next: {
      tags: ['advocates']
    }
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch advocates: ${res.statusText}`);
  }

  return res.json();
}

export default async function AdvocatesPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const urlSearchParams = new URLSearchParams();
  if (searchParams) {
    Object.entries(searchParams).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach(v => urlSearchParams.append(key, v));
      } else if (value) {
        urlSearchParams.set(key, value);
      }
    });
  }
  
  const data = await getAdvocates(urlSearchParams);
  
  return (
    <Container maxWidth="xl">
      <Box sx={{ py: 4 }}>
        <AdvocateList initialData={data} />
      </Box>
    </Container>
  );
} 