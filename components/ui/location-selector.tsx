import React from 'react';
import ReactCountryFlag from 'react-country-flag';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Globe2 } from 'lucide-react';

export const countries = {
  'US': 'United States',
  'CA': 'Canada',
  'UK': 'United Kingdom',
  'AU': 'Australia',
  'IN': 'India',
  'JP': 'Japan',
  'DE': 'Germany',
  'FR': 'France',
  'IT': 'Italy',
  'ES': 'Spain',
} as const;

interface LocationSelectorProps {
  value: keyof typeof countries;
  onValueChange: (value: keyof typeof countries) => void;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onValueChange
}) => {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-[160px] bg-white/10 border-none text-white h-8">
        <SelectValue>
          <div className="flex items-center gap-2">
            <ReactCountryFlag
              countryCode={value}
              svg
              style={{
                width: '16px',
                height: '16px'
              }}
            />
            {countries[value]}
          </div>
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {Object.entries(countries).map(([code, name]) => (
          <SelectItem key={code} value={code}>
            <div className="flex items-center gap-2">
              <ReactCountryFlag
                countryCode={code}
                svg
                style={{
                  width: '16px',
                  height: '16px'
                }}
              />
              {name}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
