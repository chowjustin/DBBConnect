'use client';

import React from "react";
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LogOut,
  LayoutDashboard,
  Users,
  BookOpen,
  Upload,
  Search,
} from 'lucide-react';
import { StudentSidebar } from './_components/student-sidebar';
import { StudentDashboardOverview } from './_components/student-dashboard-overview';
import { StudentProfileView } from './_components/student-profile-view';
import { StudentTutorsView } from './_components/student-tutors-view';
import { StudentApplicationsView } from './_components/student-applications-view';
import { StudentMaterialsView } from './_components/student-materials-view';
import { StudentSearchTutorsView } from './_components/student-search-tutors-view';
import { LogoutConfirmDialog } from './_components/logout-confirm-dialog';
import StudentReviewView from './_components/student-review';
import { TutorProfile } from "../tutor/page";

// --- SHARED COLORS (same as tutor) ---
export const LIGHTEST = '#FFE6E6';
export const LIGHT_PURPLE = '#E1AFD1';
export const MEDIUM_PURPLE = '#AD88C6';
export const DARK_PURPLE = '#7469B6';

// --- TYPES ---
export type StudentView =
  | 'dashboard'
  | 'profile'
  | 'tutors'
  | 'applications'
  | 'materials'
  | 'searchTutors'
  | 'reviews';

export interface UserBase {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
}

export interface TutorSummary {
  id: string;
  user: UserBase;
  subjects?: string[];
  hourlyRate?: number;
}

export interface StudentProfile {
  id: string;
  bio?: string | null;
  school?: string | null;
  interests?: string[] | null; // adjust to your schema if needed
  tutors?: TutorSummary[]; // from include in getProfile
  profileImage?: string | null;
}

export interface StudentProfileResponse {
  user: UserBase;
  profile: StudentProfile;
}

export interface StudentApplication {
  id: string;
  tutorId: string;
  tutorName: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  requestedAt: string;
}

export interface StudentMaterial {
  id: string;
  title: string;
  description?: string;
  fileUrl: string;
  createdAt: string;
  tutorName?: string;
}

type SearchQuery = {
  name?: string;
  subject?: string;
  minRate?: number;
  maxRate?: number;
};


