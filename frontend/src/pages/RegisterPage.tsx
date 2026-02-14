import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { XCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';

interface FieldErrors {
  email?: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  firstName?: string;
  lastName?: string;
  nip?: string;
  companyName?: string;
  website?: string;
  companySize?: string;
  privacyConsent?: string;
}

function validateEmail(email: string): string | undefined {
  if (!email.trim()) return 'Email jest wymagany.';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Podaj prawidłowy adres email.';
  return undefined;
}

function validatePhone(phone: string): string | undefined {
  if (!phone.trim()) return 'Numer telefonu jest wymagany.';
  // Accept formats like: +48123456789, +48 123 456 789, 123456789, 123-456-789
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!/^\+?\d{9,15}$/.test(cleaned)) return 'Podaj prawidłowy numer telefonu (np. +48 123 456 789).';
  return undefined;
}

function validatePassword(password: string): string | undefined {
  if (!password) return 'Hasło jest wymagane.';
  if (password.length < 6) return 'Hasło musi mieć co najmniej 6 znaków.';
  if (password.length > 72) return 'Hasło może mieć maksymalnie 72 znaki.';
  return undefined;
}

function validateConfirmPassword(password: string, confirmPassword: string): string | undefined {
  if (!confirmPassword) return 'Potwierdź hasło.';
  if (password !== confirmPassword) return 'Hasła nie są zgodne.';
  return undefined;
}

function validateRequired(value: string, fieldName: string): string | undefined {
  if (!value.trim()) return `${fieldName} jest wymagane.`;
  return undefined;
}

function validateNip(nip: string): string | undefined {
  if (!nip.trim()) return 'NIP jest wymagany.';
  const cleaned = nip.replace(/[\s\-]/g, '');
  if (!/^\d{10}$/.test(cleaned)) return 'NIP musi składać się z 10 cyfr.';

  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  const digits = cleaned.split('').map(Number);
  const sum = weights.reduce((acc, w, i) => acc + w * digits[i], 0);
  if (sum % 11 !== digits[9]) return 'Podany NIP jest nieprawidłowy.';

  return undefined;
}

function validateWebsite(url: string): string | undefined {
  if (!url.trim()) return 'Strona internetowa jest wymagana.';
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return 'Adres strony musi zaczynać się od http:// lub https://';
    }
  } catch {
    return 'Podaj prawidłowy adres URL (np. https://twojafirma.pl).';
  }
  return undefined;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return (
    <p className="mt-1.5 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4 flex-shrink-0" />
      {message}
    </p>
  );
}

