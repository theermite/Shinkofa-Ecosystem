# Best Practices - Sites Web (React + FastAPI)

<metadata>
Type: Best Practices Web
Owner: Jay The Ermite (TAKUMI Agent)
Version: 1.0
Updated: 2025-12-11
Projects: Les Petits Liens, SLF-Esport, Website-Shinkofa
</metadata>

## 🎯 Standards Obligatoires (Non-Négociables)

<standards_obligatoires>
**⚠️ TOUS les sites web développés par TAKUMI DOIVENT inclure** :

### 1. Toggle Theme Sombre/Clair
- **Obligatoire** : Tous les sites, toutes les pages
- **Position** : Header/Navbar, accessible en 1 clic
- **Persistance** : localStorage (choix survit aux refreshes)
- **Icon** : Soleil/Lune (Material Icons ou React Icons)
- **Transition** : Smooth (0.3s ease-in-out)

**Implémentation React + Tailwind** :
```tsx
// hooks/useTheme.ts
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle('dark', savedTheme === 'dark');
    } else {
      // Detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initialTheme = prefersDark ? 'dark' : 'light';
      setTheme(initialTheme);
      document.documentElement.classList.toggle('dark', prefersDark);
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  return { theme, toggleTheme };
};
```

**Component Toggle** :
```tsx
// components/ThemeToggle.tsx
import { useTheme } from '@/hooks/useTheme';
import { MoonIcon, SunIcon } from '@heroicons/react/24/outline';

export const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? (
        <MoonIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      ) : (
        <SunIcon className="w-5 h-5 text-gray-800 dark:text-gray-200" />
      )}
    </button>
  );
};
```

**Tailwind Config** :
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // Enable dark mode via class
  theme: {
    extend: {
      colors: {
        // Light theme
        'bg-light': '#ffffff',
        'text-light': '#1f2937',
        'accent-light': '#3b82f6',
        // Dark theme
        'bg-dark': '#1f2937',
        'text-dark': '#f9fafb',
        'accent-dark': '#60a5fa',
      },
    },
  },
};
```

### 2. Toggle Password Reveal
- **Obligatoire** : Tous les champs password
- **Position** : Icon dans le champ (droite)
- **Icon** : Eye/EyeSlash (Material Icons ou React Icons)
- **Type toggle** : `password` ↔ `text`

**Implémentation** :
```tsx
// components/PasswordInput.tsx
import { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
}

export const PasswordInput = ({ value, onChange, placeholder, label, error }: PasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
          {label}
        </label>
      )}
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            error ? 'border-red-500' : 'border-gray-300'
          }`}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeSlashIcon className="w-5 h-5" />
          ) : (
            <EyeIcon className="w-5 h-5" />
          )}
        </button>
      </div>
      {error && <p className="text-sm text-red-500 mt-1">{error}</p>}
    </div>
  );
};
```

