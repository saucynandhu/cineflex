import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import MediaCard from './MediaCard';
import { MediaBase } from '../types/tmdb';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock useUserLists
vi.mock('../hooks/useUserLists', () => ({
  useUserLists: () => ({
    toggleWatchLater: vi.fn(),
    isInWatchLater: vi.fn(() => false),
    removeFromContinueWatching: vi.fn(),
  }),
}));

function renderCard(item: MediaBase, props?: { type?: string; listType?: string }) {
  return render(
    <MemoryRouter>
      <MediaCard item={item} type={props?.type as any} listType={props?.listType as any} />
    </MemoryRouter>
  );
}

const baseItem: MediaBase = {
  id: 123,
  title: 'Test Movie',
  overview: 'A great movie',
  poster_path: '/poster.jpg',
  backdrop_path: '/backdrop.jpg',
  vote_average: 8.5,
  vote_count: 1000,
  genre_ids: [28, 12],
  popularity: 100,
  media_type: 'movie',
  release_date: '2024-06-15',
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe('MediaCard', () => {
  it('renders the item title', () => {
    renderCard(baseItem);
    expect(screen.getByText('Test Movie')).toBeInTheDocument();
  });

  it('renders the backdrop image with correct src', () => {
    renderCard(baseItem);
    const img = screen.getByRole('img', { name: 'Test Movie' });
    expect(img).toHaveAttribute('src', expect.stringContaining('/backdrop.jpg'));
  });

  it('shows upcoming badge for future release dates', () => {
    const futureItem = {
      ...baseItem,
      release_date: '2099-01-01',
    };
    renderCard(futureItem);
    expect(screen.getByText('Upcoming')).toBeInTheDocument();
  });

  it('does not show upcoming badge for past dates', () => {
    renderCard(baseItem);
    expect(screen.queryByText('Upcoming')).not.toBeInTheDocument();
  });

  it('navigates to details on click', async () => {
    const user = userEvent.setup();
    renderCard(baseItem);
    
    await user.click(screen.getByRole('button', { name: 'Open Test Movie' }));
    expect(mockNavigate).toHaveBeenCalledWith('/movie/123');
  });

  it('navigates to watch page when play button is clicked', async () => {
    const user = userEvent.setup();
    renderCard(baseItem);
    
    await user.click(screen.getByRole('button', { name: 'Play' }));
    expect(mockNavigate).toHaveBeenCalledWith('/watch/movie/123');
  });

  it('renders the list toggle button', () => {
    renderCard(baseItem);
    expect(screen.getByRole('button', { name: 'Add to List' })).toBeInTheDocument();
  });

  it('is keyboard accessible', async () => {
    const user = userEvent.setup();
    renderCard(baseItem);
    
    const card = screen.getByRole('button', { name: 'Open Test Movie' });
    card.focus();
    await user.keyboard('{Enter}');
    expect(mockNavigate).toHaveBeenCalledWith('/movie/123');
  });
});
