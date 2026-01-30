/**
 * App Component Tests
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from './App';

// Mock window.api
const mockInvoke = vi.fn();

beforeEach(() => {
  vi.clearAllMocks();

  // Setup window.api mock
  (global as any).window = {
    api: {
      invoke: mockInvoke,
    },
  };
});

describe('App Component', () => {
  it('renders app title', () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });

    render(<App />);

    expect(screen.getByText('My Electron App')).toBeInTheDocument();
  });

  it('loads users on mount', async () => {
    const mockUsers = [
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ];

    mockInvoke.mockResolvedValue({ success: true, data: mockUsers });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('John Doe')).toBeInTheDocument();
      expect(screen.getByText('Jane Smith')).toBeInTheDocument();
    });

    expect(mockInvoke).toHaveBeenCalledWith('database:getUsers');
  });

  it('displays message when no users exist', async () => {
    mockInvoke.mockResolvedValue({ success: true, data: [] });

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('No users yet. Add one above!')).toBeInTheDocument();
    });
  });

  it('creates a new user', async () => {
    mockInvoke
      .mockResolvedValueOnce({ success: true, data: [] }) // Initial load
      .mockResolvedValueOnce({ success: true, data: { id: 1, name: 'New User', email: 'new@example.com' } }) // Create
      .mockResolvedValueOnce({ success: true, data: [{ id: 1, name: 'New User', email: 'new@example.com' }] }); // Reload

    render(<App />);

    await waitFor(() => screen.getByText('No users yet. Add one above!'));

    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Name'), {
      target: { value: 'New User' },
    });
    fireEvent.change(screen.getByPlaceholderText('Email'), {
      target: { value: 'new@example.com' },
    });

    // Submit
    fireEvent.click(screen.getByText('Add'));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('database:createUser', {
        name: 'New User',
        email: 'new@example.com',
      });
    });
  });

  it('deletes a user after confirmation', async () => {
    const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];

    mockInvoke
      .mockResolvedValueOnce({ success: true, data: mockUsers }) // Initial load
      .mockResolvedValueOnce({ success: true }) // Delete
      .mockResolvedValueOnce({ success: true, data: [] }); // Reload

    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    render(<App />);

    await waitFor(() => screen.getByText('John Doe'));

    // Click delete
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockInvoke).toHaveBeenCalledWith('database:deleteUser', 1);
    });
  });

  it('does not delete if user cancels confirmation', async () => {
    const mockUsers = [{ id: 1, name: 'John Doe', email: 'john@example.com' }];

    mockInvoke.mockResolvedValue({ success: true, data: mockUsers });

    // Mock window.confirm to return false
    vi.spyOn(window, 'confirm').mockReturnValue(false);

    render(<App />);

    await waitFor(() => screen.getByText('John Doe'));

    // Click delete
    fireEvent.click(screen.getByText('Delete'));

    // Should not call delete
    expect(mockInvoke).toHaveBeenCalledTimes(1); // Only initial load
  });
});
