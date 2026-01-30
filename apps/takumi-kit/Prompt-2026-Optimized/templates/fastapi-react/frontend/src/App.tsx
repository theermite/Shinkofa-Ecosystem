import { useState, useEffect } from 'react';
import { api } from './api/client';

interface User {
  id: number;
  email: string;
  name: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    try {
      const data = await api.get<User[]>('/users');
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8">
          FastAPI + React App
        </h1>

        {loading ? (
          <p className="text-center">Loading...</p>
        ) : (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-2xl font-semibold mb-4">Users</h2>
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id} className="p-3 bg-gray-50 rounded">
                  <strong>{user.name}</strong> ({user.email})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
