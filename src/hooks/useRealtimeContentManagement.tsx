
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { Course } from '@/components/admin/courses/types';

export interface ContentItem {
  id: string;
  title: string;
  description?: string;
  created_at: string;
  exam_type?: string;
  branch?: string;
  level?: string;
  class_level?: string;
  subject?: string;
  is_active?: boolean;
  file_link?: string;
  download_count?: number;
}

export interface StudyGroup {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  exam_type?: string;
  branch?: string;
  level?: string;
  class_level?: string;
  group_type?: string;
  invite_link?: string;
  subjects?: string[];
  created_by?: string;
  updated_at: string;
}

export interface Community {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  exam_type?: string;
  branch?: string;
  level?: string;
  class_level?: string;
  group_type: string;
  group_link: string;
  subject?: string;
  is_active?: boolean;
  member_count?: number;
  created_by?: string;
  updated_at: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  job_type: string;
  experience_level: string;
  stipend?: string;
  description: string;
  requirements: string[];
  application_url?: string;
  deadline?: string;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  duration?: string;
}

export const useRealtimeContentManagement = () => {
  const [notes, setNotes] = useState<ContentItem[]>([]);
  const [pyqs, setPyqs] = useState<ContentItem[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [importantDates, setImportantDates] = useState<ContentItem[]>([]);
  const [newsUpdates, setNewsUpdates] = useState<ContentItem[]>([]);
  const [studyGroups, setStudyGroups] = useState<StudyGroup[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Fetch functions
  const fetchNotes = useCallback(async () => {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching notes:', error);
      return;
    }
    setNotes(data || []);
  }, []);

  const fetchPyqs = useCallback(async () => {
    const { data, error } = await supabase
      .from('pyqs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching pyqs:', error);
      return;
    }
    setPyqs(data || []);
  }, []);

  const fetchCourses = useCallback(async () => {
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching courses:', error);
      return;
    }
    setCourses((data || []) as unknown as Course[]);
  }, []);

  const fetchImportantDates = useCallback(async () => {
    const { data, error } = await supabase
      .from('important_dates')
      .select('*')
      .order('date_value', { ascending: true });
    
    if (error) {
      console.error('Error fetching important dates:', error);
      return;
    }
    setImportantDates(data || []);
  }, []);

  const fetchNewsUpdates = useCallback(async () => {
    const { data, error } = await supabase
      .from('news_updates')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching news updates:', error);
      return;
    }
    setNewsUpdates(data || []);
  }, []);

  const fetchStudyGroups = useCallback(async () => {
    const { data, error } = await supabase
      .from('study_groups')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching study groups:', error);
      return;
    }
    setStudyGroups(data || []);
  }, []);

  const fetchJobs = useCallback(async () => {
    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching jobs:', error);
      return;
    }
    setJobs(data || []);
  }, []);

  const fetchCommunities = useCallback(async () => {
    const { data, error } = await supabase
      .from('communities')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching communities:', error);
      return;
    }
    setCommunities(data || []);
  }, []);

  // Initial fetch
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      await Promise.all([
        fetchNotes(),
        fetchPyqs(),
        fetchCourses(),
        fetchImportantDates(),
        fetchNewsUpdates(),
        fetchStudyGroups(),
        fetchJobs(),
        fetchCommunities()
      ]);
      setLoading(false);
    };

    fetchAllData();
  }, [fetchNotes, fetchPyqs, fetchCourses, fetchImportantDates, fetchNewsUpdates, fetchStudyGroups, fetchJobs, fetchCommunities]);

  // Real-time subscriptions
  useEffect(() => {
    const channels: any[] = [];

    // Notes real-time subscription
    const notesChannel = supabase
      .channel('notes-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'notes'
      }, () => {
        fetchNotes();
      })
      .subscribe();
    channels.push(notesChannel);

    // PYQs real-time subscription
    const pyqsChannel = supabase
      .channel('pyqs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pyqs'
      }, () => {
        fetchPyqs();
      })
      .subscribe();
    channels.push(pyqsChannel);

    // Courses real-time subscription
    const coursesChannel = supabase
      .channel('courses-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'courses'
      }, () => {
        fetchCourses();
      })
      .subscribe();
    channels.push(coursesChannel);

    // Important dates real-time subscription
    const datesChannel = supabase
      .channel('dates-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'important_dates'
      }, () => {
        fetchImportantDates();
      })
      .subscribe();
    channels.push(datesChannel);

    // News updates real-time subscription
    const newsChannel = supabase
      .channel('news-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'news_updates'
      }, () => {
        fetchNewsUpdates();
      })
      .subscribe();
    channels.push(newsChannel);

    // Study groups real-time subscription
    const studyGroupsChannel = supabase
      .channel('study-groups-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'study_groups'
      }, () => {
        fetchStudyGroups();
      })
      .subscribe();
    channels.push(studyGroupsChannel);

    // Jobs real-time subscription
    const jobsChannel = supabase
      .channel('jobs-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'jobs'
      }, () => {
        fetchJobs();
      })
      .subscribe();
    channels.push(jobsChannel);

    // Communities real-time subscription
    const communitiesChannel = supabase
      .channel('communities-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'communities'
      }, () => {
        fetchCommunities();
      })
      .subscribe();
    channels.push(communitiesChannel);

    return () => {
      channels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [fetchNotes, fetchPyqs, fetchCourses, fetchImportantDates, fetchNewsUpdates, fetchStudyGroups, fetchJobs, fetchCommunities]);

  // Filter functions based on profile
  const getFilteredContent = useCallback((profile: any) => {
    if (!profile) return {
      notes: [],
      pyqs: [],
      courses: [],
      importantDates: [],
      newsUpdates: [],
      studyGroups: [],
      communities: []
    };

    const filterByProfile = (items: ContentItem[]) => {
      return items.filter(item => {
        if (profile.program_type === 'IITM_BS') {
          return (
            item.exam_type === 'IITM_BS' ||
            (item.branch === profile.branch && item.level === profile.level)
          );
        } else if (profile.program_type === 'COMPETITIVE_EXAM') {
          return (
            item.exam_type === profile.exam_type ||
            item.class_level === profile.student_status
          );
        }
        return true;
      });
    };

    const filterCoursesByProfile = (courses: Course[]) => {
      return courses.filter(course => {
        if (profile.program_type === 'IITM_BS') {
          return (
            course.exam_category === 'IITM BS' ||
            (course.branch === profile.branch && course.level === profile.level)
          );
        } else if (profile.program_type === 'COMPETITIVE_EXAM') {
          return course.exam_category === profile.exam_type;
        }
        return true;
      });
    };

    const filterStudyGroupsByProfile = (groups: StudyGroup[]) => {
      return groups.filter(group => {
        if (profile.program_type === 'IITM_BS') {
          return (
            group.exam_type === 'IITM_BS' ||
            (group.branch === profile.branch && group.level === profile.level)
          );
        } else if (profile.program_type === 'COMPETITIVE_EXAM') {
          return (
            group.exam_type === profile.exam_type ||
            group.class_level === profile.student_status
          );
        }
        return true;
      });
    };

    const filterCommunitiesByProfile = (communities: Community[]) => {
      return communities.filter(community => {
        if (profile.program_type === 'IITM_BS') {
          return (
            community.exam_type === 'IITM_BS' ||
            (community.branch === profile.branch && community.level === profile.level)
          );
        } else if (profile.program_type === 'COMPETITIVE_EXAM') {
          return (
            community.exam_type === profile.exam_type ||
            community.class_level === profile.student_status
          );
        }
        return true;
      });
    };

    return {
      notes: filterByProfile(notes),
      pyqs: filterByProfile(pyqs),
      courses: filterCoursesByProfile(courses),
      importantDates: filterByProfile(importantDates),
      newsUpdates: filterByProfile(newsUpdates),
      studyGroups: filterStudyGroupsByProfile(studyGroups),
      communities: filterCommunitiesByProfile(communities)
    };
  }, [notes, pyqs, courses, importantDates, newsUpdates, studyGroups, communities]);

  return {
    notes,
    pyqs,
    courses,
    importantDates,
    newsUpdates,
    studyGroups,
    jobs,
    communities,
    loading,
    getFilteredContent,
    refreshAll: async () => {
      await Promise.all([
        fetchNotes(),
        fetchPyqs(),
        fetchCourses(),
        fetchImportantDates(),
        fetchNewsUpdates(),
        fetchStudyGroups(),
        fetchJobs(),
        fetchCommunities()
      ]);
    }
  };
};
