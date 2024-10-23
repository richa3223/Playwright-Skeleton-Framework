import type { BaseBooking } from '@data/models/bookings';
import { ar, el, en, Faker, faker, ja, ru } from '@faker-js/faker';

/* The use of the builder pattern for data allows for tests to quickly create flexible data.
i.e: creating a booking with a late checkout. Rather than needing to create a new Booking json object with unnecessary values, you can do:
`const bookingWithLateCheckout = new BookingBuilder().setAdditionalNeed('Late checkout').build(); */

// This approach improves code readability and reusability, especially in tests where multiple booking configurations are required.
export class BookingBuilder implements BaseBooking {
  // Default values use faker to generate booking data, reducing boilerplate in tests.
  firstname: string;
  lastname: string;
  totalprice: number = faker.number.int({ min: 100, max: 1000 });
  depositpaid: boolean = faker.datatype.boolean();
  bookingdates: { checkin: string; checkout: string };
  additionalneeds: string = faker.helpers.arrayElement([
    'Breakfast',
    'Late checkout',
    'Extra pillow',
  ]);

  constructor() {
    // Initialise faker in a random locale to enable testing names in different languages
    const locales = [en, ar, ja, ru, el];
    const randomLocale = locales[Math.floor(Math.random() * locales.length)];
    const customLocaleFaker = new Faker({ locale: randomLocale });

    // Initialise names in random language
    this.firstname = customLocaleFaker.person.firstName();
    this.lastname = customLocaleFaker.person.lastName();

    const checkinDate = faker.date.future({ years: 0.1 });
    const checkoutDate = faker.date.future({ years: 0.1, refDate: checkinDate });
    this.bookingdates = {
      checkin: checkinDate.toISOString().split('T')[0],
      checkout: checkoutDate.toISOString().split('T')[0],
    };
  }

  // Each setter method allows for customizing the booking details, supporting tests with specific data requirements.
  setFirstName(firstName: string) {
    this.firstname = firstName;
    return this;
  }

  setLastName(lastName: string) {
    this.lastname = lastName;
    return this;
  }

  setTotalPrice(totalPrice: number) {
    this.totalprice = totalPrice;
    return this;
  }

  setDepositPaid(depositPaid: boolean) {
    this.depositpaid = depositPaid;
    return this;
  }

  setBookingDates(checkin: string, checkout: string) {
    this.bookingdates = { checkin, checkout };
    return this;
  }

  setCheckInDate(checkin: string) {
    this.bookingdates.checkin = checkin;
    return this;
  }

  setCheckoutDate(checkout: string) {
    this.bookingdates.checkout = checkout;
    return this;
  }

  setAdditionalNeed(additionalNeed: string) {
    this.additionalneeds = additionalNeed;
    return this;
  }

  // Finalizes and returns the booking object, ready for use in tests or wherever needed.
  build(): BaseBooking {
    return this;
  }
}
