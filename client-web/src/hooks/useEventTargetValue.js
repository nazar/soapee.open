import { useState } from 'react';

export default function useEventTargetValue(defaultValue) {
  const [state, setState] = useState(defaultValue);

  return [state, handleValueEvent, setState];

  //

  function handleValueEvent(e) {
    setState(e.target.value);
  }
}
