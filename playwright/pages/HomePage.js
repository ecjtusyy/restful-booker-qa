// Page Object: Home / Room Listing Page
// https://automationintesting.online

class HomePage {
  constructor(page) {
    this.page = page;
    this.roomCards = page.locator('.room-card');
    this.checkInInput = page
      .locator('label')
      .filter({ hasText: /^Check In$/ })
      .locator('..')
      .locator('input');
    this.checkOutInput = page
      .locator('label')
      .filter({ hasText: /^Check Out$/ })
      .locator('..')
      .locator('input');
    this.checkAvailabilityButton = page.getByRole('button', { name: 'Check Availability' });
  }

  async navigate() {
    await this.page.goto('/');
    await this.roomCards.first().waitFor({ state: 'visible' });
  }

  async bookRoomByType(type) {
    await this.bookingLinkByType(type).click();
  }

  bookingLinkByType(type) {
    const roomCard = this.roomCards.filter({
      has: this.page.getByRole('heading', { name: type, exact: true }),
    });
    return roomCard.getByRole('link', { name: 'Book now' });
  }

  async searchAvailability(startDate, endDate) {
    await this.checkInInput.fill(this.formatDisplayDate(startDate));
    await this.checkInInput.press('Tab');
    await this.checkOutInput.fill(this.formatDisplayDate(endDate));
    await this.checkOutInput.press('Tab');
    await this.checkAvailabilityButton.click();
    await this.roomCards.first().waitFor({ state: 'visible' });
  }

  formatDisplayDate(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${day}/${month}/${date.getFullYear()}`;
  }
}

module.exports = { HomePage };
