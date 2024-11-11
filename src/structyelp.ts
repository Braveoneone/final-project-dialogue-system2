// Restaurant Interface
interface Business {
    name: string;
    rating: number;
    review_count: number;
    location: Location;
    categories: { title: string }[];
    imageUrl: string;
    isClosed: boolean;
    url: string;
    reviewCount: number;
    phone: string;
    displayPhone: string;
    distance: number;
    businessHours: BusinessHour[];
    attributes: Attributes;
  }

// Restaurant Category Interface
interface Category {
  alias: string;
  title: string;
}

// Restaurant Coordinates Interface
interface Coordinates {
  latitude: number;
  longitude: number;
}

// Restaurant Location Interface
interface Location {
  address1: string;
  address2: string | null;
  address3: string | null;
  city: string;
  zipCode: string;
  country: string;
  state: string;
  displayAddress: string[];
}

// Restaurant BusinessHour Interface
interface BusinessHour {
  open: OpenHour[];
  hoursType: string;
  isOpenNow: boolean;
}

// Restaurant OpenHour Interface
interface OpenHour {
  isOvernight: boolean;
  start: string;
  end: string;
  day: number;
}

// Others
interface Attributes {
  businessTempClosed: boolean | null;
  menuUrl: string | null;
  open24Hours: boolean | null;
  waitlistReservation: boolean | null;
}

// Yelp json
interface YelpResponse {
  businesses: Business[];
  total: number;
  region: Region;
}

// Center of Region
interface Region {
  center: Coordinates;
}
