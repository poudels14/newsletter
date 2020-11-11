import { h } from 'preact';

import '../style.css';

import Form from './form'

const Button = (props) => {
  return (
    <button
      type='button'
      onClick={() => alert("WHAT's UP YO?")}
    >
      {props.value}
    </button>
  )
}

const Homepage = () => {
  return (
    <div
      // css={css(`background: green;`)}
      className="font-bold text-red-800">
        Hello
        <Button value="This is a button" />
        <Form />
    </div>
  )
}

console.log("HOMEPAGE imported");
export default Homepage;