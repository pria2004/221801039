import React, { useState } from 'react';
import {
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  Alert,
} from '@mui/material';

const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

const isAlphanumeric = (str) => /^[a-z0-9]+$/i.test(str);

// Helper to generate random shortcode
const generateShortcode = () => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
};

// Helpers for localStorage
const loadFromStorage = () => {
  const data = localStorage.getItem('shortenedUrls');
  return data ? JSON.parse(data) : [];
};

const saveToStorage = (data) => {
  localStorage.setItem('shortenedUrls', JSON.stringify(data));
};

export default function UrlForm() {
  const [formData, setFormData] = useState(
    Array.from({ length: 5 }, () => ({
      originalUrl: '',
      validity: '',
      shortcode: '',
    }))
  );

  const [errors, setErrors] = useState([]);
  const [submittedData, setSubmittedData] = useState([]);

  const handleChange = (index, field, value) => {
    const newData = [...formData];
    newData[index][field] = value;
    setFormData(newData);
  };

  const validate = () => {
    const errorList = [];

    formData.forEach((entry, i) => {
      const entryErrors = [];

      if (entry.originalUrl.trim() === '') {
        entryErrors.push('Original URL is required.');
      } else if (!isValidUrl(entry.originalUrl)) {
        entryErrors.push('Invalid URL format.');
      }

      if (entry.validity) {
        const minutes = parseInt(entry.validity);
        if (isNaN(minutes) || minutes <= 0) {
          entryErrors.push('Validity must be a positive number.');
        }
      }

      if (entry.shortcode) {
        if (!isAlphanumeric(entry.shortcode)) {
          entryErrors.push('Shortcode must be alphanumeric.');
        }
        if (entry.shortcode.length < 4 || entry.shortcode.length > 10) {
          entryErrors.push('Shortcode must be 4 to 10 characters.');
        }
      }

      if (entryErrors.length > 0) {
        errorList[i] = entryErrors;
      }
    });

    return errorList;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    const hasErrors = validationErrors.some((err) => err && err.length > 0);
    if (hasErrors) return;

    const existing = loadFromStorage();
    const now = new Date();

    try {
      const newUrls = formData
        .filter((entry) => entry.originalUrl.trim() !== '')
        .map((entry) => {
          const validityInMinutes = parseInt(entry.validity) || 30;
          const expiresAt = new Date(now.getTime() + validityInMinutes * 60000);
          let shortcode = entry.shortcode?.trim();

          // Ensure unique shortcode
          const allCodes = existing.map((item) => item.shortcode);
          if (!shortcode) {
            do {
              shortcode = generateShortcode();
            } while (allCodes.includes(shortcode));
          } else if (allCodes.includes(shortcode)) {
            throw new Error(`Shortcode "${shortcode}" already exists.`);
          }

          return {
            originalUrl: entry.originalUrl.trim(),
            shortcode,
            createdAt: now.toISOString(),
            expiresAt: expiresAt.toISOString(),
            clicks: [],
          };
        });

      const updated = [...existing, ...newUrls];
      saveToStorage(updated);
      setSubmittedData(newUrls);
      alert('Shortened successfully! Check the statistics page.');
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="h4" gutterBottom>
        URL Shortener
      </Typography>

      <Grid container spacing={3}>
        {formData.map((data, index) => (
          <Grid item xs={12} key={index}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  URL #{index + 1}
                </Typography>

                {errors[index] &&
                  errors[index].map((err, i) => (
                    <Alert severity="error" key={i} sx={{ mb: 1 }}>
                      {err}
                    </Alert>
                  ))}

                <Box sx={{ mb: 2 }}>
                  <TextField
                    fullWidth
                    required
                    label="Original URL"
                    value={data.originalUrl}
                    onChange={(e) =>
                      handleChange(index, 'originalUrl', e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Validity (minutes, optional)"
                    type="number"
                    value={data.validity}
                    onChange={(e) =>
                      handleChange(index, 'validity', e.target.value)
                    }
                    sx={{ mb: 2 }}
                  />
                  <TextField
                    fullWidth
                    label="Custom Shortcode (optional)"
                    value={data.shortcode}
                    onChange={(e) =>
                      handleChange(index, 'shortcode', e.target.value)
                    }
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}

        <Grid item xs={12}>
          <Button variant="contained" color="primary" type="submit" fullWidth>
            Shorten URLs
          </Button>
        </Grid>
      </Grid>

      {submittedData.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>
            Shortened URLs
          </Typography>
          {submittedData.map((item, index) => (
            <Card key={index} sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="body1">
                  <strong>Original URL:</strong> {item.originalUrl}
                </Typography>
                <Typography variant="body1">
                  <strong>Short URL:</strong>{' '}
                  <a
                    href={`http://localhost:3000/${item.shortcode}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    http://localhost:3000/{item.shortcode}
                  </a>
                </Typography>
                <Typography variant="body2">
                  <strong>Expires At:</strong>{' '}
                  {new Date(item.expiresAt).toLocaleString()}
                </Typography>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </form>
  );
}
