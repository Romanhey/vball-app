import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import { StoreProvider } from './stores/rootStore';

test('renders calendar heading', () => {
  render(
    <StoreProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </StoreProvider>
  );

  const heading = screen.getByText(/расписание матчей/i);
  expect(heading).toBeInTheDocument();
});
