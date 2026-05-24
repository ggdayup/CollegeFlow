import { useState, useMemo, useEffect } from 'react';
import { universities, University, UniversitySchool, MajorLink } from '../data/universitiesData';
import { majors, getDetailedFieldById, getBroadFieldById } from '../data/majorsData';
import { calculateSubjectDemands } from '../utils/demands';

interface UseUniversityNavigatorOptions {
  initialUniId?: string;
  initialSchoolId?: string;
  uniPageSize?: number;
}

export function useUniversityNavigator({
  initialUniId = 'umich',
  initialSchoolId = 'lsa',
  uniPageSize = 6
}: UseUniversityNavigatorOptions = {}) {
  const [activeUniId, setActiveUniId] = useState<string>(initialUniId);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>(initialSchoolId);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('');
  const [showcaseNationalMajorId, setShowcaseNationalMajorId] = useState<string | null>(null);

  // Degree Level Filter: 'BACHELOR' | 'MASTER' | 'DOCTORATE'
  const [degreeLevelFilter, setDegreeLevelFilter] = useState<'BACHELOR' | 'MASTER' | 'DOCTORATE'>('BACHELOR');

  // States for the 1000-university Directory Hub
  const [uniSearchQuery, setUniSearchQuery] = useState<string>('');
  const [uniTypeFilter, setUniTypeFilter] = useState<string>('all');
  const [uniCountryFilter, setUniCountryFilter] = useState<string>('all');
  const [uniStateFilter, setUniStateFilter] = useState<string>('all');
  const [uniPage, setUniPage] = useState<number>(1);
  const [uniSortBy, setUniSortBy] = useState<string>('nameEn');

  // DB universities loading state
  const [dbUniversities, setDbUniversities] = useState<University[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const res = await fetch('/api/universities');
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const data = await res.json();
        if (active) {
          setDbUniversities(data);
          setLoading(false);
        }
      } catch (err) {
        console.error('Failed to load universities from API, falling back to static seeds:', err);
        if (active) {
          setLoading(false);
        }
      }
    }
    load();
    return () => {
      active = false;
    };
  }, []);

  // Synchronize state when custom redirection event triggers
  useEffect(() => {
    const handleNavigate = () => {
      const preferredUniId = localStorage.getItem('preferred_uni_id');
      const preferredSchoolId = localStorage.getItem('preferred_school_id');
      
      if (preferredUniId) {
        setActiveUniId(preferredUniId);
      }
      if (preferredSchoolId) {
        setSelectedSchoolId(preferredSchoolId);
      }

      // Perform a smooth scroll to the navigator section
      setTimeout(() => {
        const el = document.getElementById('university-navigator-heading');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    window.addEventListener('navigate_to_university', handleNavigate);
    return () => {
      window.removeEventListener('navigate_to_university', handleNavigate);
    };
  }, []);

  // Resilient Dual-path loading strategy: automatic static fallback
  const finalUnis = useMemo(() => {
    return dbUniversities.length > 0 ? dbUniversities : universities;
  }, [dbUniversities]);

  // Retrieve current active university object
  const activeUni = useMemo(() => {
    return finalUnis.find(u => u.id === activeUniId) || finalUnis[0];
  }, [activeUniId, finalUnis]);

  // Landmark/Prestigious universities lookup
  const landmarks = useMemo(() => {
    const list: University[] = [];
    const ids = ['harvard', 'mit', 'stanford', 'princeton', 'berkeley', 'umich', 'rice'];
    ids.forEach(id => {
      const u = finalUnis.find(x => x.id === id);
      if (u) list.push(u);
    });
    return list;
  }, [finalUnis]);

  // Collect unique countries for geographic filtering (pinning popular options first)
  const uniqueCountries = useMemo(() => {
    const countriesSet = new Set<string>();
    finalUnis.forEach(u => {
      if (u.countryEn) {
        countriesSet.add(u.countryEn);
      }
    });

    const allCountries = Array.from(countriesSet);
    const popular = [
      'United States',
      'United Kingdom',
      'Canada',
      'Australia',
      'Singapore',
      'Hong Kong'
    ];

    const popularPresent = popular.filter(c => countriesSet.has(c));
    const others = allCountries.filter(c => !popular.includes(c)).sort();

    return [...popularPresent, ...others];
  }, [finalUnis]);

  // Collect unique US states for filtering (pinning popular options first)
  const uniqueStates = useMemo(() => {
    const statesSet = new Set<string>();
    finalUnis.forEach(u => {
      if (u.countryEn === 'United States' || u.locationEn.includes(', ')) {
        const parts = u.locationEn.split(', ');
        if (parts.length > 1) {
          statesSet.add(parts[1]);
        }
      }
    });

    const allStates = Array.from(statesSet);
    const popular = ['CA', 'NY', 'MA', 'TX', 'PA', 'IL'];

    const popularPresent = popular.filter(s => statesSet.has(s));
    const others = allStates.filter(s => !popular.includes(s)).sort();

    return [...popularPresent, ...others];
  }, [finalUnis]);

  // Set page back to 1 if filters or sorting change
  useEffect(() => {
    setUniPage(1);
  }, [uniSearchQuery, uniTypeFilter, uniCountryFilter, uniStateFilter, uniSortBy]);

  // Filter and Sort 1000 universities based on search & criteria & sorting rules
  const filteredUniversities = useMemo(() => {
    const filtered = finalUnis.filter(u => {
      const query = uniSearchQuery.trim().toLowerCase();
      const matchesSearch = !query || 
        (u.nameEn && u.nameEn.toLowerCase().includes(query)) || 
        (u.nameZh && u.nameZh.toLowerCase().includes(query)) || 
        (u.shortNameEn && u.shortNameEn.toLowerCase().includes(query)) || 
        (u.shortNameZh && u.shortNameZh.toLowerCase().includes(query)) ||
        (() => {
          const words = (u.nameEn || '').toLowerCase().replace(/[^a-z\s]/g, '').split(/\s+/);
          const acronym = words.filter(w => !['of', 'and', 'at', 'the', 'in'].includes(w)).map(w => w[0]).join('');
          return acronym.includes(query);
        })();

      let matchesType = true;
      if (uniTypeFilter !== 'all') {
        const badgeLower = u.badgeEn.toLowerCase();
        const isPrivate = badgeLower.includes('private') || badgeLower.includes('ivy') || badgeLower.includes('liberal');
        const isPublic = badgeLower.includes('public') || badgeLower.includes('flagship') || badgeLower.includes('ivy');
        const isStem = badgeLower.includes('tech') || badgeLower.includes('stem');
        
        if (uniTypeFilter === 'private' && !isPrivate) matchesType = false;
        if (uniTypeFilter === 'public' && !isPublic) matchesType = false;
        if (uniTypeFilter === 'stem' && !isStem) matchesType = false;
      }

      let matchesCountry = true;
      if (uniCountryFilter !== 'all') {
        if (u.countryEn !== uniCountryFilter) {
          matchesCountry = false;
        }
      }

      let matchesState = true;
      if (uniCountryFilter === 'United States' && uniStateFilter !== 'all') {
        const parts = u.locationEn.split(', ');
        const state = parts.length > 1 ? parts[1] : '';
        if (state !== uniStateFilter) matchesState = false;
      }

      return matchesSearch && matchesType && matchesCountry && matchesState;
    });

    const sorted = [...filtered];
    if (uniSortBy === 'qsRank') {
      sorted.sort((a, b) => {
        const rankA = a.qsRank && a.qsRank > 0 && a.qsRank < 999 ? a.qsRank : 999999;
        const rankB = b.qsRank && b.qsRank > 0 && b.qsRank < 999 ? b.qsRank : 999999;
        if (rankA !== rankB) return rankA - rankB;
        return a.nameEn.localeCompare(b.nameEn);
      });
    } else if (uniSortBy === 'usNewsRank') {
      sorted.sort((a, b) => {
        const rankA = a.usNewsRank && a.usNewsRank > 0 && a.usNewsRank < 999 ? a.usNewsRank : 999999;
        const rankB = b.usNewsRank && b.usNewsRank > 0 && b.usNewsRank < 999 ? b.usNewsRank : 999999;
        if (rankA !== rankB) return rankA - rankB;
        return a.nameEn.localeCompare(b.nameEn);
      });
    } else {
      sorted.sort((a, b) => a.nameEn.localeCompare(b.nameEn));
    }

    return sorted.map(u => {
      let prestigeNumber = u.prestigeNumber;
      let prestigeLabelEn = u.prestigeLabelEn;
      let prestigeLabelZh = u.prestigeLabelZh;

      if (uniSortBy === 'qsRank') {
        prestigeNumber = u.qsRank && u.qsRank > 0 && u.qsRank < 999 ? `#${u.qsRank}` : 'Unranked';
        prestigeLabelEn = 'QS World Rank';
        prestigeLabelZh = 'QS 世界排名';
      } else if (uniSortBy === 'usNewsRank') {
        prestigeNumber = u.usNewsRank && u.usNewsRank > 0 && u.usNewsRank < 999 ? `#${u.usNewsRank}` : 'Unranked';
        prestigeLabelEn = 'US News Rank';
        prestigeLabelZh = 'US News 排名';
      }

      return {
        ...u,
        prestigeNumber,
        prestigeLabelEn,
        prestigeLabelZh
      };
    });
  }, [uniSearchQuery, uniTypeFilter, uniCountryFilter, uniStateFilter, uniSortBy, finalUnis]);

  // Paginated visible universities slice
  const paginatedUniversities = useMemo(() => {
    const startIndex = (uniPage - 1) * uniPageSize;
    return filteredUniversities.slice(startIndex, startIndex + uniPageSize);
  }, [filteredUniversities, uniPage, uniPageSize]);

  const totalPages = Math.max(1, Math.ceil(filteredUniversities.length / uniPageSize));

  // Synchronize school and category tabs when active university changes
  useEffect(() => {
    if (activeUni && activeUni.schools.length > 0) {
      const firstSchool = activeUni.schools[0];
      setSelectedSchoolId(firstSchool.id);
      
      if (firstSchool.categories && firstSchool.categories.length > 0) {
        setActiveCategoryTab(firstSchool.categories[0].id);
      } else {
        setActiveCategoryTab('');
      }
    }
  }, [activeUniId, activeUni]);

  // Synchronize category tab when school selection changes and filter by degreeLevel
  const activeSchool = useMemo(() => {
    let school = activeUni.schools.find(s => s.id === selectedSchoolId);
    if (!school) {
      // Fallback safely
      school = activeUni.schools[0];
    }
    if (!school) return school;

    // If category tab is not valid for this school, reset it
    if (school.categories && school.categories.length > 0) {
      // Only set tab if current tab is not in the categories list
      const tabExists = school.categories.some(c => c.id === activeCategoryTab);
      if (!tabExists) {
        setActiveCategoryTab(school.categories[0].id);
      }
    } else {
      setActiveCategoryTab('');
    }

    // Filter majors in the school based on degreeLevelFilter
    const filterFn = (m: MajorLink) => {
      const level = m.degreeLevel || 'BACHELOR';
      return level === degreeLevelFilter;
    };

    let filteredCategories = school.categories;
    if (school.categories) {
      filteredCategories = school.categories.map(cat => ({
        ...cat,
        majors: cat.majors.filter(filterFn)
      }));
    }

    let filteredMajors = school.majors;
    if (school.majors) {
      filteredMajors = school.majors.filter(filterFn);
    }

    return {
      ...school,
      categories: filteredCategories,
      majors: filteredMajors
    };
  }, [selectedSchoolId, activeUni, activeCategoryTab, degreeLevelFilter]);

  // Search filter across the current active university's schools, categories, and majors
  const searchResults = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return null;

    const matchedSchools: { school: UniversitySchool; matchingMajors: MajorLink[] }[] = [];

    activeUni.schools.forEach(school => {
      const allSchoolMajors: MajorLink[] = [];
      
      if (school.categories) {
        school.categories.forEach(cat => {
          allSchoolMajors.push(...cat.majors);
        });
      } else if (school.majors) {
        allSchoolMajors.push(...school.majors);
      }

      const matchingMajors = allSchoolMajors.filter(m => {
        const matchesNameEn = m.nameEn.toLowerCase().includes(query);
        const matchesNameZh = m.nameZh.toLowerCase().includes(query);
        const matchesSubEn = m.submajors?.some(sm => sm.toLowerCase().includes(query)) || false;
        const matchesNotesEn = m.notesEn?.toLowerCase().includes(query) || false;
        const matchesNotesZh = m.notesZh?.toLowerCase().includes(query) || false;
        return matchesNameEn || matchesNameZh || matchesSubEn || matchesNotesEn || matchesNotesZh;
      });

      const schoolMatches = 
        school.nameEn.toLowerCase().includes(query) || 
        school.nameZh.toLowerCase().includes(query) || 
        school.code.toLowerCase().includes(query) ||
        school.descriptionEn.toLowerCase().includes(query) ||
        school.descriptionZh.toLowerCase().includes(query);

      if (matchingMajors.length > 0 || schoolMatches) {
        matchedSchools.push({
          school,
          matchingMajors
        });
      }
    });

    return matchedSchools;
  }, [searchQuery, activeUni]);

  // Find info of the currently showcased national major
  const showcaseMajorObj = useMemo(() => {
    if (!showcaseNationalMajorId) return null;
    const major = majors.find(m => m.id === showcaseNationalMajorId);
    if (!major) return null;

    const df = getDetailedFieldById(major.detailedFieldId);
    const bf = getBroadFieldById(major.broadFieldId);
    const demands = calculateSubjectDemands(major);

    return {
      major,
      df,
      bf,
      demands
    };
  }, [showcaseNationalMajorId]);

  const handleOpenNationalShowcase = (nationalId: string) => {
    setShowcaseNationalMajorId(nationalId);
  };

  return {
    loading,
    dbUniversities,
    finalUnis,
    activeUniId,
    setActiveUniId,
    activeUni,
    selectedSchoolId,
    setSelectedSchoolId,
    activeSchool,
    searchQuery,
    setSearchQuery,
    searchResults,
    activeCategoryTab,
    setActiveCategoryTab,
    showcaseNationalMajorId,
    setShowcaseNationalMajorId,
    showcaseMajorObj,
    uniSearchQuery,
    setUniSearchQuery,
    uniTypeFilter,
    setUniTypeFilter,
    uniCountryFilter,
    setUniCountryFilter,
    uniStateFilter,
    setUniStateFilter,
    uniSortBy,
    setUniSortBy,
    uniPage,
    setUniPage,
    totalPages,
    filteredUniversities,
    paginatedUniversities,
    landmarks,
    uniqueCountries,
    uniqueStates,
    handleOpenNationalShowcase,
    degreeLevelFilter,
    setDegreeLevelFilter
  };
}
