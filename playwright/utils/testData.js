// Shared test data helpers

const validGuest = {
  firstName: 'Jane',
  lastName: 'Tester',
  email: 'jane.tester@example.com',
  phone: '55512345678',
};

async function findAvailableBookingWindow(request, roomId = 2) {
  const response = await request.get(`/api/report/room/${roomId}`);
  if (!response.ok()) {
    throw new Error(`Availability lookup failed with status ${response.status()}`);
  }

  const { report = [] } = await response.json();
  const unavailable = report.map(({ start, end }) => ({ start, end }));
  const today = new Date();
  today.setHours(12, 0, 0, 0);

  for (let daysAhead = 30; daysAhead <= 365; daysAhead += 1) {
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() + daysAhead);
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 2);

    const start = toDateOnly(startDate);
    const end = toDateOnly(endDate);
    const overlaps = unavailable.some(
      (booking) => start < booking.end && end > booking.start
    );

    if (!overlaps) {
      return { start, startDate, end, endDate };
    }
  }

  throw new Error(`No available two-night window found for room ${roomId}`);
}

function toDateOnly(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

const validContact = {
  name: 'Jane Tester',
  email: 'jane.tester@example.com',
  phone: '55512345678',
  subject: 'Booking question',
  description: 'Please confirm whether breakfast is included with the room.',
};

const invalidContactCases = [
  {
    name: 'malformed email',
    data: { ...validContact, email: 'not-an-email' },
    expectedErrors: ['must be a well-formed email address'],
  },
  {
    name: 'values below minimum lengths',
    data: {
      name: 'A',
      email: 'valid@example.com',
      phone: '1',
      subject: 'x',
      description: 'short',
    },
    expectedErrors: [
      'Message must be between 20 and 2000 characters.',
      'Subject must be between 5 and 100 characters.',
      'Phone must be between 11 and 21 characters.',
    ],
  },
];

module.exports = { findAvailableBookingWindow, invalidContactCases, validContact, validGuest };
