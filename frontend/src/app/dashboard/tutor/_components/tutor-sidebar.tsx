'use client';

import type { View } from '../page';
import React from 'react';

type NavItem = {
  id: View;
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  route: string;
};

type Props = {
  DARK_PURPLE: string;
  MEDIUM_PURPLE: string;
  LIGHTEST: string;
  navItems: readonly NavItem[];
  currentView: View;
  onChangeView: (view: View) => void;
  userName: string;
  userEmail: string;
  onLogoutClick: () => void;
  LogOutIcon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
};

export const TutorSidebar: React.FC<Props> = ({
  DARK_PURPLE,
  MEDIUM_PURPLE,
  LIGHTEST,
  navItems,
  currentView,
  onChangeView,
  userName,
  userEmail,
  onLogoutClick,
  LogOutIcon,
}) => {
  return (
    <div
      className='w-[300px] flex flex-col justify-between p-8 relative shrink-0'
      style={{
        background: `linear-gradient(to bottom right, ${MEDIUM_PURPLE}, ${DARK_PURPLE})`,
        color: LIGHTEST,
      }}
    >
      <div className='relative z-10'>
        <h1 className='text-4xl font-extrabold mb-12'>TutorConnect</h1>
        <p className='text-lg mb-8 opacity-90 border-b border-white/30 pb-3'>
          {userName}
          <span className='block text-sm opacity-70'>{userEmail}</span>
        </p>

        <nav className='space-y-3'>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onChangeView(item.id)}
                className={`flex items-center w-full p-4 rounded-xl transition-all duration-200 text-left text-lg ${
                  isActive
                    ? 'bg-white font-semibold shadow-md'
                    : 'hover:bg-white/20'
                }`}
                style={{ color: isActive ? DARK_PURPLE : LIGHTEST }}
              >
                <Icon className='w-6 h-6 mr-4' />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>

      <button
        onClick={onLogoutClick}
        className='flex items-center justify-center p-4 mt-16 rounded-xl font-semibold transition-colors hover:bg-red-600 shadow-lg text-lg'
        style={{ backgroundColor: MEDIUM_PURPLE }}
      >
        <LogOutIcon className='w-6 h-6 mr-3' />
        Log Out
      </button>
    </div>
  );
};