### 3. Full Responsive Design
- **Approche** : Mobile-first (design pour mobile d'abord)
- **Breakpoints Tailwind** :
  - `sm:` 640px (tablets portrait)
  - `md:` 768px (tablets landscape)
  - `lg:` 1024px (laptops)
  - `xl:` 1280px (desktops)
  - `2xl:` 1536px (large screens)

**Tests Obligatoires** :
- iPhone SE (375px)
- iPad (768px)
- Desktop 1920px

**Exemple Responsive Grid** :
```tsx
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 p-4">
  {/* Cards adapt automatically */}
</div>
```

### 4. WCAG AAA Contrast (7:1 ratio minimum)
- **Standard** : WCAG AAA (pas AA - 4.5:1 trop faible)
- **Ratio minimum** : 7:1 pour texte normal, 4.5:1 pour gros texte (18px+)
- **Outil validation** : Chrome DevTools Accessibility ou WebAIM Contrast Checker

**Palettes Recommandées** :
```css
/* Light Theme */
--bg-light: #ffffff;         /* Blanc pur */
--text-light: #1a1a1a;       /* Presque noir - 15.8:1 ratio */
--accent-light: #0051a8;     /* Bleu foncé - 7.2:1 ratio */

/* Dark Theme */
--bg-dark: #0d1117;          /* GitHub dark bg */
--text-dark: #f0f6fc;        /* Blanc cassé - 13.5:1 ratio */
--accent-dark: #58a6ff;      /* Bleu clair - 8.1:1 ratio */
```

**Vérification Code** :
```tsx
// Utilise toujours text-gray-900 (dark) sur bg blanc, jamais text-gray-600 (fails AAA)
<p className="text-gray-900 dark:text-gray-100">Texte lisible AAA</p>
```

### 5. Mode Pleine Largeur Menu Navigation
- **Obligatoire** : Menu principal full-width sur mobile
- **Desktop** : Menu dans header (aligné horizontal)
- **Mobile** : Burger menu → full-screen overlay

**Implémentation Responsive Navbar** :
```tsx
// components/Navbar.tsx
import { useState } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { ThemeToggle } from './ThemeToggle';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-lg">
      {/* Desktop Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Mon App
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <a href="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              Accueil
            </a>
            <a href="/about" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
              À propos
            </a>
            <ThemeToggle />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <ThemeToggle />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <XMarkIcon className="w-6 h-6" />
              ) : (
                <Bars3Icon className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu (Full-width overlay) */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white dark:bg-gray-800">
          <div className="flex justify-end p-4">
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 rounded-md text-gray-700 dark:text-gray-300"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="flex flex-col items-center space-y-6 mt-12">
            <a
              href="/"
              className="text-2xl text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              Accueil
            </a>
            <a
              href="/about"
              className="text-2xl text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setMobileMenuOpen(false)}
            >
              À propos
            </a>
          </div>
        </div>
      )}
    </nav>
  );
};
```
</standards_obligatoires>

## 🏗️ Architecture React + FastAPI (Standard)

<architecture>
### Structure Projet Recommandée

```
project-root/
├── frontend/                 # React App
│   ├── public/
│   ├── src/
│   │   ├── components/       # Composants réutilisables
│   │   │   ├── common/       # Boutons, inputs, cards, modals
│   │   │   ├── layout/       # Navbar, footer, sidebar
│   │   │   └── features/     # Composants métier
│   │   ├── hooks/            # Custom hooks (useAuth, useTheme, useFetch)
│   │   ├── pages/            # Pages/routes
│   │   ├── services/         # API calls (axios instances)
│   │   ├── contexts/         # React Context (Auth, Theme)
│   │   ├── utils/            # Helpers, validators, formatters
│   │   ├── types/            # TypeScript interfaces
│   │   └── App.tsx           # Root component
│   ├── tailwind.config.js
│   ├── package.json
│   └── vite.config.ts        # Vite (recommandé vs CRA)
│
├── backend/                  # FastAPI App
│   ├── app/
│   │   ├── api/              # Endpoints
│   │   │   ├── v1/
│   │   │   │   ├── auth.py
│   │   │   │   ├── users.py
│   │   │   │   └── tasks.py
│   │   │   └── deps.py       # Dependencies (get_db, get_current_user)
│   │   ├── core/             # Config, security, settings
│   │   ├── models/           # SQLAlchemy models
│   │   ├── schemas/          # Pydantic schemas
│   │   ├── crud/             # CRUD operations
│   │   ├── db/               # Database session, base
│   │   └── main.py           # FastAPI app
│   ├── tests/
│   ├── requirements.txt
│   └── .env
│
├── docker-compose.yml        # Dev local (frontend + backend + postgres)
└── README.md
```

### FastAPI Backend Standards

**Main App (`app/main.py`)** :
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.v1 import auth, users, tasks
from app.core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    version="1.0.0",
    docs_url="/api/docs",
    redoc_url="/api/redoc"
)

# CORS Middleware (OBLIGATOIRE pour React)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,  # ["http://localhost:5173"] en dev
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(users.router, prefix="/api/v1/users", tags=["users"])
app.include_router(tasks.router, prefix="/api/v1/tasks", tags=["tasks"])

@app.get("/")
def read_root():
    return {"message": "API is running"}
```

**Security (`app/core/security.py`)** :
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
```

