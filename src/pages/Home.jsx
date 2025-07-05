// src/pages/Home.jsx
import React from 'react';
import Container from '@mui/material/Container';
import UrlForm from './../Components/UrlForm';

export default function Home() {
  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <UrlForm />
    </Container>
  );
}
