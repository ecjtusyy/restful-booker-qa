const { test, expect } = require('@playwright/test');
const { ContactPage } = require('../pages/ContactPage');
const { invalidContactCases, validContact } = require('../utils/testData');

test.describe('Contact Form', () => {

  test('should submit contact form successfully', async ({ page }) => {
    const contact = new ContactPage(page);

    await contact.navigate();
    await contact.fill(validContact);
    await contact.submit();

    await expect(contact.successMessage).toBeVisible();
  });

  for (const testCase of invalidContactCases) {
    test(`should reject ${testCase.name}`, async ({ page }) => {
      const contact = new ContactPage(page);

      await contact.navigate();
      await contact.fill(testCase.data);
      await contact.submit();

      await expect(contact.errorAlert).toBeVisible();
      for (const message of testCase.expectedErrors) {
        await expect(contact.errorAlert).toContainText(message);
      }

      await expect(contact.successMessage).not.toBeVisible();
    });
  }

});
