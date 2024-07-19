export const svgToImage = (path: string, width: number, height: number) => {
    return new Promise(resolve => {
        const img = new Image(width, height);
        img.src = path;
       img.addEventListener('load', () => resolve(img));
    });
}