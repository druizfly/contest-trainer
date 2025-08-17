# Playwright Testing Guidelines for Claude AI

This document provides comprehensive guidelines for creating Playwright tests , following official Playwright best practices and the platform's established patterns.

## Testing Philosophy

### Core Principles
- **Test User-Visible Behavior**: Tests should verify functionality from the end user's perspective, avoiding implementation details
- **Test Isolation**: Each test must be completely isolated with its own state and data
- **Test What You Control**: Only test application functionality, not external dependencies or third-party services
- **Web-First Assertions**: Use Playwright's auto-waiting assertions for reliable tests

## Project Structure

### Test File Organization
```
integration/
├── tests/                         # Test specifications
│   └── *.spec.ts                  # Individual test files
├── pageObjects/                   # Page Object Models
├── fixtures/                      # Test data and fixtures
├── services/                      # API service helpers
├── utils/                         # Testing utilities
└── *.config.ts                   # Configuration files
```

### Naming Conventions
```typescript
// Regular tests.
// Keep the name concise, do not use more than 3 words
bankTransfer.spec.ts
editPaymentDetails.spec.ts
documentCollector.spec.ts

// Avoid - using Page in test file name.
bankTransfer.spec.ts
editPaymentDetails.spec.ts
documentCollector.spec.ts

// Test descriptions: descriptive and user-focused decribing the goal of the action
test('Creates a card payment', async ({ page }) => {
  // Test implementation
});

test('Makes a bank transfer', async ({ page }) => {
  // Test implementation
});
```

## Test Patterns

### Test Structure Pattern 
```typescript
import data from '../fixtures/feature_data.json';
import { PageObject } from '../pageObjects/PageObject';
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  // Setup hooks
  test.beforeEach(async ({ request }) => {
    // Common setup (e.g., configure services, add configuration)
  });

  test('Test description', async ({ page }) => {
    // Use test.step for clear test steps user-focused
    await test.step('load first page', async () => {
      await page.goto('/path');
      // Page object instantiation
      const pageObject1 = new PageObject1(page);
      //isLoaded() to check if page has been loaded
      await pageObject1.isLoaded();
      await pageObject1.next();
    });

    await test.step('perform action', async () => {
      const pageObject2 = new PageObject2(page);
      await pageObject2.isLoaded();
      await pageObject2.fillForm(data);
      await pageObject2.next();
    });

    await test.step('verify result', async () => {
      const pageObject3 = new PageObject3(page);
      await pageObject3.isLoaded();
      await pageObject3.assertResult();
    });
  });

  test.afterEach(async ({ request }) => {
    // Common teardown (e.g., clear cards, clean wallet tokens)
  });
});
```

### Page Object Pattern 
```typescript
// Only import methods you will use in the test
import { Page } from '@playwright/test';

// Page objects example. By default do not inherit from any existing Page Object
const pageObject = new PaymentInformationPage(page);

// Page objects have isLoaded() methods to check that the page is properly loaded
await pageObject.isLoaded();

// Methods use descriptive names matching user actions
await paymentInformationPage.fillAmountToPay(data.amount);
await paymentInformationPage.fillCountryFrom(data.country, data.country_code);
await paymentInformationPage.next();

// Assertion methods start with 'assert' or 'to'
await trackingPage.assertPaymentStatusIs('Payment pending');
await confirmationPage.toHaveInstallmentsSize(installments);
```

### Data Management Pattern
```typescript
// Import fixtures at the top
import bankTransferData from '../fixtures/bank_transfer_from_us_data.json';
import payerData from '../fixtures/payer_data.json';
import urlParamsStudent from '../fixtures/url_params_student_data.json';

// Use utility functions for URL construction if needed
const url = toEnvironmentURL(urlParamsStudent);
await page.goto(url);

// Pass data objects to page object methods
await payerInformationPage.fillPayerInformation(payerData);
```

