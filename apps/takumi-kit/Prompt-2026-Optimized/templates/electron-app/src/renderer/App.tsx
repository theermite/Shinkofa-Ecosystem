/**
 * Main React App Component
 */

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
}

function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  async function loadUsers() {
    setLoading(true);
    const result = await window.api.invoke('database:getUsers');
    if (result.success) {
      setUsers(result.data);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const result = await window.api.invoke('database:createUser', { name, email });

    if (result.success) {
      setName('');
      setEmail('');
      loadUsers();
    } else {
      alert(`Error: ${result.error}`);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm('Delete this user?')) return;

    const result = await window.api.invoke('database:deleteUser', id);

    if (result.success) {
      loadUsers();
    }
  }

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>My Electron App</h1>

      <form onSubmit={handleSubmit} style={{ marginBottom: '20px' }}>
        <h2>Add User</h2>
        <div>
          <input
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginRight: '10px', padding: '5px' }}
          />
          <button type="submit" style={{ padding: '5px 15px' }}>
            Add
          </button>
        </div>
      </form>

      <h2>Users</h2>

      {loading ? (
        <p>Loading...</p>
      ) : users.length === 0 ? (
        <p>No users yet. Add one above!</p>
      ) : (
        <ul>
          {users.map((user) => (
            <li key={user.id} style={{ marginBottom: '10px' }}>
              <strong>{user.name}</strong> ({user.email})
              <button
                onClick={() => handleDelete(user.id)}
                style={{ marginLeft: '10px', padding: '2px 10px' }}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
