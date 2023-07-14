import { h } from 'preact';

import faqs from './faqs.json';
import '../style.css';

const Header = () => {
  return (
    <div className="header pb-20 bg-gradient-to-b from-orange-400 via-red-500 to-pink-500">
      <div className="header-nav py-2 flex flex-row text-gray-200">
        <div className="flex">
          <div>Icon</div>
          <div className="text-2xl font-extrabold">Alpine</div>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center">
          <button className="mr-3 px-3 py-1 text-sm font-bold outline-none focus:outline-none">
            Sign in
          </button>
        </div>
        <div className="flex items-center">
          <button className="mr-3 px-3 py-1 text-sm font-bold rounded bg-green-600 outline-none focus:outline-none">
            Try beta
          </button>
        </div>
      </div>
      <div className="header-content pt-20 text-gray-200">
        <div className="text-5xl font-bold text-center">
          Cloud reader for your newsletters
        </div>
        <div className="text-lg font-bold text-center pt-8">
          Inbox is messy and unsuited to read your newsletters
        </div>
        <div className="text-sm font-normal text-center pt-4 w-3/6 m-auto">
          Alpine reader enables you to highlight and take notes while reading
          your newsletters so that you can get the best out of newsletters
        </div>
        <div className="pt-5 text-base text-center">
          <button className="px-4 py-1 font-bold rounded bg-green-600 outline-none focus:outline-none">
            Try Alpine for free
          </button>
        </div>
      </div>
    </div>
  );
};

const FeatureHighlight = () => {
  const FeatureColumn = (props) => {
    return (
      <div className="px-5 max-w-15 flex flex-col text-gray-800 text-center">
        <div className={`w-2 h-2 mx-auto rounded-full ${props.color}`}></div>
        <div className="mt-5 text-lg font-bold">{props.title}</div>
        <div className="mt-3 text-sm leading-7 font-normal">
          {props.description}
        </div>
      </div>
    );
  };

  const Divider = () => {
    return <div className="h-auto border-l border-gray-300"></div>;
  };

  return (
    <div className="py-10 mt-20">
      <div className="max-w-screen-lg mx-auto flex flex-row flex-wrap justify-center">
        <FeatureColumn
          color="bg-red-500"
          title={'Highlight'}
          description={
            'Highlight the important bits while reading your newsletters.'
          }
        />
        <Divider />
        <FeatureColumn
          color="bg-green-500"
          title={'Annotate'}
          description={'Take notes for future reference.'}
        />
        <Divider />
        <FeatureColumn
          color="bg-yellow-500"
          title={'Organize'}
          description={
            'Aggregate all your newsletters into Alpine instead of scrambling to find them in your Inbox.'
          }
        />
      </div>
    </div>
  );
};

const FrequentlyAskedQuestions = () => {
  return (
    <div className="faq py-10 mt-10 mb-10 flex flex-row flex-wrap justify-around">
      <div className="faq-content max-w-screen-lg mx-auto">
        <div className="mb-8 text-4xl font-bold text-gray-800 text-center">
          Frequently Asked Questions
        </div>
        <div className="space-y-4">
          {faqs.map((faq) => {
            return (
              <div className="">
                <div className="text-sm font-bold leading-8 text-gray-800">
                  {faq.title}
                </div>
                <div className="text-xs font-light leading-6 text-gray-700">
                  {faq.description}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      {/* <div className="py-5 px-5 max-w-15 flex flex-col text-gray-800 text-center">
        <div className="w-2 h-2 mx-auto bg-red-800 rounded-full"></div>
        <div className="mt-8 text-lg font-bold">Highlight</div>
        <div className="mt-5 text-sm font-normal">Highlight the important bits while reading your newsletters.</div>
      </div> */}
    </div>
  );
};

const Footer = () => {
  return (
    <div className="footer px-5 py-5 bg-gray-800">
      <div className="footer-content max-w-screen-lg mx-auto text-gray-200">
        <div className="py-8 text-xs font-light space-y-3">
          <a className="cursor-pointer transition-all duration-300 hover:ml-2">
            Features
          </a>
          <div className="cursor-pointer transition-all duration-300 hover:ml-2">
            F.A.Q
          </div>
          <div className="cursor-pointer transition-all duration-300 hover:ml-2">
            Google API Services usage disclosure
          </div>
        </div>
        <div className="flex justify-between text-tiny font-light">
          <div className="">© 2020 Alpine. All rights reserved</div>
          <div className="flex">
            <div className="mr-6">Privacy Policy</div>
            <div>Terms & Conditions</div>
          </div>
          <div className="">Twitter</div>
        </div>
      </div>
    </div>
  );
};

const Homepage = () => {
  return (
    <div>
      <Header />
      <FeatureHighlight />
      <FrequentlyAskedQuestions />
      <Footer />
    </div>
  );
};

export default Homepage;