**Auth Endpoint (`app/api/v1/auth.py`)** :
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app import crud, schemas
from app.api import deps
from app.core import security

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login(
    db: Session = Depends(deps.get_db),
    form_data: OAuth2PasswordRequestForm = Depends()
):
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    access_token = security.create_access_token(data={"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}

@router.post("/register", response_model=schemas.User)
def register(
    user_in: schemas.UserCreate,
    db: Session = Depends(deps.get_db)
):
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="Email already registered",
        )
    user = crud.user.create(db, obj_in=user_in)
    return user
```

### React Frontend Standards

**API Service (`src/services/api.ts`)** :
```typescript
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor pour ajouter JWT token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor pour gérer erreurs 401 (token expiré)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Auth Context (`src/contexts/AuthContext.tsx`)** :
```typescript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchUser();
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await api.get('/users/me');
      setUser(response.data);
    } catch (error) {
      localStorage.removeItem('access_token');
    }
  };

  const login = async (email: string, password: string) => {
    const formData = new URLSearchParams();
    formData.append('username', email);
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });

    localStorage.setItem('access_token', response.data.access_token);
    await fetchUser();
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

**Protected Route (`src/components/ProtectedRoute.tsx`)** :
```typescript
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
```
</architecture>

## 🎨 Design Patterns & Composants Réutilisables

<design_patterns>
### 1. Form Handling avec React Hook Form + Zod

**Installation** :
```bash
npm install react-hook-form zod @hookform/resolvers
```

**Exemple Login Form** :
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { PasswordInput } from '@/components/PasswordInput';

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Minimum 8 caractères'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
    } catch (error) {
      console.error('Login failed', error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input
          type="email"
          {...register('email')}
          className="w-full px-4 py-2 border rounded-lg"
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
      </div>

      <PasswordInput
        label="Mot de passe"
        {...register('password')}
        error={errors.password?.message}
      />

      <button
        type="submit"
        className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700"
      >
        Se connecter
      </button>
    </form>
  );
};
```

### 2. Loading States & Skeleton Loaders

```tsx
// components/Skeleton.tsx
export const Skeleton = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-300 dark:bg-gray-700 rounded ${className}`} />
);

// Usage in component
export const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-3 w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return <div>{/* User list */}</div>;
};
```

### 3. Toast Notifications (react-hot-toast)

```bash
npm install react-hot-toast
```

```tsx
// App.tsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      {/* Rest of app */}
    </>
  );
}

// Usage in component
import toast from 'react-hot-toast';

const handleSave = async () => {
  try {
    await api.post('/tasks', data);
    toast.success('Tâche créée avec succès !');
  } catch (error) {
    toast.error('Erreur lors de la création');
  }
};
```

### 4. Modal/Dialog (Headless UI)

```bash
npm install @headlessui/react
```

```tsx
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/50" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6">
              <Dialog.Title className="text-xl font-bold mb-4 text-gray-900 dark:text-white">
                {title}
              </Dialog.Title>
              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
};
```
</design_patterns>

## 🚀 Performance Optimizations

<performance>
### 1. Code Splitting & Lazy Loading

```tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const Home = lazy(() => import('@/pages/Home'));
const Dashboard = lazy(() => import('@/pages/Dashboard'));
const Settings = lazy(() => import('@/pages/Settings'));

function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
```

### 2. React Query for Data Fetching

```bash
npm install @tanstack/react-query
```

```tsx
// App.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* App content */}
    </QueryClientProvider>
  );
}

// Usage in component
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const TaskList = () => {
  const queryClient = useQueryClient();

  // Fetch tasks
  const { data: tasks, isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: async () => {
      const response = await api.get('/tasks');
      return response.data;
    },
  });

  // Create task mutation
  const createTask = useMutation({
    mutationFn: async (newTask: { title: string }) => {
      const response = await api.post('/tasks', newTask);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      toast.success('Tâche créée !');
    },
  });

  if (isLoading) return <Skeleton />;

  return (
    <div>
      {tasks.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </div>
  );
};
```

### 3. Image Optimization

```tsx
// Use next/image for Next.js projects
import Image from 'next/image';

<Image
  src="/hero.jpg"
  alt="Hero image"
  width={1200}
  height={600}
  priority // Load immediately (above fold)
  placeholder="blur"
  blurDataURL="/hero-blur.jpg"
/>

// For Vite/React, use lazy loading
<img
  src="/image.jpg"
  alt="Description"
  loading="lazy"
  className="w-full h-auto"
/>
```

### 4. Debounce Search Inputs

```tsx
import { useState, useEffect } from 'react';

export const SearchInput = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // Wait 500ms after user stops typing

    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    if (debouncedQuery) {
      // Perform search
      searchAPI(debouncedQuery);
    }
  }, [debouncedQuery]);

  return (
    <input
      type="text"
      value={query}
      onChange={(e) => setQuery(e.target.value)}
      placeholder="Search..."
      className="w-full px-4 py-2 border rounded-lg"
    />
  );
};
```
</performance>

## ♿ Accessibilité (WCAG AAA)

<accessibilite>
### Checklist Obligatoire

- [ ] **Contraste 7:1** : Tous les textes (sauf gros textes 18px+ → 4.5:1)
- [ ] **Navigation clavier** : Tab, Enter, Esc fonctionnent partout
- [ ] **Focus visible** : Outline sur éléments focus (pas `outline: none !important`)
- [ ] **ARIA labels** : Boutons icons, images décoratives (`aria-label`, `aria-hidden`)
- [ ] **Headings hiérarchiques** : H1 unique, H2/H3/H4 ordonnés
- [ ] **Alt text images** : Descriptions concises, "" si décorative
- [ ] **Form labels** : Tous les inputs ont `<label>` ou `aria-label`
- [ ] **Error messages** : Clairs, visibles, associés aux champs (`aria-describedby`)

### Exemples

```tsx
// Bouton icon avec aria-label
<button
  onClick={handleDelete}
  aria-label="Supprimer la tâche"
  className="p-2 hover:bg-red-100"
