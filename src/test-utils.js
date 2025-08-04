
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';

// Custom render function that can be extended with providers
const customRender = (ui, options) => {
  return render(ui, {
    // Add any providers here if needed
    ...options,
  });
};

// Re-export everything
export * from '@testing-library/react';
export { customRender as render };