### Error Handling Pattern
```typescript
// Has errors displayed in the screen
await test.step('fails when filling invalid payment information', async () => {
  await payerInformationPage.fillPayerInformation(invalidPayerData);
  await payerInformationPage.hasErrors();
});

// Focus validation
await test.step('focuses on first element with error', async () => {
  await payerInformationPage.hasFocusOnFirstError();
});
```

### Timeout Management

```typescript
test.describe('Feature', () => {
    test.slow(); // Mark as slow (3x timeout) if page takes too long to load. Use as last resource

    test('slow test', async ({ page }) => {
        // Test Implementation
    });
});
```

### Feature Flag Manipulation

Example of feature flag intercept assuming that an endpoint exists that serves them to the frontend
```typescript

// utils/featureFlags.ts
export async function enableFeatureFlag(
  page: Page,
  flagOrFlags: string | string[],
) {
  if (Array.isArray(flagOrFlags)) {
    await setFeatureFlags(
      page,
      Object.fromEntries(flagOrFlags.map(flag => [flag, true])),
    );
  } else {
    await setFeatureFlags(page, { [flagOrFlags]: true });
  }
}

export async function setFeatureFlags(
  page: Page,
  flags: Record<string, boolean>,
) {
  await page.route(/.*\/feature_flags.*/, async route => {
    const response = await route.fetch();
    const parsedResponse = await response.json();

    Object.entries(flags).forEach(([flag, value]) => {
      parsedResponse[flag] = value;
    });

    await route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify(parsedResponse),
      status: 200,
    });
  });
}

//Test File
  import {
    disableFeatureFlag,
    enableFeatureFlag,
  } from '../utils/featureFlags';

   test('Enable Feature Flag', async ({page}) => {
    await enableFeatureFlag(page, ['PAYEX-FF']);
```

## Locator Best Practices

### Current Locator Strategy (Based on Existing Code)
```typescript
// 1. Data test id selectors. MUST TRY TO USE THIS ONE IF AVAILABLE
page.getByTestId('pageTitle')
page.getByTestId('directions')

// 2. Role selectors
page.getByRole('button', { name: 'Sign in' })
page.getByRole('checkbox', { name: 'Subscribe' })

// 3. Text-based selectors
await expect(page.locator('#Page-title')).toHaveText('Your payment');

// 4. Css selector for complex cases when previous do not apply. Last resource
page.locator('.Modal-dialog[data-headlessui-state="open"]')
page.locator('.Box-content')
```

## Assertions

### Web-First Assertions (Recommended)
```typescript
// Recommended - auto-waiting assertions
await expect(page.getByText('Payment Successful')).toBeVisible();
await expect(page.getByRole('button', { name: 'Submit' })).toBeEnabled();
await expect(page.getByTestId('amount-input')).toHaveValue('100.00');

// Avoid - non-waiting assertions
expect(await page.getByText('Payment Successful').isVisible()).toBe(true);
```

### Common Assertions 
```typescript
// Visibility checks
await expect(page.getByText('Payment Form')).toBeVisible();
await expect(page.getByTestId('error-message')).toBeHidden();

// Input validation
await expect(page.getByLabel('Amount')).toHaveValue('100.00');
await expect(page.getByRole('textbox', { name: 'Email' })).toBeEmpty();

// Status checks
await expect(page.getByTestId('payment-status')).toHaveText('Completed');
await expect(page.getByRole('button', { name: 'Submit' })).toBeDisabled();

// URL assertions
await expect(page).toHaveURL(/.*\/payment\/success/);
```

## Page Object Model Pattern (Current Project Style)

