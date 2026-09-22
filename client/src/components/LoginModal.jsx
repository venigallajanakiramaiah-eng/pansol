import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function LoginModal() {
  const { loginModalOpen, closeLoginModal, login, signup } = useAuth();
  const [mode, setMode] = useState('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loginModalOpen) return null;

  const reset = () => {
    setName('');
    setEmail('');
    setPassword('');
    setError('');
  };

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
      reset();
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    closeLoginModal();
  };

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal__close" onClick={handleClose} aria-label="Close">
          ×
        </button>
        <h2 className="modal__title">
          {mode === 'login' ? 'Log in to see the full details' : 'Create an account'}
        </h2>
        <p className="modal__subtitle">
          Full growing guides and plant uses are available to registered gardeners.
        </p>

        <form className="modal__form" onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <label className="field">
              Name
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </label>
          )}
          <label className="field">
            Email
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </label>
          <label className="field">
            Password
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
          </label>

          {error && <p className="modal__error">{error}</p>}

          <button className="btn btn--primary btn--block" type="submit" disabled={submitting}>
            {submitting ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Sign up'}
          </button>
        </form>

        <p className="modal__switch">
          {mode === 'login' ? (
            <>
              New to Pansol?{' '}
              <button className="link-btn" onClick={() => switchMode('signup')}>
                Create an account
              </button>
            </>
          ) : (
            <>
              Already have an account?{' '}
              <button className="link-btn" onClick={() => switchMode('login')}>
                Log in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
