import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';

export function DashboardPage() {
  const { user, profile } = useAuth();

  const isEmailConfirmed = user?.email_confirmed_at !== null;

  return (
    <div className="min-h-screen bg-background-alt">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-text-main-light mb-2">
              Witaj, {profile?.first_name}! 👋
            </h1>
            <p className="text-text-muted-light">
              Cieszymy się, że jesteś z nami w Przetargo
            </p>
          </div>

          {/* Email Confirmation Alert */}
          {!isEmailConfirmed && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-yellow-50 border-l-4 border-yellow-400 p-6 rounded-lg mb-8"
            >
              <div className="flex items-start">
                <span className="material-symbols-outlined text-yellow-600 text-3xl mr-4">
                  mail
                </span>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    Potwierdź swój adres email
                  </h3>
                  <p className="text-yellow-700 mb-4">
                    Wysłaliśmy link potwierdzający na adres <strong>{user?.email}</strong>.
                    Sprawdź swoją skrzynkę pocztową (również folder SPAM) i kliknij w link, aby aktywować swoje konto.
                  </p>
                  <div className="flex items-center gap-4">
                    <button className="text-sm font-semibold text-yellow-800 hover:text-yellow-900 underline">
                      Wyślij ponownie
                    </button>
                    <span className="text-sm text-yellow-600">
                      Nie otrzymałeś emaila?
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* User Info Card */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="lg:col-span-2 bg-white rounded-xl p-6 border border-border-light"
            >
              <h2 className="text-xl font-bold text-text-main-light mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">
                  person
                </span>
                Twoje dane
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-text-muted-light mb-1">Imię i nazwisko</p>
                  <p className="font-semibold text-text-main-light">
                    {profile?.first_name} {profile?.last_name}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-text-muted-light mb-1">Email</p>
                  <p className="font-semibold text-text-main-light">{user?.email}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted-light mb-1">Telefon</p>
                  <p className="font-semibold text-text-main-light">{profile?.phone}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted-light mb-1">NIP</p>
                  <p className="font-semibold text-text-main-light">{profile?.nip}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted-light mb-1">Firma</p>
                  <p className="font-semibold text-text-main-light">{profile?.company_name}</p>
                </div>

                <div>
                  <p className="text-sm text-text-muted-light mb-1">Wielkość firmy</p>
                  <p className="font-semibold text-text-main-light">{profile?.company_size}</p>
                </div>

                <div className="md:col-span-2">
                  <p className="text-sm text-text-muted-light mb-1">Strona internetowa</p>
                  <a
                    href={profile?.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-primary hover:underline"
                  >
                    {profile?.website}
                  </a>
                </div>

                {profile?.tender_description && (
                  <div className="md:col-span-2">
                    <p className="text-sm text-text-muted-light mb-1">Przetargi</p>
                    <p className="text-text-main-light">{profile.tender_description}</p>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-6 border-t border-border-light">
                <Link to="/ustawienia">
                  <Button variant="outline" size="sm">
                    <span className="material-symbols-outlined text-lg mr-2">
                      edit
                    </span>
                    Edytuj profil
                  </Button>
                </Link>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white rounded-xl p-6 border border-border-light">
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    verified
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    isEmailConfirmed
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {isEmailConfirmed ? 'Zweryfikowany' : 'Oczekuje'}
                  </span>
                </div>
                <h3 className="font-semibold text-text-main-light">Status konta</h3>
                <p className="text-sm text-text-muted-light mt-1">
                  {isEmailConfirmed
                    ? 'Twoje konto jest w pełni aktywne'
                    : 'Potwierdź email aby aktywować'}
                </p>
              </div>

              <div className="bg-white rounded-xl p-6 border border-border-light">
                <div className="flex items-center justify-between mb-2">
                  <span className="material-symbols-outlined text-primary text-3xl">
                    workspace_premium
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                    Free Trial
                  </span>
                </div>
                <h3 className="font-semibold text-text-main-light">Plan</h3>
                <p className="text-sm text-text-muted-light mt-1">
                  14 dni bezpłatnego dostępu
                </p>
              </div>
            </motion.div>
          </div>

          {/* Getting Started */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-8 border border-border-light"
          >
            <h2 className="text-2xl font-bold text-text-main-light mb-6">
              Zacznij korzystać z Przetargo
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    search
                  </span>
                </div>
                <h3 className="font-semibold text-text-main-light mb-2">
                  Szukaj przetargów
                </h3>
                <p className="text-sm text-text-muted-light mb-4">
                  Przeglądaj tysiące aktualnych przetargów dopasowanych do Twojej firmy
                </p>
                <Button variant="outline" size="sm">
                  Rozpocznij wyszukiwanie
                </Button>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    notifications
                  </span>
                </div>
                <h3 className="font-semibold text-text-main-light mb-2">
                  Ustaw powiadomienia
                </h3>
                <p className="text-sm text-text-muted-light mb-4">
                  Otrzymuj alerty o nowych przetargach które Cię interesują
                </p>
                <Button variant="outline" size="sm">
                  Skonfiguruj alerty
                </Button>
              </div>

              <div className="flex flex-col items-start">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    school
                  </span>
                </div>
                <h3 className="font-semibold text-text-main-light mb-2">
                  Poznaj funkcje
                </h3>
                <p className="text-sm text-text-muted-light mb-4">
                  Zobacz jak maksymalnie wykorzystać możliwości platformy
                </p>
                <Link to="/funkcje">
                  <Button variant="outline" size="sm">
                    Zobacz funkcje
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
