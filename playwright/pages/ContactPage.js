class ContactPage {
  constructor(page) {
    this.page = page;
    this.nameInput = page.getByTestId('ContactName');
    this.emailInput = page.getByTestId('ContactEmail');
    this.phoneInput = page.getByTestId('ContactPhone');
    this.subjectInput = page.getByTestId('ContactSubject');
    this.descriptionInput = page.getByTestId('ContactDescription');
    this.submitButton = page.getByRole('button', { name: 'Submit' });
    this.errorAlert = page.locator('.alert-danger');
    this.successMessage = page.getByText('Thanks for getting in touch');
  }

  async navigate() {
    await this.page.goto('/');
    await this.nameInput.scrollIntoViewIfNeeded();
  }

  async fill({ name, email, phone, subject, description }) {
    await this.nameInput.fill(name);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
    await this.subjectInput.fill(subject);
    await this.descriptionInput.fill(description);
  }

  async submit() {
    await this.submitButton.click();
  }
}

module.exports = { ContactPage };
