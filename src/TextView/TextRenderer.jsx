import React from "react";
import PropTypes from "prop-types";

const propTypes = {};

const TextRenderer = React.forwardRef((props, ref) => {
  let {
    words,
    height,
    width,
    wordProps,
    onWordClick,
    onWordSelected,
    scalingFactor,
    onWordFocus
  } = props;
  return (
    <svg ref={ref} width={width} height={height}>
      {words.map((word, wordIndex) => {
        return (
          <text
            tabIndex={0}
            style={{
              outlineColor: "red",
            }}
            key={`word_${wordIndex}`}
            x={word.boundingBox.topLeft.x * scalingFactor}
            y={word.boundingBox.bottomRight.y * scalingFactor}
            width={
              Math.abs(
                word.boundingBox.topLeft.x - word.boundingBox.bottomRight.x
              ) * scalingFactor
            }
            height={
              Math.abs(
                word.boundingBox.topLeft.y - word.boundingBox.bottomRight.y
              ) * scalingFactor
            }
            {...wordProps}
            onFocus={e => onWordFocus(e, word, wordIndex)}
            onClick={e => onWordClick(e, word, wordIndex)}
            onDoubleClick={e => onWordSelected(e, word, wordIndex)}
            onKeyPress={e =>
              e.which === 13 ? onWordSelected(e, word, wordIndex) : undefined
            }
          >
            {word.text}
          </text>
        );
      })}
    </svg>
  );
});

TextRenderer.propTypes = propTypes;

export default TextRenderer;
