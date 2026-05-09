import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Zap, CheckCircle2, Image as ImageIcon, Camera } from 'lucide-react';
import { Button, Input, Card } from '../components/ui';
import { useStore } from '../store/useStore';
import { useToast } from '../contexts/ToastContext';
import { useSolanaWallet } from '../hooks/useSolanaWallet';
import { initializeUser, fetchUserAccount } from '../lib/nexpay-sdk';
import { WalletGuard } from '../components/WalletGuard';

const slides = [
  { icon: Globe, title: "Send money to 150+ countries", text: "Global transfers at your fingertips." },
  { icon: Zap, title: "Settle in under 1 second", text: "Powered by USDC and USDT." },
  { icon: CheckCircle2, title: "0.1% flat fee. No hidden costs.", text: "Keep more of your money." }
];

export const Onboarding = () => {
  const [step, setStep] = useState('slides'); 
  const [slideIndex, setSlideIndex] = useState(0);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  const { login } = useStore();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const { walletAdapter, connected, userAccount } = useSolanaWallet();
  const [isLoading, setIsLoading] = useState(false);

  // Check if already registered
  useEffect(() => {
    if (connected && walletAdapter) {
      fetchUserAccount(walletAdapter).then(acc => {
        if (acc) {
          login({ name: acc.username, email: 'connected@wallet', tier: ['Free', 'Pro', 'Business'][acc.tier] || 'Free' });
          navigate('/');
        }
      }).catch(console.error);
    }
  }, [connected, walletAdapter]);

  const handleNextSlide = () => {
    if (slideIndex < slides.length - 1) setSlideIndex(slideIndex + 1);
    else setStep('auth');
  };

  const validateSignup = () => {
    const errs = {};
    if (!username.trim()) errs.username = "This field is required";
    if (!email.trim()) errs.email = "This field is required";
    if (!phone.trim()) errs.phone = "This field is required";
    if (!password.trim()) errs.password = "This field is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSignupSubmit = (e) => {
    e.preventDefault();
    if (!validateSignup()) return;
    setStep('kyc1');
  };

  const handleFinishSetup = async () => {
    if (!walletAdapter) {
      showToast("Wallet not connected", "error");
      return;
    }
    setIsLoading(true);
    try {
      const txSig = await initializeUser(walletAdapter, username, "");
      login({ name: username, email, tier: 'Free', txSig });
      showToast("Account created successfully!", "success");
      navigate('/');
    } catch (err) {
      showToast(`Registration failed — ${err.message}`, "error");
    } finally {
      setIsLoading(false);
    }
  };

  if (step === 'slides') {
    const SlideIcon = slides[slideIndex].icon;
    return (
      <div className="flex flex-col h-full p-6 text-center bg-bgDark">
        <div className="flex-1 flex flex-col justify-center items-center space-y-8">
          <div className="w-32 h-32 rounded-full bg-primary/10 flex items-center justify-center">
            <SlideIcon className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-3xl font-bold">{slides[slideIndex].title}</h1>
          <p className="text-textMuted text-lg">{slides[slideIndex].text}</p>
        </div>
        <div className="flex space-x-2 justify-center mb-8">
          {slides.map((_, i) => (
            <div key={i} className={`h-2 rounded-full transition-all ${i === slideIndex ? 'w-8 bg-primary' : 'w-2 bg-borderDark'}`} />
          ))}
        </div>
        <Button onClick={handleNextSlide} size="lg">Continue</Button>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <WalletGuard>
        <div className="flex flex-col h-full p-6 justify-center space-y-4 bg-bgDark">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-primary mb-2">NexPay</h1>
            <p className="text-textMuted">Welcome to the future of money</p>
          </div>
          <Button onClick={() => setStep('signup')} size="lg">Sign Up</Button>
        </div>
      </WalletGuard>
    );
  }

  if (step === 'signup') {
    return (
      <WalletGuard>
        <div className="flex flex-col h-full p-6 justify-center overflow-y-auto bg-bgDark">
          <h2 className="text-2xl font-bold mb-6">Create Account</h2>
          <form onSubmit={handleSignupSubmit} className="space-y-4">
            <Input label="Full Name" placeholder="John Doe" value={username} onChange={e => setUsername(e.target.value)} error={errors.username} />
            <Input label="Email" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
            <Input label="Phone Number" type="tel" placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} />
            <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
            <Button type="submit" size="lg" className="w-full mt-4">Create Account</Button>
          </form>
          <Button variant="ghost" onClick={() => setStep('auth')} className="mt-4">Back</Button>
        </div>
      </WalletGuard>
    );
  }

  if (step.startsWith('kyc')) {
    const kycStep = parseInt(step.replace('kyc', ''));
    return (
      <WalletGuard>
        <div className="flex flex-col h-full p-6 bg-bgDark">
          <div className="mb-8 mt-4">
            <p className="text-sm text-textMuted mb-2">Step {kycStep} of 3</p>
            <div className="flex space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1 flex-1 rounded-full ${i <= kycStep ? 'bg-primary' : 'bg-borderDark'}`} />
              ))}
            </div>
          </div>

          {kycStep === 1 && (
            <div className="flex-1 flex flex-col space-y-6">
              <h2 className="text-2xl font-bold">Upload ID</h2>
              <Card className="border-dashed border-2 bg-transparent flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-card/50 transition-colors">
                <ImageIcon className="w-12 h-12 text-textMuted mb-4" />
                <p className="font-medium text-textMuted">Tap to upload Front of ID</p>
              </Card>
              <Card className="border-dashed border-2 bg-transparent flex flex-col items-center justify-center p-8 cursor-pointer hover:bg-card/50 transition-colors">
                <ImageIcon className="w-12 h-12 text-textMuted mb-4" />
                <p className="font-medium text-textMuted">Tap to upload Back of ID</p>
              </Card>
              <div className="mt-auto">
                <Button onClick={() => setStep('kyc2')} size="lg" className="w-full">Continue</Button>
              </div>
            </div>
          )}

          {kycStep === 2 && (
            <div className="flex-1 flex flex-col space-y-6">
              <h2 className="text-2xl font-bold">Take Selfie</h2>
              <div className="flex-1 bg-card rounded-2xl flex items-center justify-center relative overflow-hidden">
                <div className="w-48 h-64 border-4 border-dashed border-textMuted rounded-full opacity-50 absolute" />
                <Camera className="w-16 h-16 text-textMuted" />
              </div>
              <div className="mt-auto">
                <Button onClick={() => setStep('kyc3')} size="lg" className="w-full">Take Selfie</Button>
              </div>
            </div>
          )}

          {kycStep === 3 && (
            <div className="flex-1 flex flex-col space-y-6 overflow-y-auto pb-4">
              <h2 className="text-2xl font-bold">Verify Address</h2>
              <div className="space-y-4">
                <Input label="Street Address" placeholder="123 Main St" />
                <div className="grid grid-cols-2 gap-4">
                  <Input label="City" placeholder="New York" />
                  <Input label="Postal Code" placeholder="10001" />
                </div>
                <Input label="Phone OTP" placeholder="123456" />
              </div>
              <div className="mt-auto">
                <Button onClick={handleFinishSetup} size="lg" isLoading={isLoading} className="w-full">Complete Setup</Button>
              </div>
            </div>
          )}
        </div>
      </WalletGuard>
    );
  }

  return null;
};