>
  <TrashIcon className="w-5 h-5" />
</button>

// Image décorative
<img src="/decoration.svg" alt="" aria-hidden="true" />

// Focus visible (Tailwind)
<button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
  Cliquez-moi
</button>

// Error message associé au champ
<input
  type="email"
  aria-describedby="email-error"
  className="border border-red-500"
/>
{error && <p id="email-error" className="text-red-500">{error}</p>}
```
</accessibilite>

## 📦 Déploiement

<deploiement>
### Frontend (React Build)

**Build Vite** :
```bash
npm run build  # Génère dossier dist/
```

**Hébergement o2Switch (cPanel)** :
1. Upload `dist/` → `public_html/` ou sous-dossier
2. Créer `.htaccess` pour React Router :
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

**Hébergement Vercel (Next.js)** :
```bash
npm install -g vercel
vercel --prod
```

### Backend (FastAPI)

**Hébergement VPS OVH** :

**1. Préparer serveur** :
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11+
sudo apt install python3.11 python3.11-venv python3-pip -y

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Install nginx
sudo apt install nginx -y
```

**2. Déployer app** :
```bash
# Clone repo
git clone https://github.com/user/project.git
cd project/backend

# Create venv
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env
cp .env.example .env
nano .env  # Remplir variables (DB_URL, SECRET_KEY, etc.)

# Run migrations
alembic upgrade head
```

**3. Systemd Service** (`/etc/systemd/system/myapp.service`) :
```ini
[Unit]
Description=FastAPI App
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/myapp/backend
Environment="PATH=/var/www/myapp/backend/venv/bin"
ExecStart=/var/www/myapp/backend/venv/bin/uvicorn app.main:app --host 0.0.0.0 --port 8000

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl start myapp
sudo systemctl enable myapp
```

**4. Nginx Reverse Proxy** (`/etc/nginx/sites-available/myapp`) :
```nginx
server {
    listen 80;
    server_name api.example.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

**5. SSL avec Certbot** :
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d api.example.com
```
</deploiement>

## 🧪 Testing

<testing>
### Frontend (Vitest + React Testing Library)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**vite.config.ts** :
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});
```

**setup.ts** :
```typescript
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import matchers from '@testing-library/jest-dom/matchers';

expect.extend(matchers);

afterEach(() => {
  cleanup();
});
```

**Example Test** :
```typescript
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Button } from '@/components/Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByText('Click me');
    await userEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Backend (pytest + FastAPI TestClient)

```python
# tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_register_user():
    response = client.post(
        "/api/v1/auth/register",
        json={
            "email": "test@example.com",
            "password": "password123",
            "name": "Test User"
        }
    )
    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert "id" in data

def test_login():
    response = client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        },
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"
```
</testing>

## 📋 Leçons Projets Précédents

<lecons_projets>
### Les Petits Liens (React + FastAPI)
- ✅ **Login OAuth Google** : Simplifie onboarding utilisateurs
- ✅ **Drag & Drop liens** : react-beautiful-dnd pour réorganiser
- ✅ **Infinite scroll** : react-infinite-scroll-component pour grandes listes
- ⚠️ **Lesson** : Toujours prévoir pagination backend (limit/offset) même si infinite scroll frontend

### SLF-Esport (React + FastAPI)
- ✅ **Dashboard temps réel** : WebSocket pour notifications live
- ✅ **Upload images** : Multer backend + preview instant frontend
- ✅ **Filtres avancés** : react-select pour multi-select + search
- ⚠️ **Lesson** : WebSocket nécessite gestion reconnection (heartbeat, auto-retry)

### Website-Shinkofa (WordPress)
- ✅ **SEO optimisé** : Yoast SEO, meta descriptions, schema.org
- ✅ **Cache agressif** : WP Rocket + CloudFlare = <1s load time
- ⚠️ **Lesson** : WordPress lourd, privilégier React + Next.js si possible (SEO équivalent, perfs meilleures)
</lecons_projets>

---

**Version 1.0 | 2025-12-11 | TAKUMI Best Practices Web**
