import { test, expect } from '@playwright/test';

test.describe('Authentication & Session E2E Flows', () => {
  const timestamp = Date.now();
  const testUser = {
    email: `e2e_gamer_${timestamp}@evoq.gg`,
    username: `e2e_${timestamp.toString().slice(-6)}`,
    password: 'Password@12345!',
  };

  test('1. Accessing protected dashboard without authentication redirects to login', async ({
    page,
  }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.locator('h2')).toContainText('Welcome Back');
  });

  test('2. User registration flow with validation and success notice', async ({
    page,
  }) => {
    await page.goto('/register');
    await expect(page.locator('h2')).toContainText('Create Account');

    // Fill form
    await page.fill('#email', testUser.email);
    await page.fill('#username', testUser.username);
    await page.fill('#password', testUser.password);

    await page.click('button[type="submit"]');

    // Verification screen
    await expect(page.locator('h2')).toContainText('Account Created!');
    await expect(page.locator('.auth-card')).toContainText(testUser.email);
  });

  test('3. Login, Session Persistence across Refresh, and Logout', async ({
    page,
  }) => {
    // Navigate to Login
    await page.goto('/login');
    await expect(page.locator('h2')).toContainText('Welcome Back');

    // Attempt login with valid credentials
    await page.fill('#email', testUser.email);
    await page.fill('#password', testUser.password);
    await page.click('button[type="submit"]');

    // Should land on Dashboard
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Platform Dashboard');
    await expect(page.locator('.navbar')).toContainText(testUser.username);
    await expect(page.locator('.dashboard-card')).toContainText(testUser.email);

    // Refresh page while authenticated
    await page.reload();

    // Session should persist
    await expect(page).toHaveURL(/.*\/dashboard/);
    await expect(page.locator('h1')).toContainText('Platform Dashboard');
    await expect(page.locator('.navbar')).toContainText(testUser.username);

    // Logout
    await page.click('button:has-text("Sign Out")');

    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);

    // Attempting to visit /dashboard now redirects back to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/.*\/login/);
  });
});

