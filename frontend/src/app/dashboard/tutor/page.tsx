'use client';

import React, { JSX } from 'react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  User,
  BookOpen,
  Users,
  Upload,
  LayoutDashboard,
} from 'lucide-react';

import { TutorSidebar } from './_components/tutor-sidebar';
import { DashboardOverview } from './_components/tutor-dashboard-overview';
import { ProfileView } from './_components/tutor-profile-view';
import { ApplicationsView } from './_components/tutor-applications-view';
import { StudentsView } from './_components/tutor-students-view';
import { SearchTutorView } from './_components/tutor-search-tutor-view';
import { MaterialsView } from './_components/tutor-materials-view';
import { LogoutConfirmDialog } from './_components/logout-confirm-dialog';

// Color Palette Variables
export const LIGHTEST = '#FFE6E6';
export const LIGHT_PURPLE = '#E1AFD1';
export const MEDIUM_PURPLE = '#AD88C6';
export const DARK_PURPLE = '#7469B6';

export type View =
  | 'dashboard'
  | 'profile'
  | 'applications'
  | 'students'
  | 'materials'
  | 'searchTutor';

export interface Student {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: string;
}

export type Subject =
  | 'MATH'
  | 'PHYSICS'
  | 'CHEMISTRY'
  | 'ENGLISH'
  | 'COMPUTER_SCIENCE'
  | 'ECONOMICS'
  | 'ACCOUNTING';

export const SubjectList: Subject[] = [
  'MATH',
  'PHYSICS',
  'CHEMISTRY',
  'ENGLISH',
  'COMPUTER_SCIENCE',
  'ECONOMICS',
  'ACCOUNTING',
];

export const timeSlots = [
  { label: "09:00" },
  { label: "11:00" },
  { label: "13:00" },
  { label: "15:00" },
  { label: "17:00" },
];


export const daysOfWeek = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
  'Sunday',
];

export interface User {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'TUTOR' | 'STUDENT' | 'ADMIN';
}

export interface TutorProfile {
  user: {
    id: string;
    name: string;
    email: string;
    phoneNumber: string;
    role: 'TUTOR' | 'STUDENT' | 'ADMIN';
  }
  id: string;
  subjects?: Subject[];
  hourlyRate?: number;
  bio?: string | null;
  experience?: number | null;
  availability?: any;
  profileImage?: string | null;
}

export interface Application {
  studentId: string;
  applicationId: string;
  name: string;
  email: string;
  phoneNumber: string;
  applicationStatus: string;
  requestedAt: string;
  createdAt?: string;
}

type SearchQuery = {
  name?: string;
  subject?: string;
  minRate?: number;
  maxRate?: number;
};

// Helper component for Star icon
export const Star = (props: any) => (
  <svg
    {...props}
    xmlns='http://www.w3.org/2000/svg'
    width='24'
    height='24'
    viewBox='0 0 24 24'
    fill='currentColor'
    stroke='currentColor'
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <polygon points='12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2'></polygon>
  </svg>
);