// --- MAIN CONTAINER ---
export default function StudentDashboardPage() {
  const router = useRouter();

  const [currentView, setCurrentView] = useState<StudentView>('dashboard');

  const [token, setToken] = useState<string | null>(null);
  const [userName, setUserName] = useState('Student');
  const [userEmail, setUserEmail] = useState('');

  const [user, setUser] = useState<UserBase | null>(null);
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);

  const [applications, setApplications] = useState<StudentApplication[]>([]);
  const [appsLoading, setAppsLoading] = useState(false);
  const [appsError, setAppsError] = useState<string | null>(null);

  const [materials, setMaterials] = useState<StudentMaterial[]>([]);
  const [materialsLoading, setMaterialsLoading] = useState(false);
  const [materialsError, setMaterialsError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState<SearchQuery>({});
  const [searchResults, setSearchResults] = useState<TutorProfile[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);



  const [showConfirm, setShowConfirm] = useState(false);

  // Search state (subject, minRate, maxRate)
  const [searchSubject, setSearchSubject] = useState('');
  const [searchMinRate, setSearchMinRate] = useState<number | undefined>();
  const [searchMaxRate, setSearchMaxRate] = useState<number | undefined>();

  // --- LOAD AUTH FROM LOCALSTORAGE ---
  useEffect(() => {
    const t = localStorage.getItem('token');
    const email = localStorage.getItem('email') || '';
    const name = localStorage.getItem('name') || 'Student';

    setToken(t);
    setUserEmail(email);
    setUserName(name);
  }, []);

  // --- FETCH STUDENT PROFILE (/students/profile) ---
  useEffect(() => {
    if (!token) return;

    const fetchProfile = async () => {
      setProfileLoading(true);
      setProfileError(null);
      try {
        const res = await fetch('http://localhost:3000/api/students/profile', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch student profile');

        const data: StudentProfileResponse = await res.json();

        setUser(data.user);
        setProfile(data.profile);
      } catch (err: any) {
        console.error(err);
        setProfileError('Could not load your profile information.');
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [token]);

  // --- AUTO CLEAR PROFILE SUCCESS ---
  useEffect(() => {
    if (profileSuccess) {
      const timer = setTimeout(() => setProfileSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [profileSuccess]);

  // --- FETCH STUDENT APPLICATIONS (/applications/student) ---
  useEffect(() => {
    if (!token) return;
    if (currentView !== 'applications' && currentView !== 'dashboard' && currentView !== 'searchTutors') {
      return;
    }

    const fetchApplications = async () => {
      setAppsLoading(true);
      setAppsError(null);

      try {
        const res = await fetch('http://localhost:3000/api/applications/student', {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) throw new Error('Failed to fetch applications');

        const data = await res.json();
        const mapped: StudentApplication[] = data.map((a: any) => ({
          id: a.id,
          tutorId: a.tutor?.id,
          tutorName: a.tutor?.user?.name ?? 'Unknown tutor',
          status: a.status,
          requestedAt: a.requestedAt,
        }));

        setApplications(mapped);
      } catch (err: any) {
        console.error(err);
        setAppsError('Could not load your applications.');
      } finally {
        setAppsLoading(false);
      }
    };

    fetchApplications();
  }, [token, currentView]);

  // --- FETCH MATERIALS FOR STUDENT (/materials/student/:studentProfileId) ---
  useEffect(() => {
    if (!token || !profile?.id) return;
    if (currentView !== 'materials' && currentView !== 'dashboard') return;

    const fetchMaterials = async () => {
      setMaterialsLoading(true);
      setMaterialsError(null);

      try {
        const res = await fetch(
          `http://localhost:3000/api/materials/student/${profile.id}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (!res.ok) throw new Error('Failed to fetch materials');

        const data = await res.json();
        const mapped: StudentMaterial[] = data.map((m: any) => ({
          id: m.id,
          title: m.title,
          description: m.description,
          fileUrl: m.fileUrl,
          createdAt: m.createdAt,
          tutorName: m.tutor?.user?.name,
        }));

        setMaterials(mapped);
      } catch (err: any) {
        console.error(err);
        setMaterialsError('Could not load your materials.');
      } finally {
        setMaterialsLoading(false);
      }
    };

    fetchMaterials();
  }, [token, profile?.id, currentView]);

  // --- UPDATE STUDENT PROFILE (/students/:id PATCH) ---
  const handleProfileSave = async (updates: {
    bio?: string;
    school?: string;
    interestsText?: string; // comma-separated interests from UI
  }) => {
    if (!token || !profile?.id) return;

    setProfileSaving(true);
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const interestsArray =
        updates.interestsText && updates.interestsText.trim().length > 0
          ? updates.interestsText.split(',').map((s) => s.trim()).filter(Boolean)
          : [];

      const payload: any = {
        bio: updates.bio ?? profile.bio ?? '',
        school: updates.school ?? profile.school ?? '',
        interests: interestsArray,
      };

      const res = await fetch(
        `http://localhost:3000/api/students/${profile.id}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to update profile');
      }

      const updated = await res.json();
      setProfile({
        ...profile,
        bio: updated.bio,
        school: updated.school,
        interests: updated.interests,
      });
      setProfileSuccess('Profile updated successfully!');
    } catch (err: any) {
      console.error(err);
      setProfileError(err.message || 'Failed to update profile');
    } finally {
      setProfileSaving(false);
    }
  };

  // --- SEARCH TUTORS (/students/search-tutors) ---
  // page.tsx (or wherever your search function lives)
const searchTutors = async () => {
  if (!token) return;

  setSearchLoading(true);
  setSearchError(null);

  try {
    const params = new URLSearchParams();

    if (searchQuery.name?.trim())
      params.append('name', searchQuery.name.trim());

    if (searchQuery.subject)
      params.append('subject', searchQuery.subject);

    if (searchQuery.minRate != null)
      params.append('minRate', searchQuery.minRate.toString());

    if (searchQuery.maxRate != null)
      params.append('maxRate', searchQuery.maxRate.toString());

    const response = await fetch(
      `http://localhost:3000/api/students/search-tutors?${params.toString()}`,
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




  // --- APPLY TO TUTOR (/applications POST) ---
  const handleApplyToTutor = async (tutorId: string) => {
    if (!token) return;

    try {
      const res = await fetch('http://localhost:3000/api/applications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ tutorId }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to create application');
      }

      const created = await res.json();
      setApplications((prev) => [
        ...prev,
        {
          id: created.id,
          tutorId: created.tutor?.id || tutorId,
          tutorName: created.tutor?.user?.name ?? 'Unknown tutor',
          status: created.status,
          requestedAt: created.requestedAt,
        },
      ]);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to apply to tutor.');
    }
  };

  // --- CANCEL APPLICATION (/applications/:id DELETE) ---
  const handleCancelApplication = async (applicationId: string) => {
    if (!token) return;

    const confirmed = window.confirm('Cancel this application?');
    if (!confirmed) return;

    try {
      const res = await fetch(
        `http://localhost:3000/api/applications/${applicationId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to cancel application');
      }

      setApplications((prev) =>
        prev.filter((a) => a.id !== applicationId),
      );
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to cancel application.');
    }
  };

  // --- LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('role');
    localStorage.removeItem('email');
    localStorage.removeItem('name');
    router.push('/auth/login');
  };

  const navItems = [
    { id: 'dashboard' as StudentView, label: 'Dashboard Overview', icon: LayoutDashboard },
    { id: 'profile' as StudentView, label: 'My Profile', icon: Users },
    { id: 'tutors' as StudentView, label: 'My Tutors', icon: Users },
    { id: 'applications' as StudentView, label: 'Applications', icon: BookOpen },
    { id: 'materials' as StudentView, label: 'Materials', icon: Upload },
    { id: 'searchTutors' as StudentView, label: 'Search Tutors', icon: Search },
    { id: 'reviews' as StudentView, label: 'My Reviews', icon: BookOpen },
  ];

  const pendingCount = applications.filter(
    (a) => a.status === 'PENDING',
  ).length;

  // Tutors list comes from profile.tutors (backend includes it)
  const tutorsFromProfile: TutorSummary[] =
    profile?.tutors?.map((t: any) => ({
      id: t.id,
      user: t.user,
      subjects: t.subjects || [],
      hourlyRate: t.hourlyRate,
    })) || [];

  // --- MAIN CONTENT SWITCH ---
  let content: React.ReactNode;

  if (currentView === 'profile') {
    content = (
      <StudentProfileView
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        profile={profile}
        user={user}
        loading={profileLoading}
        error={profileError}
        saving={profileSaving}
        success={profileSuccess}
        onSave={handleProfileSave}
      />
    );
  } else if (currentView === 'tutors') {
    content = (
      <StudentTutorsView
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        tutors={tutorsFromProfile}
        loading={profileLoading}
        error={profileError}
      />
    );
  } else if (currentView === 'applications') {
    content = (
      <StudentApplicationsView
        DARK_PURPLE={DARK_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        applications={applications}
        loading={appsLoading}
        error={appsError}
        onCancel={handleCancelApplication}
      />
    );
  } else if (currentView === 'materials') {
    content = (
      <StudentMaterialsView
        DARK_PURPLE={DARK_PURPLE}
        materials={materials}
        loading={materialsLoading}
        error={materialsError}
      />
    );
  } else if (currentView === 'searchTutors') {
  content = (
    <StudentSearchTutorsView
      DARK_PURPLE={DARK_PURPLE}
      searchQuery={searchQuery}
      setSearchQuery={setSearchQuery}
      searchLoading={searchLoading}
      searchError={searchError}
      searchResults={searchResults}
      applications={applications}
      onSearch={searchTutors}
      onApply={handleApplyToTutor}
      onCancel={handleCancelApplication}
    />
  );
}

else if (currentView === 'reviews') {
  content = (
    <StudentReviewView
      DARK_PURPLE={DARK_PURPLE}
      MEDIUM_PURPLE={MEDIUM_PURPLE}
      profile={profile}
      token={token}
      
    />
  );
}


else {
    content = (
      <StudentDashboardOverview
        DARK_PURPLE={DARK_PURPLE}
        LIGHT_PURPLE={LIGHT_PURPLE}
        MEDIUM_PURPLE={MEDIUM_PURPLE}
        tutorsCount={tutorsFromProfile.length}
        pendingApplications={pendingCount}
        materialsCount={materials.length}
      />
    );
  }

  return (
    <div
      className='flex min-h-screen p-0 m-0 font-[Outfit]'
      style={{ backgroundColor: LIGHT_PURPLE }}
    >
      <div className='flex w-full h-screen shadow-2xl overflow-hidden bg-white'>
        <StudentSidebar
          DARK_PURPLE={DARK_PURPLE}
          MEDIUM_PURPLE={MEDIUM_PURPLE}
          LIGHTEST={LIGHTEST}
          navItems={navItems}
          currentView={currentView}
          onChangeView={setCurrentView}
          userName={userName}
          userEmail={userEmail}
          onLogoutClick={() => setShowConfirm(true)}
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
