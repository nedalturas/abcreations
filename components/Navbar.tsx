'use client';

import { useState } from 'react';
import { Container, Group, Text, Burger, Drawer, Stack, UnstyledButton } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { LayoutDashboard, Wrench, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserMenu } from './UserMenu';
import { useAuth } from '@/hooks/useAuth';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Repairs', href: '/repairs', icon: Wrench },
  { name: 'Job Orders', href: '/job-orders', icon: Briefcase },
];

export function Navbar() {
  const [opened, { toggle, close }] = useDisclosure(false);
  const pathname = usePathname();
  const { user } = useAuth();

  // Don't show navbar on auth/login pages
  if (pathname === '/auth' || pathname === '/login' || pathname === '/auth/complete') {
    return null;
  }

  return (
    <div className="navbar">
      <Container>
        <Group justify="space-between" h={70}>
          {/* Left side - Logo */}
          <Group gap="sm">
            <svg fill="#FF385C" height="25px" width="25px" version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 489.6 489.6" stroke="#FF385C" strokeWidth="0.004896" transform="matrix(1, 0, 0, 1, 0, 0)">
              <g id="SVGRepo_bgCarrier" strokeWidth="1"></g>
              <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round" stroke="#050505" strokeWidth="16.646400000000003">
                <g>
                  <path d="M466.1,115c-9.7,0-17.5,7.8-17.5,17.5v54.8h-27.2V89.8L188.3,103V78.5h12.8V22.1h-12.8V9.7c0-5.4-4.3-9.7-9.7-9.7 s-9.7,4.3-9.7,9.7v12.4h-12.8v56.3h12.7v24.5c0,0.4,0,0.8,0,1.2L5.6,113.4v85.1l17.1,0.8v82h16.7v35h13.2v39.2 c0,5.4,4.3,9.7,9.7,9.7s9.7-4.3,9.7-9.7v-39.2h13.2v-35h16.7V204l182.2,10.1v180.7H5.6v94.8h416.2V282.9H449v54.8 c0,9.7,7.8,17.5,17.5,17.5s17.5-7.8,17.5-17.5V132.5C483.6,122.8,475.8,115,466.1,115z M448.6,263.1h-27.2v-56.3h27.2V263.1z"></path>
                </g>
              </g>
              <g id="SVGRepo_iconCarrier">
                <g>
                  <path d="M466.1,115c-9.7,0-17.5,7.8-17.5,17.5v54.8h-27.2V89.8L188.3,103V78.5h12.8V22.1h-12.8V9.7c0-5.4-4.3-9.7-9.7-9.7 s-9.7,4.3-9.7,9.7v12.4h-12.8v56.3h12.7v24.5c0,0.4,0,0.8,0,1.2L5.6,113.4v85.1l17.1,0.8v82h16.7v35h13.2v39.2 c0,5.4,4.3,9.7,9.7,9.7s9.7-4.3,9.7-9.7v-39.2h13.2v-35h16.7V204l182.2,10.1v180.7H5.6v94.8h416.2V282.9H449v54.8 c0,9.7,7.8,17.5,17.5,17.5s17.5-7.8,17.5-17.5V132.5C483.6,122.8,475.8,115,466.1,115z M448.6,263.1h-27.2v-56.3h27.2V263.1z"></path>
                </g>
              </g>
            </svg>

            <Text className="navbar-brand">
              ABC Portal
            </Text>
          </Group>

          {/* Right side - Desktop Navigation and User Menu */}
          <Group gap="md" visibleFrom="sm">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`navbar-link ${isActive ? 'active' : ''}`}
                >
                  <Icon size={18} />
                  {item.name}
                </Link>
              );
            })}

            {user && <UserMenu />}
          </Group>

          {/* Mobile - User Menu and Burger */}
          <Group gap="sm" hiddenFrom="sm">
            {user && <UserMenu />}
            <Burger opened={opened} onClick={toggle} size="sm" />
          </Group>
        </Group>
      </Container>

      {/* Mobile Navigation Drawer */}
      <Drawer
        opened={opened}
        onClose={close}
        title="Navigation"
        padding="md"
        size="xs"
        position="right"
      >
        <Stack gap="xs">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <UnstyledButton
                key={item.name}
                component={Link}
                href={item.href}
                className={`navbar-link ${isActive ? 'active' : ''}`}
                onClick={close}
                style={{ width: '100%' }}
              >
                <Icon size={18} />
                {item.name}
              </UnstyledButton>
            );
          })}
        </Stack>
      </Drawer>
    </div>
  );
}