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
  Award
} from 'lucide-react';
import api from '@/lib/axios';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'branding' | 'technologies' | 'socials' | 'mission' | 'slider' | 'management' | 'contact'>('branding');

  // See More / Hide Content State Mapping for Descriptions
  const [expandedAdminDescs, setExpandedAdminDescs] = useState<Record<string, boolean>>({});

  const toggleAdminDesc = (key: string) => {
    setExpandedAdminDescs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // File Input References
  const logoFileRef = useRef<HTMLInputElement | null>(null);
  const footerLogoFileRef = useRef<HTMLInputElement | null>(null);
  const faviconFileRef = useRef<HTMLInputElement | null>(null);
  const slideFileRef = useRef<HTMLInputElement | null>(null);
  const editSlideFileRef = useRef<HTMLInputElement | null>(null);
  const techPhotoRef = useRef<HTMLInputElement | null>(null);
  const editTechPhotoRef = useRef<HTMLInputElement | null>(null);
  const socialIconRef = useRef<HTMLInputElement | null>(null);
  const editSocialIconRef = useRef<HTMLInputElement | null>(null);
  const memberPhotoRef = useRef<HTMLInputElement | null>(null);
  const editMemberPhotoRef = useRef<HTMLInputElement | null>(null);

  // 1. Branding, Header Logo, Footer Logo & Favicon
  const [siteName, setSiteName] = useState('Care Point');
  const [tagline, setTagline] = useState('Diagnostic & Consultation Centre');
  const [logoUrl, setLogoUrl] = useState('');
  const [footerLogoUrl, setFooterLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [topbarHotlineText, setTopbarHotlineText] = useState('09666 787801');
  const [topbarStatusText, setTopbarStatusText] = useState('Online Services: Active 24/7');
  const [topbarCertText, setTopbarCertText] = useState('ISO 9001:2015 Certified');

  // 2. Contact & WhatsApp
  const [hotline, setHotline] = useState('09666 787801');
  const [supportPhone, setSupportPhone] = useState('+880 1700-000000');
  const [email, setEmail] = useState('info@carepoint.com');
  const [address, setAddress] = useState('House 42, Road 11, Dhanmondi, Dhaka - 1209');
  const [googleMapUrl, setGoogleMapUrl] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('8801700000000');
  const [whatsappDefaultMessage, setWhatsappDefaultMessage] = useState('');

  // 3. Technologies & Edit Modal State
  const [technologies, setTechnologies] = useState<any[]>([]);
  const [newTechName, setNewTechName] = useState('');
  const [newTechModel, setNewTechModel] = useState('');
  const [newTechManufacturer, setNewTechManufacturer] = useState('');
  const [newTechDesc, setNewTechDesc] = useState('');
  const [newTechImageUrl, setNewTechImageUrl] = useState('');
  const [editingTech, setEditingTech] = useState<any | null>(null);

  // 4. Social Links & Edit Modal State
  const [customSocialLinks, setCustomSocialLinks] = useState<any[]>([]);
  const [newSocialPlatform, setNewSocialPlatform] = useState('Facebook');
  const [newSocialUrl, setNewSocialUrl] = useState('');
  const [newSocialIconUrl, setNewSocialIconUrl] = useState('');
  const [editingSocial, setEditingSocial] = useState<any | null>(null);

  // 5. Hero Sliders & Edit Modal State
  const [slides, setSlides] = useState<any[]>([]);
  const [newSlideTitle, setNewSlideTitle] = useState('');
  const [newSlideSubtitle, setNewSlideSubtitle] = useState('');
  const [newSlideUploadedUrl, setNewSlideUploadedUrl] = useState('');
  const [editingSlide, setEditingSlide] = useState<any | null>(null);

  // 6. Management Team & Edit Modal State
  const [managementTeam, setManagementTeam] = useState<any[]>([]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberDesignation, setNewMemberDesignation] = useState('');
  const [newMemberDegrees, setNewMemberDegrees] = useState('');
  const [newMemberBio, setNewMemberBio] = useState('');
  const [newMemberPhotoUrl, setNewMemberPhotoUrl] = useState('');
  const [editingMember, setEditingMember] = useState<any | null>(null);

  // 7. Mission & Vision Dynamic Points
  const [missionTitle, setMissionTitle] = useState('');
  const [missionDesc, setMissionDesc] = useState('');
  const [missionPoints, setMissionPoints] = useState<string[]>([]);
  const [newMissionPointText, setNewMissionPointText] = useState('');

  const [visionTitle, setVisionTitle] = useState('');
  const [visionDesc, setVisionDesc] = useState('');
  const [visionPoints, setVisionPoints] = useState<string[]>([]);
  const [newVisionPointText, setNewVisionPointText] = useState('');

  // 8. Leadership Messages
  const [chairmanName, setChairmanName] = useState('');
  const [chairmanDegrees, setChairmanDegrees] = useState('');
  const [chairmanStatement, setChairmanStatement] = useState('');
  const [chairmanPhoto, setChairmanPhoto] = useState('');

  const [mdName, setMdName] = useState('');
  const [mdDegrees, setMdDegrees] = useState('');
  const [mdStatement, setMdStatement] = useState('');
  const [mdPhoto, setMdPhoto] = useState('');

  const [isUploading, setIsUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { data: settings } = useQuery({
    queryKey: ['admin-master-settings'],
    queryFn: async () => {
      const res = await api.get('/settings');
      return res.data.data;
    },
  });

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName || 'Care Point');
      setTagline(settings.tagline || 'Diagnostic & Consultation Centre');
      setLogoUrl(settings.logoUrl || '');
      setFooterLogoUrl(settings.footerLogoUrl || '');
      setFaviconUrl(settings.faviconUrl || '');
      setTopbarHotlineText(settings.topbarHotlineText || '09666 787801');
      setTopbarStatusText(settings.topbarStatusText || 'Online Services: Active 24/7');
      setTopbarCertText(settings.topbarCertText || 'ISO 9001:2015 Certified');

      setHotline(settings.hotline || '09666 787801');
      setSupportPhone(settings.supportPhone || '+880 1700-000000');
      setEmail(settings.email || 'info@carepoint.com');
      setAddress(settings.address || 'House 42, Road 11, Dhanmondi, Dhaka');
      setGoogleMapUrl(settings.googleMapUrl || '');
      setWhatsappNumber(settings.whatsappNumber || '8801700000000');
      setWhatsappDefaultMessage(settings.whatsappDefaultMessage || '');

      setTechnologies(settings.technologies || []);
      setCustomSocialLinks(settings.customSocialLinks || [
        { id: '1', platform: 'Facebook', url: 'https://facebook.com', iconUrl: '' },
        { id: '2', platform: 'YouTube', url: 'https://youtube.com', iconUrl: '' },
        { id: '3', platform: 'LinkedIn', url: 'https://linkedin.com', iconUrl: '' }
      ]);
      setSlides(settings.heroSlides || []);
      setManagementTeam(settings.managementTeam || []);

      setMissionTitle(settings.mission?.title || 'Precision Diagnostic Healthcare for All');
      setMissionDesc(settings.mission?.description || '');
      setMissionPoints(settings.mission?.points || []);

      setVisionTitle(settings.vision?.title || 'The Benchmark of Diagnostic Trust');
      setVisionDesc(settings.vision?.description || '');
      setVisionPoints(settings.vision?.points || []);

      setChairmanName(settings.chairmanMessage?.name || 'Prof. Dr. M. A. Rahim');
      setChairmanDegrees(settings.chairmanMessage?.degrees || 'MBBS, FCPS, FRCP (Glasgow)');
      setChairmanStatement(settings.chairmanMessage?.statement || '');
      setChairmanPhoto(settings.chairmanMessage?.photoUrl || '');

      setMdName(settings.managingDirectorMessage?.name || 'Engr. Tariqul Islam');
      setMdDegrees(settings.managingDirectorMessage?.degrees || 'B.Sc Engr (BUET), MBA');
      setMdStatement(settings.managingDirectorMessage?.statement || '');
      setMdPhoto(settings.managingDirectorMessage?.photoUrl || '');
    }
  }, [settings]);

  // INSTANT IMAGE UPLOADER (WITH LOCAL PREVIEW)
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
        onSuccess(res.data.data.imageUrl); // update with permanent server URL
        setSuccessMsg('Image uploaded successfully from your computer!');
        setTimeout(() => setSuccessMsg(null), 2500);
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async (payload: any) => api.put('/settings', payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-master-settings'] });
      queryClient.invalidateQueries({ queryKey: ['public-settings'] });
      setSuccessMsg('Master settings and all content saved successfully!');
      setErrorMsg(null);
      setTimeout(() => setSuccessMsg(null), 3000);
    },
    onError: (err: any) => setErrorMsg(err.response?.data?.message || 'Failed to save settings.'),
  });

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      siteName,
      tagline,
      logoUrl,
      footerLogoUrl,
      faviconUrl,
      topbarHotlineText,
      topbarStatusText,
      topbarCertText,
      hotline,
      supportPhone,
      email,
      address,
      googleMapUrl,
      whatsappNumber,
      whatsappDefaultMessage,
      technologies,
      customSocialLinks,
      heroSlides: slides,
      managementTeam,
      mission: { title: missionTitle, description: missionDesc, points: missionPoints },
      vision: { title: visionTitle, description: visionDesc, points: visionPoints },
      chairmanMessage: { name: chairmanName, degrees: chairmanDegrees, statement: chairmanStatement, photoUrl: chairmanPhoto },
      managingDirectorMessage: { name: mdName, degrees: mdDegrees, statement: mdStatement, photoUrl: mdPhoto },
    });
  };

  // Add / Edit Technology
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

  const handleSaveEditedTech = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTech) return;
    setTechnologies(technologies.map((t) => (t.id === editingTech.id ? editingTech : t)));
    setEditingTech(null);
  };

  // Add / Edit Social Link
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

  const handleSaveEditedSocial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSocial) return;
    setCustomSocialLinks(customSocialLinks.map((s) => (s.id === editingSocial.id ? editingSocial : s)));
    setEditingSocial(null);
  };

  // Add / Edit Slide
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

  const handleSaveEditedSlide = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSlide) return;
    setSlides(slides.map((s) => (s.id === editingSlide.id ? editingSlide : s)));
    setEditingSlide(null);
  };

  // Add / Edit Management Member
  const handleSaveEditedMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMember) return;
    setManagementTeam(managementTeam.map((m) => (m.id === editingMember.id ? editingMember : m)));
    setEditingMember(null);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-24">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-black text-slate-900">Website CMS & Master Business Settings</h1>
          <p className="text-xs text-slate-500 mt-1">
            Edit text, upload images, manage banners, technologies, and social links with live previews.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={updateMutation.isPending || isUploading}
          className="bg-brand-gradient hover:opacity-95 text-white font-black px-6 py-3 rounded-2xl text-xs transition shadow-md flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          <span>{updateMutation.isPending ? 'Saving All...' : 'Save All Changes'}</span>
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

      {/* Clean Tabs without counting numbers */}
      <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-1.5 overflow-x-auto no-scrollbar text-xs font-bold">
        <button
          onClick={() => setActiveTab('branding')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'branding' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Logo, Favicon & Header
        </button>
        <button
          onClick={() => setActiveTab('technologies')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'technologies' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Modern Technologies
        </button>
        <button
          onClick={() => setActiveTab('socials')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'socials' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Social Media Links
        </button>
        <button
          onClick={() => setActiveTab('mission')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'mission' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Mission & Vision Points
        </button>
        <button
          onClick={() => setActiveTab('slider')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'slider' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Banner Sliders
        </button>
        <button
          onClick={() => setActiveTab('management')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'management' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Management Team
        </button>
        <button
          onClick={() => setActiveTab('contact')}
          className={`px-4 py-2 rounded-xl transition ${activeTab === 'contact' ? 'bg-[#00984a] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-50'}`}
        >
          Contact, Map & WhatsApp
        </button>
      </div>

      {/* 1. BRANDING: CLEAR PREVIEW FOR LOGO, FOOTER LOGO & FAVICON */}
      {activeTab === 'branding' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Header Logo, Footer Logo & Favicon Upload</h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Header Logo Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">1. Navbar Header Logo</label>
              
              <div className="w-full h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                {logoUrl ? (
                  <>
                    <img src={logoUrl} alt="Header Logo Preview" className="max-h-full max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">No Logo Uploaded</span>
                )}
              </div>

              <input
                type="file"
                ref={logoFileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImageFile(f, setLogoUrl);
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => logoFileRef.current?.click()}
                className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition"
              >
                <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                <span>Choose Logo from PC</span>
              </button>
            </div>

            {/* Footer Logo Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">2. Dedicated Footer Logo</label>
              
              <div className="w-full h-24 rounded-2xl bg-slate-900 border-2 border-dashed border-slate-700 flex items-center justify-center p-2 relative overflow-hidden group">
                {footerLogoUrl ? (
                  <>
                    <img src={footerLogoUrl} alt="Footer Logo Preview" className="max-h-full max-w-full object-contain" />
                    <button
                      type="button"
                      onClick={() => setFooterLogoUrl('')}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition"
                      title="Remove Footer Logo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">No Footer Logo (Uses Header Logo)</span>
                )}
              </div>

              <input
                type="file"
                ref={footerLogoFileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImageFile(f, setFooterLogoUrl);
                }}
                accept="image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => footerLogoFileRef.current?.click()}
                className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition"
              >
                <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                <span>Choose Footer Logo</span>
              </button>
            </div>

            {/* Favicon Box */}
            <div className="p-4 bg-slate-50 rounded-2xl border space-y-3">
              <label className="block text-slate-800 font-bold">3. Browser Tab Favicon</label>
              
              <div className="w-full h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex items-center justify-center p-2 relative overflow-hidden group">
                {faviconUrl ? (
                  <>
                    <img src={faviconUrl} alt="Favicon Preview" className="w-10 h-10 object-contain shadow-xs border p-1 rounded-lg" />
                    <button
                      type="button"
                      onClick={() => setFaviconUrl('')}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg shadow opacity-0 group-hover:opacity-100 transition"
                      title="Remove Favicon"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </>
                ) : (
                  <span className="text-[11px] text-slate-400 font-medium">Default Favicon</span>
                )}
              </div>

              <input
                type="file"
                ref={faviconFileRef}
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadImageFile(f, setFaviconUrl);
                }}
                accept=".ico,.png,.svg,image/*"
                className="hidden"
              />
              <button
                type="button"
                onClick={() => faviconFileRef.current?.click()}
                className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100 transition"
              >
                <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                <span>Choose Favicon (.ico/.png)</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block mb-1">Centre Brand Name *</label>
              <input
                type="text"
                value={siteName}
                onChange={(e) => setSiteName(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block mb-1">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block mb-1">Topbar Hotline Text (e.g. 09666 787801) *</label>
              <input
                type="text"
                value={topbarHotlineText}
                onChange={(e) => setTopbarHotlineText(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 font-mono"
              />
            </div>
            <div>
              <label className="block mb-1">Topbar Service Status Text</label>
              <input
                type="text"
                value={topbarStatusText}
                onChange={(e) => setTopbarStatusText(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* 2. TECHNOLOGIES (WITH EDIT MODAL, TEXTAREA & SEE MORE TOGGLE) */}
      {activeTab === 'technologies' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Our Modern Diagnostic Technologies</h3>

          <div className="bg-slate-50 p-5 rounded-2xl border space-y-3">
            <p className="font-black text-slate-900 text-xs">Add New Clinical Analyzer / Technology:</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Analyzer Name *</label>
                <input
                  type="text"
                  value={newTechName}
                  onChange={(e) => setNewTechName(e.target.value)}
                  placeholder="e.g. Cobas e411 Immunoassay Analyzer"
                  className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Model / Origin</label>
                <input
                  type="text"
                  value={newTechModel}
                  onChange={(e) => setNewTechModel(e.target.value)}
                  placeholder="Roche Diagnostics (Germany)"
                  className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Manufacturer</label>
                <input
                  type="text"
                  value={newTechManufacturer}
                  onChange={(e) => setNewTechManufacturer(e.target.value)}
                  placeholder="F. Hoffmann-La Roche AG"
                  className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-500 uppercase">Clinical Description (Textarea) *</label>
              <textarea
                rows={3}
                value={newTechDesc}
                onChange={(e) => setNewTechDesc(e.target.value)}
                placeholder="Write detailed clinical functions, zero contamination features, and parameters..."
                className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[90px]"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-1">
              <div className="flex items-center gap-3">
                <input
                  type="file"
                  ref={techPhotoRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageFile(f, setNewTechImageUrl);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => techPhotoRef.current?.click()}
                  className="bg-white border py-2 px-3.5 rounded-xl flex items-center gap-1.5 shadow-2xs hover:bg-slate-100"
                >
                  <Camera className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>Choose Machine Photo from PC</span>
                </button>

                {newTechImageUrl && (
                  <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-emerald-400 shadow-2xs">
                    <img src={newTechImageUrl} alt="Machine Preview" className="w-10 h-10 object-cover rounded-lg" />
                    <span className="text-[10px] text-[#00984a] font-bold pr-2">Preview Ready ✓</span>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={handleAddTechnology}
                className="bg-[#00984a] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
              >
                <Plus className="w-4 h-4" /> Add Technology
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {technologies.map((t, idx) => (
              <div key={t.id || idx} className="p-4 bg-white rounded-2xl border shadow-2xs flex flex-col justify-between">
                <div>
                  {t.imageUrl && <img src={t.imageUrl} alt={t.name} className="w-full h-40 object-cover rounded-xl mb-3 border" />}
                  <span className="text-[10px] font-black uppercase text-[#00984a] bg-emerald-50 px-2 py-0.5 rounded">{t.model}</span>
                  <h4 className="font-black text-slate-900 text-sm mt-1">{t.name}</h4>
                  
                  {/* Technology Description with See More / Hide Content Toggle */}
                  <div className="mt-1">
                    <p className={`text-[11px] text-slate-600 whitespace-pre-line leading-relaxed ${!expandedAdminDescs[`tech-${idx}`] ? 'line-clamp-2' : ''}`}>
                      {t.description}
                    </p>
                    {t.description && t.description.length > 90 && (
                      <button
                        type="button"
                        onClick={() => toggleAdminDesc(`tech-${idx}`)}
                        className="text-[10px] text-[#00984a] font-black hover:underline mt-0.5 inline-block"
                      >
                        {expandedAdminDescs[`tech-${idx}`] ? 'Hide Content (কম দেখুন)' : 'See More (বিস্তারিত দেখুন)'}
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingTech({ ...t })}
                    className="p-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-xl text-[10px] font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setTechnologies(technologies.filter((_, i) => i !== idx))}
                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. DYNAMIC SOCIAL LINKS */}
      {activeTab === 'socials' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Custom Social Media Links & Icon Upload</h3>

          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <p className="font-black text-slate-900 text-xs">Add New Social Platform:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Platform Name *</label>
                <input
                  type="text"
                  value={newSocialPlatform}
                  onChange={(e) => setNewSocialPlatform(e.target.value)}
                  placeholder="e.g. TikTok, WhatsApp, Facebook"
                  className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Profile URL *</label>
                <input
                  type="text"
                  value={newSocialUrl}
                  onChange={(e) => setNewSocialUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={socialIconRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageFile(f, setNewSocialIconUrl);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => socialIconRef.current?.click()}
                  className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-2xs hover:bg-slate-100"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>Choose Custom Icon</span>
                </button>

                {newSocialIconUrl && (
                  <img src={newSocialIconUrl} alt="Icon Preview" className="w-9 h-9 object-contain rounded-lg border bg-white p-0.5" />
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddSocialLink}
              className="bg-[#00984a] text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-1.5 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Social Link
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {customSocialLinks.map((item, idx) => (
              <div key={item.id || idx} className="p-3 bg-white rounded-2xl border shadow-2xs flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  {item.iconUrl ? (
                    <img src={item.iconUrl} alt="Icon" className="w-8 h-8 rounded-lg object-contain border p-0.5" />
                  ) : (
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00984a] flex items-center justify-center font-bold">
                      <Share2 className="w-4 h-4" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 text-xs truncate">{item.platform}</p>
                    <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{item.url}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => setEditingSocial({ ...item })}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded-lg"
                    title="Edit Link"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setCustomSocialLinks(customSocialLinks.filter((_, i) => i !== idx))}
                    className="p-1 text-red-500 hover:bg-red-50 rounded-lg"
                    title="Delete Link"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. MISSION & VISION POINTS */}
      {activeTab === 'mission' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Mission & Vision Multi-Line Descriptions & Points</h3>

          <div className="p-5 bg-slate-50 rounded-2xl border space-y-3">
            <h4 className="font-black text-slate-900">1. Mission Headline & Detailed Paragraph:</h4>
            <input
              type="text"
              value={missionTitle}
              onChange={(e) => setMissionTitle(e.target.value)}
              className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
            />
            <textarea
              rows={4}
              value={missionDesc}
              onChange={(e) => setMissionDesc(e.target.value)}
              placeholder="Detailed mission paragraph (Textarea)..."
              className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[100px]"
            />

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newMissionPointText}
                onChange={(e) => setNewMissionPointText(e.target.value)}
                placeholder="Add new mission commitment point..."
                className="flex-1 bg-white border rounded-xl px-3 py-2 text-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (newMissionPointText.trim()) {
                    setMissionPoints([...missionPoints, newMissionPointText.trim()]);
                    setNewMissionPointText('');
                  }
                }}
                className="bg-[#00984a] text-white px-4 py-2 rounded-xl"
              >
                + Add Point
              </button>
            </div>
            <div className="space-y-1">
              {missionPoints.map((pt, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 px-3 rounded-xl border text-xs">
                  <span>• {pt}</span>
                  <button type="button" onClick={() => setMissionPoints(missionPoints.filter((_, idx) => idx !== i))} className="text-red-500 font-black">×</button>
                </div>
              ))}
            </div>
          </div>

          <div className="p-5 bg-slate-50 rounded-2xl border space-y-3">
            <h4 className="font-black text-slate-900">2. Vision Headline & Detailed Paragraph:</h4>
            <input
              type="text"
              value={visionTitle}
              onChange={(e) => setVisionTitle(e.target.value)}
              className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
            />
            <textarea
              rows={4}
              value={visionDesc}
              onChange={(e) => setVisionDesc(e.target.value)}
              placeholder="Detailed vision paragraph (Textarea)..."
              className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[100px]"
            />

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                value={newVisionPointText}
                onChange={(e) => setNewVisionPointText(e.target.value)}
                placeholder="Add new vision goal..."
                className="flex-1 bg-white border rounded-xl px-3 py-2 text-slate-900"
              />
              <button
                type="button"
                onClick={() => {
                  if (newVisionPointText.trim()) {
                    setVisionPoints([...visionPoints, newVisionPointText.trim()]);
                    setNewVisionPointText('');
                  }
                }}
                className="bg-[#00984a] text-white px-4 py-2 rounded-xl"
              >
                + Add Point
              </button>
            </div>
            <div className="space-y-1">
              {visionPoints.map((pt, i) => (
                <div key={i} className="flex justify-between items-center bg-white p-2 px-3 rounded-xl border text-xs">
                  <span>• {pt}</span>
                  <button type="button" onClick={() => setVisionPoints(visionPoints.filter((_, idx) => idx !== i))} className="text-red-500 font-black">×</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 5. HERO SLIDER */}
      {activeTab === 'slider' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Hero Banner Studio</h3>
          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end">
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Banner Image *</label>
                <input
                  type="file"
                  ref={slideFileRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageFile(f, setNewSlideUploadedUrl);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => slideFileRef.current?.click()}
                  className="w-full bg-white border py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>{newSlideUploadedUrl ? 'Image Selected ✓' : 'Upload Slide from PC'}</span>
                </button>
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Slide Headline</label>
                <input
                  type="text"
                  value={newSlideTitle}
                  onChange={(e) => setNewSlideTitle(e.target.value)}
                  placeholder="e.g. Modern Automated Diagnostic Lab"
                  className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Slide Subtitle (Textarea)</label>
                <textarea
                  rows={2}
                  value={newSlideSubtitle}
                  onChange={(e) => setNewSlideSubtitle(e.target.value)}
                  placeholder="Brief description about this banner..."
                  className="w-full bg-white border rounded-xl p-3 text-slate-900"
                />
              </div>
            </div>

            {newSlideUploadedUrl && (
              <div className="flex items-center gap-3 p-2 bg-white rounded-xl border border-emerald-400">
                <img src={newSlideUploadedUrl} alt="Slide Preview" className="w-24 h-14 object-cover rounded-lg" />
                <span className="text-[11px] text-[#00984a] font-bold">✓ Slide Image Preview Ready</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleAddSlide}
              disabled={!newSlideUploadedUrl}
              className="bg-[#00984a] text-white py-2.5 px-6 rounded-xl font-bold flex items-center gap-1 shadow-xs"
            >
              <Plus className="w-4 h-4" /> Add Slide to Slider
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {slides.map((s, idx) => (
              <div key={s.id || idx} className="rounded-2xl border overflow-hidden relative group bg-white shadow-2xs">
                <img src={s.imageUrl} alt="Slide" className="w-full h-36 object-cover" />
                <div className="p-3">
                  <span className="text-[9px] font-black text-[#00984a] uppercase">Slide #{idx + 1}</span>
                  <p className="font-bold text-slate-900 text-xs truncate mt-0.5">{s.title || 'Untitled Banner'}</p>
                </div>
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    onClick={() => setEditingSlide({ ...s })}
                    className="bg-blue-600 text-white p-1.5 rounded-lg shadow"
                    title="Edit Slide"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlides(slides.filter((_, i) => i !== idx))}
                    className="bg-red-600 text-white p-1.5 rounded-lg shadow"
                    title="Delete Slide"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 6. MANAGEMENT TEAM */}
      {activeTab === 'management' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Management Team Members</h3>

          <div className="bg-slate-50 p-4 rounded-2xl border space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                type="text"
                value={newMemberName}
                onChange={(e) => setNewMemberName(e.target.value)}
                placeholder="Full Name *"
                className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
              />
              <input
                type="text"
                value={newMemberDesignation}
                onChange={(e) => setNewMemberDesignation(e.target.value)}
                placeholder="Designation"
                className="w-full bg-white border rounded-xl px-3 py-2 text-slate-900"
              />
              
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={memberPhotoRef}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) uploadImageFile(f, setNewMemberPhotoUrl);
                  }}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => memberPhotoRef.current?.click()}
                  className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-[#00984a]" />
                  <span>Choose Photo</span>
                </button>

                {newMemberPhotoUrl && (
                  <img src={newMemberPhotoUrl} alt="Preview" className="w-9 h-9 object-cover rounded-lg border border-emerald-400" />
                )}
              </div>
            </div>

            <div>
              <label className="block mb-1 text-[10px] text-slate-500 uppercase">Person Bio & Clinical Background (Textarea)</label>
              <textarea
                rows={3}
                value={newMemberBio}
                onChange={(e) => setNewMemberBio(e.target.value)}
                placeholder="Write member's clinical governance and healthcare experience..."
                className="w-full bg-white border rounded-xl p-3 text-slate-900 font-medium min-h-[80px]"
              />
            </div>

            <button
              type="button"
              onClick={() => {
                if (newMemberName.trim()) {
                  setManagementTeam([...managementTeam, {
                    id: `m-${Date.now()}`,
                    name: newMemberName.trim(),
                    designation: newMemberDesignation.trim(),
                    degrees: newMemberDegrees.trim(),
                    bio: newMemberBio.trim(),
                    photoUrl: newMemberPhotoUrl,
                  }]);
                  setNewMemberName('');
                  setNewMemberDesignation('');
                  setNewMemberBio('');
                  setNewMemberPhotoUrl('');
                }
              }}
              className="bg-[#00984a] text-white px-5 py-2 rounded-xl"
            >
              + Add Member
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {managementTeam.map((m, idx) => (
              <div key={m.id || idx} className="p-4 rounded-2xl border bg-white shadow-2xs flex flex-col justify-between items-start">
                <div className="flex items-center gap-3 w-full">
                  <img src={m.photoUrl || 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=400&auto=format&fit=crop'} alt="Member" className="w-12 h-12 rounded-xl object-cover border" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-xs">{m.name}</h4>
                    <p className="text-[10px] text-[#00984a]">{m.designation}</p>
                    
                    {/* Management Bio with See More Toggle */}
                    <div className="mt-1">
                      <p className={`text-[10px] text-slate-500 leading-relaxed ${!expandedAdminDescs[`member-${idx}`] ? 'line-clamp-2' : ''}`}>
                        {m.bio}
                      </p>
                      {m.bio && m.bio.length > 80 && (
                        <button
                          type="button"
                          onClick={() => toggleAdminDesc(`member-${idx}`)}
                          className="text-[10px] text-[#00984a] font-black hover:underline mt-0.5 inline-block"
                        >
                          {expandedAdminDescs[`member-${idx}`] ? 'Hide Content (কম দেখুন)' : 'See More (বিস্তারিত দেখুন)'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mt-3 pt-2 border-t w-full justify-end">
                  <button
                    type="button"
                    onClick={() => setEditingMember({ ...m })}
                    className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => setManagementTeam(managementTeam.filter((_, i) => i !== idx))}
                    className="p-1.5 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg text-[10px] font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 7. CONTACT, MAP & WHATSAPP */}
      {activeTab === 'contact' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4 text-xs font-bold text-slate-700 animate-in fade-in">
          <h3 className="text-sm font-black text-slate-900 border-b pb-2">Address, Google Map & Floating WhatsApp</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Floating WhatsApp Number (e.g. 8801700000000) *</label>
              <input
                type="text"
                value={whatsappNumber}
                onChange={(e) => setWhatsappNumber(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900"
              />
            </div>
            <div>
              <label className="block mb-1">Hotline Number (e.g. 09666 787801) *</label>
              <input
                type="text"
                value={hotline}
                onChange={(e) => setHotline(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900 font-mono"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1">Full Physical Centre Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block mb-1">Google Maps Embed iframe URL *</label>
              <input
                type="text"
                value={googleMapUrl}
                onChange={(e) => setGoogleMapUrl(e.target.value)}
                className="w-full bg-slate-50 border rounded-xl px-4 py-2.5 text-slate-900"
              />
            </div>
          </div>
        </div>
      )}

      {/* FULL EDIT TECHNOLOGY MODAL */}
      {editingTech && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl border text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Clinical Technology
              </h3>
              <button onClick={() => setEditingTech(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedTech} className="space-y-3.5">
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Analyzer Name *</label>
                <input
                  type="text"
                  required
                  value={editingTech.name}
                  onChange={(e) => setEditingTech({ ...editingTech, name: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] text-slate-500 uppercase">Model</label>
                  <input
                    type="text"
                    value={editingTech.model || ''}
                    onChange={(e) => setEditingTech({ ...editingTech, model: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] text-slate-500 uppercase">Manufacturer</label>
                  <input
                    type="text"
                    value={editingTech.manufacturer || ''}
                    onChange={(e) => setEditingTech({ ...editingTech, manufacturer: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Description (Textarea) *</label>
                <textarea
                  rows={4}
                  required
                  value={editingTech.description}
                  onChange={(e) => setEditingTech({ ...editingTech, description: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Machine Image</label>
                <div className="flex items-center gap-3">
                  {editingTech.imageUrl && (
                    <img src={editingTech.imageUrl} alt="Tech" className="w-12 h-12 rounded-xl object-cover border" />
                  )}
                  <input
                    type="file"
                    ref={editTechPhotoRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImageFile(f, (url) => setEditingTech({ ...editingTech, imageUrl: url }));
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editTechPhotoRef.current?.click()}
                    className="bg-white border px-3 py-1.5 rounded-xl font-bold flex items-center gap-1 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>Replace Image from PC</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingTech(null)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT SOCIAL LINK MODAL */}
      {editingSocial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Social Media Link
              </h3>
              <button onClick={() => setEditingSocial(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSocial} className="space-y-3.5">
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Platform Name *</label>
                <input
                  type="text"
                  required
                  value={editingSocial.platform}
                  onChange={(e) => setEditingSocial({ ...editingSocial, platform: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Profile URL *</label>
                <input
                  type="text"
                  required
                  value={editingSocial.url}
                  onChange={(e) => setEditingSocial({ ...editingSocial, url: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Custom Icon</label>
                <div className="flex items-center gap-2">
                  {editingSocial.iconUrl && (
                    <img src={editingSocial.iconUrl} alt="Icon" className="w-8 h-8 rounded-lg object-contain border p-0.5" />
                  )}
                  <input
                    type="file"
                    ref={editSocialIconRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImageFile(f, (url) => setEditingSocial({ ...editingSocial, iconUrl: url }));
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editSocialIconRef.current?.click()}
                    className="flex-1 bg-white border py-2 px-3 rounded-xl flex items-center justify-center gap-1 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>Replace Icon from PC</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingSocial(null)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT SLIDE MODAL */}
      {editingSlide && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Hero Banner Slide
              </h3>
              <button onClick={() => setEditingSlide(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedSlide} className="space-y-3.5">
              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Slide Headline</label>
                <input
                  type="text"
                  value={editingSlide.title || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, title: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Slide Subtitle (Textarea)</label>
                <textarea
                  rows={2}
                  value={editingSlide.subtitle || ''}
                  onChange={(e) => setEditingSlide({ ...editingSlide, subtitle: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Banner Image</label>
                <div className="space-y-2">
                  {editingSlide.imageUrl && (
                    <img src={editingSlide.imageUrl} alt="Banner" className="w-full h-32 object-cover rounded-xl border" />
                  )}
                  <input
                    type="file"
                    ref={editSlideFileRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImageFile(f, (url) => setEditingSlide({ ...editingSlide, imageUrl: url }));
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editSlideFileRef.current?.click()}
                    className="w-full bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>Replace Banner Image from PC</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingSlide(null)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FULL EDIT MANAGEMENT MEMBER MODAL */}
      {editingMember && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border text-xs font-bold text-slate-700 animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-4 pb-2 border-b">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-1.5">
                <Edit className="w-4 h-4 text-[#00984a]" /> Edit Management Member
              </h3>
              <button onClick={() => setEditingMember(null)} className="p-1 text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedMember} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block mb-1 text-[10px] text-slate-500 uppercase">Person Name *</label>
                  <input
                    type="text"
                    required
                    value={editingMember.name}
                    onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-[10px] text-slate-500 uppercase">Designation</label>
                  <input
                    type="text"
                    value={editingMember.designation || ''}
                    onChange={(e) => setEditingMember({ ...editingMember, designation: e.target.value })}
                    className="w-full bg-slate-50 border rounded-xl px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Person Bio (Textarea)</label>
                <textarea
                  rows={3}
                  value={editingMember.bio || ''}
                  onChange={(e) => setEditingMember({ ...editingMember, bio: e.target.value })}
                  className="w-full bg-slate-50 border rounded-xl p-3 text-slate-900 font-medium"
                />
              </div>

              <div>
                <label className="block mb-1 text-[10px] text-slate-500 uppercase">Person Photo</label>
                <div className="flex items-center gap-3">
                  {editingMember.photoUrl && (
                    <img src={editingMember.photoUrl} alt="Member" className="w-12 h-12 rounded-xl object-cover border" />
                  )}
                  <input
                    type="file"
                    ref={editMemberPhotoRef}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) uploadImageFile(f, (url) => setEditingMember({ ...editingMember, photoUrl: url }));
                    }}
                    accept="image/*"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => editMemberPhotoRef.current?.click()}
                    className="flex-1 bg-white border py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Upload className="w-3.5 h-3.5 text-[#00984a]" />
                    <span>Replace Photo from PC</span>
                  </button>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={() => setEditingMember(null)} className="w-1/2 bg-slate-100 py-2.5 rounded-xl">Cancel</button>
                <button type="submit" className="w-1/2 bg-brand-gradient text-white py-2.5 rounded-xl font-black">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};