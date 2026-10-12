import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Settings as SettingsIcon, 
  Save, 
  AlertCircle, 
  CheckCircle2, 
  Upload, 
  Plus, 
  Trash2, 
  Camera, 
  Edit, 
  Cpu, 
  Share2, 
  Target, 
  X,
  Phone,
  MapPin,
  Mail,
  Award,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Database,
  Lock,
  Layers
} from 'lucide-react';
import api from '@/lib/axios';
import { useAuth } from '@/features/auth/context/AuthContext';

// 🌟 ULTRA-SMART GOOGLE MAPS EMBED PARSER
const cleanGoogleMapUrl = (inputUrl: string, fallbackAddress?: string): string => {
  const trimmed = (inputUrl || '').trim();
  const iframeMatch = trimmed.match(/src=["']([^"']+)["']/i);
  if (iframeMatch && iframeMatch[1]) return iframeMatch[1];
  if (trimmed.includes('google.com/maps/embed') || (trimmed.includes('google.com') && trimmed.includes('output=embed'))) return trimmed;
  const placeMatch = trimmed.match(/maps\/place\/([^/@?]+)/i);
  if (placeMatch && placeMatch[1]) {
    const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, ' '));
    return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  }
  const qMatch = trimmed.match(/[?&](?:q|query)=([^&]+)/i);
  if (qMatch && qMatch[1]) return `https://maps.google.com/maps?q=${qMatch[1]}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
  const addressFallback = fallbackAddress || 'Dhanmondi, Dhaka - 1209, Bangladesh';
  return `https://maps.google.com/maps?q=${encodeURIComponent(addressFallback)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;
};

