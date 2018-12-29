import DemoData from "./assets/demo_data";
import DemoImage from "./assets/demo_image.jpg";

const getWordsFromPage = (page) => page.blocks.flatMap(block =>
    block.paragraphs.flatMap(paragraph =>
        paragraph.words.map(word => ({
            text: word.symbols.reduce((prev, curr) => prev + curr.text, ""), // OCRed Text
            boundingBox: {
                topLeft: word.boundingBox.vertices[0], // topLeft Vertex of the Bounding Box
                bottomRight: word.boundingBox.vertices[2] // bottomRight Vertex of the Bounding Box
            }
        }))
    )
)

export const getOCRResponse = (image) =>
    new Promise((resolve) => setTimeout(resolve,500)) // Fake Delay to Mimic an API
    .then(() => DemoData)
    .then(data =>
        data.pages.map(page => ({
            pageHeight: page.height, // Height of the Image
            pageWidth: page.width, // Width of the Image
            image: DemoImage, //Image Source
            words: getWordsFromPage(page) // OCRed Words from the Page Response 
        }))
    );

