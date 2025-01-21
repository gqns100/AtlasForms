import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface CurrencySelectorProps {
  value: string;
  onChange: (currency: string) => void;
}

const SUPPORTED_CURRENCIES = [
  "USD",
  "CNY",
  "HKD",
  "SGD",
  "BTC"
];

export const CurrencySelector: React.FC<CurrencySelectorProps> = ({
  value,
  onChange
}) => {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-32">
        <SelectValue placeholder="Select currency" />
      </SelectTrigger>
      <SelectContent>
        {SUPPORTED_CURRENCIES.map((currency) => (
          <SelectItem key={currency} value={currency}>
            {currency}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
