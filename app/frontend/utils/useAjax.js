import { useState } from 'react';
import axios from 'axios';

const initialState = {
  started: false,
  success: null,
  response: null,
  inProgress: false,
};

export default (config, onUpdate) => {
  const [state, setState] = useState({ ...initialState });

  const partialUpdate = (updates) => {
    setState((prev) => {
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

  return {
    ...state,
    post: ({ url, body }) => {
      setState({ ...initialState, started: true, inProgress: true });
      axios
        .post(url, body)
        .then((response) => {
          if (config.onSuccess) {
            config.onSuccess();
          }
          partialUpdate({
            success: true,
            inProgress: false,
            response,
          });
        })
        .catch((error) => {
          if (config.onError) {
            config.onError(error);
          }
          partialUpdate({
            success: false,
            error,
            inProgress: false,
          });
        });
    },
  };
};
