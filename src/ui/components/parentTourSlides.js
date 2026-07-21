// Parent tour slides. Each slide can specify:
//   navigate() — switches top-level tabs by calling window.__pearTourNavigate(target)
//   targetId — data-tour-id attribute of the element to spotlight (omit for centered card)
//   title, body, cta — copy

import { t } from '../locales/index.js';

const nav = (target) => () => window.__pearTourNavigate?.(target);

export const PARENT_TOUR_SLIDES = [
  {
    title: t('Welcome to PearGuard'),
    body: t('A private parental control app that runs peer-to-peer between your device and your child\'s. No servers, no accounts, no data collected.'),
    navigate: nav('dashboard'),
  },
  {
    title: t('Pair with your child\'s device'),
    body: t('Tap Add Child on your Dashboard to scan a QR code or share a one-time invite link. Once paired, your child appears here.'),
    targetId: 'dashboard-add-child',
    navigate: nav('dashboard'),
  },
  {
    title: t('Your Dashboard'),
    body: t('Each paired child shows their current app, screen time today, and any pending approvals or requests. Tap a child\'s card to dig in.'),
    targetId: 'dashboard-child-card',
    navigate: nav('dashboard'),
  },
  {
    title: t('Decide which apps your child can use'),
    body: t('Open the Apps tab to approve, block, or set daily time limits per app. You can set limits by category too (Games, Social, Video and Music).'),
    targetId: 'child-tab-apps',
    navigate: nav('child:apps'),
  },
  {
    title: t('Set quiet hours'),
    body: t('The Rules tab lets you block apps during specific times like bedtime or school. Pick days and times, then choose any apps that stay allowed during the window.'),
    targetId: 'child-tab-rules',
    navigate: nav('child:rules'),
  },
  {
    title: t('Stay in the loop'),
    body: t('When your child wants more time or asks to unblock an app, the request shows up in their Activity tab. Approve with a duration or deny in one tap.'),
    targetId: 'child-tab-activity',
    navigate: nav('child:activity'),
  },
  {
    title: t('Optional: set an Override PIN'),
    body: t('Give your child a 4-digit PIN they can enter on a blocked app to grant themselves a brief override. Each use shows up in your Activity log.'),
    targetId: 'settings-override-pin',
    navigate: nav('settings'),
  },
  {
    title: t('You\'re ready'),
    body: t('Head back to your Dashboard to keep going. You can replay this tour any time from the About tab.'),
    navigate: nav('dashboard'),
    cta: t('Get Started'),
  },
];

// Auto-tour after first successful pairing skips the Welcome and Pair slides since
// the parent has already dismissed the welcome card and just finished pairing.
export const PARENT_TOUR_AFTER_PAIR_SLIDES = PARENT_TOUR_SLIDES.slice(2);
