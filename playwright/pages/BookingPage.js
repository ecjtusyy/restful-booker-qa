// Page Object: Booking Form
// https://automationintesting.online

class BookingPage {
  constructor(page) {
    this.page = page;

    // Calendar
    this.calendar = page.locator('.rbc-calendar');

    // Reserve Now button (also submits the form)
    this.reserveNowButton = page.getByRole('button', { name: 'Reserve Now' });

    // Form fields (appear above calendar after clicking Reserve Now)
    this.firstNameInput = page.getByRole('textbox', { name: 'Firstname' });
    this.lastNameInput = page.getByRole('textbox', { name: 'Lastname' });
    this.emailInput = page.getByRole('textbox', { name: 'Email' });
    this.phoneInput = page.getByRole('textbox', { name: 'Phone' });

    // Confirmation
    this.confirmationHeading = page.getByRole('heading', { name: 'Booking Confirmed' });
    this.returnHomeLink = page.getByRole('link', { name: 'Return home' });
  }

  async openBookingForm() {
    await this.reserveNowButton.click();
    await this.firstNameInput.waitFor({ state: 'visible', timeout: 10000 });
    await this.firstNameInput.scrollIntoViewIfNeeded();
  }

  async fillGuestDetails({ firstName, lastName, email, phone }) {
    await this.firstNameInput.fill(firstName);
    await this.lastNameInput.fill(lastName);
    await this.emailInput.fill(email);
    await this.phoneInput.fill(phone);
  }

  async submitBooking() {
    await this.reserveNowButton.scrollIntoViewIfNeeded();
    await this.reserveNowButton.click();
  }

  async returnHome() {
    await this.returnHomeLink.click();
  }
}

module.exports = { BookingPage };