// 🌟 ডাটাবেজ কালেকশন তালিকা
const DATABASE_TARGETS = [
  { key: 'appointments', label: 'Doctor Chamber Appointments & Serials', desc: 'সকল চেম্বার সিরিয়াল, বুকিং হিস্ট্রি ও শিডিউল কাউন্টার ক্লিয়ার' },
  { key: 'testBookings', label: 'Diagnostic Test Orders & Home Collections', desc: 'সকল প্যাথলজি ও রেডিওলজি টেস্ট বুকিং রেকর্ড ক্লিয়ার' },
  { key: 'reports', label: 'Published Medical Reports & Lab Files', desc: 'সকল প্রস্তুতকৃত ও আপলোড করা টেস্ট রিপোর্ট ডাটা ক্লিয়ার' },
  { key: 'prescriptions', label: 'Digital Prescriptions (Rx Records)', desc: 'সকল তৈরি করা ডিজিটাল প্রেসক্রিপশন ক্লিয়ার' },
  { key: 'patients', label: 'Registered Patient Accounts & Profiles', desc: 'সকল নিবন্ধিত রোগীর তালিকা ক্লিয়ার (অ্যাডমিন বা ডাক্তার ডিলিট হবে না)' },
  { key: 'messages', label: 'Patient Complaints & Contact Inquiries', desc: 'সকল রোগী ফিডব্যাক ও মেসেজ ক্লিয়ার' },
  { key: 'gallery', label: 'Photo Gallery Facilities Records', desc: 'সকল ল্যাবরেটরি ও চেম্বার ফটো রেকর্ড ক্লিয়ার' },
];

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentAdmin } = useAuth();
  const isSuperAdmin = currentAdmin?.role === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'branding' | 'leadership' | 'technologies' | 'socials' | 'mission' | 'slider' | 'management' | 'contact' | 'database'>('branding');

  const [expandedAdminDescs, setExpandedAdminDescs] = useState<Record<string, boolean>>({});

  const toggleAdminDesc = (key: string) => {
    setExpandedAdminDescs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Multi-Select States for Items
  const [selectedSlideIds, setSelectedSlideIds] = useState<string[]>([]);
  const [selectedTechIds, setSelectedTechIds] = useState<string[]>([]);
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([]);
  const [selectedSocialIds, setSelectedSocialIds] = useState<string[]>([]);

  // 🛡️ DATABASE CLEAR STATES
  const [selectedDbTargets, setSelectedDbTargets] = useState<string[]>([]);
  const [isDbClearModalOpen, setIsDbClearModalOpen] = useState(false);
  const [superAdminDbPassword, setSuperAdminDbPassword] = useState('');
  const [confirmClearKeyword, setConfirmClearKeyword] = useState('');

  // Items Hard Security Delete Modal
  const [isItemSecurityModalOpen, setIsItemSecurityModalOpen] = useState(false);
  const [itemDeletePassword, setItemDeletePassword] = useState('');
  const [itemDeleteKeyword, setItemDeleteKeyword] = useState('');
  const [pendingItemDeleteAction, setPendingItemDeleteAction] = useState<{
    moduleKey: string;
    itemIds: string[];
    description: string;
  } | null>(null);

  // Edit Modals States
  const [editingTech, setEditingTech] = useState<any | null>(null);
  const [editingSocial, setEditingSocial] = useState<any | null>(null);
  const [editingSlide, setEditingSlide] = useState<any | null>(null);
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // File Input References
  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const footerLogoFileRef = useRef<HTMLInputElement | null>(null);
  const faviconFileRef = useRef<HTMLInputElement | null>(null);
  const loaderLogoFileRef = useRef<HTMLInputElement | null>(null);
  const slideFileRef = useRef<HTMLInputElement | null>(null);
  const editSlideFileRef = useRef<HTMLInputElement | null>(null);
  const techPhotoRef = useRef<HTMLInputElement | null>(null);
  const editTechPhotoRef = useRef<HTMLInputElement | null>(null);
  const socialIconRef = useRef<HTMLInputElement | null>(null);
  const memberPhotoRef = useRef<HTMLInputElement | null>(null);
  const editMemberPhotoRef = useRef<HTMLInputElement | null>(null);
  const chairmanPhotoRef = useRef<HTMLInputElement | null>(null);
  const mdPhotoRef = useRef<HTMLInputElement | null>(null);

  // Form States
  const [siteName, setSiteName] = useState('Care Point');
  const [tagline, setTagline] = useState('Diagnostic & Consultation Centre');
  const [logoUrl, setLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [loaderLogoUrl, setLoaderLogoUrl] = useState('');
  const [topbarHotlineText, setTopbarHotlineText] = useState('09666 787801');
  const [topbarStatusText, setTopbarStatusText] = useState('Online Services: Active 24/7');
  const [topbarCertText, setTopbarCertText] = useState('ISO 9001:2015 Certified');

  const [chairmanName, setChairmanName] = useState('');
  const [chairmanDegrees, setChairmanDegrees] = useState('');
  const [chairmanStatement, setChairmanStatement] = useState('');
  const [chairmanPhoto, setChairmanPhoto] = useState('');

  const [mdName, setMdName] = useState('');
  const [mdDegrees, setMdDegrees] = useState('');
  const [mdStatement, setMdStatement] = useState('');
  const [mdPhoto, setMdPhoto] = useState('');

  const [hotline, setHotline] = useState('09666 787801');
  const [supportPhone, setSupportPhone] = useState('+880 1700-000000');
  const [email, setEmail] = useState('info@carepoint.com');
  const [address, setAddress] = useState('House 42, Road 11, Dhanmondi, Dhaka - 1209');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState('');

  const [technologies, setTechnologies] = useState<any[]>([]);
  const [newTechName, setNewTechName] = useState('');
  const [newTechModel, setNewTechModel] = useState('');
  const [newTechManufacturer, setNewTechManufacturer] = useState('');
  const [newTechDesc, setNewTechDesc] = useState('');
  const [newTechImageUrl, setNewTechImageUrl] = useState('');

  const [customSocialLinks, setCustomSocialLinks] = useState<any[]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Facebook');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIconUrl, setNewSocialIconUrl] = useState('');

  const [slides, setSlides] = useState<any[]>([]);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideUploadedUrl, setNewSlideUploadedUrl] = useState('');

  const [managementTeam, setManagementTeam] = useState<any[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDesignation, setNewMemberDesignation] = useState('');
  const [newMemberDegrees, setNewMemberDegrees] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberPhotoUrl, setNewMemberPhotoUrl] = useState('');

  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionPoints, setMissionPoints] = useState<string[]>([]);
  const [newMissionPointText, setNewMissionPointText] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Settings Query
  const { data: settings } = useQuery({
    queryKey: ['admin-master-settings'],
    queryFn: async () => (await api.get('/settings')).data.data,
  });

  // 🌟 Live Database Collection Counts Query (Instant live load)
  const { data: dbStats, refetch: refetchDbStats, isLoading: isDbStatsLoading } = useQuery({
    queryKey: ['admin-db-stats'],
    queryFn: async () => {
      const res = await api.get('/database/stats');
      return res.data.data;
    },
    staleTime: 0,
  });

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || '');
      setTagline(settings.tagline || '');
      setLogoUrl(settings.logoUrl || '');
      setFooterLogoUrl(settings.footerLogoUrl || '');
      setFaviconUrl(settings.faviconUrl || '');
      setLoaderLogoUrl(settings.loaderLogoUrl || '');
      setTopbarHotlineText(settings.topbarHotlineText || '');
      setTopbarStatusText(settings.topbarStatusText || '');
      setTopbarCertText(settings.topbarCertText || '');

      setChairmanName(settings.chairmanMessage?.name || '');
      setChairmanDegrees(settings.chairmanMessage?.degrees || '');
      setChairmanStatement(settings.chairmanMessage?.statement || '');
      setChairmanPhoto(settings.chairmanMessage?.photoUrl || '');

      setMdName(settings.managingDirectorMessage?.name || '');
      setMdDegrees(settings.managingDirectorMessage?.degrees || '');
      setMdStatement(settings.managingDirectorMessage?.statement || '');
      setMdPhoto(settings.managingDirectorMessage?.photoUrl || '');

      setHotline(settings.hotline || '');
      setSupportPhone(settings.supportPhone || '');
      setEmail(settings.email || '');
      setAddress(settings.address || '');
      setGoogleMapUrl(settings.googleMapUrl || '');
      setWhatsappNumber(settings.whatsappNumber || '');
      setWhatsappDefaultMessage(settings.whatsappDefaultMessage || '');

      setTechnologies(settings.technologies || []);
      setCustomSocialLinks(settings.customSocialLinks || []);
      setSlides(settings.heroSlides || []);
      setManagementTeam(settings.managementTeam || []);

      setMissionTitle(settings.mission?.title || '');
      setMissionDesc(settings.mission?.description || '');
      setMissionPoints(settings.mission?.points || []);
    }
  }, [settings]);

  const uploadImageFile = async (file: File, onSuccess: (url: string) => void) => {
    const localUrl = URL.createObjectURL(file);
    onSuccess(localUrl);
    const formData = new FormData();
    formData.append('image', file);
    setIsUploading(true);
    setErrorMsg(null);
    try {
      const res = await api.post('/upload/image', formData);
      if (res.data.success) {
        onSuccess(res.data.data.imageUrl);
        setSuccessMsg('Photo uploaded and preview ready!');
        setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch {
      setErrorMsg('Failed to upload image.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => api.put('/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-master-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      setSuccessMsg('Settings saved successfully!');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to save settings.'),
  });

  // 🛡️ SUPER ADMIN DATABASE CLEAR MUTATION
  const clearDatabaseMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/database/clear', payload),
    onSuccess: () => {
      queryClient.invalidateQueries();
      refetchDbStats();
      setSuccessMsg('Selected database collections permanently cleared!');
      setErrorMsg(null);
      setIsDbClearModalOpen(false);
      setSelectedDbTargets([]);
      setSuperAdminDbPassword('');
      setConfirmClearKeyword('');
      setTimeout(() => setSuccessMsg(null), 4000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to clear database.'),
  });

  // 🛡️ SUPER ADMIN ITEM SELECTIVE DELETE MUTATION
  const selectiveDeleteMutation = useMutation({
    mutationFn: async (payload: any) => api.post('/settings/selective-delete', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-master-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      setSuccessMsg('Selected items permanently deleted by Super Admin!');
      setErrorMsg(null);
      setIsItemSecurityModalOpen(false);
      setItemDeletePassword('');
      setItemDeleteKeyword('');
      setPendingItemDeleteAction(null);
      setSelectedSlideIds([]);
      setSelectedTechIds([]);
      setSelectedMemberIds([]);
      setSelectedSocialIds([]);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to delete selected items.'),
  });

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      siteName,
      tagline,
      logoUrl,
      footerLogoUrl,
      faviconUrl,
      loaderLogoUrl,
      topbarHotlineText,
      topbarStatusText,
      topbarCertText,
      hotline,
      supportPhone,
      email,
      address,
      googleMapUrl: cleanGoogleMapUrl(googleMapUrl, address),
      whatsappNumber,
      whatsappDefaultMessage,
      technologies,
      customSocialLinks,
      heroSlides: slides,
      managementTeam,
      mission: { title: missionTitle, description: missionDesc, points: missionPoints },
      chairmanMessage: { name: chairmanName, degrees: chairmanDegrees, statement: chairmanStatement, photoUrl: chairmanPhoto },
      managingDirectorMessage: { name: mdName, degrees: mdDegrees, statement: mdStatement, photoUrl: mdPhoto },
    });
  };

  const handleAuthorizeDbClear = (e: React.FormEvent) => {
    e.preventDefault();
    if (confirmClearKeyword.trim() !== 'CLEAR_DATABASE') {
      setErrorMsg('Please type CLEAR_DATABASE exactly to confirm.');
      return;
    }
    if (!superAdminDbPassword.trim()) {
      setErrorMsg('Super Admin password is required.');
      return;
    }

    clearDatabaseMutation.mutate({
      selectedTargets: selectedDbTargets,
      password: superAdminDbPassword.trim(),
    });
  };

  const triggerItemDeleteModal = (moduleKey: string, itemIds: string[], description: string) => {
    if (itemIds.length === 0) {
      setErrorMsg('Please select at least one item using the checkboxes.');
      return;
    }
    setPendingItemDeleteAction({ moduleKey, itemIds, description });
    setItemDeletePassword('');
    setItemDeleteKeyword('');
    setIsItemSecurityModalOpen(true);
  };

  const handleAuthorizeItemDelete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pendingItemDeleteAction) return;

    if (itemDeleteKeyword.trim() !== 'DELETE') {
      setErrorMsg('Please type DELETE exactly to confirm.');
      return;
    }

    if (!itemDeletePassword.trim()) {
      setErrorMsg('Super Admin password is required.');
      return;
    }

    selectiveDeleteMutation.mutate({
      moduleKey: pendingItemDeleteAction.moduleKey,
      itemIds: pendingItemDeleteAction.itemIds,
      password: itemDeletePassword.trim(),
    });
  };

  const handleAddTechnology = () => {
    if (!newTechName.trim() || !newTechDesc.trim()) {
      setErrorMsg('Please enter technology name and clinical description.');
      return;
    }
    const item = {
      id: `tech-${Date.now()}`,
      name: newTechName.trim(),
      model: newTechModel.trim(),
      manufacturer: newTechManufacturer.trim(),
      description: newTechDesc.trim(),
      imageUrl: newTechImageUrl,
    };
    setTechnologies([...technologies, item]);
    setNewTechName('');
    setNewTechModel('');
    setNewTechManufacturer('');
    setNewTechDesc('');
    setNewTechImageUrl('');
  };

  const handleAddSocialLink = () => {
    if (!newSocialUrl.trim()) {
      setErrorMsg('Please enter social link URL.');
      return;
    }
    const item = {
      id: `soc-${Date.now()}`,
      platform: newSocialPlatform,
      url: newSocialUrl.trim(),
      iconUrl: newSocialIconUrl,
    };
    setCustomSocialLinks([...customSocialLinks, item]);
    setNewSocialUrl('');
    setNewSocialIconUrl('');
  };

  const handleAddSlide = () => {
    if (!newSlideUploadedUrl) {
      setErrorMsg('Please upload a slide banner image from your computer first.');
      return;
    }
    const item = {
      id: `slide-${Date.now()}`,
      imageUrl: newSlideUploadedUrl,
      title: newSlideTitle.trim() || 'Modern Healthcare',
      subtitle: newSlideSubtitle.trim() || 'Certified Laboratory Services',
      linkUrl: '/appointment',
      order: slides.length + 1,
    };
    setSlides([...slides, item]);
    setNewSlideUploadedUrl('');
    setNewSlideTitle('');
    setNewSlideSubtitle('');
  };

  const activeMapUrl = cleanGoogleMapUrl(googleMapUrl, address);

  return (
    <div className="space-y-6 max-w-6xl pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-[#006642] bg-[#f0fdf4] border border-emerald-300 px-3 py-1 rounded-full flex items-center gap-1.5 w-fit">
            <SettingsIcon className="w-3.5 h-3.5" /> All-in-One CMS & Database Engine
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-2">Master Settings & Database Manager</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Full business settings, branding, Google Maps, sliders, and super admin selective database purge.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={updateMutation.isPending || isUploading}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-6 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>{updateMutation.isPending ? 'Saving...' : 'Save All Settings'}</span>
        </button>
      </div>

      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
        <button onClick={() => setActiveTab('branding')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'branding' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Logo & Header</button>
        <button onClick={() => setActiveTab('leadership')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'leadership' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Chairman & MD</button>
        <button onClick={() => setActiveTab('technologies')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'technologies' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Technologies ({technologies.length})</button>
        <button onClick={() => setActiveTab('socials')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'socials' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Social Links ({customSocialLinks.length})</button>
        <button onClick={() => setActiveTab('mission')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'mission' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Mission & Vision</button>
        <button onClick={() => setActiveTab('slider')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'slider' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Banner Sliders ({slides.length})</button>
        <button onClick={() => setActiveTab('management')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'management' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Management Team ({managementTeam.length})</button>
        <button onClick={() => setActiveTab('contact')} className={`px-4 py-2 rounded-xl transition ${activeTab === 'contact' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}>Contact & Map</button>

        {/* 🌟 DEDICATED DATABASE CLEAR TAB FOR SUPER ADMIN */}
        {isSuperAdmin && (
          <button
            onClick={() => {
              refetchDbStats();
              setActiveTab('database');
            }}
            className={`px-4 py-2 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'database'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-red-600 bg-red-50 hover:bg-red-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Clear Database (ডাটাবেজ ক্লিয়ার)</span>
          </button>
        )}
      </div>

      {/* 1. BRANDING TAB */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Logos, Favicon & Brand Headers</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">1. Navbar Header Logo</label>
              <div className="w-full h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Header Logo" className="max-h-full max-w-full object-contain" />
                    <button type="button" onClick={() => setLogoUrl('')} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                ) : (<span className="text-[11px] text-slate-400 font-medium">No Logo Uploaded</span>)}
              </div>
              <input type="file" ref={logoFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setLogoUrl); }} accept="image/*" className="hidden" />
              <button type="button" onClick={() => logoFileRef.current?.click()} className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Upload Logo</span></button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">2. Dedicated Footer Logo</label>
              <div className="w-full h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center p-2 relative overflow-hidden group">
                {footerLogoUrl ? (
                  <>
                    <img src={footerLogoUrl} alt="Footer Logo" className="max-h-full max-w-full object-contain" />
                    <button type="button" onClick={() => setFooterLogoUrl('')} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                ) : (<span className="text-[11px] text-slate-400 font-medium">Uses Header Logo</span>)}
              </div>
              <input type="file" ref={footerLogoFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setFooterLogoUrl); }} accept="image/*" className="hidden" />
              <button type="button" onClick={() => footerLogoFileRef.current?.click()} className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Upload Footer Logo</span></button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">3. Browser Tab Favicon</label>
              <div className="w-full h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                {faviconUrl ? (
                  <>
                    <img src={faviconUrl} alt="Favicon" className="w-10 h-10 object-contain shadow-xs border p-1 rounded-lg" />
                    <button type="button" onClick={() => setFaviconUrl('')} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                ) : (<span className="text-[11px] text-slate-400 font-medium">Default Favicon</span>)}
              </div>
              <input type="file" ref={faviconFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setFaviconUrl); }} accept=".ico,.png,.svg,image/*" className="hidden" />
              <button type="button" onClick={() => faviconFileRef.current?.click()} className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Upload Favicon</span></button>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">4. Loader Animation Logo</label>
              <div className="w-full h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                {loaderLogoUrl ? (
                  <>
                    <img src={loaderLogoUrl} alt="Loader Logo" className="max-h-full max-w-full object-contain" />
                    <button type="button" onClick={() => setLoaderLogoUrl('')} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition shadow cursor-pointer"><Trash2 className="w-3.5 h-3.5" /></button>
                  </>
                ) : (<div className="w-12 h-12 rounded-2xl bg-brand-gradient text-white flex items-center justify-center font-black text-xl">C</div>)}
              </div>
              <input type="file" ref={loaderLogoFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setLoaderLogoUrl); }} accept="image/*" className="hidden" />
              <button type="button" onClick={() => loaderLogoFileRef.current?.click()} className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Upload Loader Image</span></button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block mb-1">Centre Brand Name *</label>
              <input type="text" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900" />
            </div>
            <div>
              <label className="block mb-1">Brand Tagline</label>
              <input type="text" value={tagline} onChange={(e) => setTagline(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900" />
            </div>
          </div>
        </div>
      )}

      {/* 2. LEADERSHIP TAB */}
      {activeTab === 'leadership' && (
        <div className="space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00984a]" /> Chairman's Official Statement & Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">Chairman Full Name *</label>
                <input type="text" value={chairmanName} onChange={(e) => setChairmanName(e.target.value)} placeholder="e.g. Prof. Dr. M. A. Rahim" className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block mb-1">Degrees & Titles</label>
                <input type="text" value={chairmanDegrees} onChange={(e) => setChairmanDegrees(e.target.value)} placeholder="MBBS, FCPS" className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900" />
              </div>
              <div className="flex items-center gap-3">
                {chairmanPhoto && <img src={chairmanPhoto} alt="Chairman" className="w-12 h-12 rounded-xl object-cover border" />}
                <input type="file" ref={chairmanPhotoRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setChairmanPhoto); }} accept="image/*" className="hidden" />
                <button type="button" onClick={() => chairmanPhotoRef.current?.click()} className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 cursor-pointer"><Camera className="w-3.5 h-3.5 text-[#00984a]" /><span>Choose Photo</span></button>
              </div>
              <div className="sm:col-span-3">
                <label className="block mb-1">Chairman's Full Message Statement (Textarea) *</label>
                <textarea rows={4} value={chairmanStatement} onChange={(e) => setChairmanStatement(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium min-h-[100px]" />
              </div>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b pb-2 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#00984a]" /> Managing Director's Official Statement & Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block mb-1">MD Full Name *</label>
                <input type="text" value={mdName} onChange={(e) => setMdName(e.target.value)} placeholder="e.g. Engr. Tariqul Islam" className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900" />
              </div>
              <div>
                <label className="block mb-1">Degrees & Qualifications</label>
                <input type="text" value={mdDegrees} onChange={(e) => setMdDegrees(e.target.value)} placeholder="B.Sc Engr, MBA" className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900" />
              </div>
              <div className="flex items-center gap-3">
                {mdPhoto && <img src={mdPhoto} alt="MD" className="w-12 h-12 rounded-xl object-cover border" />}
                <input type="file" ref={mdPhotoRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setMdPhoto); }} accept="image/*" className="hidden" />
                <button type="button" onClick={() => mdPhotoRef.current?.click()} className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 cursor-pointer"><Camera className="w-3.5 h-3.5 text-[#00984a]" /><span>Choose Photo</span></button>
              </div>
              <div className="sm:col-span-3">
                <label className="block mb-1">MD's Full Message Statement (Textarea) *</label>
                <textarea rows={4} value={mdStatement} onChange={(e) => setMdStatement(e.target.value)} className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium min-h-[100px]" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TECHNOLOGIES TAB */}
      {activeTab === 'technologies' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
            <h3 className="text-sm font-black text-slate-900">Modern Diagnostic Technologies</h3>

            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedTechIds(
                      selectedTechIds.length === technologies.length
                        ? []
                        : technologies.map((t) => t.id || t._id?.toString())
                    )
                  }
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {selectedTechIds.length === technologies.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerItemDeleteModal('technologies', selectedTechIds, `${selectedTechIds.length} Clinical Technology(ies)`)
                  }
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedTechIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
            <p className="font-black text-slate-900 text-xs">Add New Clinical Equipment / Analyzer:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" value={newTechName} onChange={(e) => setNewTechName(e.target.value)} placeholder="Analyzer Name *" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <input type="text" value={newTechModel} onChange={(e) => setNewTechModel(e.target.value)} placeholder="Model (e.g. Roche Germany)" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <input type="text" value={newTechManufacturer} onChange={(e) => setNewTechManufacturer(e.target.value)} placeholder="Manufacturer" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
            </div>

            <textarea rows={3} value={newTechDesc} onChange={(e) => setNewTechDesc(e.target.value)} placeholder="Clinical description (Textarea)..." className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[90px]" />

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <input type="file" ref={techPhotoRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setNewTechImageUrl); }} accept="image/*" className="hidden" />
                <button type="button" onClick={() => techPhotoRef.current?.click()} className="bg-white border py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-slate-100 cursor-pointer"><Camera className="w-3.5 h-3.5 text-[#00984a]" /><span>Choose Machine Photo</span></button>
                {newTechImageUrl && <img src={newTechImageUrl} alt="Machine" className="w-10 h-10 object-cover rounded-lg border border-emerald-400" />}
              </div>
              <button type="button" onClick={handleAddTechnology} className="bg-[#00984a] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"><Plus className="w-4 h-4" /> Add Technology</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {technologies.map((t, idx) => {
              const techId = t.id || t._id?.toString() || `tech-${idx}`;
              const isChecked = selectedTechIds.includes(techId);

              return (
                <div key={techId} className={`p-4 bg-white rounded-2xl border shadow-2xs relative flex flex-col justify-between ${isChecked ? 'ring-2 ring-red-500 border-red-500' : ''}`}>
                  {isSuperAdmin && (
                    <div className="absolute top-2 left-2 z-10 bg-white/90 p-1 rounded-lg shadow-sm">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedTechIds((prev) =>
                            prev.includes(techId) ? prev.filter((id) => id !== techId) : [...prev, techId]
                          )
                        }
                        className="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>
                  )}

                  <div>
                    {t.imageUrl ? <img src={t.imageUrl} alt={t.name} className="w-full h-40 object-cover rounded-xl mb-3 border" /> : <div className="w-full h-32 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">No Image</div>}
                    <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">{t.model}</span>
                    <h4 className="font-black text-slate-900 text-sm mt-1">{t.name}</h4>
                    <div className="mt-1">
                      <p className={`text-[11px] text-slate-600 whitespace-pre-line leading-relaxed ${!expandedAdminDescs[`tech-${idx}`] ? 'line-clamp-2' : ''}`}>{t.description}</p>
                      {t.description && t.description.length > 90 && (
                        <button type="button" onClick={() => toggleAdminDesc(`tech-${idx}`)} className="text-[10px] text-[#00984a] font-black hover:underline mt-0.5 inline-block cursor-pointer">{expandedAdminDescs[`tech-${idx}`] ? 'Hide Content' : 'See More'}</button>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 pt-2 border-t flex justify-end gap-2">
                    <button type="button" onClick={() => setEditingTech({ ...t })} className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"><Edit className="w-3.5 h-3.5" /> Edit</button>
                    <button type="button" onClick={() => setTechnologies(technologies.filter((_, i) => i !== idx))} className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. SOCIAL LINKS TAB */}
      {activeTab === 'socials' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
            <h3 className="text-sm font-black text-slate-900">Custom Social Media Links</h3>

            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSocialIds(
                      selectedSocialIds.length === customSocialLinks.length
                        ? []
                        : customSocialLinks.map((s) => s.id)
                    )
                  }
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {selectedSocialIds.length === customSocialLinks.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerItemDeleteModal('socials', selectedSocialIds, `${selectedSocialIds.length} Social Link(s)`)
                  }
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedSocialIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <input type="text" value={newSocialPlatform} onChange={(e) => setNewSocialPlatform(e.target.value)} placeholder="Platform Name (e.g. TikTok) *" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <input type="text" value={newSocialUrl} onChange={(e) => setNewSocialUrl(e.target.value)} placeholder="Profile URL *" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <div className="flex items-center gap-2">
                <input type="file" ref={socialIconRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setNewSocialIconUrl); }} accept="image/*" className="hidden" />
                <button type="button" onClick={() => socialIconRef.current?.click()} className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Choose Custom Icon</span></button>
                {newSocialIconUrl && <img src={newSocialIconUrl} alt="Icon" className="w-9 h-9 object-contain rounded-lg border bg-white p-0.5" />}
              </div>
            </div>
            <button type="button" onClick={handleAddSocialLink} className="bg-[#00984a] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"><Plus className="w-4 h-4" /> Add Social Link</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {customSocialLinks.map((item, idx) => {
              const isChecked = selectedSocialIds.includes(item.id);

              return (
                <div key={item.id || idx} className={`p-3 bg-white rounded-2xl border shadow-2xs flex items-center justify-between ${isChecked ? 'ring-2 ring-red-500 border-red-500' : ''}`}>
                  <div className="flex items-center gap-2.5">
                    {isSuperAdmin && (
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedSocialIds((prev) =>
                            prev.includes(item.id) ? prev.filter((id) => id !== item.id) : [...prev, item.id]
                          )
                        }
                        className="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    )}
                    <div>
                      <p className="font-bold text-slate-900 text-xs">{item.platform}</p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{item.url}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 5. MISSION & VISION TAB */}
      {activeTab === 'mission' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Mission & Vision Multi-Line Descriptions & Points</h3>
          <div className="p-5 bg-slate-50 rounded-2xl border space-y-3">
            <h4 className="font-black text-slate-900">1. Mission Headline & Detailed Paragraph:</h4>
            <input type="text" value={missionTitle} onChange={(e) => setMissionTitle(e.target.value)} className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
            <textarea rows={4} value={missionDesc} onChange={(e) => setMissionDesc(e.target.value)} placeholder="Detailed mission paragraph (Textarea)..." className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[100px]" />
            <div className="flex gap-2 pt-1">
              <input type="text" value={newMissionPointText} onChange={(e) => setNewMissionPointText(e.target.value)} placeholder="Add new mission point..." className="flex-1 bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <button type="button" onClick={() => { if (newMissionPointText.trim()) { setMissionPoints([...missionPoints, newMissionPointText.trim()]); setNewMissionPointText(''); } }} className="bg-[#00984a] text-white px-4 py-2 rounded-xl cursor-pointer">+ Add Point</button>
            </div>
            <div className="space-y-1">
              {missionPoints.map((pt, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 px-3 rounded-xl border text-xs"><span>• {pt}</span><button type="button" onClick={() => setMissionPoints(missionPoints.filter((_, idx) => idx !== i))} className="text-red-500 font-black cursor-pointer">×</button></div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 6. HERO SLIDERS TAB */}
      {activeTab === 'slider' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
            <h3 className="text-sm font-black text-slate-900">Hero Banner Studio</h3>

            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedSlideIds(
                      selectedSlideIds.length === slides.length ? [] : slides.map((s) => s.id)
                    )
                  }
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {selectedSlideIds.length === slides.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerItemDeleteModal('slides', selectedSlideIds, `${selectedSlideIds.length} Banner Slide(s)`)
                  }
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedSlideIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <input type="file" ref={slideFileRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setNewSlideUploadedUrl); }} accept="image/*" className="hidden" />
                <button type="button" onClick={() => slideFileRef.current?.click()} className="w-full bg-white border py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Choose Slide Banner from PC</span></button>
              </div>
              <input type="text" value={newSlideTitle} onChange={(e) => setNewSlideTitle(e.target.value)} placeholder="Slide Headline" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <div className="sm:col-span-2">
                <textarea rows={2} value={newSlideSubtitle} onChange={(e) => setNewSlideSubtitle(e.target.value)} placeholder="Slide Subtitle (Textarea)" className="w-full bg-white border rounded-xl p-3 text-slate-900" />
              </div>
            </div>
            {newSlideUploadedUrl && <img src={newSlideUploadedUrl} alt="Slide" className="w-24 h-14 object-cover rounded-lg border border-emerald-400" />}
            <button type="button" onClick={handleAddSlide} disabled={!newSlideUploadedUrl} className="bg-[#00984a] text-white py-2.5 px-6 rounded-xl font-bold flex items-center gap-1 shadow-xs cursor-pointer"><Plus className="w-4 h-4" /> Add Slide to Slider</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {slides.map((s, idx) => {
              const isChecked = selectedSlideIds.includes(s.id);

              return (
                <div key={s.id || idx} className={`rounded-2xl border overflow-hidden relative group bg-white shadow-2xs ${isChecked ? 'ring-2 ring-red-500 border-red-500' : ''}`}>
                  {isSuperAdmin && (
                    <div className="absolute top-2 left-2 z-10 bg-white/90 p-1 rounded-lg shadow-sm">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedSlideIds((prev) =>
                            prev.includes(s.id) ? prev.filter((id) => id !== s.id) : [...prev, s.id]
                          )
                        }
                        className="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>
                  )}

                  <img src={s.imageUrl} alt="Slide" className="w-full h-36 object-cover" />
                  <div className="p-3"><p className="font-bold text-slate-900 text-xs truncate mt-0.5">{s.title || 'Untitled Banner'}</p></div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 7. MANAGEMENT TEAM TAB */}
      {activeTab === 'management' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b pb-3">
            <h3 className="text-sm font-black text-slate-900">Management Team Members</h3>

            {isSuperAdmin && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setSelectedMemberIds(
                      selectedMemberIds.length === managementTeam.length
                        ? []
                        : managementTeam.map((m) => m.id || m._id?.toString())
                    )
                  }
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer"
                >
                  {selectedMemberIds.length === managementTeam.length ? 'Deselect All' : 'Select All'}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    triggerItemDeleteModal('management', selectedMemberIds, `${selectedMemberIds.length} Management Member(s)`)
                  }
                  className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({selectedMemberIds.length})</span>
                </button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} placeholder="Full Name *" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <input type="text" value={newMemberDesignation} onChange={(e) => setNewMemberDesignation(e.target.value)} placeholder="Designation" className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900" />
              <div className="flex items-center gap-2">
                <input type="file" ref={memberPhotoRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, setNewMemberPhotoUrl); }} accept="image/*" className="hidden" />
                <button type="button" onClick={() => memberPhotoRef.current?.click()} className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer"><Camera className="w-3.5 h-3.5 text-[#00984a]" /><span>Choose Photo</span></button>
                {newMemberPhotoUrl && <img src={newMemberPhotoUrl} alt="Preview" className="w-9 h-9 object-cover rounded-lg border border-emerald-400" />}
              </div>
            </div>
            <textarea rows={3} value={newMemberBio} onChange={(e) => setNewMemberBio(e.target.value)} placeholder="Person Bio (Textarea)..." className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[80px]" />
            <button type="button" onClick={() => { if (newMemberName.trim()) { setManagementTeam([...managementTeam, { id: `m-${Date.now()}`, name: newMemberName.trim(), designation: newMemberDesignation.trim(), bio: newMemberBio.trim(), photoUrl: newMemberPhotoUrl }]); setNewMemberName(''); setNewMemberDesignation(''); setNewMemberBio(''); setNewMemberPhotoUrl(''); } }} className="bg-[#00984a] text-white px-5 py-2 rounded-xl cursor-pointer">+ Add Member</button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {managementTeam.map((m, idx) => {
              const memId = m.id || m._id?.toString() || `mem-${idx}`;
              const isChecked = selectedMemberIds.includes(memId);

              return (
                <div key={memId} className={`p-4 rounded-2xl border bg-white shadow-2xs relative flex flex-col justify-between items-start ${isChecked ? 'ring-2 ring-red-500 border-red-500' : ''}`}>
                  {isSuperAdmin && (
                    <div className="absolute top-2 left-2 z-10 bg-white/90 p-1 rounded-lg shadow-sm">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() =>
                          setSelectedMemberIds((prev) =>
                            prev.includes(memId) ? prev.filter((id) => id !== memId) : [...prev, memId]
                          )
                        }
                        className="rounded text-red-600 focus:ring-0 cursor-pointer w-4 h-4"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-3 w-full">
                    {m.photoUrl && <img src={m.photoUrl} alt={m.name} className="w-12 h-12 rounded-xl object-cover border" />}
                    <div className="flex-1"><h4 className="font-bold text-slate-900 text-xs">{m.name}</h4><p className="text-[10px] text-[#00984a]">{m.designation}</p></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 8. CONTACT & GOOGLE MAPS TAB */}
      {activeTab === 'contact' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Address, Google Map & Floating WhatsApp</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Floating WhatsApp Number (e.g. 8801700000000) *</label>
              <input type="text" value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900" />
            </div>
            <div>
              <label className="block mb-1">Hotline Number (e.g. 09666 787801) *</label>
              <input type="text" value={hotline} onChange={(e) => setHotline(e.target.value)} className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 font-mono" />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1">Full Physical Centre Address *</label>
              <input 
                type="text" 
                value={address} 
                onChange={(e) => setAddress(e.target.value)} 
                placeholder="House 42, Road 11, Dhanmondi, Dhaka - 1209, Bangladesh"
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900" 
              />
            </div>
            <div className="sm:col-span-2 space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-slate-900 font-black">Google Maps Embed Link, Place Link, or &lt;iframe&gt; Code</label>
                <button
                  type="button"
                  onClick={() => {
                    if (address.trim()) {
                      setGoogleMapUrl(`https://maps.google.com/maps?q=${encodeURIComponent(address.trim())}&t=&z=15&ie=UTF8&iwloc=&output=embed`);
                      setSuccessMsg('Google Map successfully generated from your physical address!');
                      setTimeout(() => setSuccessMsg(null), 2500);
                    }
                  }}
                  className="text-[10px] text-[#006642] bg-[#f0fdf4] hover:bg-[#00984a] hover:text-white border border-emerald-300 px-2.5 py-1 rounded-lg transition font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" /> Generate Map from Address
                </button>
              </div>
              <input type="text" value={googleMapUrl} onChange={(e) => setGoogleMapUrl(e.target.value)} placeholder="https://maps.google.com/... or <iframe>...</iframe>" className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 font-mono text-[11px]" />
            </div>
          </div>

          <div className="pt-2 border-t mt-4 space-y-2">
            <p className="font-bold text-slate-900 text-xs flex items-center gap-1.5"><MapPin className="w-4 h-4 text-[#00984a]" /> Live Google Map Interactive Preview:</p>
            <div className="w-full h-72 sm:h-80 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-inner bg-slate-100 relative">
              <iframe key={activeMapUrl} src={activeMapUrl} className="w-full h-full border-0" allowFullScreen loading="lazy" title="Admin Google Map Live Preview" />
            </div>
          </div>
        </div>
      )}

      {/* 🌟 9. DATABASE SELECTIVE PURGE & RESET TAB (SUPER ADMIN ONLY) */}
      {activeTab === 'database' && isSuperAdmin && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-red-200 shadow-sm space-y-6 text-xs text-slate-700 font-bold animate-in fade-in">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b pb-4">
            <div>
              <span className="text-[10px] font-black uppercase text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">Super Admin Danger Zone</span>
              <h3 className="text-base font-black text-slate-900 mt-1 flex items-center gap-2"><Database className="w-5 h-5 text-red-600" /> Select & Clear Database Collections</h3>
              <p className="text-[11px] text-slate-500 font-normal mt-0.5">Select the collections you want to wipe from MongoDB. Staff and Admin accounts are 100% immune from deletion.</p>
            </div>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => setSelectedDbTargets(selectedDbTargets.length === DATABASE_TARGETS.length ? [] : DATABASE_TARGETS.map((t) => t.key))} className="bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold cursor-pointer">
                {selectedDbTargets.length === DATABASE_TARGETS.length ? 'Deselect All' : 'Select All'}
              </button>
              <button type="button" onClick={() => { if (selectedDbTargets.length === 0) { setErrorMsg('Please select at least one collection to clear.'); return; } setSuperAdminDbPassword(''); setConfirmClearKeyword(''); setIsDbClearModalOpen(true); }} className="bg-red-600 hover:bg-red-700 text-white px-5 py-2 rounded-xl text-xs font-black shadow flex items-center gap-1.5 cursor-pointer">
                <Trash2 className="w-4 h-4" /> Clear Selected ({selectedDbTargets.length})
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {DATABASE_TARGETS.map((target) => {
              const isSelected = selectedDbTargets.includes(target.key);
              const count = dbStats ? dbStats[target.key] || 0 : 0;
              return (
                <div key={target.key} onClick={() => setSelectedDbTargets((prev) => prev.includes(target.key) ? prev.filter((t) => t !== target.key) : [...prev, target.key])} className={`p-4 rounded-2xl border-2 transition cursor-pointer flex items-center justify-between ${isSelected ? 'border-red-500 bg-red-50/50 shadow-sm' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                  <div className="flex items-center gap-3.5">
                    <input type="checkbox" checked={isSelected} onChange={() => {}} className="w-5 h-5 text-red-600 rounded focus:ring-0 cursor-pointer" />
                    <div><h4 className="font-black text-slate-900 text-sm">{target.label}</h4><p className="text-[11px] text-slate-500 font-medium mt-0.5">{target.desc}</p></div>
                  </div>
                  <span className="text-xs font-mono font-bold bg-white border border-slate-200 px-2.5 py-1 rounded-xl shadow-2xs text-slate-800 shrink-0">
                    {isDbStatsLoading ? 'Checking...' : `${count} Records in DB`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 🛡️ HARD SECURITY MODAL FOR DATABASE CLEAR */}
      {isDbClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-600 text-xs font-bold text-slate-700 animate-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Database Purge Authorization</h3>
                  <span className="text-[10px] text-red-600 uppercase font-black">Super Admin Authentication Required</span>
                </div>
              </div>
              <button onClick={() => setIsDbClearModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-800 space-y-1">
              <p className="font-black text-xs">⚠️ DANGER: PERMANENT DATA WIPE!</p>
              <p className="text-[11px] font-normal leading-relaxed">
                You have selected <strong className="font-black text-slate-900">{selectedDbTargets.length} collection(s)</strong> to clear from MongoDB database. All records in these collections will be destroyed immediately.
              </p>
            </div>

            <form onSubmit={handleAuthorizeDbClear} className="space-y-4">
              <div>
                <label className="block mb-1 text-slate-900">1. Type <span className="font-black text-red-600">CLEAR_DATABASE</span> to confirm:</label>
                <input type="text" required value={confirmClearKeyword} onChange={(e) => setConfirmClearKeyword(e.target.value)} placeholder="Type CLEAR_DATABASE" className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 font-mono font-black" />
              </div>
              <div>
                <label className="block mb-1 text-slate-900">2. Enter Super Admin Password (পাসওয়ার্ড দিন):</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" required value={superAdminDbPassword} onChange={(e) => setSuperAdminDbPassword(e.target.value)} placeholder="Super Admin Password" className="w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2 text-slate-900" />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsDbClearModalOpen(false)} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={clearDatabaseMutation.isPending || confirmClearKeyword !== 'CLEAR_DATABASE'} className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl shadow disabled:opacity-40 cursor-pointer">
                  {clearDatabaseMutation.isPending ? 'Wiping Database...' : 'Authorize & Wipe'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 🛡️ HARD SECURITY MODAL FOR ITEMS DELETION */}
      {isItemSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-red-500 text-xs font-bold text-slate-700 animate-in zoom-in-95 space-y-4">
            <div className="flex justify-between items-start border-b pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <ShieldAlert className="w-6 h-6 shrink-0" />
                <div>
                  <h3 className="text-base font-black text-slate-900">Item Deletion Authorization</h3>
                  <span className="text-[10px] text-red-600 uppercase font-black">Super Admin Authentication</span>
                </div>
              </div>
              <button onClick={() => setIsItemSecurityModalOpen(false)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-3 bg-red-50 rounded-2xl border border-red-200 text-red-800 space-y-1">
              <p className="font-black text-xs">⚠️ Warning: Selected items will be deleted permanently!</p>
              <p className="text-[11px] font-normal leading-relaxed">
                You are about to delete: <strong className="font-black text-slate-900">{pendingItemDeleteAction?.description}</strong>
              </p>
            </div>

            <form onSubmit={handleAuthorizeItemDelete} className="space-y-4">
              <div>
                <label className="block mb-1 text-slate-900">1. Type <span className="font-black text-red-600">DELETE</span> to confirm:</label>
                <input type="text" required value={itemDeleteKeyword} onChange={(e) => setItemDeleteKeyword(e.target.value)} placeholder="Type DELETE" className="w-full bg-slate-50 border rounded-xl px-3.5 py-2 text-slate-900 font-mono font-black" />
              </div>
              <div>
                <label className="block mb-1 text-slate-900">2. Enter Super Admin Password:</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input type="password" required value={itemDeletePassword} onChange={(e) => setItemDeletePassword(e.target.value)} placeholder="Super Admin Password" className="w-full bg-slate-50 border rounded-xl pl-9 pr-3 py-2 text-slate-900" />
                </div>
              </div>
              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setIsItemSecurityModalOpen(false)} className="w-1/2 bg-slate-100 hover:bg-slate-200 py-2.5 rounded-xl font-bold">Cancel</button>
                <button type="submit" disabled={selectiveDeleteMutation.isPending || itemDeleteKeyword !== 'DELETE'} className="w-1/2 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl shadow disabled:opacity-40 cursor-pointer">
                  {selectiveDeleteMutation.isPending ? 'Deleting...' : 'Authorize & Delete'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT MODAL FOR TECHNOLOGIES */}
      {editingTech && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border text-xs font-bold text-slate-700 animate-in zoom-in-95 space-y-3.5">
            <div className="flex justify-between items-center border-b pb-2">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5"><Edit className="w-4 h-4 text-[#00984a]" /> Edit Clinical Technology</h3>
              <button onClick={() => setEditingTech(null)} className="p-1 text-slate-400 hover:text-slate-700"><X className="w-4 h-4" /></button>
            </div>
            <div><label className="block mb-1">Analyzer Name *</label><input type="text" required value={editingTech.name} onChange={(e) => setEditingTech({ ...editingTech, name: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block mb-1">Model</label><input type="text" value={editingTech.model || ''} onChange={(e) => setEditingTech({ ...editingTech, model: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900" /></div>
              <div><label className="block mb-1">Manufacturer</label><input type="text" value={editingTech.manufacturer || ''} onChange={(e) => setEditingTech({ ...editingTech, manufacturer: e.target.value })} className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900" /></div>
            </div>
            <div><label className="block mb-1">Description *</label><textarea rows={4} required value={editingTech.description} onChange={(e) => setEditingTech({ ...editingTech, description: e.target.value })} className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium" /></div>
            <div>
              <label className="block mb-1">Replace Image</label>
              <input type="file" ref={editTechPhotoRef} onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadImageFile(f, (url) => setEditingTech({ ...editingTech, imageUrl: url })); }} accept="image/*" className="hidden" />
              <button type="button" onClick={() => editTechPhotoRef.current?.click()} className="bg-white border px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-2xs cursor-pointer"><Upload className="w-3.5 h-3.5 text-[#00984a]" /><span>Upload from PC</span></button>
            </div>
            <div className="pt-2 flex gap-3">
              <button type="button" onClick={() => setEditingTech(null)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
              <button type="button" onClick={() => { setTechnologies(technologies.map((t) => t.id === editingTech.id ? editingTech : t)); setEditingTech(null); }} className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;