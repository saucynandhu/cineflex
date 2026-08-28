import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SourceSwitcher from './SourceSwitcher';

// SourceSwitcher uses react-router-dom's Link, so wrap in a MemoryRouter
import { MemoryRouter } from 'react-router-dom';

function renderWithRouter(ui: React.ReactElement) {
  return render(<MemoryRouter>{ui}</MemoryRouter>);
}

describe('SourceSwitcher', () => {
  it('renders all sources from the SOURCES list', () => {
    renderWithRouter(
      <SourceSwitcher activeSource="vidsrc_me" onSourceChange={vi.fn()} />
    );

    const select = screen.getByLabelText('Video source');
    expect(select).toBeInTheDocument();

    // Should have 6 options (vidsrc_me, vidking, vidsrc_cc, vidfast, twoembed, superembed)
    expect(select.querySelectorAll('option')).toHaveLength(6);
  });

  it('displays the correct active source', () => {
    renderWithRouter(
      <SourceSwitcher activeSource="vidking" onSourceChange={vi.fn()} />
    );

    const select = screen.getByLabelText('Video source') as HTMLSelectElement;
    expect(select.value).toBe('vidking');
  });

  it('calls onSourceChange when a different source is selected', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    renderWithRouter(
      <SourceSwitcher activeSource="vidsrc_me" onSourceChange={handleChange} />
    );

    const select = screen.getByLabelText('Video source');
    await user.selectOptions(select, 'vidking');

    expect(handleChange).toHaveBeenCalledWith('vidking');
  });

  it('shows the "Why are there ads?" link', () => {
    renderWithRouter(
      <SourceSwitcher activeSource="vidsrc_me" onSourceChange={vi.fn()} />
    );

    const link = screen.getByRole('link', { name: /Why are there ads/i });
    expect(link).toHaveAttribute('href', '/ads');
  });

  it('shows the helper text about trying another source', () => {
    renderWithRouter(
      <SourceSwitcher activeSource="vidsrc_me" onSourceChange={vi.fn()} />
    );

    expect(screen.getByText(/If a source doesn't load/)).toBeInTheDocument();
  });
});
