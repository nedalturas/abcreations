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

  // Don't show navbar on auth pages
  if (pathname === '/auth' || pathname === '/auth/complete') {
    return null;
  }

  return (
    <div className="navbar">
      <Container size="lg">
        <Group justify="space-between" h={70}>
          <Text className="navbar-brand">
            BagCraft Pro
          </Text>

          {/* Desktop Navigation */}
          <Group gap="xs" visibleFrom="sm">
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
          </Group>

          {/* User Menu and Mobile Menu Button */}
          <Group gap="sm">
            {user && <UserMenu />}
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
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