import React, { Component } from "react";
import "./App.css";
import {
  Container,
  Segment,
  Grid,
  Divider,
  Loader,
  Dimmer,
  Icon,
  Message,
  Responsive,
  Header,
  List
} from "semantic-ui-react";
import {
  ScrollSync,
  Grid as VirtualGrid
} from "react-virtualized";

//API Service
import { getOCRResponse } from "./ApiService";

// Custom Components
import {  TextEditor, TextRenderer } from "./TextView";
import {  ImageRenderer } from "./ImageView";
import { getRelativeXYCoordinates, getMin, getMax } from "./utils";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isViewLoading: true,
      pages: [],
      scalingFactor: 0.5,
      apiError: false,
      width: document.body.clientWidth,
      textEditorActive: false,
      imageHighlight: null,
      wordToEdit: null
    };
    this.textViewRef = React.createRef();
  }

  componentDidMount() {
    // Get Demo Response from API
    getOCRResponse(
      null // Image to be Passed
    )
      .then(pages => this.setState({ pages, isViewLoading: false }))
      .catch(error => this.setState({ apiError: true }));
  }

  textViewRenderer({ columnIndex, key, rowIndex, style }) {
    let { pages, scalingFactor, textEditorActive } = this.state;
    let { pageHeight, pageWidth, words } = pages[rowIndex];

    return (
      <TextRenderer
        key={key}
        height={this.scale(pageHeight)}
        width={this.scale(pageWidth)}
        words={words}
        ref={this.textViewRef}
        scalingFactor={scalingFactor}
        onWordClick={(e, word, wordIndex) =>
          this.onWordClick(word, wordIndex, rowIndex)
        }
        onWordFocus={(e, word, wordIndex) =>
          this.onWordClick(word, wordIndex, rowIndex)
        }
        onWordSelected={(e, word, wordIndex) =>
          this.onWordSelected(word, wordIndex, rowIndex)
        }
      />
    );
  }

  /**
   *
   *
   * @param {Object} word // Word Object with text and bounding box.
   * @param {number} wordIndex // Word Object's index in words array
   * @param {number} pageIndex // Page Index
   * @memberof App
   */
  onWordClick(word, wordIndex, pageIndex) {
    let rectProps = this.getBoundingRectangle(word);

    this.setState({
      imageHighlight: rectProps
    });
  }

  /**
   *
   *
   * @param {Object} word // Word Object with text and bounding box.
   * @param {number} wordIndex // Word Object's index in words array
   * @param {number} pageIndex // Page Index
   * @memberof App
   */
  onWordSelected(word, wordIndex, pageIndex) {
    let rectProps = this.getBoundingRectangle(word, true);

    this.setState({
      wordToEdit: {
        wordIndex,
        pageIndex,
        word,
        rectProps,
        image: this.state.pages[pageIndex].image
      },
      textEditorActive: true
    });
  }

  imageViewRenderer({ columnIndex, key, rowIndex, style }) {
    let { pages, textEditorActive, imageHighlight } = this.state;
    let { pageHeight, pageWidth, image } = pages[rowIndex];

    return (
      <ImageRenderer
        key={key}
        height={this.scale(pageHeight)}
        width={this.scale(pageWidth)}
        image={image}
        onImageClick={e => this.onImageClick(e, rowIndex)}
        onImageDoubleClick={e => this.onImageDoubleClick(e, rowIndex)}
        highlight={!!imageHighlight}
        highlightRectProps={imageHighlight}
      />
    );
  }

  /**
   *
   *
   * @param {Object} event // Click Event
   * @param {number} pageIndex // Page Index
   * @memberof App
   */
  onImageClick(event, pageIndex) {
    let { x, y } = getRelativeXYCoordinates(event);

    x = this.unscale(x);
    y = this.unscale(y);

    let selectedIndex;

    let word = this.state.pages[pageIndex].words.filter(
      ({ boundingBox }, index) =>
        x > getMin(boundingBox.topLeft.x, boundingBox.bottomRight.x) &&
        x < getMax(boundingBox.topLeft.x, boundingBox.bottomRight.x) &&
        y > getMin(boundingBox.topLeft.y, boundingBox.bottomRight.y) &&
        y < getMax(boundingBox.topLeft.y, boundingBox.bottomRight.y)
          ? (selectedIndex = index)
          : false
    )[0];

    if (selectedIndex && word) {
      this.textViewRef.current.children[selectedIndex].focus();
    }
  }

  onImageDoubleClick(event, pageIndex) {
    let { x, y } = getRelativeXYCoordinates(event);

    x = this.unscale(x);
    y = this.unscale(y);

    let selectedIndex;

    let word = this.state.pages[pageIndex].words.filter(
      ({ boundingBox }, index) =>
        x > getMin(boundingBox.topLeft.x, boundingBox.bottomRight.x) &&
        x < getMax(boundingBox.topLeft.x, boundingBox.bottomRight.x) &&
        y > getMin(boundingBox.topLeft.y, boundingBox.bottomRight.y) &&
        y < getMax(boundingBox.topLeft.y, boundingBox.bottomRight.y)
          ? (selectedIndex = index)
          : false
    )[0];

    if (selectedIndex && word) {
      let rectProps = this.getBoundingRectangle(word, true);

      this.setState({
        wordToEdit: {
          wordIndex: selectedIndex,
          pageIndex,
          word,
          rectProps,
          image: this.state.pages[pageIndex].image
        },
        textEditorActive: true
      });
    }
  }

  scale = number => number * this.state.scalingFactor;
  unscale = number => number / this.state.scalingFactor;

  getBoundingRectangle = (word, unscaled) =>
    !unscaled
      ? {
          height: this.scale(
            Math.abs(
              word.boundingBox.topLeft.y - word.boundingBox.bottomRight.y
            )
          ),
          width: this.scale(
            Math.abs(
              word.boundingBox.bottomRight.x - word.boundingBox.topLeft.x
            )
          ),
          x: this.scale(word.boundingBox.topLeft.x),
          y: this.scale(word.boundingBox.topLeft.y)
        }
      : {
          height: Math.abs(
            word.boundingBox.topLeft.y - word.boundingBox.bottomRight.y
          ),
          width: Math.abs(
            word.boundingBox.bottomRight.x - word.boundingBox.topLeft.x
          ),
          x: word.boundingBox.topLeft.x,
          y: word.boundingBox.topLeft.y
        };

  updateWord(e, { value, word, wordIndex, pageIndex }) {
    e.preventDefault();
    let newPage = this.state.pages.map((page, pI) => {
      if (pI === pageIndex) {
        page = {
          ...page,
          words: page.words.map((word, wI) => {
            if (wI === wordIndex) {
              word = {
                ...word,
                text: value
              };
              return word;
            } else return word;
          })
        };
        return page;
      } else {
        return page;
      }
    });

    this.setState({
      textEditorActive: false,
      pages: newPage
    });
    this.textViewRef.current.children[wordIndex].focus();
  }

  closeTextEditor(e, { value, word, wordIndex, pageIndex }) {
    this.setState({
      textEditorActive: false
    });
    this.textViewRef.current.children[wordIndex].focus();
  }

  render() {
    let {
      pages,
      scalingFactor,
      apiError,
      isViewLoading,
      textEditorActive
    } = this.state;
    let { virtualGridHeight, virtualGridWidth } = {
      virtualGridHeight: 500,
      virtualGridWidth: 500
    };
    return (
      <Container fluid>
        <Header as="h1" inverted attached="top">
          <Icon name="translate" />
          <Header.Content> IIT-B OCR App</Header.Content>
        </Header>
        
        <ScrollSync>
          {({
            clientHeight,
            clientWidth,
            onScroll,
            scrollHeight,
            scrollLeft,
            scrollTop,
            scrollWidth
          }) => (
            <Segment attached placeholder>
              <Dimmer active={isViewLoading}>
                {apiError ? (
                  <Message negative>
                    <Message.Header>
                      We're sorry an error has occurred.
                    </Message.Header>
                    <p>Please refresh the page or try again later.</p>
                  </Message>
                ) : (
                  <Loader />
                )}
              </Dimmer>
              <Grid columns={2} centered relaxed="very" stackable>
                <Grid.Column verticalAlign="middle">
                  <Header textAlign="center">Text</Header>
                  {pages.length === 0 ? null : (
                    <VirtualGrid
                      className="virtual-grid"
                      scrollTop={scrollTop}
                      scrollLeft={scrollLeft}
                      onScroll={onScroll}
                      columnWidth={({ index }) =>
                        pages[index].pageWidth * scalingFactor
                      }
                      rowHeight={({ index }) =>
                        pages[index].pageHeight * scalingFactor
                      }
                      columnCount={1}
                      rowCount={this.state.pages.length}
                      cellRenderer={this.textViewRenderer.bind(this)}
                      height={virtualGridHeight}
                      width={virtualGridWidth}
                    />
                  )}
                </Grid.Column>
                <Grid.Column verticalAlign="middle">
                  <Header textAlign="center">Image</Header>
                  {pages.length === 0 ? null : (
                    <VirtualGrid
                      className="virtual-grid"
                      scrollTop={scrollTop}
                      scrollLeft={scrollLeft}
                      onScroll={onScroll}
                      columnWidth={({ index }) =>
                        pages[index].pageWidth * scalingFactor
                      }
                      rowHeight={({ index }) =>
                        pages[index].pageHeight * scalingFactor
                      }
                      columnCount={1}
                      rowCount={this.state.pages.length}
                      cellRenderer={this.imageViewRenderer.bind(this)}
                      height={virtualGridHeight}
                      width={virtualGridWidth}
                    />
                  )}
                </Grid.Column>
              </Grid>

              <Responsive
                onUpdate={(e, { width }) => this.setState({ width })}
                minWidth={767}
              >
                <Divider vertical>
                  <Icon name="arrows alternate horizontal" />
                </Divider>
              </Responsive>

              {textEditorActive ? (
                <TextEditor
                  {...this.state.wordToEdit}
                  active={textEditorActive}
                  onSubmit={this.updateWord.bind(this)}
                  onClose={this.closeTextEditor.bind(this)}
                />
              ) : null}
            </Segment>
          )}
        </ScrollSync>
        <Container textAlign="center">
          <Message info>
            <Message.Header>Usage Tips:</Message.Header>
            <List bulleted>
              <List.Item>
                Click Once to <strong>Highlight the Word </strong> in the Image
                to Word in Text and vice a versa.
              </List.Item>
              <List.Item>
                Press <strong> Tab to Focus on the next word </strong> in the
                Image to Word in Text and vice a versa.
              </List.Item>
              <List.Item>
                Click Twice or Press Return on the highlighted word in the Text
                to <strong> Update it.</strong>
              </List.Item>
            </List>
          </Message>
        </Container>
      </Container>
    );
  }
}

export default App;
