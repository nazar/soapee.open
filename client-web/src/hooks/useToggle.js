import { useState, useCallback } from 'react';

export default function useToggle(initialValue) {
  const [value, setValue] = useState(initialValue);

  return [value, useCallback(toggleValue, []), setValue];

  function toggleValue() {
    setValue(prev => !(prev));
  }
}
