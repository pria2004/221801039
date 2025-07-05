import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Divider,
} from '@mui/material';

export default function Stats() {
  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    const stored = localStorage.getItem('shortenedUrls');
    if (stored) {
      const parsed = JSON.parse(stored);
      setStatsData(parsed);
    }
  }, []);

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Shortened URL Statistics
      </Typography>

      {statsData.length === 0 ? (
        <Typography variant="body1" sx={{ mt: 2 }}>
          No shortened URLs found for this session.
        </Typography>
      ) : (
        statsData.map((entry, index) => (
          <Box key={index} sx={{ mt: 4 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Shortcode:{' '}
                  <a
                    href={`http://localhost:3000/${entry.shortcode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {entry.shortcode}
                  </a>
                </Typography>
                <Typography><strong>Original URL:</strong> {entry.originalUrl}</Typography>
                <Typography><strong>Created At:</strong> {new Date(entry.createdAt).toLocaleString()}</Typography>
                <Typography><strong>Expires At:</strong> {new Date(entry.expiresAt).toLocaleString()}</Typography>
                <Typography><strong>Total Clicks:</strong> {entry.clicks?.length || 0}</Typography>

                {entry.clicks && entry.clicks.length > 0 && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Typography variant="subtitle1" gutterBottom>
                      Click Logs
                    </Typography>

                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell><strong>Timestamp</strong></TableCell>
                          <TableCell><strong>Source</strong></TableCell>
                          <TableCell><strong>Location</strong></TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {entry.clicks.map((click, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{new Date(click.timestamp).toLocaleString()}</TableCell>
                            <TableCell>{click.source || 'Direct / Unknown'}</TableCell>
                            <TableCell>{click.location || 'Unknown'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </>
                )}
              </CardContent>
            </Card>
          </Box>
        ))
      )}
    </Container>
  );
}
