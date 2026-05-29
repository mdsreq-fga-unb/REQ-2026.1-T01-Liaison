/**
 * Theme design system tests
 * Validates that all design tokens are well-formed and consistent.
 */
import { colors } from './colors';
import { typography, fontFamilies } from './typography';
import { radius, spacing, shadows, components } from './spacing';

describe('Theme — Colors', () => {
  it('has all brand color keys', () => {
    expect(colors.brand).toBeDefined();
    expect(colors.brand.navy).toBe('#1a2744');
    expect(colors.brand.gold).toBe('#d4813a');
  });

  it('has all neutral color keys', () => {
    expect(colors.neutral.bg).toBe('#faf8f4');
    expect(colors.neutral.border).toBe('#ddd8ce');
    expect(colors.neutral.white).toBe('#ffffff');
  });

  it('has all text color keys', () => {
    expect(colors.text.primary).toBe('#1a2744');
    expect(colors.text.secondary).toBe('#7a8299');
    expect(colors.text.muted).toContain('rgba');
    expect(colors.text.light).toContain('rgba');
    expect(colors.text.info).toBe('#3a4560');
  });

  it('has all accent color keys', () => {
    expect(colors.accent.lightBg).toBe('#fdf5ec');
    expect(colors.accent.subtleBorder).toContain('rgba');
    expect(colors.accent.subtleShadow).toContain('rgba');
  });

  it('has success color', () => {
    expect(colors.success).toBe('#1d7a4a');
  });
});

describe('Theme — Typography', () => {
  it('defines all required font families', () => {
    expect(fontFamilies.playfairBold).toBe('PlayfairDisplay_700Bold');
    expect(fontFamilies.playfairBoldItalic).toBe('PlayfairDisplay_700Bold_Italic');
    expect(fontFamilies.dmSansRegular).toBe('DMSans_400Regular');
    expect(fontFamilies.dmSansMedium).toBe('DMSans_500Medium');
    expect(fontFamilies.dmSansSemiBold).toBe('DMSans_600SemiBold');
    expect(fontFamilies.dmSansBold).toBe('DMSans_700Bold');
  });

  it('has h1 typography with Playfair Display Bold', () => {
    expect(typography.h1.fontFamily).toBe(fontFamilies.playfairBold);
    expect(typography.h1.fontSize).toBe(24);
  });

  it('has h1-accent typography with Playfair Display Bold Italic', () => {
    expect(typography['h1-accent'].fontFamily).toBe(fontFamilies.playfairBoldItalic);
    expect(typography['h1-accent'].fontSize).toBe(24);
  });

  it('has h2 typography with Playfair Display Bold', () => {
    expect(typography.h2.fontFamily).toBe(fontFamilies.playfairBold);
    expect(typography.h2.fontSize).toBe(20);
  });

  it('has label typography with DM Sans Medium', () => {
    expect(typography.label.fontFamily).toBe(fontFamilies.dmSansMedium);
    expect(typography.label.fontSize).toBe(13);
  });

  it('has body typography with DM Sans Regular', () => {
    expect(typography.body.fontFamily).toBe(fontFamilies.dmSansRegular);
    expect(typography.body.fontSize).toBe(13);
  });

  it('has button typography with DM Sans SemiBold', () => {
    expect(typography.button.fontFamily).toBe(fontFamilies.dmSansSemiBold);
    expect(typography.button.fontSize).toBe(15);
  });

  it('has input typography with DM Sans Regular 15px', () => {
    expect(typography.input.fontFamily).toBe(fontFamilies.dmSansRegular);
    expect(typography.input.fontSize).toBe(15);
  });
});

describe('Theme — Spacing & Radius', () => {
  it('has all radius tokens as positive numbers', () => {
    expect(radius.sm).toBe(8);
    expect(radius.md).toBe(12);
    expect(radius.lg).toBe(20);
    expect(radius.xl).toBe(75);
    expect(radius.round).toBe(9999);
    expect(radius.step).toBe(15);
    Object.values(radius).forEach((v) => expect(v).toBeGreaterThan(0));
  });

  it('has horizontal spacing for login and step pages', () => {
    expect(spacing.horizontal.login).toBe(24);
    expect(spacing.horizontal.step).toBe(20);
  });

  it('has form spacing', () => {
    expect(spacing.formGap).toBe(20);
    expect(spacing.labelGap).toBe(8);
    expect(spacing.inputHorizontal).toBe(16);
  });

  it('has component size specs with positive values', () => {
    expect(components.input.height).toBe(54);
    expect(components.input.borderRadius).toBe(8);
    expect(components.input.borderWidth).toBe(1.5);
    expect(components.button.height).toBe(52);
    expect(components.button.borderRadius).toBe(8);
    expect(components.stepCircle.size).toBe(30);
  });

  it('has tab bar specs', () => {
    expect(components.tabBar.height).toBe(47);
    expect(components.tabBar.borderRadius).toBe(12);
    expect(components.tabBar.padding).toBe(3);
  });
});

describe('Theme — Shadows', () => {
  it('has card shadow configuration', () => {
    expect(shadows.card.shadowColor).toBeDefined();
    expect(shadows.card.elevation).toBeGreaterThan(0);
  });

  it('has accent glow shadow configuration', () => {
    expect(shadows.accentGlow.shadowColor).toContain('rgba');
    expect(shadows.accentGlow.elevation).toBeGreaterThan(0);
  });

  it('has tab active shadow configuration', () => {
    expect(shadows.tabActive.shadowColor).toBeDefined();
    expect(shadows.tabActive.elevation).toBeGreaterThan(0);
  });
});
