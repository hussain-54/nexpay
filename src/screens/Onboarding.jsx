import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Globe, Zap, CheckCircle2, Image as ImageIcon, Camera, ChevronLeft } from 'lucide-react';
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

  const handleLoginClick = async () => {
    if (!walletAdapter) {
      showToast("Please connect your wallet first.", "error");
      return;
    }
    
    setIsLoading(true);
    try {
      const acc = await fetchUserAccount(walletAdapter);
      if (acc) {
        login({ name: acc.username, email: 'connected@wallet', tier: ['Free', 'Pro', 'Business'][acc.tier] || 'Free' });
        navigate('/');
        showToast("Welcome back!", "success");
      } else {
        showToast("No account found for this wallet. Please Create Account.", "error");
      }
    } catch (err) {
      showToast("Error checking account.", "error");
    } finally {
      setIsLoading(false);
    }
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
      <div className="flex flex-col h-full p-6 text-center bg-gradient-to-br from-bgDark via-bgDark to-primary/10 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-primary/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="flex-1 flex flex-col justify-center items-center space-y-8 z-10">
          <div className="w-32 h-32 rounded-[2rem] bg-card/40 backdrop-blur-md border border-white/10 shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center justify-center transform transition-transform hover:scale-105">
            <SlideIcon className="w-14 h-14 text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]" />
          </div>
          <div className="space-y-4">
            <h1 className="text-3xl font-extrabold tracking-tight text-white leading-tight px-4">{slides[slideIndex].title}</h1>
            <p className="text-textMuted text-lg px-6">{slides[slideIndex].text}</p>
          </div>
        </div>
        <div className="flex space-x-2 justify-center mb-8 z-10">
          {slides.map((_, i) => (
            <div key={i} className={`h-1.5 rounded-full transition-all duration-300 ${i === slideIndex ? 'w-8 bg-primary shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'w-2 bg-white/10'}`} />
          ))}
        </div>
        <Button onClick={handleNextSlide} size="lg" className="z-10 shadow-lg shadow-primary/20 font-bold tracking-wide">Continue</Button>
      </div>
    );
  }

  if (step === 'auth') {
    return (
      <WalletGuard>
        <div className="flex flex-col h-full p-6 justify-center bg-gradient-to-b from-bgDark to-card relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />
          
          <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 z-10">
            <div className="w-20 h-20 bg-primary/20 rounded-3xl flex items-center justify-center mb-4 border border-primary/30 backdrop-blur-md shadow-[0_0_30px_rgba(99,102,241,0.3)]">
              <Zap className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight">NexPay</h1>
            <p className="text-textMuted text-lg max-w-[250px]">The future of global finance.</p>
          </div>
          
          <div className="flex flex-col space-y-3 z-10 mb-8">
            <Button onClick={() => setStep('signup')} size="lg" className="w-full shadow-lg shadow-primary/20 font-bold">Create Account</Button>
            <Button variant="secondary" onClick={handleLoginClick} isLoading={isLoading} size="lg" className="w-full font-bold">Log In</Button>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (step === 'signup') {
    return (
      <WalletGuard>
        <div className="flex flex-col h-full bg-bgDark">
          <div className="flex items-center p-4 border-b border-white/5 relative shrink-0">
            <button onClick={() => setStep('auth')} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h1 className="text-lg font-bold flex-1 text-center pr-8 text-white">Create Account</h1>
          </div>
          
          <div className="flex-1 p-6 overflow-y-auto">
            <form onSubmit={handleSignupSubmit} className="space-y-5">
              <Input label="Full Name" placeholder="John Doe" value={username} onChange={e => setUsername(e.target.value)} error={errors.username} />
              <Input label="Email Address" type="email" placeholder="john@example.com" value={email} onChange={e => setEmail(e.target.value)} error={errors.email} />
              <Input label="Phone Number" type="tel" placeholder="+1 234 567 8900" value={phone} onChange={e => setPhone(e.target.value)} error={errors.phone} />
              <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} error={errors.password} />
              
              <div className="pt-4 pb-8">
                <Button type="submit" size="lg" className="w-full shadow-lg shadow-primary/20 font-bold">Continue</Button>
              </div>
            </form>
          </div>
        </div>
      </WalletGuard>
    );
  }

  if (step.startsWith('kyc')) {
    const kycStep = parseInt(step.replace('kyc', ''));
    return (
      <WalletGuard>
        <div className="flex flex-col h-full bg-bgDark">
          <div className="flex items-center p-4 border-b border-white/5 relative shrink-0">
            <button onClick={() => setStep(kycStep === 1 ? 'signup' : `kyc${kycStep - 1}`)} className="p-2 -ml-2 rounded-full hover:bg-white/5 transition-colors">
              <ChevronLeft size={24} className="text-white" />
            </button>
            <h1 className="text-lg font-bold flex-1 text-center pr-8 text-white">Verification</h1>
          </div>

          <div className="flex-1 p-6 flex flex-col overflow-y-auto">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-3">
                <p className="text-sm font-medium text-white">Step {kycStep} of 3</p>
                <p className="text-xs text-textMuted">{kycStep === 1 ? 'ID Upload' : kycStep === 2 ? 'Selfie' : 'Address'}</p>
              </div>
              <div className="flex space-x-2">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i <= kycStep ? 'bg-primary shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-white/10'}`} />
                ))}
              </div>
            </div>

            {kycStep === 1 && (
              <div className="flex-1 flex flex-col space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Upload your ID</h2>
                  <p className="text-textMuted text-sm">Please ensure all text is legible and well-lit.</p>
                </div>
                <Card className="border-dashed border-2 border-white/10 bg-black/20 flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all rounded-[2rem]">
                  <ImageIcon className="w-12 h-12 text-textMuted mb-4" />
                  <p className="font-semibold text-white">Front of ID</p>
                  <p className="text-xs text-textMuted mt-1">Tap to scan</p>
                </Card>
                <Card className="border-dashed border-2 border-white/10 bg-black/20 flex flex-col items-center justify-center p-10 cursor-pointer hover:bg-white/5 hover:border-primary/50 transition-all rounded-[2rem]">
                  <ImageIcon className="w-12 h-12 text-textMuted mb-4" />
                  <p className="font-semibold text-white">Back of ID</p>
                  <p className="text-xs text-textMuted mt-1">Tap to scan</p>
                </Card>
                <div className="mt-auto pt-8 pb-4">
                  <Button onClick={() => setStep('kyc2')} size="lg" className="w-full font-bold">Continue</Button>
                </div>
              </div>
            )}

            {kycStep === 2 && (
              <div className="flex-1 flex flex-col space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">Take a Selfie</h2>
                  <p className="text-textMuted text-sm">Position your face within the oval.</p>
                </div>
                <div className="flex-1 bg-black/40 border border-white/5 rounded-[2rem] flex items-center justify-center relative overflow-hidden backdrop-blur-md">
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 pointer-events-none" />
                  <div className="w-56 h-72 border-4 border-dashed border-white/30 rounded-full flex flex-col items-center justify-center z-10 shadow-[0_0_50px_rgba(0,0,0,0.5)_inset]">
                    <Camera className="w-16 h-16 text-white/50 mb-4" />
                    <span className="text-xs font-medium text-white/70 tracking-widest uppercase">Align Face</span>
                  </div>
                </div>
                <div className="mt-auto pt-8 pb-4">
                  <Button onClick={() => setStep('kyc3')} size="lg" className="w-full font-bold shadow-lg shadow-primary/20">Capture</Button>
                </div>
              </div>
            )}

            {kycStep === 3 && (
              <div className="flex-1 flex flex-col">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white mb-2">Verify Address</h2>
                  <p className="text-textMuted text-sm">Enter your residential address exactly as it appears on your ID.</p>
                </div>
                <div className="space-y-5 flex-1">
                  <Input label="Street Address" placeholder="123 Financial District" />
                  <div className="grid grid-cols-2 gap-4">
                    <Input label="City" placeholder="New York" />
                    <Input label="Postal Code" placeholder="10001" />
                  </div>
                  <div className="pt-4 border-t border-white/10 mt-6">
                    <Input label="Phone Verification OTP" placeholder="6-digit code" type="number" className="tracking-widest font-mono text-lg" />
                  </div>
                </div>
                <div className="mt-auto pt-8 pb-4">
                  <Button onClick={handleFinishSetup} size="lg" isLoading={isLoading} className="w-full font-bold shadow-lg shadow-primary/20">Complete Registration</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </WalletGuard>
    );
  }

  return null;
};
