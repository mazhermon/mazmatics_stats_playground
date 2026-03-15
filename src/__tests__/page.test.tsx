import { render, screen } from '@testing-library/react';
import Page from '@/app/page';

describe('Landing Page', () => {
  it('renders the main heading', () => {
    render(<Page />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Mazmatics math stats playground');
  });
});
