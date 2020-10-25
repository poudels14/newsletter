const Actions = {
  SET_DEVICE_TYPE: '/device/type',
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case Actions.SET_DEVICE_TYPE: {
      return {
        ...state,
        type: action.device,
      };
    }
    default:
      return state;
  }
};

export { Actions, reducer };
