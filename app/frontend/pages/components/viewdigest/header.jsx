import React from 'react';
import PropTypes from 'prop-types';
// import classnames from 'classnames';
// import HeartIcon from 'heroicons/outline/heart.svg';
// import CheckIcon from 'heroicons/outline/check.svg';
// import Popover from 'ui/Popover';
import { css } from '@emotion/react';

/* eslint-disable-next-line react/prop-types, no-unused-vars */
// const ColorPalette = ({ className, onClick }) => (
//   <div
//     className={classnames('flex-1 w-6 h-4 cursor-pointer', className)}
//     onClick={onClick}
//   ></div>
// );

// /* eslint-disable-next-line react/prop-types */
// const FontSize = ({ label, onClick }) => (
//   <div className="flex-1 leading-6 cursor-pointer" onClick={onClick}>
//     {label}
//   </div>
// );

// /* eslint-disable-next-line react/prop-types */
// const FontPicker = ({ name, selectedFont, selectFont }) => (
//   <div
//     className="w-full py-1 px-2 cursor-pointer"
//     onClick={() => selectFont(name)}
//   >
//     {selectedFont === name && (
//       <CheckIcon widht="20" height="20" className="inline mr-2" />
//     )}
//     {name}
//   </div>
// );

// const PopoverContent = ({ selectedFont, ...props }) => {
//   const selectFont = (name) => props.updateReaderConfig({ selectedFont: name });
//   return (
//     <div
//       className="space-y-2 flex flex-col text-gray-700 divide-y divide-gray-400"
//       css={css(`width: 200px;`)}
//     >
//       <div
//         className="w-full py-1 px-2 text-sm rounded border border-gray-400 cursor-pointer"
//         onClick={() => selectFont(null)}
//       >
//         {!selectedFont && (
//           <CheckIcon widht="20" height="20" className="inline mr-2" />
//         )}
//         Original Style
//       </div>
//       <div className="space-y-2 pt-2 flex flex-col text-gray-700">
//         {/* <div className="flex space-x-1">
//             <ColorPalette className="border border-gray-400" />
//             <ColorPalette className="bg-gray-700" />
//             <ColorPalette className="bg-black" />
//             <ColorPalette className="bg-orange-800" />
//           </div> */}
//         <div className="flex text-sm rounded-md border border-gray-400 divide-x divide-gray-400">
//           <FontSize
//             label="-><-"
//             onClick={() =>
//               props.updateReaderConfig({ readerWidth: readerWidth - 50 })
//             }
//           />
//           <FontSize
//             label="<-->"
//             onClick={() =>
//               props.updateReaderConfig({ readerWidth: readerWidth + 50 })
//             }
//           />
//         </div>
//         <div className="flex text-sm rounded-md border border-gray-400 divide-x divide-gray-400">
//           <FontSize
//             label="-A"
//             onClick={() => props.updateReaderConfig({ fontSize: fontSize - 1 })}
//           />
//           <FontSize
//             label="A+"
//             onClick={() => props.updateReaderConfig({ fontSize: fontSize + 1 })}
//           />
//         </div>
//         <div className="flex flex-col text-sm font-semibold rounded border border-gray-400 divide-y divide-gray-400">
//           <FontPicker
//             name="monospace"
//             selectedFont={selectedFont}
//             selectFont={selectFont}
//           />
//           <FontPicker
//             name="Tisa"
//             selectedFont={selectedFont}
//             selectFont={selectFont}
//           />
//           <FontPicker
//             name="Helvertica"
//             selectedFont={selectedFont}
//             selectFont={selectFont}
//           />
//           <FontPicker
//             name="Georgia"
//             selectedFont={selectedFont}
//             selectFont={selectFont}
//           />
//         </div>
//       </div>
//     </div>
//   );
// };
// PopoverContent.propTypes = {
//   selectedFont: PropTypes.string,
// };

const ArticleHeader = ({
  title,
  publisherName,
  // readerConfig,
  // updateReaderConfig,
  // digestConfig,
  // updateDigestConfig,
}) => {
  // const { fontSize, readerWidth = 600 } = readerConfig;
  // const { liked } = digestConfig || {};

  return (
    <div
      className="sticky top-0 py-2 bg-white border-b border-gray-400"
      css={css(`z-index: 9999999;`)}
    >
      <div className="flex" css={css(`max-width: 800px; margin: auto;`)}>
        <div className="flex-1 text-md truncate space-x-2">
          <div className="inline text-gray-600">{publisherName}</div>
          <div className="inline text-gray-600">-</div>
          <div className="inline font-semibold text-gray-800">{title}</div>
        </div>
        {/* <div className="pl-6 flex space-x-2 select-none text-gray-500">
            <Popover
              anchor={<div className="font-semibold">Aa</div>}
              content={
                <PopoverContent selectedFont={readerConfig.selectedFont} />
              }
            />
            <div className="flex items-center">
              <HeartIcon
                width="16"
                height="16"
                className={classnames('cursor-pointer', {
                  'text-red-500': liked,
                })}
                fill={liked ? 'currentColor' : 'transparent'}
                onClick={() => updateDigestConfig({ liked: !liked })}
              />
            </div>
          </div> */}
      </div>
    </div>
  );
};
ArticleHeader.propTypes = {
  title: PropTypes.string,
  publisherName: PropTypes.string,
  readerConfig: PropTypes.object,
  updateReaderConfig: PropTypes.func,
  digestConfig: PropTypes.object,
  updateDigestConfig: PropTypes.func,
};

export default ArticleHeader;