export function RegisterPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
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
    if (fieldErrors[name as keyof FieldErrors]) {
      setFieldErrors(prev => ({ ...prev, [name]: undefined }));
    }
    if (error) setError('');
  };

  const validateForm = (): boolean => {
    const errors: FieldErrors = {};

    errors.email = validateEmail(formData.email);
    errors.phone = validatePhone(formData.phone);
    errors.password = validatePassword(formData.password);
    errors.confirmPassword = validateConfirmPassword(formData.password, formData.confirmPassword);
    errors.firstName = validateRequired(formData.firstName, 'Imię');
    errors.lastName = validateRequired(formData.lastName, 'Nazwisko');
    errors.nip = validateNip(formData.nip);
    errors.companyName = validateRequired(formData.companyName, 'Nazwa firmy');
    errors.website = validateWebsite(formData.website);
    errors.companySize = formData.companySize ? undefined : 'Wybierz wielkość firmy.';
    errors.privacyConsent = formData.privacyConsent ? undefined : 'Musisz zaakceptować politykę prywatności.';

    // Filter out undefined entries
    const filteredErrors: FieldErrors = {};
    for (const [key, value] of Object.entries(errors)) {
      if (value) (filteredErrors as Record<string, string>)[key] = value;
    }

    setFieldErrors(filteredErrors);
    return Object.keys(filteredErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      const firstErrorField = document.querySelector('.text-red-600');
      firstErrorField?.scrollIntoView({ behavior: 'smooth', block: 'center' });
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
    });

    setLoading(false);

    if (error) {
      setError(error.message || 'Wystąpił błąd podczas rejestracji.');
    } else {
      navigate('/potwierdz-email', { state: { email: formData.email } });
    }
  };

  const inputClass = (field: keyof FieldErrors) =>
    `w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-all ${
      fieldErrors[field]
        ? 'border-red-400 focus:ring-red-300 bg-red-50/50'
        : 'border-border-light focus:ring-primary'
    }`;

  return (
    <div className="min-h-screen bg-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-2xl w-full space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-black rounded-none flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <span className="font-bold text-2xl tracking-tight text-text-main-light">
              Przetargo
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          {error && (
            <motion.div
              className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm flex items-start gap-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-text-main-light mb-2">
                  Email *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass('email')}
                  placeholder="twoj@email.com"
                />
                <FieldError message={fieldErrors.email} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-text-main-light mb-2">
                  Numer Telefonu *
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className={inputClass('phone')}
                  placeholder="+48 123 456 789"
                />
                <FieldError message={fieldErrors.phone} />
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
                  autoComplete="new-password"
                  value={formData.password}
                  onChange={handleChange}
                  className={inputClass('password')}
                  placeholder="••••••••"
                />
                <FieldError message={fieldErrors.password} />
                {!fieldErrors.password && formData.password && (
                  <p className="mt-1.5 text-xs text-text-muted-light">
                    Min. 6 znaków
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-text-main-light mb-2">
                  Potwierdź Hasło *
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={inputClass('confirmPassword')}
                  placeholder="••••••••"
                />
                <FieldError message={fieldErrors.confirmPassword} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstName" className="block text-sm font-semibold text-text-main-light mb-2">
                  Imię *
                </label>
                <input
                  id="firstName"
                  name="firstName"
                  type="text"
                  autoComplete="given-name"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={inputClass('firstName')}
                  placeholder="Jan"
                />
                <FieldError message={fieldErrors.firstName} />
              </div>
              <div>
                <label htmlFor="lastName" className="block text-sm font-semibold text-text-main-light mb-2">
                  Nazwisko *
                </label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  autoComplete="family-name"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={inputClass('lastName')}
                  placeholder="Kowalski"
                />
                <FieldError message={fieldErrors.lastName} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nip" className="block text-sm font-semibold text-text-main-light mb-2">
                  NIP *
                </label>
                <input
                  id="nip"
                  name="nip"
                  type="text"
                  inputMode="numeric"
                  value={formData.nip}
                  onChange={handleChange}
                  className={inputClass('nip')}
                  placeholder="1234567890"
                  maxLength={13}
                />
                <FieldError message={fieldErrors.nip} />
              </div>
              <div>
                <label htmlFor="companyName" className="block text-sm font-semibold text-text-main-light mb-2">
                  Nazwa Firmy *
                </label>
                <input
                  id="companyName"
                  name="companyName"
                  type="text"
                  autoComplete="organization"
                  value={formData.companyName}
                  onChange={handleChange}
                  className={inputClass('companyName')}
                  placeholder="Nazwa Twojej Firmy"
                />
                <FieldError message={fieldErrors.companyName} />
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
                autoComplete="url"
                value={formData.website}
                onChange={handleChange}
                className={inputClass('website')}
                placeholder="https://twojafirma.pl"
              />
              <FieldError message={fieldErrors.website} />
              {!fieldErrors.website && (
                <p className="mt-1 text-xs text-text-muted-light">
                  Link do strony internetowej Twojej firmy
                </p>
              )}
            </div>

            <div>
              <label htmlFor="companySize" className="block text-sm font-semibold text-text-main-light mb-2">
                Wielkość Firmy *
              </label>
              <select
                id="companySize"
                name="companySize"
                value={formData.companySize}
                onChange={handleChange}
                className={`${inputClass('companySize')} bg-white`}
              >
                <option value="">Wybierz wielkość firmy</option>
                {companySizes.map(size => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
              <FieldError message={fieldErrors.companySize} />
            </div>

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

            <div className="space-y-3">

              <div>
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    name="privacyConsent"
                    checked={formData.privacyConsent}
                    onChange={handleChange}
                    className={`mt-1 w-5 h-5 border-2 rounded focus:ring-2 focus:ring-primary text-primary cursor-pointer ${
                      fieldErrors.privacyConsent ? 'border-red-400' : 'border-border-light'
                    }`}
                  />
                  <span className="text-sm text-text-main-light">
                    Potwierdzam, że administratorem moich danych osobowych jest Przetargo (zgodnie z Polityką Prywatności) oraz że moje dane będą przetwarzane w celu rejestracji, kontaktu i obsługi zapytania. Zapoznałem(-am) się z{' '}
                    <a href="#" className="text-primary hover:underline">
                      Polityką Prywatności
                    </a>
                    . *
                  </span>
                </label>
                <FieldError message={fieldErrors.privacyConsent} />
              </div>
            </div>
          </div>

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
