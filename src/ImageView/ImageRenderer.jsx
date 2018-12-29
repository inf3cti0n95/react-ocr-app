import React from "react";
import PropTypes from "prop-types";

const propTypes = {};

function ImageRenderer(props) {
  let { highlightRectProps, highlight } = props;
  return (
    <svg
      width={props.width}
      height={props.height}
      style={{
        background: "rgba(0, 0, 0, 0.7)"
      }}
      onClick={props.onImageClick}
      onDoubleClick={props.onImageDoubleClick}

    >
      <image
        xlinkHref={props.image}
        height={props.height}
        width={props.width}
        id="image"
      />
      {highlight ? (
        <rect style={{pointerEvents: "none"}} fill="rgba(255,0,0,0.3)" stroke={"red"} {...highlightRectProps} />
      ) : null}
    </svg>
  );
}

ImageRenderer.propTypes = propTypes;

export default ImageRenderer;
