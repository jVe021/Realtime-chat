import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { router } from './app/routes';
import { Providers } from './app/providers';
import { useAuthStore } from './store/auth.store';

function App() {
  const loadUser = useAuthStore(s => s.loadUser);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  return (
    <Providers>
      <Toaster position="top-right" />
      <RouterProvider router={router} />
    </Providers>
  );
}

export default App;