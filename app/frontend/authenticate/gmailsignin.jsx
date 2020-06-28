const Signin = (props) => {
  gapi.load('client:auth2', () => {
    initAuthrization();
  });

  return <div>Authenticate with Gmail API</div>;
};

export { Signin };
