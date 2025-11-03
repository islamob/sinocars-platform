import { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'fr' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  fr: {
    appName: 'Algeria Car Pool',
    tagline: 'Plateforme de partage de conteneurs entre agents algériens en Chine',
    login: 'Connexion',
    register: "S'inscrire",
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    confirmPassword: 'Confirmer le mot de passe',
    companyName: 'Nom de la société',
    contactPerson: 'Personne de contact',
    phone: 'Téléphone',
    myProfile: 'Mon profil',
    myListings: 'Mes annonces',
    createListing: 'Créer une annonce',
    adminPanel: 'Panneau admin',
    browseListings: 'Parcourir les annonces',
    offerSpace: "J'offre de l'espace",
    requestSpace: 'Je cherche de l\'espace',
    listingType: "Type d'annonce",
    title: 'Titre',
    description: 'Description',
    departureCityChina: 'Ville de départ (Chine)',
    arrivalCityAlgeria: "Ville d'arrivée (Algérie)",
    portLoading: "Port d'embarquement",
    portArrival: "Port d'arrivée",
    spotsCount: 'Nombre de places',
    carTypes: 'Types de véhicules',
    estimatedShippingDate: "Date d'expédition estimée",
    contactEmail: 'Email de contact',
    contactPhone: 'Téléphone de contact',
    submit: 'Soumettre',
    cancel: 'Annuler',
    save: 'Enregistrer',
    delete: 'Supprimer',
    edit: 'Modifier',
    approve: 'Approuver',
    reject: 'Rejeter',
    pending: 'En attente',
    approved: 'Approuvé',
    rejected: 'Rejeté',
    revealContact: 'Révéler les contacts',
    contactInfo: 'Informations de contact',
    loginRequired: 'Connexion requise pour voir les contacts',
    search: 'Rechercher',
    filter: 'Filtrer',
    allListings: 'Toutes les annonces',
    offers: 'Offres',
    requests: 'Demandes',
    noListings: 'Aucune annonce trouvée',
    updateProfile: 'Mettre à jour le profil',
    profileUpdated: 'Profil mis à jour avec succès',
    listingCreated: 'Annonce créée avec succès',
    listingUpdated: 'Annonce mise à jour avec succès',
    listingDeleted: 'Annonce supprimée avec succès',
    error: 'Erreur',
    success: 'Succès',
    loading: 'Chargement...',
  },
  ar: {
    appName: 'Algeria Car Pool',
    tagline: 'منصة لمشاركة الحاويات بين الوكلاء الجزائريين في الصين',
    login: 'تسجيل الدخول',
    register: 'إنشاء حساب',
    logout: 'تسجيل الخروج',
    email: 'البريد الإلكتروني',
    password: 'كلمة المرور',
    confirmPassword: 'تأكيد كلمة المرور',
    companyName: 'اسم الشركة',
    contactPerson: 'شخص الاتصال',
    phone: 'الهاتف',
    myProfile: 'ملفي الشخصي',
    myListings: 'إعلاناتي',
    createListing: 'إنشاء إعلان',
    adminPanel: 'لوحة الإدارة',
    browseListings: 'تصفح الإعلانات',
    offerSpace: 'أقدم مساحة',
    requestSpace: 'أبحث عن مساحة',
    listingType: 'نوع الإعلان',
    title: 'العنوان',
    description: 'الوصف',
    departureCityChina: 'مدينة المغادرة (الصين)',
    arrivalCityAlgeria: 'مدينة الوصول (الجزائر)',
    portLoading: 'ميناء الشحن',
    portArrival: 'ميناء الوصول',
    spotsCount: 'عدد الأماكن',
    carTypes: 'أنواع السيارات',
    estimatedShippingDate: 'تاريخ الشحن المقدر',
    contactEmail: 'بريد الاتصال',
    contactPhone: 'هاتف الاتصال',
    submit: 'إرسال',
    cancel: 'إلغاء',
    save: 'حفظ',
    delete: 'حذف',
    edit: 'تعديل',
    approve: 'قبول',
    reject: 'رفض',
    pending: 'قيد الانتظار',
    approved: 'مقبول',
    rejected: 'مرفوض',
    revealContact: 'إظهار جهات الاتصال',
    contactInfo: 'معلومات الاتصال',
    loginRequired: 'يجب تسجيل الدخول لرؤية جهات الاتصال',
    search: 'بحث',
    filter: 'تصفية',
    allListings: 'جميع الإعلانات',
    offers: 'عروض',
    requests: 'طلبات',
    noListings: 'لم يتم العثور على إعلانات',
    updateProfile: 'تحديث الملف الشخصي',
    profileUpdated: 'تم تحديث الملف الشخصي بنجاح',
    listingCreated: 'تم إنشاء الإعلان بنجاح',
    listingUpdated: 'تم تحديث الإعلان بنجاح',
    listingDeleted: 'تم حذف الإعلان بنجاح',
    error: 'خطأ',
    success: 'نجاح',
    loading: 'جاري التحميل...',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('fr');

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.fr] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      <div dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
