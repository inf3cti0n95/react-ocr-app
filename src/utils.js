export const getRelativeXYCoordinates = (element) => {
    let e = element.target;
    let dim = e.getBoundingClientRect();
    let x = element.clientX - dim.left;
    let y = element.clientY - dim.top;

    return {
        x,
        y
    };
}

export const getMax = (a, b) => (a > b ? a : b);
export const getMin = (a, b) => (a < b ? a : b);