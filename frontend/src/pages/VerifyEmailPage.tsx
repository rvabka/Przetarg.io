import { Link, Navigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';

export function VerifyEmailPage() {
  const location = useLocation();
  const { user, loading } = useAuth();
  const email = (location.state as { email?: string })?.email || '';

  if (loading) return null;
  if (user) return <Navigate to="/dashboard" replace />;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-md w-full space-y-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Logo */}
        <Link to="/" className="inline-flex items-center gap-2 mb-6">
          <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center text-white font-bold text-xl">
            T
          </div>
          <span className="font-bold text-2xl tracking-tight text-text-main-light">
            Przetargo
          </span>
        </Link>

        {/* Mail Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
          className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-primary"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
            />
          </svg>
        </motion.div>

        {/* Heading */}
        <div>
          <h2 className="text-3xl font-bold text-text-main-light">
            Sprawdź swoją skrzynkę
          </h2>
          <p className="mt-4 text-text-muted-light leading-relaxed">
            Wysłaliśmy link weryfikacyjny na adres
            {email && (
              <>
                <br />
                <span className="font-semibold text-text-main-light">{email}</span>
              </>
            )}
            . Kliknij link w wiadomości, aby potwierdzić swoje konto.
          </p>
        </div>

        {/* Info Box */}
        <div className="bg-gray-50 border border-border-light rounded-lg p-4 text-sm text-text-muted-light space-y-2">
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
            <span className="text-left">
              Jeśli nie widzisz wiadomości, sprawdź folder <span className="font-semibold">spam</span> lub <span className="font-semibold">oferty</span>.
            </span>
          </p>
          <p className="flex items-start gap-2">
            <svg className="w-5 h-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-left">
              Dostarczenie wiadomości może zająć kilka minut.
            </span>
          </p>
        </div>

        {/* Back to Login */}
        <div className="pt-4">
          <Link
            to="/zaloguj"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Wróć do logowania
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
