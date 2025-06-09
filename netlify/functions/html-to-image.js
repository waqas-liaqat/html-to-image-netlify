const { html: toReact } = require("satori-html");
const satori = require("satori");
const { Resvg } = require("@resvg/resvg-js");
const fs = require("fs/promises");

exports.handler = async function(event, context) {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }
  const htmlContent = event.isBase64Encoded 
    ? Buffer.from(event.body, 'base64').toString('utf-8')
    : event.body;

  const markup = toReact`${htmlContent}`;

  const fontRegular = await fs.readFile(`${__dirname}/fonts/DejaVuSans.ttf`);
  const fontBold    = await fs.readFile(`${__dirname}/fonts/DejaVuSans-Bold.ttf`);

  const svg = await satori(markup, {
    width: 1350,
    height: 1080,
    fonts: [
      { name: "DejaVu Sans", data: fontRegular, weight: 400, style: "normal" },
      { name: "DejaVu Sans", data: fontBold, weight: 700, style: "normal" },
    ],
  });

  const resvg = new Resvg(svg, { background: "#fff" });
  const pngData = resvg.render();
  const pngBuffer = pngData.asPng();

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
    body: JSON.stringify({ image: pngBuffer.toString('base64') })
  };
};