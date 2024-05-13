import { useState, useCallback } from 'react';

export default function useEventDataValue(defaultValue) {
  const [state, setState] = useState(defaultValue);

  return [state, useCallback(handleValueEvent, []), setState];

  //

  function handleValueEvent(e, data) {
    setState(data.value);
  }
}
