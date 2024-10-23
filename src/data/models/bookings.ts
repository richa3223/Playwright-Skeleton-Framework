import { z } from 'zod';

//Bokking model for declaring schema and creating types from them

export const BookingDatesSchema = z.object({
  checkin: z.string(),
  checkout: z.string(),
});

//Represents the structured format of booking dates, supporting TypeScript intellisense and type checking.
export type BookingDates = z.infer<typeof BookingDatesSchema>;

//Outlines the core structure of a booking, useful for validating input/output data in API tests.
export const BaseBookingSchema = z.object({
  firstname: z.string().optional(),
  lastname: z.string().optional(),
  totalprice: z.number().optional(),
  depositpaid: z.boolean().optional(),
  bookingdates: BookingDatesSchema.optional(),
  additionalneeds: z.string().optional(),
});

export type BaseBooking = z.infer<typeof BaseBookingSchema>;

export const GetBookingIdsResponseSchema = z.array(
  z.object({
    bookingid: z.number(),
  })
);

export type GetBookingIdsResponse = z.infer<typeof GetBookingIdsResponseSchema>;

export const CreateBookingResponseSchema = z.object({
  bookingid: z.number(),
  booking: BaseBookingSchema,
});

export type CreateBookingResponse = z.infer<typeof CreateBookingResponseSchema>;

export type AuthRequest = {
  username: string;
  password: string;
};
