

export type CalendarDay = {
    date: string;
    dayOfMonth: number;
    status: "open" | "pending" | "reserved" | "blocked";
    rate: number;
    isAvailable: boolean;
    isCheckInAllowed: boolean;
}

export type CalendarMonth = {
    propertyName: string;
    month: string;
    startDate: string;
    endDate: string;
    summary: {
        totalDays: number;
        openDays: number;
        pendingDays: number;
        reservedDays: number;
        blockedDays: number;
        occupancyRatePercent: number;
    };
    days: CalendarDay[]
}

export type CalendarResponse = {
    calendars: CalendarMonth;
    message: string;
}