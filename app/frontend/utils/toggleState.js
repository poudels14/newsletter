import { useState } from 'react';

// toggle state to true or false
export default (initialState) => {
  const [state, setState] = useState(initialState);

  const toggleState = () => {
    setState(!state);
  };

  return [state, toggleState];
};
