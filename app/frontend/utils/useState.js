import { useState } from 'react';

export default (initialState, onUpdate) => {
  const [state, setState] = useState(initialState);

  const partialUpdate = (updates, partial = true) => {
    setState((prev) => {
      if (!partial) {
        return updates;
      }
      const newState = {
        ...prev,
        ...updates,
      };
      if (onUpdate) {
        onUpdate(newState);
      }
      return newState;
    });
  };

  return [state, partialUpdate];
};
