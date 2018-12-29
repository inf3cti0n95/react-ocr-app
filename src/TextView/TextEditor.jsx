import React, { Component } from "react";
import {
  Dimmer,
  Segment,
  Grid,
  Responsive,
  Divider,
  Icon,
  Input,
  Form,
  Button,
  Search,
  Header,
  Message,
  Container,
  GridRow
} from "semantic-ui-react";
import debounce from "lodash.debounce";
import filter from "lodash.filter";
import escapeRegExp from "lodash.escaperegexp";

import ReturnKeyIcon from "./../assets/return_key.png";
export default class TextEditor extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.word.text
    };
    this.inputRef = React.createRef();
    this.canvasRef = React.createRef();
    this.escapeKeyCloseListener = this.escapeKeyCloseListener.bind(this)
  }

  escapeKeyCloseListener = e =>
    e.which === 27
      ? this.props.onClose(e, {
          value: this.state.value,
          word: this.props.word,
          wordIndex: this.props.wordIndex,
          pageIndex: this.props.pageIndex
        })
      : null;

  componentDidMount() {
    this.inputRef.current.focus();

    this.drawCroppedImage(
      this.canvasRef.current,
      this.props.image,
      this.props.rectProps
    );

    // Close Dialog Box on Escape Key
    document.addEventListener("keydown", this.escapeKeyCloseListener);
  }

  drawCroppedImage(canvas, image, rectProps) {
    let context = canvas.getContext("2d");
    let imageObj = new Image();

    imageObj.onload = function() {
      // draw cropped image
      var sourceX = rectProps.x;
      var sourceY = rectProps.y;
      var sourceWidth = rectProps.width;
      var sourceHeight = rectProps.height;
      var destWidth = sourceWidth;
      var destHeight = sourceHeight;
      var destX = 0;
      var destY = 0;

      context.drawImage(
        imageObj,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        destX,
        destY,
        destWidth,
        destHeight
      );
    };
    imageObj.src = image;
  }

  componentWillUnmount() {
    document.removeEventListener("keydown", this.escapeKeyCloseListener);
  }

  handleResultSelect = (e, { result }) =>
    this.setState({ value: result.title });

  handleSearchChange = (e, { value }) => {
    this.setState({ isLoading: true, value });

    setTimeout(() => {
      if (this.state.value.length < 1) return this.resetComponent();

      const re = new RegExp("^" + escapeRegExp(this.state.value), "i");
      const isMatch = result => re.test(result.title);

      this.setState({
        isLoading: false,
        results: filter(
          [
            "hello",
            "world",
            "this",
            "is",
            "an",
            "example",
            "examplee",
            "exampleb",
            "exble",
            "excalibre"
          ].map(a => ({ title: a })),
          isMatch
        )
      });
    }, 300);
  };

  resetComponent = () =>
    this.setState({ isLoading: false, results: [], value: "" });

  handleSubmit = e =>
    this.props.onSubmit(e, {
      value: this.state.value,
      word: this.props.word,
      wordIndex: this.props.wordIndex,
      pageIndex: this.props.pageIndex
    });

  render() {
    let {
      word,
      wordIndex,
      pageIndex,
      image,
      rectProps,
      active,
      onSubmit,
      onClose
    } = this.props;
    return (
      <Dimmer.Inner
        onClickOutside={e =>
          onClose(e, {
            value: this.state.value,
            word,
            wordIndex,
            pageIndex
          })
        }
        page
        active={active}
      >
        <Segment placeholder>
          <Grid padded columns={2} stackable>
            <Grid.Row>
              <Grid.Column>
                {active ? (
                  <Form onSubmit={this.handleSubmit.bind(this)}>
                    <Search
                      icon="pencil alternate"
                      input={{ ref: this.inputRef }}
                      loading={this.state.isLoading}
                      defaultValue={word.text}
                      onResultSelect={this.handleResultSelect}
                      onSearchChange={debounce(this.handleSearchChange, 500, {
                        leading: true
                      })}
                      results={this.state.results}
                    />
                  </Form>
                ) : null}
              </Grid.Column>
              <Grid.Column  verticalAlign="middle">
                {active ? (
                  <canvas
                    height={rectProps.height}
                    width={rectProps.width}
                    ref={this.canvasRef}
                  />
                ) : null}
              </Grid.Column>
              <Responsive
                onUpdate={(e, { width }) => this.setState({ width })}
                minWidth={767}
              >
                <Divider vertical>
                  <Icon name="arrows alternate horizontal" />
                </Divider>
              </Responsive>
            </Grid.Row>
          </Grid>
        </Segment>
        <Grid.Row className="margin-top-20" centered>
          <Button type="submit" onClick={this.handleSubmit.bind(this)} primary>
            Update
          </Button>

          <Message info>
            <p>
              Press Enter
              <img
                src={ReturnKeyIcon}
                height="16"
                width="16"
                alt="Enter Key"
              />{" "}
              to Update the text.
            </p>
          </Message>
        </Grid.Row>
      </Dimmer.Inner>
    );
  }
}