### Page Class Structure 
```typescript
// pageObjects/PaymentInformationPage.ts
export class PaymentInformationPage {

  // Standard isLoaded() method for all page objects
  async isLoaded(URL): Promise<void> {
    await this.page.waitForURL(URL);
    await this.page.waitForLoadState('load');
    await this.page.waitForLoadState('domcontentloaded');

    // Assert object in the page after loaded is complete
    await expect(this.page.getByTestId('title')).toBeVisible();
  }

  // Fill methods use descriptive naming
  async fillAmountToPay(amount: string): Promise<void> {
    await this.page.getByTestId('amountField').fill(amount);
  }

  // Navigation methods
  async next(): Promise<void> {
    await this.page.getByTestId('next').click('[data-testid="next-button"]');
  }

  // Assertion methods use 'assert' or 'to' prefix
  async assertPaymentStatusIs(status: string): Promise<void> {
    await expect(this.page.getByTestId('paymentStatus')).toHaveText(status);
  }

  async toHaveRecurringDisclaimer(): Promise<void> {
    await expect(this.page.getByTestId('recurringDisclaimer')).toBeVisible();
  }

  // Validation methods
  async hasErrors(): Promise<void> {
    await expect(this.page.getByTestId('errorMessage')).toBeVisible();
  }

  async hasFocusOnFirstError(): Promise<void> {
    // Focus validation logic
  }
}
```

### Using Page Objects in Tests 
```typescript
import { PaymentInformationPage } from '../pageObjects/PaymentInformationPage';
import bankTransferData from '../fixtures/bank_transfer_data.json';

test('Makes a bank transfer', async ({ page }) => {
  await test.step('fill payment information', async () => {
    const paymentInformationPage = new PaymentInformationPage(page);
    
    await paymentInformationPage.isLoaded();
    await paymentInformationPage.fillAmountToPay(bankTransferData.amount);
    await paymentInformationPage.fillCountryFrom(
      bankTransferData.country,
      bankTransferData.country_code
    );
    await paymentInformationPage.next();
  });
});
```

## Data Management using fixtures

```typescript
// fixtures/testData.js
export const testPayments = {
  declinedPayment: {
    amount: '200.00',
    currency: 'USD',
    email: 'declined@example.com',
    cardNumber: '4000000000000002'
  }
};

// Use in tests
import { testPayments } from '../fixtures/testData';

test('should handle declined card', async ({ page }) => {
  const paymentPage = new PaymentPage(page);
  const { amount, email, cardNumber } = testPayments.declinedPayment;
  
  await paymentPage.fillPaymentForm(amount, email);
  await paymentPage.fillCardNumber(cardNumber);
});
```

## Performance and Optimization

### Efficient Waiting Strategies
```typescript
//  Good - specific waiting
await expect(page.getByText('Loading...')).toBeHidden();
await expect(page.getByText('Payment Form')).toBeVisible();

// L Avoid - arbitrary timeouts
await page.waitForTimeout(3000);
```

## Test Configuration Example
```typescript
// playwright.config.js
module.exports = {
  testDir: './integration/tests',
  retries: 2,
  
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    }
  ],
  
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5300',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  }
};
```

## Common Mistakes to Avoid

### Anti-Patterns
```typescript
// Don't use implementation details
page.locator('.payment-form__submit-button'); // Fragile CSS class

// Don't use non-waiting assertions
expect(await page.getByText('Success').isVisible()).toBe(true);

// Don't use arbitrary waits
await page.waitForTimeout(5000);

// Don't use regex for long text assertion when only part of the information is important
expect(await page.getByText('Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry').isVisible())
```

##  Best Practices

###  Code Best Practices
```typescript

// Use data-test id locators
page.getByTestId('button', { name: 'Submit Payment' });

// Use web-first assertions
await expect(page.getByTestId('Success')).toBeVisible();

// Wait for specific conditions
await expect(page.getByText('Loading...')).toBeHidden();

// Mock external dependencies if specific result is needed
await page.route('**/google-pay/**', route => route.fulfill({ body: 'mocked' }));

// Use regex for long text assertion when only part of the information is relevant
expect(await page.getByText(/Lorem Ipsum/).isVisible())
```

### Page Object Best Practices

- **Only what is needed**: Only create required methods to be used in the test
- **Reuse method**: If there is already a method that accomplish what is desired, reuse it in the test
- **Imports**: Only import what's needed in the Page Object. Remove not used imports.


### Test File Best Practices
- **Imports**: Only import what's needed in the Page Object. Remove not used imports.
