const { test, expect } = require('@playwright/test');
const { BookingPage } = require('../pages/BookingPage');
const { HomePage } = require('../pages/HomePage');
const { findAvailableBookingWindow, validGuest } = require('../utils/testData');

// Run serially — the demo site cannot handle parallel booking requests
test.describe.configure({ mode: 'serial' });

test.describe('Booking Flow', () => {

  test('should display the booking calendar for a room', async ({ page }) => {
    const home = new HomePage(page);
    const booking = new BookingPage(page);

    await home.navigate();
    await home.bookRoomByType('Double');

    await expect(booking.calendar).toBeVisible();
  });

  test('should complete a booking - happy path', async ({ page, request, browserName }) => {
    test.skip(
      browserName === 'firefox',
      'Shared demo site returns a browser load-error page after Firefox booking submission.'
    );

    const home = new HomePage(page);
    const booking = new BookingPage(page);

    const bookingWindow = await findAvailableBookingWindow(request);
    test.info().annotations.push({
      type: 'booking-window',
      description: `${bookingWindow.start} to ${bookingWindow.end}`,
    });

    await home.navigate();
    await home.searchAvailability(bookingWindow.startDate, bookingWindow.endDate);
    await expect(home.bookingLinkByType('Double')).toHaveAttribute(
      'href',
      new RegExp(`checkin=${bookingWindow.start}&checkout=${bookingWindow.end}`)
    );
    await home.bookRoomByType('Double');
    await expect(page).toHaveURL(
      new RegExp(`checkin=${bookingWindow.start}&checkout=${bookingWindow.end}`)
    );
    await expect(booking.calendar).toBeVisible();

    // Open the booking form
    await booking.openBookingForm();

    // Fill in guest details
    await booking.fillGuestDetails(validGuest);

    // Submit
    await booking.submitBooking();

    await expect(booking.confirmationHeading).toBeVisible();
  });

  test('should show error for missing required fields', async ({ page, request }) => {
    const home = new HomePage(page);
    const booking = new BookingPage(page);

    const bookingWindow = await findAvailableBookingWindow(request);
    await home.navigate();
    await home.searchAvailability(bookingWindow.startDate, bookingWindow.endDate);
    await expect(home.bookingLinkByType('Double')).toHaveAttribute(
      'href',
      new RegExp(`checkin=${bookingWindow.start}&checkout=${bookingWindow.end}`)
    );
    await home.bookRoomByType('Double');
    await expect(booking.calendar).toBeVisible();

    await booking.openBookingForm();

    // Submit without filling in any fields
    await booking.submitBooking();

    // Validation error container should appear
    await expect(page.locator('.alert.alert-danger')).toBeVisible();

    // Confirmation should NOT appear
    await expect(booking.confirmationHeading).not.toBeVisible();
  });

});