export default function TutorDashboardLandingPage() {
  const router = useRouter();

  // navigation + auth
  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [userName, setUserName] = useState('Tutor');
  const [userEmail, setUserEmail] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  // dashboard
  const [activeStudentCount, setActiveStudentCount] = useState<number | string>(
    '-',
  );
  const [dashboardFetchError, setDashboardFetchError] = useState<
    string | null
  >(null);

  // applications
  const [applications, setApplications] = useState<Application[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  // 
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<TutorProfile | null>(null);
  const [bio, setBio] = useState('');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [experience, setExperience] = useState<number>(0);
  const [hourlyRate, setHourlyRate] = useState<number>(0);
  const [availability, setAvailability] = useState<string[]>([]);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState('');

  // students
  const [students, setStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);

  // search tutors
  const [searchResults, setSearchResults] = useState<TutorProfile[]>([]);
  const [searchQuery, setSearchQuery] = useState<SearchQuery>({});
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // materials
  const [materials, setMaterials] = useState<any[]>([]);
  const [materialTitle, setMaterialTitle] = useState('');
  const [materialDescription, setMaterialDescription] = useState('');
  const [materialFile, setMaterialFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);

  // initial auth load
  useEffect(() => {
    const name = localStorage.getItem('name') || 'Tutor';
    const email = localStorage.getItem('email') || '';
    const t = localStorage.getItem('token');

    setUserName(name);
    setUserEmail(email);
    setToken(t);
  }, []);

  // dashboard: fetch student count + applications
  useEffect(() => {
    if (!token || !userEmail) return;

    const baseURL = 'http://localhost:3000';

    const fetchStudentCount = async () => {
      setDashboardFetchError(null);
      try {
        const endpoint = `${baseURL}/api/tutors/${userEmail}/students`;
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch student data');
        const data: Student[] = await response.json();
        setActiveStudentCount(data.length);
      } catch (_error) {
        setActiveStudentCount('Error');
        setDashboardFetchError('Could not load student count.');
      }
    };

    const fetchApplications = async () => {
      setAppsLoading(true);
      setAppsError(null);
      try {
        const endpoint = `${baseURL}/api/applications/tutor`;
        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch applications.');
        const data = await response.json();

        setApplications(
          data.map((app: any) => ({
            applicationId: app.id,
            applicationStatus: app.status,
            requestedAt: app.requestedAt,
            createdAt: app.createdAt,
            studentId: app.student?.id,
            name: app.student?.user?.name ?? 'Unknown',
            email: app.student?.user?.email ?? 'Unknown',
            phoneNumber: app.student?.user?.phoneNumber ?? '-',
          })),
        );
      } catch (error: any) {
        console.error('Application fetch error:', error);
        setAppsError('Failed to load applications list.');
      } finally {
        setAppsLoading(false);
      }
    };

    fetchStudentCount();
    // for overview card we still like to have apps
    fetchApplications();
  }, [token, userEmail]);

  // profile fetch
  useEffect(() => {
    if (!token) return;

    async function fetchProfile() {
      setProfileLoading(true);
      try {
        const res = await fetch('http://localhost:3000/api/tutors/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch profile');

        const data = await res.json();
        const tutorProfile: TutorProfile = data.profile;
        const user: User = data.user;

        const backendAvailabilityObject = tutorProfile.availability || {};
        const flatAvailabilityArray: string[] = [];

        for (const dayKey in backendAvailabilityObject) {
          if (Object.prototype.hasOwnProperty.call(backendAvailabilityObject, dayKey)) {
            const slotList = backendAvailabilityObject[dayKey];
            const upperDayKey = dayKey.toUpperCase();

            slotList.forEach((slot: string) => {
              flatAvailabilityArray.push(`${upperDayKey}_${slot}`);
            });
          }
        }

        setUser(user);
        setProfile(tutorProfile);
        setBio(tutorProfile.bio || '');
        setSubjects(tutorProfile.subjects || []);
        setExperience(tutorProfile.experience || 0);
        setHourlyRate(tutorProfile.hourlyRate || 0);
        setAvailability(flatAvailabilityArray);
        console.log('Fetched profile:', tutorProfile);
      } catch (_err: any) {
        setProfileError('Could not load profile details.');
      } finally {
        setProfileLoading(false);
      }
    }

    fetchProfile();
  }, [token]);

  // auto clear profile success
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => setProfileSuccess(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

  // fetch applications when entering applications view
  useEffect(() => {
    if (!token || currentView !== 'applications') return;

    const fetchApplications = async () => {
      setAppsLoading(true);
      setAppsError(null);
      try {
        const baseURL = 'http://localhost:3000';
        const endpoint = `${baseURL}/api/applications/tutor`;

        const response = await fetch(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch applications.');

        const data = await response.json();
        setApplications(
          data.map((app: any) => ({
            applicationId: app.id,
            applicationStatus: app.status,
            requestedAt: app.requestedAt,
            createdAt: app.createdAt,
            studentId: app.student?.id,
            name: app.student?.user?.name ?? 'Unknown',
            email: app.student?.user?.email ?? 'Unknown',
            phoneNumber: app.student?.user?.phoneNumber ?? '-',
          })),
        );
      } catch (error: any) {
        console.error('Application fetch error:', error);
        setAppsError('Failed to load applications list.');
      } finally {
        setAppsLoading(false);
      }
    };

    fetchApplications();
  }, [token, currentView]);

  // fetch students when entering students view
  const fetchStudents = async () => {
    if (!token || !userEmail) return;

    setStudentsLoading(true);
    setStudentsError(null);

    try {
      const response = await fetch(
        `http://localhost:3000/api/tutors/${userEmail}/students`,
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (!response.ok) throw new Error('Failed to fetch students.');
      const data: Student[] = await response.json();
      setStudents(data);
    } catch (error: any) {
      console.error('Students fetch error:', error);
      setStudentsError('Could not load student list.');
    } finally {
      setStudentsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchStudents();
    }
  }, [token, currentView]);

  // fetch materials when entering materials view
  useEffect(() => {
    if (currentView !== 'materials') return;
    if (!token || !profile?.id) return;

    const fetchMaterials = async () => {
      try {
        const res = await fetch(
          `http://localhost:3000/api/materials/tutor/${profile.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error('Failed to fetch materials');
        const data = await res.json();
        setMaterials(data);
      } catch (err) {
        console.error('Materials fetch error:', err);
        setMaterials([]);
      }
    };

    fetchMaterials();
  }, [token, profile?.id, currentView]);

  // subject toggle
  const handleSubjectChange = (subject: Subject) => {
    setSubjects((prev) =>
      prev.includes(subject)
        ? prev.filter((s) => s !== subject)
        : [...prev, subject],
    );
  };

  // availability toggle
  const handleAvailabilityChange = (key: string) => {
    setAvailability((prev) =>
      prev.includes(key) ? prev.filter((d) => d !== key) : [...prev, key],
    );
  };

  // profile submit
  const handleSubmitProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess('');
    setSaving(true);

    if (!profile || !profile.id || !token) {
      setProfileError('Profile ID or token is missing. Cannot save profile.');
      setSaving(false);
      return;
    }

    const backendAvailabilityObject: { [key: string]: string[] } = {};

    availability.forEach((key) => {
      const [day, timeSlot] = key.split('_');
      const dayKey = day.toLowerCase();

      if (!backendAvailabilityObject[dayKey]) {
        backendAvailabilityObject[dayKey] = [];
      }
      backendAvailabilityObject[dayKey].push(timeSlot);
    });

    const updatePayload: any = {};
    const initialProfile = profile;

    if (bio !== initialProfile.bio && bio.trim() !== '') {
      updatePayload.bio = bio;
    }
    if (subjects.length > 0) {
      updatePayload.subjects = subjects;
    }
    if (experience !== initialProfile.experience && experience > 0) {
      updatePayload.experience = experience;
    }
    if (hourlyRate !== initialProfile.hourlyRate && hourlyRate > 0) {
      updatePayload.hourlyRate = hourlyRate;
    }

    updatePayload.availability = backendAvailabilityObject;

    if (
      Object.keys(updatePayload).filter((key) => key !== 'availability')
        .length === 0 &&
      Array.isArray(initialProfile.availability) &&
      availability.length === initialProfile.availability.length
    ) {
      setSaving(false);
      setProfileError('No meaningful changes detected to save.');
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:3000/api/tutors/${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updatePayload),
        },
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Failed to update profile');
      }

      const data = await res.json();
      setProfile(data);
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // accept / reject application
  const handleApplicationAction = async (
    applicationId: string,
    action: 'accept' | 'reject',
  ) => {
    if (!token) return;

    try {
      const endpoint = `http://localhost:3000/api/applications/${applicationId}/status`;
      const statusValue = action === 'accept' ? 'ACCEPTED' : 'REJECTED';

      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: statusValue }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Failed to ${action} application.`);
      }

      setApplications((prev) =>
        prev.map((app) =>
          app.applicationId === applicationId
            ? { ...app, applicationStatus: statusValue }
            : app,
        ),
      );
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error(`${action.toUpperCase()} application error:`, error);
    }
  };

  const handleAccept = (applicationId: string) =>
    handleApplicationAction(applicationId, 'accept');
  const handleReject = (applicationId: string) =>
    handleApplicationAction(applicationId, 'reject');

  // remove student
  const handleRemoveStudent = async (studentId: string) => {
    if (!token) return;

    const confirmed = window.confirm(
      'Are you sure you want to remove this student?',
    );
    if (!confirmed) return;

    try {
      const response = await fetch(
        `http://localhost:3000/api/tutors/students/${studentId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || 'Failed to remove student');
      }

      setStudents((prev) => prev.filter((s) => s.id !== studentId));
    } catch (error: any) {
      alert(`Error: ${error.message}`);
      console.error('Remove student error:', error);
    }
  };

  // search tutors
  const searchTutors = async () => {
    if (!token) return;

    setSearchLoading(true);
    setSearchError(null);

    try {
      const params = new URLSearchParams();
      if (searchQuery.name?.trim())
        params.append('name', searchQuery.name.trim());
      if (searchQuery.subject) params.append('subject', searchQuery.subject);
      if (searchQuery.minRate != null)
        params.append('minRate', searchQuery.minRate.toString());
      if (searchQuery.maxRate != null)
        params.append('maxRate', searchQuery.maxRate.toString());

      const response = await fetch(
        `http://localhost:3000/api/tutors/search?${params.toString()}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!response.ok) throw new Error('Failed to search tutors.');

      const data = await response.json();
      setSearchResults(data);
    } catch (err: any) {
      console.error('Search tutors error:', err);
      setSearchError('Could not fetch search results.');
    } finally {
      setSearchLoading(false);
    }
  };

  // upload materials
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setUploadError('You are not logged in.');
      return;
    }

    if (!materialFile) {
      setUploadError('Please select a file.');
      return;
    }

    if (!profile?.id) {
      setUploadError('Tutor profile not found.');
      return;
    }

    const formData = new FormData();
    formData.append('title', materialTitle);
    formData.append('description', materialDescription);
    formData.append('file', materialFile);
    selectedStudents.forEach((id) => formData.append('allowedStudents', id));

    try {
      setUploading(true);
      setUploadError(null);
      setUploadSuccess(null);

      const res = await fetch(
        `http://localhost:3000/api/materials/upload/${profile.id}`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
        },
      );

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.log('Upload error:', text);
        throw new Error('Failed to upload material');
      }

      setUploadSuccess('Material uploaded successfully!');

      setMaterialTitle('');
      setMaterialDescription('');
      setMaterialFile(null);
      setSelectedStudents([]);

      const materialsRes = await fetch(
        `http://localhost:3000/api/materials/tutor/${profile.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!materialsRes.ok)
        throw new Error('Failed to fetch materials after upload');
      const materialsData = await materialsRes.json();
      setMaterials(materialsData);
    } catch (err: any) {
      console.error(err);
      setUploadError(err.message || 'Failed to upload material.');
    } finally {
      setUploading(false);
    }
  };

  // logout handlers
  const confirmLogout = () => setShowConfirm(true);
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    router.push('/auth/login');
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      route: '/dashboard/tutor',
    },
    {
      id: 'profile',
      label: 'My Profile',
      icon: User,
      route: '/dashboard/tutor/profile',
    },
    {
      id: 'applications',
      label: 'Applications',
      icon: BookOpen,
      route: '/dashboard/tutor/applications',
    },
    {
      id: 'students',
      label: 'My Students',
      icon: Users,
      route: '/dashboard/tutor/students',
    },
    {
      id: 'materials',
      label: 'Upload Materials',
      icon: Upload,
      route: '/dashboard/tutor/materials',
    },
    {
      id: 'searchTutor',
      label: 'Search Tutors',
      icon: Users,
      route: '/dashboard/tutor/search',
    },
  ] as const;

  let content: JSX.Element;

if (currentView === 'profile') {
  content = (
    <ProfileView
      DARK_PURPLE={DARK_PURPLE}
      MEDIUM_PURPLE={MEDIUM_PURPLE}

      // profile & status
      user={user}
      profile={profile}
      profileLoading={profileLoading}
      profileError={profileError}
      profileSuccess={profileSuccess}

      // bio
      bio={bio}
      setBio={setBio}

      // experience & hourly rate
      // experience={experience}
      // setExperience={setExperience}
      hourlyRate={hourlyRate}
      setHourlyRate={setHourlyRate}

      // subjects
      subjects={subjects}
      onSubjectChange={handleSubjectChange}

      // availability
      availability={availability}
      onAvailabilityChange={handleAvailabilityChange}

      // saving + submit
      saving={saving}
      onSubmit={handleSubmitProfile}
    />
  );
}
 else if (currentView === 'applications') {
    content = (
      <ApplicationsView
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        applications={applications}
        appsLoading={appsLoading}
        appsError={appsError}
        onAccept={handleAccept}
        onReject={handleReject}
      />
    );
  } else if (currentView === 'students') {
    content = (
      <StudentsView
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        students={students}
        studentsLoading={studentsLoading}
        studentsError={studentsError}
        onRemoveStudent={handleRemoveStudent}
      />
    );
  } else if (currentView === 'searchTutor') {
    content = (
      <SearchTutorView
        DARK_PURPLE={DARK_PURPLE}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        searchLoading={searchLoading}
        searchError={searchError}
        searchResults={searchResults}
        onSearch={searchTutors}
      />
    );
  } else if (currentView === 'materials') {
    content = (
      <MaterialsView
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        students={students}
        studentsLoading={studentsLoading}
        studentsError={studentsError}
        materials={materials}
        materialTitle={materialTitle}
        setMaterialTitle={setMaterialTitle}
        materialDescription={materialDescription}
        setMaterialDescription={setMaterialDescription}
        materialFile={materialFile}
        setMaterialFile={setMaterialFile}
        selectedStudents={selectedStudents}
        setSelectedStudents={setSelectedStudents}
        uploading={uploading}
        uploadError={uploadError}
        uploadSuccess={uploadSuccess}
        onUpload={handleUpload}
      />
    );
  } else {
    content = (
      <DashboardOverview
        DARK_PURPLE={DARK_PURPLE}
        LIGHT_PURPLE={LIGHT_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        applications={applications}
        activeStudentCount={activeStudentCount}
        dashboardFetchError={dashboardFetchError}
      />
    );
  }

  return (
    <div
      className='flex min-h-screen p-0 m-0 font-[Outfit]'
      style={{ backgroundColor: LIGHT_PURPLE }}
    >
      <div className='flex w-full h-screen shadow-2xl overflow-hidden bg-white'>
        <TutorSidebar
          DARK_PURPLE={DARK_PURPLE}
          MEDIUM_PURPLE={MEDIUM_PURPLE}
          LIGHTEST={LIGHTEST}
          navItems={navItems}
          currentView={currentView}
          onChangeView={(view) => setCurrentView(view)}
          userName={userName}
          userEmail={userEmail}
          onLogoutClick={confirmLogout}
          LogOutIcon={LogOut}
        />

        <div
          className='grow overflow-y-auto'
          style={{ backgroundColor: LIGHTEST }}
        >
          {content}
        </div>
      </div>

      <LogoutConfirmDialog
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={handleLogout}
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        LIGHTEST={LIGHTEST}
      />
    </div>
  );
}
