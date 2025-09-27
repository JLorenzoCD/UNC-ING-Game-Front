import "@testing-library/jest-dom";
import { render, screen } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, type Mock } from 'vitest';
import Secrets from './Secrets';
import { usePlayer } from '../../../contexts/PlayerContext';

// Mock del contexto de jugador
vi.mock('../../../contexts/PlayerContext', () => ({
  usePlayer: vi.fn(),
}));

// Mock de las imágenes
vi.mock('@/assets/06-secret_front.png', () => ({
  default: 'secret-front.png'
}));
vi.mock('@/assets/03-secret_murderer.png', () => ({
  default: 'secret-murderer.png'
}));

const mockUsePlayer = usePlayer as Mock;

describe('Secrets', () => {
  const mockPlayer = { id: 'b3e2af7a-7736-4833-95c0-3a927c7effda', name: 'TestPlayer' };
  
  const mockSecrets = [
    {
      type: 'INNOCENT' as const,
      content: 'You are innocent',
      id: '517872ad-9a41-45be-a7cc-d1498fdce7d5' as `${string}-${string}-${string}-${string}-${string}`,
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: 'b3e2af7a-7736-4833-95c0-3a927c7effda' as `${string}-${string}-${string}-${string}-${string}`,
      is_revealed: false
    },
    {
      type: 'INNOCENT' as const,
      id: '9690f15b-394d-406d-a2a5-e64381e491eb' as `${string}-${string}-${string}-${string}-${string}`,
      content: 'You are the innocent',
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: 'b3e2af7a-7736-4833-95c0-3a927c7effda' as `${string}-${string}-${string}-${string}-${string}`,
      is_revealed: false
    },
    {
      type: 'MURDERER' as const,
      id: 'b86d15d1-957d-4921-9dbf-c16c897ab72f' as `${string}-${string}-${string}-${string}-${string}`,
      content: 'You are the murderer',
      match_id: crypto.randomUUID(),
      secret_id: crypto.randomUUID(),
      player_id: 'b3e2af7a-7736-4833-95c0-3a927c7effda' as `${string}-${string}-${string}-${string}-${string}`,
      is_revealed: false
    }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock console methods para evitar warnings en tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Rendering secrets correctly', () => {
    it('should render the secrets for current player', () => {
      mockUsePlayer.mockReturnValue({ player: mockPlayer });
      
      render(<Secrets secrets={mockSecrets} />);
      
      const secretElements = screen.getAllByRole('img');

      expect(secretElements.length).toBe(3);
      expect(secretElements[0]).toHaveAttribute('src', 'secret-front.png');
      expect(secretElements[1]).toHaveAttribute('src', 'secret-front.png');
      expect(secretElements[2]).toHaveAttribute('src', 'secret-murderer.png');
    });
  });

  describe('Security - Not showing other players secrets', () => {
    it('should not render secrets for different player', () => {
      mockUsePlayer.mockReturnValue({ player: { ...mockPlayer, id: 'different-player' } });

      render(<Secrets secrets={mockSecrets} />);

      const secretElements = screen.queryAllByRole('img');

      expect(secretElements.length).toBe(0);
    });
  });
});
