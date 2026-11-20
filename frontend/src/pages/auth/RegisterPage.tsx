import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { User, Building, ArrowRight, AlertCircle, CheckCircle2, X } from 'lucide-react';
import api from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';

export const RegisterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialType = searchParams.get('type') === 'client' ? 'client' : 'developer';
  const [accountType, setAccountType] = useState<'developer' | 'client'>(initialType);
  const { login } = useAuth();
  const { settings } = useSettings();
  const navigate = useNavigate();

  const platformName = settings?.company_name || 'RMVS Web Services';
  const platformLogo = settings?.logo_url || '/logo.png';

  // Shared fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  // Developer specific fields
  const [title, setTitle] = useState('');
  const [shortBio, setShortBio] = useState('');
  const [location, setLocation] = useState('');
  const [yearsExperience, setYearsExperience] = useState(2);
  const [githubUrl, setGithubUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [availability, setAvailability] = useState('Available for Projects');
  const [skills, setSkills] = useState<string[]>(['React', 'TypeScript', 'Python']);
  const [newSkill, setNewSkill] = useState('');

  // Client specific fields
  const [companyName, setCompanyName] = useState('');
  const [website, setWebsite] = useState('');
  const [industry, setIndustry] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const removeSkill = (sToRemove: string) => {
    setSkills(skills.filter((s) => s !== sToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (accountType === 'developer') {
        const payload = {
          full_name: fullName,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          phone: phone || null,
          password: password,
          title: title || 'Full-Stack Developer',
          short_bio: shortBio,
          location: location,
          skills: skills,
          years_experience: Number(yearsExperience),
          github_url: githubUrl || null,
          linkedin_url: linkedinUrl || null,
          portfolio_url: portfolioUrl || null,
          availability: availability,
        };

        const res = await api.post('/auth/register/developer', payload);
        login(res.data.access_token, res.data.user);
        navigate('/dashboard');
      } else {
        const payload = {
          full_name: fullName,
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          phone: phone || null,
          password: password,
          company_name: companyName,
          website: website || null,
          industry: industry || null,
        };

        const res = await api.post('/auth/register/client', payload);
        login(res.data.access_token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      console.error('Registration failed', err);
      setError(err.response?.data?.detail || 'Registration failed. Please check your inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none px-4 py-3 transition-colors shadow-2xs';

  const labelClass = 'block text-slate-600 text-xs tracking-wider uppercase mb-1.5 font-mono font-semibold';

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-800 flex items-start justify-center px-6 py-16 selection:bg-blue-600 selection:text-white">
      <div className="w-full max-w-2xl space-y-8">

        {/* Brand */}
        <div className="text-center space-y-2 flex flex-col items-center">
          <Link to="/" className="inline-block mb-3">
            <img src={platformLogo} alt={platformName} className="h-12 w-auto max-w-[240px] mx-auto object-contain transition-transform hover:scale-[1.02]" />
          </Link>
          <h2 className="font-sans font-extrabold text-2xl sm:text-3xl text-slate-900 leading-tight">
            Create Your <span className="bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 bg-clip-text text-transparent">Account</span>
          </h2>
          <p className="text-slate-500 text-xs">
            Register to access developer projects, client inquiries, or executive administration.
          </p>
        </div>

        {/* Account Type Tabs */}
        <div className="grid grid-cols-2 gap-2 p-1.5 rounded-2xl border border-slate-200 bg-white shadow-2xs">
          <button
            type="button"
            onClick={() => setAccountType('developer')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              accountType === 'developer'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User size={14} />
            <span>Developer</span>
          </button>

          <button
            type="button"
            onClick={() => setAccountType('client')}
            className={`py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center justify-center gap-1.5 ${
              accountType === 'client'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building size={14} />
            <span>Client</span>
          </button>
        </div>

        {/* Main Form Card */}
        <div className="rounded-3xl p-8 border border-slate-200/90 shadow-[0_4px_25px_rgba(0,0,0,0.05)] bg-white">

          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
              <AlertCircle size={16} className="shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Developer Notice */}
          {accountType === 'developer' && (
            <div className="mb-6 p-4 rounded-2xl border border-blue-200 bg-blue-50 flex items-start gap-3">
              <CheckCircle2 size={16} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-slate-900 text-xs font-semibold mb-0.5">Developer Verification Process</p>
                <p className="text-slate-600 text-xs leading-relaxed">
                  Upon registration, your developer profile is created. Platform administrators review and verify your profile so you can publish projects and connect with enterprise clients.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Shared Credentials */}
            <div className="space-y-4">
              <h3 className="font-sans font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
                1. Account Credentials
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ritesh Lingamallu"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Username *</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. ritesh-lingamallu"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ritesh@company.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>Password *</label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className={inputClass}
                />
              </div>
            </div>

            {/* Developer Specific Fields */}
            {accountType === 'developer' && (
              <div className="space-y-4 pt-2">
                <h3 className="font-sans font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
                  2. Professional Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Professional Title *</label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g. Senior Full-Stack Developer"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Years Experience</label>
                    <input
                      type="number"
                      min={0}
                      max={50}
                      value={yearsExperience}
                      onChange={(e) => setYearsExperience(Number(e.target.value))}
                      className={inputClass}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Location</label>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Hyderabad, India"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Availability</label>
                    <select
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                      className={inputClass}
                    >
                      <option value="Available for Projects">Available for Projects</option>
                      <option value="Available for Consulting & Advisory">Available for Consulting &amp; Advisory</option>
                      <option value="Available for Enterprise Projects">Available for Enterprise Projects</option>
                      <option value="Full-time">Full-time</option>
                      <option value="Busy">Busy</option>
                    </select>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <label className={labelClass}>Technologies &amp; Core Skills</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="text-xs text-blue-700 px-3 py-1 rounded-full flex items-center gap-1.5 border border-blue-200 bg-blue-50 font-mono font-medium"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removeSkill(skill)}
                          className="text-slate-400 hover:text-slate-600"
                        >
                          <X size={12} />
                        </button>
                      </span>
                    ))}
                  </div>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={(e) => setNewSkill(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          addSkill();
                        }
                      }}
                      placeholder="Type a skill (e.g. FastAPI, Docker) and press Add"
                      className={inputClass}
                    />
                    <button
                      type="button"
                      onClick={addSkill}
                      className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shrink-0 shadow-2xs transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Social links */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className={labelClass}>GitHub URL</label>
                    <input
                      type="url"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>LinkedIn URL</label>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={(e) => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/..."
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Website / Work Details URL</label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={(e) => setPortfolioUrl(e.target.value)}
                      placeholder="https://yourwebsite.com or work link..."
                      className={inputClass}
                    />
                  </div>
                </div>

                {/* Short Bio */}
                <div>
                  <label className={labelClass}>Short Bio</label>
                  <textarea
                    rows={2}
                    value={shortBio}
                    onChange={(e) => setShortBio(e.target.value)}
                    placeholder="Brief 1–2 sentence overview of your engineering domain…"
                    className={`${inputClass} resize-none`}
                  />
                </div>
              </div>
            )}

            {/* Client Specific Fields */}
            {accountType === 'client' && (
              <div className="space-y-4 pt-2">
                <h3 className="font-sans font-bold text-slate-900 text-lg border-b border-slate-100 pb-2">
                  2. Organization Information
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Company Name *</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Apex Dynamics Ltd"
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label className={labelClass}>Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. FinTech, CleanTech, SaaS"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className={labelClass}>Company Website</label>
                  <input
                    type="url"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    placeholder="https://company.com"
                    className={inputClass}
                  />
                </div>
              </div>
            )}

            {/* Submit */}
            <div className="pt-4 border-t border-slate-100">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isLoading ? 'Creating Account…' : `Register as ${accountType === 'developer' ? 'Developer' : 'Client'}`}</span>
                <ArrowRight size={15} />
              </button>
            </div>
          </form>

          {/* Login prompt */}
          <div className="mt-6 text-center text-xs text-slate-500">
            Already have an account?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-700 underline underline-offset-2 font-semibold transition-colors">
              Sign in to your workspace
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
