'use client';
import { Calendar } from '@/components/ui/calendar';
import { useEffect, useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { DateRange } from 'react-day-picker';
import { useProperty } from '@/utils/store';

import {
  generateDisabledDates,
  generateDateRange,
  defaultSelected,
  generateBlockedPeriods,
} from '@/utils/calendar';

function BookingCalendar() {
  const { toast } = useToast();
  const currentDate = new Date();
  
  const bookings = useProperty(state => state.bookings);
  const blockedPeriods = generateBlockedPeriods({
    bookings,
    today: currentDate,
  });
  
  const unavailableDates = generateDisabledDates(blockedPeriods);

  const [range, setRange] = useState<DateRange | undefined>(defaultSelected);

  useEffect(() => {
    const selectedRange = generateDateRange(range);

    const hasBlockedDate = selectedRange.some(date => unavailableDates[date]);

    if (hasBlockedDate) {
      setRange(defaultSelected);
      toast({ description: 'Some dates are booked. Please select again.' });
    }

    useProperty.setState({ range });
  }, [range, toast, unavailableDates]);

  return (
    <Calendar
      mode="range"
      defaultMonth={currentDate}
      selected={range}
      onSelect={setRange}
      className="mb-4"
      disabled={blockedPeriods}
    />
  );
}
export default BookingCalendar;