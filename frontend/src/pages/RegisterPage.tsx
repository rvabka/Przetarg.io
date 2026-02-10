import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    nip: '',
    companyName: '',
    website: '',
    companySize: '',
    tenderDescription: '',
    searchAllPoland: false,
    privacyConsent: false,
  });

  const companySizes = [
    'Jednoosobowa (JDG)',
    'Mikro (1–9 pracowników)',
    'Mała (10–49 pracowników)',
    'Średnia (50–249 pracowników)',
    'Duża (250+ pracowników)',
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Hasła nie są zgodne');
      return;
    }

    if (formData.password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    if (!formData.privacyConsent) {
      setError('Musisz zaakceptować politykę prywatności');
      return;
    }

    setLoading(true);

    const { error } = await signUp(formData.email, formData.password, {
      first_name: formData.firstName,
      last_name: formData.lastName,
      phone: formData.phone,
      nip: formData.nip,
      company_name: formData.companyName,
      website: formData.website,
      company_size: formData.companySize,
      tender_description: formData.tenderDescription,
      search_all_poland: formData.searchAllPoland,
    });

    setLoading(false);

    if (error) {
      setError(error.message || 'Wystąpił błąd podczas rejestracji');
    } else {
      navigate('/potwierdz-email', { state: { email: formData.email } });
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-2xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="font-bold text-2xl tracking-tight text-text-main-light">
              TenderAI
            </span>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-text-main-light">
            Załóż konto
          </h2>
          <p className="mt-2 text-sm text-text-muted-light">
            Już masz konto?{' '}
            <Link
              to="/zaloguj"
              className="font-semibold text-primary hover:text-primary/80"
            >
              Zaloguj się
            </Link>
          </p>
        </div>

        {/* Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email & Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-main-light mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="twoj@email.com"
                />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-text-main-light mb-2">
                  Numer Telefonu *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="+48 123 456 789"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-text-main-light mb-2">
                  Hasło *
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-main-light mb-2">
                  Potwierdź Hasło *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {/* Personal Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-text-main-light mb-2">
                  Imię *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Jan"
                />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-text-main-light mb-2">
                  Nazwisko *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Kowalski"
                />
              </div>
            </div>

            {/* Company Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nip" className="block text-sm font-semibold text-text-main-light mb-2">
                  NIP *
                </label>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  required
                  value={formData.nip}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="1234567890"
                />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-text-main-light mb-2">
                  Nazwa Firmy *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  placeholder="Nazwa Twojej Firmy"
                />
              </div>
            </div>

            <div>
              <label htmlFor="website" className="block text-sm font-semibold text-text-main-light mb-2">
                Strona Internetowa *
              </label>
              <input
                id="website"
                name="website"
                type="url"
                required
                value={formData.website}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                placeholder="https://twojafirma.pl"
              />
              <p className="mt-1 text-xs text-text-muted-light">
                Link do strony internetowej Twojej firmy
              </p>
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-semibold text-text-main-light mb-2">
                Wielkość Firmy *
              </label>
              <select
                id="companySize"
                name="companySize"
                required
                value={formData.companySize}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all bg-white"
              >
                <option value="">Wybierz wielkość firmy</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            {/* Tender Description */}
            <div>
              <label htmlFor="tenderDescription" className="block text-sm font-semibold text-text-main-light mb-2">
                Opisz jakich przetargów szukasz
              </label>
              <textarea
                id="tenderDescription"
                name="tenderDescription"
                rows={4}
                value={formData.tenderDescription}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border-light rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none"
                placeholder="Im więcej nam opowiesz, tym precyzyjniej dopasujemy przetargi."
              />
              <p className="mt-1 text-xs text-text-muted-light">*Opcjonalne</p>
            </div>

            {/* Checkboxes */}
            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="searchAllPoland"
                  checked={formData.searchAllPoland}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 border-2 border-border-light rounded focus:ring-2 focus:ring-primary text-primary cursor-pointer"
                />
                <span className="text-sm text-text-main-light group-hover:text-primary transition-colors">
                  Szukam przetargów w całej Polsce
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  required
                  checked={formData.privacyConsent}
                  onChange={handleChange}
                  className="mt-1 w-5 h-5 border-2 border-border-light rounded focus:ring-2 focus:ring-primary text-primary cursor-pointer"
                />
                <span className="text-sm text-text-main-light">
                  Potwierdzam, że administratorem moich danych osobowych jest TenderAI (zgodnie z Polityką Prywatności) oraz że moje dane będą przetwarzane w celu rejestracji, kontaktu i obsługi zapytania. Zapoznałem(-am) się z{' '}
                  <a href="#" className="text-primary hover:underline">
                    Polityką Prywatności
                  </a>
                  . *
                </span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full justify-center"
            disabled={loading}
          >
            {loading ? 'Rejestrowanie...' : 'Załóż konto'}
          </Button>

          <p className="text-xs text-center text-text-muted-light">
            Bez karty kredytowej • 14 dni za darmo
          </p>
        </form>
      </motion.div>
    </div>
  );
}
