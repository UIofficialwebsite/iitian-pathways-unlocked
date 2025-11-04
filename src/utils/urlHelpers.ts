export const slugify = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const unslugify = (slug: string): string => {
  return slug
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const buildExamUrl = (
  exam: string,
  tab: string,
  params: Record<string, string | undefined> = {}
): string => {
  const baseUrl = `/exam-preparation/${exam.toLowerCase()}`;
  
  // Define parameter order for different tabs
  const paramOrder: Record<string, string[]> = {
    'notes': ['subject', 'class', 'branch', 'level'],
    'syllabus': ['subject', 'class', 'branch', 'level'],
    'pyqs': ['subject', 'class', 'year', 'session', 'branch', 'level']
  };
  
  // Get the order for this tab, or use all params if not defined
  const order = paramOrder[tab] || Object.keys(params);
  
  // Build params array in the correct order
  const cleanParams = order
    .filter(key => params[key] && params[key] !== 'all')
    .map(key => slugify(params[key]!));
  
  if (cleanParams.length === 0) {
    return `${baseUrl}/${slugify(tab)}`;
  }
  
  return `${baseUrl}/${slugify(tab)}/${cleanParams.join('/')}`;
};

export const parseExamUrl = (pathname: string) => {
  const parts = pathname.split('/').filter(Boolean);
  
  if (parts.length < 3 || parts[0] !== 'exam-preparation') {
    return null;
  }
  
  const exam = parts[1];
  const tab = parts[2];
  const params = parts.slice(3);
  
  return {
    exam,
    tab: unslugify(tab).toLowerCase().replace(/\s+/g, '-'),
    params
  };
};

export const getTabFromUrl = (pathname: string): string => {
  const parsed = parseExamUrl(pathname);
  return parsed?.tab || 'notes';
};

export const getParamsFromUrl = (pathname: string): string[] => {
  const parsed = parseExamUrl(pathname);
  return parsed?.params.map(param => unslugify(param)) || [];
};